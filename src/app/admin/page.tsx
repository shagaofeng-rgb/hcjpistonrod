import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, FileText, FolderTree, Newspaper, SearchCheck, UsersRound } from "lucide-react";
import { AnalyticsCharts } from "@/components/admin/analytics-charts";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminTimeRangeFilter } from "@/components/admin/admin-time-range-filter";
import { getCurrentAdminUser } from "@/lib/admin/auth";
import { resolveAdminDateRange, type AdminSearchParams } from "@/lib/admin/date-range";
import { getAdminOverview } from "@/lib/admin/site-data";
import { getAnalyticsDashboard } from "@/lib/admin/analytics-data";

export const metadata: Metadata = {
  title: "数据概览",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage({ searchParams }: { searchParams: Promise<AdminSearchParams> }) {
  const range = resolveAdminDateRange(await searchParams);
  const [overview, user, analytics] = await Promise.all([getAdminOverview(range), getCurrentAdminUser().catch(() => null), getAnalyticsDashboard(range)]);
  const icons = [FileText, FolderTree, Newspaper, SearchCheck];

  return (
    <AdminShell active="dashboard" user={user}>
      <div className="grid gap-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#061a2f]">运营概览</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">集中查看网站访问、客户询盘与内容表现。</p>
        </div>

        <section className="rounded-md border border-slate-200 bg-white p-4">
          <AdminTimeRangeFilter range={range} />
        </section>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {analytics.metrics.map((card) => (
            <section key={card.label} className="rounded-md border border-[#d3e0e7] bg-white p-5">
              <div className="flex items-center justify-between gap-3"><span className="text-sm text-[#526a7c]">{card.label}</span><UsersRound size={18} className="text-[#0068ae]" /></div>
              <div className="mt-4 text-3xl font-semibold text-[#061a2f]">{card.value}</div>
              <div className="mt-2 text-xs text-[#7890a0]">{card.detail}</div>
            </section>
          ))}
        </div>

        <section className="rounded-md border border-[#d3e0e7] bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d3e0e7] px-5 py-4"><div><h2 className="font-semibold text-[#132b42]">访问趋势</h2><p className="mt-1 text-sm text-[#526a7c]">按上海时区统计页面浏览与独立访客。</p></div><Link href="/admin/analytics" className="inline-flex h-9 items-center gap-2 rounded-md border border-[#d3e0e7] px-3 text-sm font-semibold text-[#0068ae] transition hover:border-[#0068ae]">打开访客分析 <ArrowUpRight size={15} /></Link></div>
          {analytics.trend.length > 0 ? <AnalyticsCharts trend={analytics.trend} channels={analytics.channels} /> : <div className="px-5 py-12 text-center text-sm leading-6 text-[#526a7c]">当前时间范围暂无访问数据。</div>}
        </section>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {overview.cards.map((card, index) => {
            const Icon = icons[index] ?? FileText;
            return (
              <section key={card.label} className="rounded-md border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-slate-500">{card.label}</span>
                  <Icon size={18} className="text-[#174a8b]" />
                </div>
                <div className="mt-4 text-2xl font-semibold text-slate-950">{card.value}</div>
                <div className="mt-2 text-xs text-slate-500">{card.detail}</div>
              </section>
            );
          })}
        </div>

      </div>
    </AdminShell>
  );
}
