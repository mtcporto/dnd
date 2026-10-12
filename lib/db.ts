import "server-only";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "@/server/db/schema";
const url = process.env.TURSO_DATABASE_URL;
if (!url) throw Error("TURSO_DATABASE_URL is required.");
export const db = drizzle(
  createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN }),
  { schema },
);
