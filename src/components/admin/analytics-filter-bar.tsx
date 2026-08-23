"use client";

import { Filter, Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type Option = { value: string; label: string };

type AnalyticsFilterBarProps = {
  countries: string[];
  channels: string[];
  classifications: string[];
  devices: string[];
};

function options(values: string[], fallback: string): Option[] {
  return [{ value: "", label: fallback }, ...values.map((value) => ({ value, label: value }))];
}

export function AnalyticsFilterBar({ countries, channels, classifications, devices }: AnalyticsFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
  const setParam = (name: string, value: string) => {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(name, value); else next.delete(name);
    next.delete("page");
    router.push(`${pathname}?${next.toString()}`);
  };
  const selectValue = (name: string) => searchParams.get(name) || "";
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setParam("keyword", keyword.trim());
  };
  const select = (name: string, label: string, source: Option[]) => (
    <label className="grid min-w-32 gap-1 text-xs font-medium text-[#526a7c]">
      {label}
      <select value={selectValue(name)} onChange={(event) => setParam(name, event.target.value)} className="h-10 rounded-md border border-[#d3e0e7] bg-white px-2 text-sm text-[#132b42] outline-none transition focus:border-[#0068ae] focus:ring-2 focus:ring-[#0068ae]/15">
        {source.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
      </select>
    </label>
  );
  return (
    <section className="border-y border-[#d3e0e7] bg-white px-4 py-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex h-10 items-center gap-2 text-sm font-semibold text-[#132b42]"><Filter size={16} className="text-[#0068ae]" /> 筛选访客</div>
        {select("country", "国家 / 地区", options(countries, "全部国家"))}
        {select("channel", "来源渠道", options(channels, "全部渠道"))}
        {select("classification", "访客分类", options(classifications, "全部分类"))}
        {select("device", "设备", options(devices, "全部设备"))}
        <form onSubmit={submit} className="grid min-w-52 flex-1 gap-1 text-xs font-medium text-[#526a7c]">
          关键词
          <div className="relative"><Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#7890a0]" /><input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="IP 掩码、访问页面或来源" className="h-10 w-full rounded-md border border-[#d3e0e7] py-2 pl-9 pr-3 text-sm text-[#132b42] outline-none transition focus:border-[#0068ae] focus:ring-2 focus:ring-[#0068ae]/15" /></div>
        </form>
      </div>
    </section>
  );
}
