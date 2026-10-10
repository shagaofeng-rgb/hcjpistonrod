import type { Metadata } from "next";
import { AdminModuleRoute } from "@/components/admin/admin-module-route";
import type { AdminSearchParams } from "@/lib/admin/date-range";

export const metadata: Metadata = { title: "客户表单", robots: { index: false, follow: false } };

export default async function Page({ searchParams }: { searchParams: Promise<AdminSearchParams> }) {
  return <AdminModuleRoute moduleKey="leads" searchParams={searchParams} />;
}
