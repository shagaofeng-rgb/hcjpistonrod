import Link from "next/link";
import { redirect } from "next/navigation";
import { adminModules } from "@/lib/admin/modules";
import type { AdminUser } from "@/lib/admin/auth";

type AdminShellProps = {
  children: React.ReactNode;
  user: AdminUser | null;
  active: string;
};

export function AdminShell({ children, user, active }: AdminShellProps) {
  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-[#f4f6f9] text-[#111827]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-200 bg-[#071428] text-white lg:block">
        <div className="border-b border-white/10 px-6 py-5">
          <div className="text-lg font-semibold">锡玖后台</div>
          <div className="mt-1 text-xs text-white/55">海外B2B网站管理系统</div>
        </div>
        <nav className="grid gap-1 px-3 py-4 text-sm">
          {adminModules.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.key;
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 transition ${
                  isActive ? "bg-white text-[#071428]" : "text-white/72 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex min-h-16 items-center justify-between gap-4 px-5 lg:px-8">
            <div>
              <div className="text-sm font-semibold text-slate-900">管理后台</div>
              <div className="text-xs text-slate-500">产品、询盘、SEO、访问分析和同步任务集中管理</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-600 sm:inline-flex">
                {user ? user.name : "未登录"}
              </span>
              <form action="/api/admin/auth/logout" method="post">
                <button className="h-10 rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  退出
                </button>
              </form>
            </div>
          </div>
        </header>

        <main className="px-5 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
