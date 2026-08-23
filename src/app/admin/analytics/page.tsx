import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import Link from "next/link";
import { ExternalLink, MonitorSmartphone, Route, UserRoundCheck } from "lucide-react";
import { AdminTimeRangeFilter } from "@/components/admin/admin-time-range-filter";
import { AnalyticsFilterBar } from "@/components/admin/analytics-filter-bar";
import { AnalyticsPagination } from "@/components/admin/analytics-pagination";
import { AnalyticsLiveRefresh } from "@/components/admin/analytics-live-refresh";
import { getCurrentAdminUser } from "@/lib/admin/auth";
import { getAnalyticsOptions, getVisitorSessions, parseAnalyticsFilters } from "@/lib/admin/analytics-data";
import { resolveAdminDateRange, type AdminSearchParams } from "@/lib/admin/date-range";

export const metadata: Metadata = { title: "访问分析", robots: { index: false, follow: false } };

export default async function Page({ searchParams }: { searchParams: Promise<AdminSearchParams> }) {
  const params = await searchParams;
  const range = resolveAdminDateRange(params);
  const filters = parseAnalyticsFilters(params);
  const [user, options, sessions] = await Promise.all([getCurrentAdminUser().catch(() => null), getAnalyticsOptions(range), getVisitorSessions(range, filters)]);
  return <AdminShell active="analytics" user={user}>
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><h1 className="text-2xl font-semibold text-[#061a2f]">访客分析</h1><p className="mt-2 text-sm text-[#526a7c]">按真实匿名会话查看来源、访问路径、回访次数和询盘识别结果。IP 仅显示脱敏片段。</p></div>
        <div className="flex flex-wrap gap-2"><AnalyticsLiveRefresh /><Link href="/admin/analytics/traffic" className="inline-flex h-10 items-center gap-2 rounded-md bg-[#0068ae] px-4 text-sm font-semibold text-white transition hover:bg-[#00598f]"><Route size={16} /> 查看流量来源</Link></div>
      </div>
      <AdminTimeRangeFilter range={range} />
      <AnalyticsFilterBar countries={options.countries} channels={options.channels} classifications={options.classifications} devices={options.devices} />
      <section className="overflow-hidden rounded-md border border-[#d3e0e7] bg-white">
        {sessions.rows.length > 0 ? <div className="overflow-x-auto"><table className="min-w-[1080px] w-full text-left text-sm"><thead className="border-b border-[#d3e0e7] bg-[#f2f6f8] text-xs font-semibold text-[#526a7c]"><tr><th className="px-4 py-3">最后识别</th><th className="px-4 py-3">访客</th><th className="px-4 py-3">国家 / 来源</th><th className="px-4 py-3">首次页面</th><th className="px-4 py-3">最近页面</th><th className="px-4 py-3">行为</th><th className="px-4 py-3">状态</th><th className="px-4 py-3"><span className="sr-only">详情</span></th></tr></thead><tbody>
          {sessions.rows.map((session) => <tr key={session.id} className="border-b border-[#edf2f5] last:border-0 hover:bg-[#f8fbfc]"><td className="whitespace-nowrap px-4 py-3 text-[#526a7c]">{formatDate(session.last_seen_at)}</td><td className="px-4 py-3"><div className="font-medium text-[#132b42]">{session.ip_masked || "IP 已隐藏"}</div><div className="mt-1 text-xs text-[#6f8594]">第 {session.visit_number} 次访问</div></td><td className="px-4 py-3"><div className="font-medium text-[#132b42]">{session.countryLabel}</div><div className="mt-1 text-xs text-[#6f8594]">{session.source_channel || "direct"}{session.referrer_host ? ` · ${session.referrer_host}` : ""}</div></td><td className="max-w-48 truncate px-4 py-3 text-[#526a7c]" title={session.landing_path || ""}>{session.landing_path || "-"}</td><td className="max-w-48 truncate px-4 py-3 text-[#526a7c]" title={session.last_page_path || ""}>{session.last_page_path || "-"}</td><td className="px-4 py-3"><div className="flex items-center gap-1.5 text-[#526a7c]"><MonitorSmartphone size={15} /> {session.device_type || "unknown"} · {session.browser || "Other"}</div><div className="mt-1 text-xs text-[#6f8594]">{session.page_views} 页 · {session.conversion_count} 次转化</div></td><td className="px-4 py-3"><span className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${session.classification === "lead" ? "bg-emerald-50 text-emerald-700" : session.classification === "engaged" ? "bg-sky-50 text-sky-700" : "bg-[#edf3f6] text-[#3d596c]"}`}>{session.classification === "lead" ? "询盘线索" : session.classification === "engaged" ? "高互动" : session.classification === "returning" ? "回访" : "新访客"}</span></td><td className="px-4 py-3"><Link aria-label="查看访客详情" href={`/admin/analytics/visitors/${session.id}`} className="grid h-9 w-9 place-items-center rounded-md border border-[#d3e0e7] text-[#0068ae] transition hover:border-[#0068ae] hover:bg-[#eef7fb]"><ExternalLink size={16} /></Link></td></tr>)}
        </tbody></table></div> : <div className="px-6 py-16 text-center text-sm leading-6 text-[#526a7c]"><UserRoundCheck className="mx-auto mb-3 text-[#7f9aad]" size={28} />当前筛选范围还没有已验证的真实访问会话。生产站点上线后会自动写入，后台、预览、机器人与测试访问不会显示在这里。</div>}
        <AnalyticsPagination page={filters.page} pageSize={filters.pageSize} total={sessions.total} />
      </section>
    </div>
  </AdminShell>;
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("zh-CN", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Shanghai" }).format(value);
}
