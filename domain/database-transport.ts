// Database requests must never enter Next's fetch cache or wait indefinitely.
export function databaseFetch(input: RequestInfo | URL, init?: RequestInit) {
  const originalSignal =
    init?.signal || (input instanceof Request ? input.signal : undefined);
  const timeout = AbortSignal.timeout(8000);
  return fetch(input, {
    ...init,
    cache: "no-store",
    signal: originalSignal
      ? AbortSignal.any([originalSignal, timeout])
      : timeout,
  });
}
const transientCodes = new Set([
  "ECONNRESET",
  "ECONNREFUSED",
  "ETIMEDOUT",
  "EAI_AGAIN",
  "UND_ERR_CONNECT_TIMEOUT",
  "UND_ERR_HEADERS_TIMEOUT",
  "UND_ERR_BODY_TIMEOUT",
  "UND_ERR_SOCKET",
]);
export function transientDatabaseError(error: unknown): boolean {
  const seen = new Set<unknown>();
  let current = error;
  while (current && typeof current === "object" && !seen.has(current)) {
    seen.add(current);
    const e = current as { code?: string; name?: string; cause?: unknown };
    if (transientCodes.has(e.code || "") || e.name === "TimeoutError")
      return true;
    current = e.cause;
  }
  return false;
}
// Only wrap explicit reads. Retrying a write after a lost response can duplicate it.
export async function readDatabase<T>(read: () => PromiseLike<T>): Promise<T> {
  try {
    return await read();
  } catch (error) {
    if (!transientDatabaseError(error)) throw error;
    await new Promise((resolve) => setTimeout(resolve, 150));
    return await read();
  }
}
