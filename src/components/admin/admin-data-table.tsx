"use client";

import { ChevronLeft, ChevronRight, Download, RefreshCw, Search } from "lucide-react";
import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { AdminDateRange, AdminListParams } from "@/lib/admin/date-range";
import type { AdminTableRow } from "@/lib/admin/site-data";
import { AdminTimeRangeFilter } from "./admin-time-range-filter";

export function AdminDataTable({ title, columns, rows, total, pagination, range, emptyMessage }: { title: string; columns: readonly string[]; rows: AdminTableRow[]; total: number; pagination: AdminListParams; range: AdminDateRange; emptyMessage?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState(pagination.keyword);
  const totalPages = Math.max(1, Math.ceil(total / pagination.pageSize));
  const currentPage = Math.min(pagination.page, totalPages);

  function navigate(page: number, pageSize = pagination.pageSize, nextKeyword = pagination.keyword) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(Math.max(1, page)));
    params.set("pageSize", String(pageSize));
    if (nextKeyword) params.set("q", nextKeyword); else params.delete("q");
    router.push(`${pathname}?${params.toString()}`);
  }

  function exportCsv() {
    const quote = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const csv = [columns, ...rows.map((row) => row.cells)].map((cells) => cells.map(quote).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${title}-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="rounded-md border border-[#d3e0e7] bg-white shadow-[0_10px_30px_rgba(6,26,47,0.04)]">
      <div className="grid gap-3 border-b border-[#d3e0e7] p-5">
        <AdminTimeRangeFilter range={range} />
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
          <div className="relative block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
          <form onSubmit={(event) => { event.preventDefault(); navigate(1, pagination.pageSize, keyword.trim()); }}>
          <input
            className="h-10 w-full rounded-md border border-[#d3e0e7] pl-10 pr-3 text-sm outline-none ring-[#19a9e5]/20 focus:ring-4"
            placeholder="搜索当前数据"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
          </form>
          </div>
          <button type="button" onClick={exportCsv} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[#d3e0e7] px-4 text-sm font-semibold text-[#132b42] transition hover:border-[#0068ae] hover:bg-[#f2f6f8]">
            <Download size={16} /> 导出本页 CSV
          </button>
          <button type="button" onClick={() => window.location.reload()} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[#d3e0e7] px-4 text-sm font-semibold text-[#132b42] transition hover:border-[#0068ae] hover:bg-[#f2f6f8]">
            <RefreshCw size={16} /> 刷新
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#f2f6f8] text-[#526a7c]"><tr>{columns.map((column) => <th key={column} className="whitespace-nowrap px-4 py-3 font-semibold">{column}</th>)}</tr></thead>
          <tbody>
            {rows.length > 0 ? rows.map((row) => (
              <tr key={row.id} className="border-t border-[#edf2f5] transition hover:bg-[#f7fafb]">
                {row.cells.map((cell, index) => <td key={`${row.id}-${index}`} className="max-w-[320px] truncate px-4 py-3 text-[#526a7c]" title={cell}>{cell}</td>)}
              </tr>
            )) : (
              <tr><td colSpan={columns.length} className="px-4 py-16 text-center text-sm leading-6 text-slate-500">{emptyMessage || "当前所选时间范围内暂无真实记录。"}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#d3e0e7] p-4 text-sm text-[#526a7c]">
        <span>{range.label}：共 {total} 条记录</span>
        <div className="flex items-center gap-2">
          <label className="inline-flex h-9 items-center gap-2 whitespace-nowrap text-xs text-[#526a7c]">
            每页
            <select
              aria-label="每页显示条数"
              className="h-9 rounded-md border border-[#d3e0e7] bg-white px-2 text-sm text-[#132b42] outline-none focus:ring-4 focus:ring-[#19a9e5]/20"
              value={pagination.pageSize}
              onChange={(event) => navigate(1, Number(event.target.value))}
            >
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            条
          </label>
          <button aria-label="上一页" type="button" disabled={currentPage <= 1} onClick={() => navigate(currentPage - 1)} className="grid h-9 w-9 place-items-center rounded-md border border-[#d3e0e7] transition hover:border-[#0068ae] disabled:opacity-40"><ChevronLeft size={16} /></button>
          <span className="grid h-9 min-w-16 place-items-center rounded-md bg-[#0068ae] px-2 text-white">{currentPage}/{totalPages}</span>
          <button aria-label="下一页" type="button" disabled={currentPage >= totalPages} onClick={() => navigate(currentPage + 1)} className="grid h-9 w-9 place-items-center rounded-md border border-[#d3e0e7] transition hover:border-[#0068ae] disabled:opacity-40"><ChevronRight size={16} /></button>
        </div>
      </div>
    </section>
  );
}
