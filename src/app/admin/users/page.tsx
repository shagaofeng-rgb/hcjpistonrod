import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminModulePage } from "@/components/admin/admin-module-page";
import { getCurrentAdminUser } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "用户与权限", robots: { index: false, follow: false } };

export default async function Page() {
  const user = await getCurrentAdminUser().catch(() => null);
  return <AdminShell active="users" user={user}><AdminModulePage moduleKey="users" /></AdminShell>;
}
