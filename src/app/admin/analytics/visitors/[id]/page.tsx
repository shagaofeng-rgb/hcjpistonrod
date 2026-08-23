import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Clock3, MapPin, MonitorSmartphone, Route } from "lucide-react";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { getCurrentAdminUser } from "@/lib/admin/auth";
import { getVisitorSessionDetail } from "@/lib/admin/analytics-data";

export const metadata: Metadata = { title: "访客会话详情", robots: { index: false, follow: false } };

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium", timeStyle: "medium", timeZone: "Asia/Shanghai" }).format(value);
}

export default async function VisitorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [user, visitor] = await Promise.all([getCurrentAdminUser().catch(() => null), getVisitorSessionDetail(id)]);
  if (!visitor) notFound();
  const summary = [
    { label: "国家 / 地区", value: visitor.countryLabel, Icon: MapPin },
    { label: "来源渠道", value: visitor.source_channel || "direct", Icon: Route },
    { label: "访问设备", value: `${visitor.device_type || "unknown"} · ${visitor.browser || "Other"}`, Icon: MonitorSmartphone },
    { label: "开始时间", value: formatDate(visitor.first_seen_at), Icon: Clock3 },
  ];
  const label = visitor.classification === "lead" ? "已识别询盘线索" : visitor.classification === "engaged" ? "高互动访客" : visitor.classification === "returning" ? "回访访客" : "新访客";
  return <AdminShell active="analytics" user={user}><div className="grid gap-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><Link href="/admin/analytics" className="inline-flex items-center gap-2 text-sm font-semibold text-[#0068ae]"><ArrowLeft size={16} /> 返回访客分析</Link><h1 className="mt-4 text-2xl font-semibold text-[#061a2f]">访客会话详情</h1><p className="mt-2 text-sm text-[#526a7c]">匿名访客 {visitor.ip_masked || "IP 已隐藏"} · 第 {visitor.visit_number} 次访问</p></div><span className="rounded-md bg-[#eef7fb] px-3 py-2 text-sm font-semibold text-[#0068ae]">{label}</span></div><div className="grid gap-px overflow-hidden rounded-md border border-[#d3e0e7] bg-[#d3e0e7] sm:grid-cols-2 xl:grid-cols-4">{summary.map(({ label: itemLabel, value, Icon }) => <section key={itemLabel} className="bg-white p-4"><Icon size={17} className="text-[#0068ae]" /><div className="mt-4 text-xs font-medium text-[#6f8594]">{itemLabel}</div><div className="mt-1 break-words text-sm font-semibold text-[#132b42]">{value}</div></section>)}</div><section className="rounded-md border border-[#d3e0e7] bg-white"><div className="border-b border-[#d3e0e7] px-5 py-4"><h2 className="font-semibold text-[#132b42]">会话路径</h2><p className="mt-1 text-sm text-[#526a7c]">{visitor.page_views} 个页面浏览 · {visitor.conversion_count} 次询盘转化 · 最近识别于 {formatDate(visitor.last_seen_at)}</p></div><ol className="divide-y divide-[#edf2f5]">{visitor.events.map((event) => <li key={event.id} className="grid gap-2 px-5 py-4 sm:grid-cols-[180px_140px_1fr]"><time className="text-sm text-[#526a7c]">{formatDate(event.occurred_at)}</time><span className="text-sm font-semibold text-[#132b42]">{event.event_name === "page_view" ? "浏览页面" : event.event_name}</span><span className="break-all text-sm text-[#526a7c]">{event.page_url || "询盘已提交"}</span></li>)}</ol></section></div></AdminShell>;
}
