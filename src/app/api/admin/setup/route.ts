import { createHash } from "node:crypto";
import { adminApiError, adminError, adminOk } from "@/lib/admin/api";
import { getPool } from "@/lib/admin/db";
import { hashPassword, validateAdminPassword } from "@/lib/admin/password";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const token = String(formData.get("token") || "");
    const password = String(formData.get("password") || "");
    const confirmation = String(formData.get("confirmation") || "");
    if (!token || !password || password !== confirmation) {
      return adminError("链接、密码或确认密码无效。", 400, "ADMIN_SETUP_INVALID_INPUT");
    }
    const passwordError = validateAdminPassword(password);
    if (passwordError) return adminError(passwordError, 400, "ADMIN_SETUP_WEAK_PASSWORD");

    const client = await getPool().connect();
    try {
      await client.query("begin");
      const tokenHash = createHash("sha256").update(token).digest("hex");
      const setup = await client.query<{ id: string; email: string }>(
        "select id,email from admin_setup_tokens where token_hash=$1 and used_at is null and expires_at > now() for update",
        [tokenHash],
      );
      if (!setup.rows[0]) {
        await client.query("rollback");
        return adminError("初始化链接无效或已过期。", 410, "ADMIN_SETUP_TOKEN_EXPIRED");
      }
      const existing = await client.query<{ count: string }>("select count(*)::text as count from admin_users where deleted_at is null");
      if (Number(existing.rows[0]?.count || 0) > 0) {
        await client.query("rollback");
        return adminError("后台已完成初始化。", 409, "ADMIN_ALREADY_INITIALIZED");
      }
      const email = setup.rows[0].email;
      const created = await client.query<{ id: string }>(
        `insert into admin_users (email,username,name,password_hash,status,must_change_password)
         values ($1,$2,'超级管理员',$3,'active',false) returning id`,
        [email, email.split("@")[0], hashPassword(password)],
      );
      const role = await client.query<{ id: string }>("select id from admin_roles where code='super_admin' limit 1");
      if (!role.rows[0]) throw new Error("Super admin role is missing");
      await client.query("insert into admin_user_roles (user_id,role_id) values ($1,$2)", [created.rows[0].id, role.rows[0].id]);
      await client.query("update admin_setup_tokens set used_at=now() where id=$1", [setup.rows[0].id]);
      await client.query(
        "insert into audit_logs (user_id,action,module,object_type,object_id,result) values ($1,'bootstrap','users','admin_user',$1,'success')",
        [created.rows[0].id],
      );
      await client.query("commit");
      return adminOk({ created: true, email });
    } catch (error) {
      await client.query("rollback").catch(() => undefined);
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    return adminApiError(error);
  }
}
