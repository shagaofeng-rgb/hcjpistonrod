import { Download, Plus, RefreshCw, Search } from "lucide-react";
import { moduleContent, type AdminModuleKey } from "@/lib/admin/modules";
import { getModuleRows } from "@/lib/admin/site-data";

type AdminModulePageProps = {
  moduleKey: AdminModuleKey;
};

export async function AdminModulePage({ moduleKey }: AdminModulePageProps) {
  const config = moduleContent[moduleKey];
  const rows = getModuleRows(moduleKey);

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-sm text-slate-500">后台 / {config.title}</div>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">{config.title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{config.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {config.actions.slice(0, 3).map((action, index) => (
            <button
              key={action}
              className={`inline-flex h-10 items-center gap-2 rounded-md px-4 text-sm font-semibold ${
                index === 0 ? "bg-[#174a8b] text-white" : "border border-slate-200 bg-white text-slate-700"
              }`}
              type="button"
            >
              {index === 0 ? <Plus size={16} /> : <Download size={16} />}
              {action}
            </button>
          ))}
        </div>
      </div>

      <section className="rounded-md border border-slate-200 bg-white">
        <div className="grid gap-3 border-b border-slate-200 p-4 lg:grid-cols-[1fr_auto_auto]">
          <label className="relative block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input
              className="h-10 w-full rounded-md border border-slate-200 pl-10 pr-3 text-sm outline-none ring-[#174a8b]/20 focus:ring-4"
              placeholder="关键词搜索，服务端分页查询"
            />
          </label>
          <select className="h-10 rounded-md border border-slate-200 px-3 text-sm text-slate-700">
            <option>全部状态</option>
            <option>草稿</option>
            <option>已发布</option>
            <option>已归档</option>
          </select>
          <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 px-4 text-sm font-semibold text-slate-700">
            <RefreshCw size={16} />
            刷新
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="w-12 px-4 py-3">
                  <input type="checkbox" aria-label="全选" />
                </th>
                {config.columns.map((column) => (
                  <th key={column} className="whitespace-nowrap px-4 py-3 font-semibold">
                    {column}
                  </th>
                ))}
                <th className="px-4 py-3 font-semibold">操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.length > 0 ? (
                rows.map((row) => (
                  <tr key={row.id} className="border-t border-slate-100">
                    <td className="px-4 py-3">
                      <input type="checkbox" aria-label={`选择 ${row.id}`} />
                    </td>
                    {row.cells.map((cell, index) => (
                      <td key={`${row.id}-${index}`} className="max-w-[320px] truncate px-4 py-3 text-slate-700" title={cell}>
                        {cell}
                      </td>
                    ))}
                    <td className="whitespace-nowrap px-4 py-3">
                      <button className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-[#174a8b]">
                        查看
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={config.columns.length + 2} className="px-4 py-16 text-center">
                    <div className="mx-auto max-w-md">
                      <div className="text-base font-semibold text-slate-900">当前没有记录</div>
                      <p className="mt-2 text-sm leading-6 text-slate-500">该模块暂无可显示的数据。</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 p-4 text-sm text-slate-600">
          <span>共 {rows.length} 条记录，每页 20 条</span>
          <div className="flex items-center gap-2">
            <button className="h-9 rounded-md border border-slate-200 px-3">上一页</button>
            <button className="h-9 rounded-md bg-[#174a8b] px-3 text-white">1</button>
            <button className="h-9 rounded-md border border-slate-200 px-3">下一页</button>
          </div>
        </div>
      </section>
    </div>
  );
}
