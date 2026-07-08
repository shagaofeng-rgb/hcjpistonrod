import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { query } from "./db";
import { verifyPassword } from "./password";

export const ADMIN_SESSION_COOKIE = "hcj_admin_session";
const SESSION_DAYS = 7;

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  roles: string[];
  permissions: string[];
};

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function createSessionToken() {
  return randomBytes(32).toString("base64url");
}

export function sessionExpiresAt(remember: boolean) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (remember ? 30 : SESSION_DAYS));
  return expiresAt;
}

export async function getCurrentAdminUser(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!token) return null;

  const tokenHash = hashToken(token);
  const result = await query<{
    id: string;
    email: string;
    name: string;
    roles: string[];
    permissions: string[];
  }>(
    `
    select
      u.id,
      u.email,
      u.name,
      coalesce(array_agg(distinct r.code) filter (where r.code is not null), '{}') as roles,
      coalesce(array_agg(distinct p.code) filter (where p.code is not null), '{}') as permissions
    from admin_sessions s
    join admin_users u on u.id = s.user_id
    left join admin_user_roles ur on ur.user_id = u.id
    left join admin_roles r on r.id = ur.role_id
    left join admin_role_permissions rp on rp.role_id = r.id
    left join admin_permissions p on p.id = rp.permission_id
    where s.token_hash = $1
      and s.revoked_at is null
      and s.expires_at > now()
      and u.status = 'active'
      and u.deleted_at is null
    group by u.id, u.email, u.name
    limit 1
    `,
    [tokenHash],
  );

  const user = result.rows[0];
  if (!user) return null;

  await query("update admin_sessions set last_used_at = now() where token_hash = $1", [tokenHash]);
  return user;
}

export function hasPermission(user: AdminUser | null, permission: string) {
  if (!user) return false;
  if (user.roles.includes("super_admin")) return true;
  return user.permissions.includes(permission);
}

export async function verifyAdminCredentials(account: string, password: string) {
  const result = await query<{
    id: string;
    email: string;
    name: string;
    password_hash: string;
    status: string;
    locked_until: Date | null;
  }>(
    `
    select id, email, name, password_hash, status, locked_until
    from admin_users
    where deleted_at is null and (email = $1 or username = $1)
    limit 1
    `,
    [account.toLowerCase()],
  );

  const user = result.rows[0];

  if (!user) {
    return { ok: false as const, reason: "账号或密码错误。" };
  }

  if (user.status !== "active") {
    return { ok: false as const, reason: "账号已停用，请联系管理员。" };
  }

  if (user.locked_until && user.locked_until > new Date()) {
    return { ok: false as const, reason: "登录失败次数过多，账号临时锁定。" };
  }

  if (!verifyPassword(password, user.password_hash)) {
    await query(
      `
      update admin_users
      set failed_login_count = failed_login_count + 1,
          locked_until = case when failed_login_count + 1 >= 5 then now() + interval '15 minutes' else locked_until end,
          updated_at = now()
      where id = $1
      `,
      [user.id],
    );
    return { ok: false as const, reason: "账号或密码错误。" };
  }

  await query(
    "update admin_users set failed_login_count = 0, locked_until = null, last_login_at = now(), updated_at = now() where id = $1",
    [user.id],
  );

  return { ok: true as const, user };
}
