import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, Eye, FileText, FolderTree, MessageSquareText, Newspaper, SearchCheck, UsersRound, PanelsTopLeft } from "lucide-react";
import { AnalyticsCharts } from "@/components/admin/analytics-charts";
import { AdminDataError, AdminEmptyState } from "@/components/admin/admin-feedback";
import { AdminAccessDenied } from "@/components/admin/admin-module-route";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminTimeRangeFilter } from "@/components/admin/admin-time-range-filter";
import { getCurrentAdminUser, hasPermission } from "@/lib/admin/auth";
import { resolveAdminDateRange, type AdminSearchParams } from "@/lib/admin/date-range";
import { getAdminOverview } from "@/lib/admin/site-data";
import { getAnalyticsDashboard } from "@/lib/admin/analytics-data";

export const metadata: Metadata = {
  title: "数据概览",
  robots: { index: false, follow: false },
};

const metricIcons = [Eye, UsersRound, PanelsTopLeft, MessageSquareText];
const contentIcons = [FileText, FolderTree, Newspaper, SearchCheck];

export default async function AdminDashboardPage({ searchParams }: { searchParams: Promise<AdminSearchParams> }) {
  const user = await getCurrentAdminUser().catch(() => null);
  if (!user) redirect("/admin/login");
  if (!hasPermission(user, "dashboard.view")) return <AdminAccessDenied user={user} active="dashboard" />;

  const range = resolveAdminDateRange(await searchParams);
  const [overview, analytics] = await Promise.all([
    getAdminOverview(range).catch(() => null),
    getAnalyticsDashboard(range).catch(() => null),
  ]);

  return <AdminShell active="dashboard" user={user}>
    <div className="grid gap-6">
      <div>
        <div className="text-xs font-semibold tracking-[0.12em] text-[#0068ae]">企业运营中心 / 数据概览</div>
        <h1 className="admin-page-title mt-2">运营概览</h1>
        <p className="admin-page-description mt-2">查看网站访问、客户询盘和内容表现。</p>
      </div>

      <section className="admin-panel p-4" aria-label="统计时间范围">
        <AdminTimeRangeFilter range={range} />
      </section>

      {analytics ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {analytics.metrics.map((card, index) => {
          const Icon = metricIcons[index] ?? Eye;
          return <section key={card.label} className="admin-stat p-5">
            <div className="flex items-center justify-between gap-3"><span className="text-sm font-medium text-[#526a7c]">{card.label}</span><Icon size={20} className={index === 3 ? "text-[#c42e33]" : "text-[#0068ae]"} aria-hidden="true" /></div>
            <div className="mt-4 text-3xl font-bold tabular-nums text-[#061a2f]">{card.value.toLocaleString("zh-CN")}</div>
            <div className="mt-2 text-xs leading-5 text-[#526a7c]">{card.detail}</div>
          </section>;
        })}
      </div> : <AdminDataError title="访问数据暂时无法加载" />}

      <section className="admin-panel overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d3e0e7] px-5 py-4">
          <div><h2 className="text-base font-semibold text-[#132b42]">访问趋势与来源</h2><p className="mt-1 text-xs text-[#526a7c]">{range.label} · 北京时间 · 页面浏览与匿名访客</p></div>
          {hasPermission(user, "analytics.view") && <Link href="/admin/analytics" className="inline-flex h-10 items-center gap-2 rounded-md border border-[#d3e0e7] px-3 text-sm font-semibold text-[#0068ae] hover:border-[#0068ae]">查看访客分析 <ArrowUpRight size={16} aria-hidden="true" /></Link>}
        </div>
        {!analytics ? <AdminDataError title="趋势数据暂时无法加载" /> : analytics.hasData ? <AnalyticsCharts trend={analytics.trend} channels={analytics.channels} /> : <AdminEmptyState />}
      </section>

      <section className="admin-panel overflow-hidden">
        <div className="border-b border-[#d3e0e7] px-5 py-4"><h2 className="text-base font-semibold text-[#132b42]">内容状态</h2><p className="mt-1 text-xs text-[#526a7c]">{range.label}内的内容记录</p></div>
        {overview ? <div className="grid gap-px bg-[#d3e0e7] sm:grid-cols-2 xl:grid-cols-4">
          {overview.cards.map((card, index) => {
            const Icon = contentIcons[index] ?? FileText;
            return <div key={card.label} className="bg-white p-5"><div className="flex items-center gap-2 text-sm font-medium text-[#526a7c]"><Icon size={18} className="text-[#0068ae]" aria-hidden="true" />{card.label}</div><div className="mt-4 text-2xl font-bold tabular-nums text-[#061a2f]">{card.value}</div><p className="mt-2 text-xs leading-5 text-[#526a7c]">{card.detail}</p></div>;
          })}
        </div> : <AdminDataError title="内容数据暂时无法加载" />}
      </section>
    </div>
  </AdminShell>;
}
