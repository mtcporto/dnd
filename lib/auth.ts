import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { nextCookies } from "better-auth/next-js";
import { getDb } from "./db";
export const authConfigured = !!(
  process.env.TURSO_DATABASE_URL && process.env.BETTER_AUTH_SECRET
);
export const googleEnabled = authConfigured && !!(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);
function createAuth() {
  if (!authConfigured) throw Error("Authentication is not configured.");
  return betterAuth({
    appName: "D&D Aventuras",
    baseURL: process.env.BETTER_AUTH_URL,
    secret: process.env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(getDb(), { provider: "sqlite" }),
    socialProviders: googleEnabled
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            prompt: "select_account",
          },
        }
      : {},
    plugins: [nextCookies()],
  });
}

let authentication: ReturnType<typeof createAuth> | undefined;
export function getAuth() {
  return (authentication ??= createAuth());
}
