import { moduleContent, type AdminModuleKey } from "@/lib/admin/modules";
import { parseAdminListParams, resolveAdminDateRange, type AdminSearchParams } from "@/lib/admin/date-range";
import { getAdminModulePage } from "@/lib/admin/site-data";
import { AdminDataTable } from "./admin-data-table";

type AdminModulePageProps = {
  moduleKey: AdminModuleKey;
  searchParams: Promise<AdminSearchParams>;
};

const timeFields: Record<AdminModuleKey, string> = {
  products: "更新时间", categories: "更新时间", news: "发布时间或更新时间", blog: "发布时间或更新时间",
  "content-ops": "创建时间", leads: "提交时间", analytics: "统计日期", seo: "发现时间",
  media: "上传时间", users: "创建时间", "audit-logs": "操作时间", settings: "更新时间", sync: "更新时间",
};

export async function AdminModulePage({ moduleKey, searchParams }: AdminModulePageProps) {
  const config = moduleContent[moduleKey];
  const params = await searchParams;
  const range = resolveAdminDateRange(params);
  const pagination = parseAdminListParams(params);
  const page = await getAdminModulePage(moduleKey, range, pagination);

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold tracking-[0.12em] text-[#0068ae]">企业运营中心 / {config.title}</div>
          <h1 className="admin-page-title mt-2">{config.title}</h1>
          <p className="admin-page-description mt-2 max-w-3xl">{config.description}</p>
        </div>
      </div>
      <AdminDataTable title={config.title} columns={config.columns} rows={page.rows} total={page.total} available={page.available} pagination={pagination} range={range} timeField={timeFields[moduleKey]} />
    </div>
  );
}
