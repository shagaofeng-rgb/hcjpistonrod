import { AlertCircle, Database, LoaderCircle } from "lucide-react";

export function AdminDataError({ title = "数据暂时无法加载" }: { title?: string }) {
  return <section className="admin-panel px-6 py-12 text-center" role="alert">
    <AlertCircle size={30} className="mx-auto text-[#a54a32]" aria-hidden="true" />
    <h2 className="mt-3 text-base font-semibold text-[#132b42]">{title}</h2>
    <p className="mt-1 text-sm text-[#526a7c]">请稍后刷新页面；若问题持续，请联系管理员。</p>
  </section>;
}

export function AdminEmptyState({ title = "当前范围暂无数据", description = "请调整时间范围或筛选条件。" }: { title?: string; description?: string }) {
  return <div className="px-6 py-12 text-center">
    <Database size={28} className="mx-auto text-[#7f9aad]" aria-hidden="true" />
    <div className="mt-3 text-sm font-semibold text-[#132b42]">{title}</div>
    <p className="mt-1 text-sm text-[#526a7c]">{description}</p>
  </div>;
}

export function AdminLoadingState() {
  return <div className="admin-panel flex items-center gap-3 p-6 text-sm text-[#526a7c]" role="status"><LoaderCircle size={19} className="animate-spin text-[#0068ae]" aria-hidden="true" />正在加载数据…</div>;
}
