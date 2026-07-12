"use client";

import { CalendarDays } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { AdminDateRange } from "@/lib/admin/date-range";

const options = [
  ["today", "当天"],
  ["week", "本周"],
  ["month", "本月"],
] as const;

export function AdminTimeRangeFilter({ range }: { range: AdminDateRange }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [from, setFrom] = useState(range.preset === "custom" ? range.startDate ?? "" : "");
  const [to, setTo] = useState(range.preset === "custom" ? range.endDate ?? "" : "");

  function navigate(preset: string, customFrom?: string, customTo?: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", preset);
    if (preset === "custom") {
      if (customFrom) params.set("from", customFrom); else params.delete("from");
      if (customTo) params.set("to", customTo); else params.delete("to");
    } else {
      params.delete("from");
      params.delete("to");
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="数据时间范围">
      <span className="inline-flex h-10 items-center gap-2 text-sm font-medium text-slate-600"><CalendarDays size={16} /> 时间</span>
      <button type="button" onClick={() => navigate("all")} className={`h-10 rounded-md border px-3 text-sm font-semibold ${range.preset === "all" ? "border-[#174a8b] bg-[#174a8b] text-white" : "border-slate-200 text-slate-700"}`}>全部</button>
      {options.map(([preset, label]) => (
        <button key={preset} type="button" onClick={() => navigate(preset)} className={`h-10 rounded-md border px-3 text-sm font-semibold ${range.preset === preset ? "border-[#174a8b] bg-[#174a8b] text-white" : "border-slate-200 text-slate-700"}`}>{label}</button>
      ))}
      <button type="button" onClick={() => navigate("custom", from, to)} className={`h-10 rounded-md border px-3 text-sm font-semibold ${range.preset === "custom" ? "border-[#174a8b] bg-[#174a8b] text-white" : "border-slate-200 text-slate-700"}`}>自定义</button>
      {range.preset === "custom" && (
        <form className="flex flex-wrap items-center gap-2" onSubmit={(event) => { event.preventDefault(); navigate("custom", from, to); }}>
          <input aria-label="开始日期" type="date" required value={from} onChange={(event) => setFrom(event.target.value)} className="h-10 rounded-md border border-slate-200 px-2 text-sm text-slate-700" />
          <span className="text-sm text-slate-400">至</span>
          <input aria-label="结束日期" type="date" required min={from || undefined} value={to} onChange={(event) => setTo(event.target.value)} className="h-10 rounded-md border border-slate-200 px-2 text-sm text-slate-700" />
          <button type="submit" className="h-10 rounded-md border border-slate-200 px-3 text-sm font-semibold text-slate-700">应用</button>
        </form>
      )}
    </div>
  );
}
