const test = require("node:test"),
  assert = require("node:assert/strict");
const {
  databaseFetch,
  readDatabase,
  transientDatabaseError,
} = require("../domain/database-transport.ts");
test("database transport opts out of caching, bounds requests and preserves caller cancellation", async () => {
  const original = global.fetch;
  const controller = new AbortController();
  let options;
  global.fetch = async (_input, init) => {
    options = init;
    return new Response("{}");
  };
  try {
    await databaseFetch(
      new Request("https://example.test", { signal: controller.signal }),
    );
    assert.equal(options.cache, "no-store");
    assert(options.signal instanceof AbortSignal);
    controller.abort();
    assert.equal(options.signal.aborted, true);
  } finally {
    global.fetch = original;
  }
});
test("read retries one transient nested transport failure and returns the fresh result", async () => {
  let calls = 0;
  const result = await readDatabase(async () => {
    if (++calls === 1)
      throw new Error("Failed query", {
        cause: new TypeError("fetch failed", {
          cause: Object.assign(new Error("reset"), { code: "ECONNRESET" }),
        }),
      });
    return [42];
  });
  assert.deepEqual(result, [42]);
  assert.equal(calls, 2);
});
test("persistent network failures stop after two reads; SQL and permission errors are not retried", async () => {
  let calls = 0;
  await assert.rejects(
    readDatabase(async () => {
      calls++;
      throw Object.assign(new Error("timeout"), {
        code: "UND_ERR_CONNECT_TIMEOUT",
      });
    }),
  );
  assert.equal(calls, 2);
  calls = 0;
  await assert.rejects(
    readDatabase(async () => {
      calls++;
      throw Object.assign(new Error("no such table"), { code: "SQLITE_ERROR" });
    }),
  );
  assert.equal(calls, 1);
  assert.equal(
    transientDatabaseError(new DOMException("timed out", "TimeoutError")),
    true,
  );
  assert.equal(
    transientDatabaseError(new DOMException("cancelled", "AbortError")),
    false,
  );
});
