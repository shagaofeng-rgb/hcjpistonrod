"use client";

import { Download, RefreshCw, Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { AdminDateRange } from "@/lib/admin/date-range";
import type { AdminTableRow } from "@/lib/admin/site-data";
import { AdminTimeRangeFilter } from "./admin-time-range-filter";

export function AdminDataTable({ title, columns, rows, range }: { title: string; columns: readonly string[]; rows: AdminTableRow[]; range: AdminDateRange }) {
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const filtered = useMemo(() => {
    const query = keyword.trim().toLowerCase();
    return query ? rows.filter((row) => row.cells.some((cell) => cell.toLowerCase().includes(query))) : rows;
  }, [keyword, rows]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function exportCsv() {
    const quote = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const csv = [columns, ...filtered.map((row) => row.cells)].map((cells) => cells.map(quote).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${title}-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="rounded-md border border-slate-200 bg-white">
      <div className="grid gap-3 border-b border-slate-200 p-4">
        <AdminTimeRangeFilter range={range} />
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
          <label className="relative block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
          <input
            className="h-10 w-full rounded-md border border-slate-200 pl-10 pr-3 text-sm outline-none ring-[#174a8b]/20 focus:ring-4"
            placeholder="搜索当前真实数据"
            value={keyword}
            onChange={(event) => { setKeyword(event.target.value); setPage(1); }}
          />
          </label>
          <button type="button" onClick={exportCsv} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 px-4 text-sm font-semibold text-slate-700">
            <Download size={16} /> 导出 CSV
          </button>
          <button type="button" onClick={() => window.location.reload()} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 px-4 text-sm font-semibold text-slate-700">
            <RefreshCw size={16} /> 刷新
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500"><tr>{columns.map((column) => <th key={column} className="whitespace-nowrap px-4 py-3 font-semibold">{column}</th>)}</tr></thead>
          <tbody>
            {visible.length > 0 ? visible.map((row) => (
              <tr key={row.id} className="border-t border-slate-100">
                {row.cells.map((cell, index) => <td key={`${row.id}-${index}`} className="max-w-[320px] truncate px-4 py-3 text-slate-700" title={cell}>{cell}</td>)}
              </tr>
            )) : (
              <tr><td colSpan={columns.length} className="px-4 py-16 text-center text-sm text-slate-500">没有匹配的数据。</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 p-4 text-sm text-slate-600">
        <span>{range.label}：共 {filtered.length} 条真实记录，每页 {pageSize} 条</span>
        <div className="flex items-center gap-2">
          <button type="button" disabled={currentPage <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="h-9 rounded-md border border-slate-200 px-3 disabled:opacity-40">上一页</button>
          <span className="grid h-9 min-w-9 place-items-center rounded-md bg-[#174a8b] px-2 text-white">{currentPage}/{totalPages}</span>
          <button type="button" disabled={currentPage >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} className="h-9 rounded-md border border-slate-200 px-3 disabled:opacity-40">下一页</button>
        </div>
      </div>
    </section>
  );
}
