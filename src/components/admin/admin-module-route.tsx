import { redirect } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { getCurrentAdminUser, hasPermission, type AdminUser } from "@/lib/admin/auth";
import type { AdminSearchParams } from "@/lib/admin/date-range";
import type { AdminModuleKey } from "@/lib/admin/modules";
import { adminModules } from "@/lib/admin/modules";
import { AdminModulePage } from "./admin-module-page";
import { AdminShell } from "./admin-shell";

const hiddenPermissions: Partial<Record<AdminModuleKey, string>> = {
  "content-ops": "news.manage",
  "audit-logs": "audit.view",
  sync: "sync.manage",
};

export async function AdminModuleRoute({ moduleKey, searchParams }: { moduleKey: AdminModuleKey; searchParams: Promise<AdminSearchParams> }) {
  const user = await getCurrentAdminUser().catch(() => null);
  if (!user) redirect("/admin/login");
  const permission = adminModules.find((item) => item.key === moduleKey)?.permission || hiddenPermissions[moduleKey];
  if (!permission || !hasPermission(user, permission)) {
    return <AdminAccessDenied user={user} active={moduleKey} />;
  }
  return <AdminShell active={moduleKey} user={user}><AdminModulePage moduleKey={moduleKey} searchParams={searchParams} /></AdminShell>;
}

export function AdminAccessDenied({ user, active }: { user: AdminUser; active: string }) {
  return <AdminShell active={active} user={user}>
    <section className="admin-panel max-w-2xl p-8" role="alert">
      <ShieldAlert size={28} className="text-[#0068ae]" aria-hidden="true" />
      <h1 className="admin-page-title mt-4">无权访问此页面</h1>
      <p className="admin-page-description mt-2">请联系后台管理员确认您的访问权限。</p>
    </section>
  </AdminShell>;
}
