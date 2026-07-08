import { AlertTriangle, Download, Plus, RefreshCw, Search } from "lucide-react";
import { databaseHealth, hasObjectStorageConfig } from "@/lib/admin/db";
import { moduleContent, type AdminModuleKey } from "@/lib/admin/modules";

type AdminModulePageProps = {
  moduleKey: AdminModuleKey;
};

export async function AdminModulePage({ moduleKey }: AdminModulePageProps) {
  const config = moduleContent[moduleKey];
  const db = await databaseHealth();
  const storageConfigured = hasObjectStorageConfig();

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

      {!db.ok ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 shrink-0" size={18} />
            <div>
              <div className="font-semibold">数据库尚未启用</div>
              <p className="mt-1 leading-6">
                {db.message} 请配置 `DATABASE_URL`，运行 `pnpm admin:migrate` 和 `pnpm admin:create-user` 后再使用真实数据功能。
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {moduleKey === "media" && !storageConfigured ? (
        <div className="rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-600">
          对象存储未配置。请设置 S3 相关环境变量后再启用上传、缩略图和文件管理。
        </div>
      ) : null}

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
              <tr>
                <td colSpan={config.columns.length + 2} className="px-4 py-16 text-center">
                  <div className="mx-auto max-w-md">
                    <div className="text-base font-semibold text-slate-900">暂无可展示数据</div>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      当前模块已连接真实后端接口设计，配置数据库并完成迁移后，将通过 `/api/admin/content/{config.apiModule}` 进行服务端分页、搜索和筛选。
                    </p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 p-4 text-sm text-slate-600">
          <span>默认每页 20 条，可选 10 / 20 / 50 / 100 条</span>
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
