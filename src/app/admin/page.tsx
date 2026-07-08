import type { Metadata } from "next";
import { AlertTriangle, CheckCircle2, Clock, Database, FileText, SearchCheck, Users } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { databaseHealth, hasObjectStorageConfig } from "@/lib/admin/db";
import { getCurrentAdminUser } from "@/lib/admin/auth";

export const metadata: Metadata = {
  title: "数据概览",
  robots: { index: false, follow: false },
};

const overviewCards = [
  { label: "今日访问量", value: "待同步", icon: Database },
  { label: "新增询盘", value: "待接入", icon: Users },
  { label: "已发布产品", value: "待迁移", icon: FileText },
  { label: "SEO问题", value: "待扫描", icon: SearchCheck },
];

export default async function AdminDashboardPage() {
  const [db, user] = await Promise.all([databaseHealth(), getCurrentAdminUser().catch(() => null)]);
  const storageConfigured = hasObjectStorageConfig();

  return (
    <AdminShell active="dashboard" user={user}>
      <div className="grid gap-6">
        <div>
          <div className="text-sm text-slate-500">后台 / 数据概览</div>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">数据概览</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            用于查看访问分析、表单转化、热门内容、同步状态和近期操作。未配置外部数据源时，不展示伪造数据。
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {overviewCards.map((card) => {
            const Icon = card.icon;
            return (
              <section key={card.label} className="rounded-md border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-slate-500">{card.label}</span>
                  <Icon size={18} className="text-[#174a8b]" />
                </div>
                <div className="mt-4 text-2xl font-semibold text-slate-950">{card.value}</div>
                <div className="mt-2 text-xs text-slate-500">等待数据库和同步任务提供真实数据</div>
              </section>
            );
          })}
        </div>

        <section className="rounded-md border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-950">系统配置状态</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <StatusCard ok={db.ok} label="PostgreSQL 数据库" message={db.message} />
            <StatusCard ok={storageConfigured} label="对象存储" message={storageConfigured ? "对象存储配置已提供。" : "S3对象存储尚未配置，媒体上传未启用。"} />
            <StatusCard ok={false} label="外部SEO/分析数据" message="Google Search Console 或分析平台凭证尚未配置。" />
          </div>
        </section>

        <section className="rounded-md border border-amber-200 bg-amber-50 p-5 text-amber-950">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 shrink-0" size={18} />
            <div>
              <h2 className="font-semibold">上线后启用步骤</h2>
              <p className="mt-2 text-sm leading-6">
                配置生产 `DATABASE_URL` 和 `ADMIN_SESSION_SECRET` 后，运行数据库迁移并创建初始管理员。对象存储和外部SEO/分析凭证未配置前，系统会保留接口和同步状态，但不会伪造真实数据。
              </p>
            </div>
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
