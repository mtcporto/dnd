import "server-only";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "@/server/db/schema";

function createDatabase() {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) throw Error("TURSO_DATABASE_URL is required.");
  return drizzle(
    createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN }),
    { schema },
  );
}

let database: ReturnType<typeof createDatabase> | undefined;
export function getDb() {
  return (database ??= createDatabase());
}
