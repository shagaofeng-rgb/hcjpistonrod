import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminModulePage } from "@/components/admin/admin-module-page";
import { getCurrentAdminUser } from "@/lib/admin/auth";
import type { AdminSearchParams } from "@/lib/admin/date-range";

export const metadata: Metadata = { title: "访问分析", robots: { index: false, follow: false } };

export default async function Page({ searchParams }: { searchParams: Promise<AdminSearchParams> }) {
  const user = await getCurrentAdminUser().catch(() => null);
  return <AdminShell active="analytics" user={user}><AdminModulePage moduleKey="analytics" searchParams={searchParams} /></AdminShell>;
}
