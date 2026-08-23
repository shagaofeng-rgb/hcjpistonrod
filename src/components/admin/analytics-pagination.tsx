"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function AnalyticsPagination({ page, pageSize, total }: { page: number; pageSize: number; total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const navigate = (nextPage: number, nextSize = pageSize) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));
    params.set("pageSize", String(nextSize));
    router.push(`${pathname}?${params.toString()}`);
  };
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#d3e0e7] px-4 py-3 text-sm text-[#526a7c]">
      <span>共 {total} 条真实会话记录</span>
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2">每页<select aria-label="每页显示数量" value={pageSize} onChange={(event) => navigate(1, Number(event.target.value))} className="h-9 rounded-md border border-[#d3e0e7] bg-white px-2 text-sm text-[#132b42]"><option value="20">20</option><option value="50">50</option><option value="100">100</option></select></label>
        <button aria-label="上一页" type="button" disabled={page <= 1} onClick={() => navigate(page - 1)} className="grid h-9 w-9 place-items-center rounded-md border border-[#d3e0e7] text-[#132b42] transition hover:border-[#0068ae] disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft size={16} /></button>
        <span className="min-w-16 text-center">{page} / {pages}</span>
        <button aria-label="下一页" type="button" disabled={page >= pages} onClick={() => navigate(page + 1)} className="grid h-9 w-9 place-items-center rounded-md border border-[#d3e0e7] text-[#132b42] transition hover:border-[#0068ae] disabled:cursor-not-allowed disabled:opacity-40"><ChevronRight size={16} /></button>
      </div>
    </div>
  );
}
