import { toNextJsHandler } from "better-auth/next-js";
import { authConfigured, getAuth } from "@/lib/auth";
export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!authConfigured)
    return Response.json({ error: "Acesso às contas em preparação." }, { status: 503 });
  return toNextJsHandler(getAuth()).GET(request);
}
export async function POST(request: Request) {
  if (!authConfigured)
    return Response.json({ error: "Acesso às contas em preparação." }, { status: 503 });
  return toNextJsHandler(getAuth()).POST(request);
}
