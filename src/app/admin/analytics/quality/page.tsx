import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock3, ShieldCheck } from "lucide-react";
import { AdminDataError, AdminEmptyState } from "@/components/admin/admin-feedback";
import { AdminAccessDenied } from "@/components/admin/admin-module-route";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminTimeRangeFilter } from "@/components/admin/admin-time-range-filter";
import { getCurrentAdminUser, hasPermission } from "@/lib/admin/auth";
import { getAnalyticsCollectionStatus, getAnalyticsDashboard } from "@/lib/admin/analytics-data";
import { resolveAdminDateRange, type AdminSearchParams } from "@/lib/admin/date-range";

export const metadata: Metadata = { title: "数据质量", robots: { index: false, follow: false } };

const reasonLabel: Record<string, string> = {
  accepted: "已计入分析",
  non_production_host: "非正式站点",
  internal_path: "后台及接口路径",
  automated_client: "自动化访问",
  test_marker: "测试访问",
  admin_exclusion_rule: "自定义排除规则",
};

export default async function QualityPage({ searchParams }: { searchParams: Promise<AdminSearchParams> }) {
  const user = await getCurrentAdminUser().catch(() => null);
  if (!user) redirect("/admin/login");
  if (!hasPermission(user, "analytics.view")) return <AdminAccessDenied user={user} active="analytics" />;

  const range = resolveAdminDateRange(await searchParams);
  const data = await Promise.all([getAnalyticsCollectionStatus(range), getAnalyticsDashboard(range)]).catch(() => null);
  return <AdminShell active="analytics" user={user}>
    <div className="grid gap-6">
      <div><Link href="/admin/analytics" className="inline-flex items-center gap-2 text-sm font-semibold text-[#0068ae]"><ArrowLeft size={16} /> 返回访客分析</Link><h1 className="admin-page-title mt-3">数据质量</h1><p className="admin-page-description mt-2">查看所选时间范围内的采集情况与统计口径。</p></div>
      <section className="admin-panel p-4"><AdminTimeRangeFilter range={range} /></section>
      {data ? <>
        <div className="grid gap-4 md:grid-cols-3">
          <section className="admin-stat p-5"><ShieldCheck className="text-[#0068ae]" size={20} aria-hidden="true" /><div className="mt-4 text-sm text-[#526a7c]">已接收事件</div><div className="mt-1 text-3xl font-bold tabular-nums text-[#061a2f]">{data[0].eventCount.toLocaleString("zh-CN")}</div></section>
          <section className="admin-stat p-5"><CheckCircle2 className="text-[#0068ae]" size={20} aria-hidden="true" /><div className="mt-4 text-sm text-[#526a7c]">访问会话</div><div className="mt-1 text-3xl font-bold tabular-nums text-[#061a2f]">{data[0].sessionCount.toLocaleString("zh-CN")}</div></section>
          <section className="admin-stat p-5"><Clock3 className="text-[#0068ae]" size={20} aria-hidden="true" /><div className="mt-4 text-sm text-[#526a7c]">最近事件</div><div className="mt-1 text-sm font-semibold text-[#132b42]">{data[0].latestEventAt ? new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Shanghai" }).format(data[0].latestEventAt) : "当前范围暂无记录"}</div></section>
        </div>
        <section className="admin-panel overflow-hidden"><div className="border-b border-[#d3e0e7] px-5 py-4"><h2 className="font-semibold text-[#132b42]">采集记录</h2></div><div className="divide-y divide-[#edf2f5]">{data[1].quality.length ? data[1].quality.map((item) => <div key={item.outcome + "-" + item.reason} className="flex items-center justify-between gap-4 px-5 py-4"><div className="text-sm font-medium text-[#132b42]">{reasonLabel[item.reason] || item.reason}</div><div className="text-lg font-semibold tabular-nums text-[#061a2f]">{item.count}</div></div>) : <AdminEmptyState />}</div></section>
        <section className="admin-panel overflow-hidden"><div className="border-b border-[#d3e0e7] px-5 py-4"><h2 className="font-semibold text-[#132b42]">当前排除规则</h2></div><div className="divide-y divide-[#edf2f5]">{data[0].rules.length ? data[0].rules.map((rule) => <div key={rule.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-4"><span className="text-sm font-medium text-[#132b42]">{rule.label}</span><span className="text-xs text-[#526a7c]">{rule.expires_at ? "临时" : "长期"}</span></div>) : <AdminEmptyState title="当前没有自定义规则" description="默认统计规则仍正常适用。" />}</div></section>
      </> : <AdminDataError title="采集数据暂时无法加载" />}
    </div>
  </AdminShell>;
}
