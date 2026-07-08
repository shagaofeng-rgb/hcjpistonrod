import type { Metadata } from "next";
import { CheckCircle2, Clock, FileText, FolderTree, Newspaper, SearchCheck } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { getCurrentAdminUser } from "@/lib/admin/auth";
import { getAdminOverview } from "@/lib/admin/site-data";

export const metadata: Metadata = {
  title: "数据概览",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage() {
  const [overview, user] = await Promise.all([getAdminOverview(), getCurrentAdminUser().catch(() => null)]);
  const icons = [FileText, FolderTree, Newspaper, SearchCheck];

  return (
    <AdminShell active="dashboard" user={user}>
      <div className="grid gap-6">
        <div>
          <div className="text-sm text-slate-500">后台 / 数据概览</div>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">数据概览</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            当前后台展示网站已发布内容、SEO检查、客户表单和数据源连接状态。
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {overview.cards.map((card, index) => {
            const Icon = icons[index] ?? FileText;
            return (
              <section key={card.label} className="rounded-md border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-slate-500">{card.label}</span>
                  <Icon size={18} className="text-[#174a8b]" />
                </div>
                <div className="mt-4 text-2xl font-semibold text-slate-950">{card.value}</div>
                <div className="mt-2 text-xs text-slate-500">{card.detail}</div>
              </section>
            );
          })}
        </div>

        <section className="rounded-md border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-950">系统配置状态</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            {overview.status.map((item) => (
              <StatusCard key={item.label} ok={item.ok} label={item.label} message={item.message} />
            ))}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}

function StatusCard({ ok, label, message }: { ok: boolean; label: string; message: string }) {
  return (
    <div className="rounded-md border border-slate-200 p-4">
      <div className="flex items-center gap-2">
        {ok ? <CheckCircle2 size={18} className="text-emerald-600" /> : <Clock size={18} className="text-amber-600" />}
        <span className="font-semibold text-slate-900">{label}</span>
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-500">{message}</p>
    </div>
  );
}
