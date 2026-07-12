import { NextResponse } from "next/server";
import { adminApiError, adminError } from "@/lib/admin/api";
import { ADMIN_SESSION_COOKIE, createSessionToken, hashToken, sessionExpiresAt, verifyAdminCredentials } from "@/lib/admin/auth";
import { query } from "@/lib/admin/db";

export const runtime = "nodejs";

function getClientMeta(request: Request) {
  const headers = request.headers;
  const forwardedFor = headers.get("x-forwarded-for") ?? "";
  const ip = forwardedFor.split(",")[0]?.trim() || headers.get("x-real-ip") || "";
  const userAgent = headers.get("user-agent") || "";
  return { ip, userAgent };
}

async function hasTooManyRecentFailures(account: string, ip: string) {
  const result = await query<{ count: string }>(
    `
    select count(*)::text as count
    from admin_login_attempts
    where success = false
      and created_at > now() - interval '15 minutes'
      and (account = $1 or ($2 <> '' and ip_address = $2))
    `,
    [account, ip],
  );

  return Number(result.rows[0]?.count ?? 0) >= 10;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const account = String(formData.get("account") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");
    const remember = formData.get("remember") === "on";
    const { ip, userAgent } = getClientMeta(request);

    if (!account || !password) {
      return adminError("请输入账号和密码。", 400, "ADMIN_LOGIN_REQUIRED");
    }

    if (await hasTooManyRecentFailures(account, ip)) {
      return adminError("登录尝试过于频繁，请 15 分钟后再试。", 429, "ADMIN_LOGIN_RATE_LIMITED");
    }

    const verified = await verifyAdminCredentials(account, password);

    await query(
      "insert into admin_login_attempts (account, ip_address, user_agent, success, reason) values ($1, $2, $3, $4, $5)",
      [account, ip, userAgent, verified.ok, verified.ok ? null : verified.reason],
    );

    if (!verified.ok) {
      return adminError(verified.reason, 401, "ADMIN_LOGIN_FAILED");
    }

    const token = createSessionToken();
    const expiresAt = sessionExpiresAt(remember);

    await query(
      "insert into admin_sessions (user_id, token_hash, ip_address, user_agent, expires_at, last_used_at) values ($1, $2, $3, $4, $5, now())",
      [verified.user.id, hashToken(token), ip, userAgent, expiresAt],
    );

    await query(
      "insert into audit_logs (user_id, action, module, object_type, object_id, ip_address, user_agent, result) values ($1, 'login', 'auth', 'admin_user', $2, $3, $4, 'success')",
      [verified.user.id, verified.user.id, ip, userAgent],
    );

    const response = NextResponse.json({ ok: true, data: { user: { id: verified.user.id, email: verified.user.email, name: verified.user.name } } });
    response.cookies.set(ADMIN_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });

    return response;
  } catch (error) {
    return adminApiError(error);
  }
}
