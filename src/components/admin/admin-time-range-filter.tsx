"use client";

import { CalendarDays } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import type { AdminDateRange } from "@/lib/admin/date-range";

const options = [
  ["today", "今天"],
  ["week", "本周"],
  ["month", "本月"],
  ["90days", "90天"],
] as const;

export function AdminTimeRangeFilter({ range }: { range: AdminDateRange }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [from, setFrom] = useState(range.preset === "custom" ? range.startDate ?? "" : "");
  const [to, setTo] = useState(range.preset === "custom" ? range.endDate ?? "" : "");
  const [showCustom, setShowCustom] = useState(range.preset === "custom");
  const [pending, startTransition] = useTransition();

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
    params.delete("page");
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="数据时间范围" aria-busy={pending}>
      <span className="inline-flex h-10 items-center gap-2 text-sm font-medium text-[#526a7c]"><CalendarDays size={16} /> 时间范围</span>
      {options.map(([preset, label]) => (
        <button key={preset} type="button" aria-pressed={range.preset === preset && !showCustom} onClick={() => { setShowCustom(false); navigate(preset); }} className={`h-10 rounded-md border px-3 text-sm font-semibold transition-colors ${range.preset === preset && !showCustom ? "border-[#0068ae] bg-[#0068ae] text-white" : "border-[#d3e0e7] bg-white text-[#132b42] hover:border-[#0068ae]"}`}>{label}</button>
      ))}
      <button type="button" aria-pressed={showCustom} aria-expanded={showCustom} onClick={() => setShowCustom((value) => !value)} className={`h-10 rounded-md border px-3 text-sm font-semibold transition-colors ${showCustom ? "border-[#0068ae] bg-[#0068ae] text-white" : "border-[#d3e0e7] bg-white text-[#132b42] hover:border-[#0068ae]"}`}>自定义</button>
      {showCustom && (
        <form className="flex w-full flex-wrap items-center gap-2 pt-1" onSubmit={(event) => { event.preventDefault(); navigate("custom", from, to); }}>
          <input aria-label="开始日期" type="date" required value={from} max={to || undefined} onChange={(event) => setFrom(event.target.value)} className="h-10 min-w-36 rounded-md border border-[#d3e0e7] bg-white px-2 text-sm text-[#132b42]" />
          <span className="text-sm text-[#526a7c]">至</span>
          <input aria-label="结束日期" type="date" required min={from || undefined} value={to} onChange={(event) => setTo(event.target.value)} className="h-10 min-w-36 rounded-md border border-[#d3e0e7] bg-white px-2 text-sm text-[#132b42]" />
          <button type="submit" className="h-10 rounded-md bg-[#0068ae] px-4 text-sm font-semibold text-white hover:bg-[#00598f]">应用</button>
        </form>
      )}
      <span className="sr-only" role="status">{pending ? "正在更新数据" : `当前范围：${range.label}`}</span>
    </div>
  );
}
