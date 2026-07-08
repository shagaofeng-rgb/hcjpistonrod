import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminModulePage } from "@/components/admin/admin-module-page";
import { getCurrentAdminUser } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "客户表单", robots: { index: false, follow: false } };

export default async function Page() {
  const user = await getCurrentAdminUser().catch(() => null);
  return <AdminShell active="leads" user={user}><AdminModulePage moduleKey="leads" /></AdminShell>;
}
