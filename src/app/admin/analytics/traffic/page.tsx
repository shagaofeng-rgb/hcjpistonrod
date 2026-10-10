import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, BarChart3, Globe2, Route } from "lucide-react";
import { AdminDataError, AdminEmptyState } from "@/components/admin/admin-feedback";
import { AdminAccessDenied } from "@/components/admin/admin-module-route";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminTimeRangeFilter } from "@/components/admin/admin-time-range-filter";
import { AnalyticsLiveRefresh } from "@/components/admin/analytics-live-refresh";
import { getCurrentAdminUser, hasPermission } from "@/lib/admin/auth";
import { getAnalyticsDashboard } from "@/lib/admin/analytics-data";
import { resolveAdminDateRange, type AdminSearchParams } from "@/lib/admin/date-range";

export const metadata: Metadata = { title: "流量来源", robots: { index: false, follow: false } };

function DataList({ title, icon: Icon, items, columns }: { title: string; icon: typeof Globe2; items: Array<{ label?: string; path?: string; pageViews: number; visitors?: number }>; columns: "visitors" | "pages" }) {
  const max = Math.max(...items.map((item) => item.pageViews), 1);
  return <section className="admin-panel overflow-hidden">
    <div className="flex items-center gap-2 border-b border-[#d3e0e7] px-5 py-4"><Icon size={18} className="text-[#0068ae]" aria-hidden="true" /><h2 className="font-semibold text-[#132b42]">{title}</h2></div>
    <div className="divide-y divide-[#edf2f5]">
      {items.length ? items.map((item) => <div key={item.label || item.path} className="grid grid-cols-[minmax(0,1fr)_88px] gap-4 px-5 py-4">
        <div className="min-w-0"><div className="truncate text-sm font-medium text-[#132b42]" title={item.label || item.path}>{item.label || item.path}</div><div className="mt-2 h-1.5 bg-[#edf3f6]"><div className="h-full bg-[#0068ae]" style={{ width: String((item.pageViews / max) * 100) + "%" }} /></div></div>
        <div className="text-right text-sm tabular-nums text-[#526a7c]"><div>{item.pageViews} 次浏览</div>{columns === "visitors" && <div className="mt-1 text-xs">{item.visitors ?? 0} 位访客</div>}</div>
      </div>) : <AdminEmptyState />}
    </div>
  </section>;
}

export default async function TrafficPage({ searchParams }: { searchParams: Promise<AdminSearchParams> }) {
  const user = await getCurrentAdminUser().catch(() => null);
  if (!user) redirect("/admin/login");
  if (!hasPermission(user, "analytics.view")) return <AdminAccessDenied user={user} active="traffic" />;

  const range = resolveAdminDateRange(await searchParams);
  const dashboard = await getAnalyticsDashboard(range).catch(() => null);
  return <AdminShell active="traffic" user={user}>
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><Link href="/admin/analytics" className="inline-flex items-center gap-2 text-sm font-semibold text-[#0068ae]"><ArrowLeft size={16} /> 返回访客分析</Link><h1 className="admin-page-title mt-3">流量来源</h1><p className="admin-page-description mt-2">按来源、地区和页面查看网站访问。</p></div>
        <div className="flex flex-wrap gap-2"><AnalyticsLiveRefresh /><Link href="/admin/analytics/quality" className="inline-flex h-10 items-center gap-2 rounded-md border border-[#d3e0e7] bg-white px-4 text-sm font-semibold text-[#132b42] hover:border-[#0068ae]"><BarChart3 size={16} /> 数据质量</Link></div>
      </div>
      <section className="admin-panel p-4"><AdminTimeRangeFilter range={range} /></section>
      {dashboard ? <>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {dashboard.metrics.map((metric) => <section key={metric.label} className="admin-stat p-5"><div className="text-sm text-[#526a7c]">{metric.label}</div><div className="mt-3 text-3xl font-bold tabular-nums text-[#061a2f]">{metric.value.toLocaleString("zh-CN")}</div><p className="mt-2 text-xs leading-5 text-[#526a7c]">{metric.detail}</p></section>)}
        </div>
        <div className="grid gap-5 xl:grid-cols-2"><DataList title="来源渠道" icon={Route} items={dashboard.channels} columns="visitors" /><DataList title="访问国家 / 地区" icon={Globe2} items={dashboard.countries} columns="visitors" /></div>
        <DataList title="热门访问页面" icon={Route} items={dashboard.pages} columns="pages" />
      </> : <AdminDataError title="流量数据暂时无法加载" />}
    </div>
  </AdminShell>;
}
