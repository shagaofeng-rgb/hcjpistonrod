import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminModulePage } from "@/components/admin/admin-module-page";
import { getCurrentAdminUser } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "系统设置", robots: { index: false, follow: false } };

export default async function Page() {
  const user = await getCurrentAdminUser().catch(() => null);
  return <AdminShell active="settings" user={user}><AdminModulePage moduleKey="settings" /></AdminShell>;
}
