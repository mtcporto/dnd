import { NextRequest, NextResponse } from "next/server";
import { isLocale } from "@/lib/i18n/shared";
export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin)
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const locale =
    body && typeof body === "object" && "locale" in body
      ? body.locale
      : undefined;
  if (!isLocale(locale))
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  const response = NextResponse.json({ locale });
  response.cookies.set("dnd-locale", locale, {
    httpOnly: true,
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:",
    path: "/",
    maxAge: 31536000,
  });
  return response;
}
