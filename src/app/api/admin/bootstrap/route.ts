import { createHash, randomBytes } from "node:crypto";
import { adminApiError, adminError, adminOk } from "@/lib/admin/api";
import { query } from "@/lib/admin/db";
import { emailConfig, getEmailTransporter } from "@/lib/email";
import { site } from "@/lib/site";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const secret = process.env.CRON_SECRET;
    if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
      return adminError("无权执行后台初始化。", 401, "ADMIN_BOOTSTRAP_UNAUTHORIZED");
    }
    const existing = await query<{ count: string }>("select count(*)::text as count from admin_users where deleted_at is null");
    if (Number(existing.rows[0]?.count || 0) > 0) {
      return adminError("后台已完成初始化。", 409, "ADMIN_ALREADY_INITIALIZED");
    }

    const email = (process.env.ADMIN_SETUP_EMAIL || site.email).toLowerCase();
    const token = randomBytes(32).toString("base64url");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    await query("update admin_setup_tokens set used_at=now() where used_at is null");
    const inserted = await query<{ id: string }>(
      "insert into admin_setup_tokens (email,token_hash,expires_at) values ($1,$2,$3) returning id",
      [email, tokenHash, expiresAt],
    );
    const setupUrl = `${site.domain}/admin/setup?token=${encodeURIComponent(token)}`;
    try {
      await getEmailTransporter().sendMail({
        from: `"${emailConfig.fromName}" <${emailConfig.fromEmail}>`,
        to: email,
        subject: "XIJIU 网站后台管理员初始化",
        text: [`请在30分钟内打开以下链接设置后台管理员密码：`, setupUrl, "", "如果不是你本人发起，请忽略此邮件。"].join("\n"),
        html: `<div style="font-family:Arial,sans-serif;line-height:1.7;color:#111827"><h2>XIJIU 网站后台管理员初始化</h2><p>请在30分钟内使用下面的安全链接设置管理员密码。链接使用一次后失效。</p><p><a href="${setupUrl}" style="display:inline-block;background:#174a8b;color:#fff;text-decoration:none;padding:12px 18px;border-radius:6px">设置管理员密码</a></p><p style="color:#64748b">如果不是你本人发起，请忽略此邮件。</p></div>`,
      });
    } catch (error) {
      await query("delete from admin_setup_tokens where id=$1", [inserted.rows[0].id]).catch(() => undefined);
      throw error;
    }
    return adminOk({ sent: true, email, expiresAt: expiresAt.toISOString() });
  } catch (error) {
    return adminApiError(error);
  }
}
