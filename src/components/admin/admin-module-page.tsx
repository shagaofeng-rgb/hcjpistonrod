import { moduleContent, type AdminModuleKey } from "@/lib/admin/modules";
import { resolveAdminDateRange, type AdminSearchParams } from "@/lib/admin/date-range";
import { getAdminModuleRows } from "@/lib/admin/site-data";
import { AdminDataTable } from "./admin-data-table";

type AdminModulePageProps = {
  moduleKey: AdminModuleKey;
  searchParams: Promise<AdminSearchParams>;
};

export async function AdminModulePage({ moduleKey, searchParams }: AdminModulePageProps) {
  const config = moduleContent[moduleKey];
  const range = resolveAdminDateRange(await searchParams);
  const rows = await getAdminModuleRows(moduleKey, range);

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-sm text-slate-500">后台 / {config.title}</div>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">{config.title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{config.description}</p>
        </div>
      </div>
      <AdminDataTable title={config.title} columns={config.columns} rows={rows} range={range} />
    </div>
  );
}
