import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, hashToken } from "@/lib/admin/auth";
import { hasDatabaseConfig, query } from "@/lib/admin/db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const token = request.headers.get("cookie")?.match(new RegExp(`${ADMIN_SESSION_COOKIE}=([^;]+)`))?.[1];

  if (token && hasDatabaseConfig()) {
    await query("update admin_sessions set revoked_at = now() where token_hash = $1 and revoked_at is null", [hashToken(decodeURIComponent(token))]).catch(() => null);
  }

  const response = NextResponse.redirect(new URL("/admin/login", request.url));
  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
