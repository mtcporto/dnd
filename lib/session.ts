import "server-only";
import { headers } from "next/headers";
import { authConfigured, getAuth } from "./auth";
export async function getSession() {
  const requestHeaders = await headers();
  if (!authConfigured) return null;
  return getAuth().api.getSession({ headers: requestHeaders });
}
