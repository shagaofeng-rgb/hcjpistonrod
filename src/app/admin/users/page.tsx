import type { Metadata } from "next";
import { AdminModuleRoute } from "@/components/admin/admin-module-route";
import type { AdminSearchParams } from "@/lib/admin/date-range";

export const metadata: Metadata = { title: "用户与权限", robots: { index: false, follow: false } };

export default async function Page({ searchParams }: { searchParams: Promise<AdminSearchParams> }) {
  return <AdminModuleRoute moduleKey="users" searchParams={searchParams} />;
}
