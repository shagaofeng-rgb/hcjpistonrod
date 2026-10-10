import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { adminModules } from "@/lib/admin/modules";
import { hasPermission, type AdminUser } from "@/lib/admin/auth";
import { AdminMobileNavigation } from "./admin-mobile-navigation";

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
    <div className="admin-shell min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-[#183a56] bg-[#061a2f] text-white lg:block">
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-md bg-white">
            <Image src="/xijiu-logo.png" alt="XIJIU Logo" fill className="object-contain p-1.5" sizes="44px" />
          </div>
          <div>
            <div className="text-sm font-semibold tracking-[0.03em]">HCJ 企业后台</div>
            <div className="mt-1 text-[10px] uppercase tracking-[0.12em] text-[#9fcce3]">XIJIU · Business Console</div>
          </div>
        </div>
        <nav aria-label="后台主导航" className="grid max-h-[calc(100vh-88px)] gap-1 overflow-y-auto px-3 py-5 text-sm">
          {adminModules.filter((item) => hasPermission(user, item.permission)).map((item) => {
            const Icon = item.icon;
            const isActive = active === item.key;
            return (
              <Link
                key={item.key}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex min-h-10 items-center gap-3 rounded-md px-3 py-2.5 transition-colors ${
                  isActive ? "bg-[#1266bf] text-white" : "text-white/75 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={17} aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-[#d3e0e7] bg-white">
          <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <AdminMobileNavigation active={active} allowedKeys={adminModules.filter((item) => hasPermission(user, item.permission)).map((item) => item.key)} />
              <div>
              <div className="text-sm font-semibold text-[#061a2f]">企业运营中心</div>
              <div className="hidden text-xs text-[#526a7c] sm:block">内容、客户与网站数据</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden rounded-md bg-[#e8f0f4] px-3 py-2 text-sm text-[#526a7c] sm:inline-flex">
                {user ? user.name : "未登录"}
              </span>
              <form action="/api/admin/auth/logout" method="post">
                <button className="h-10 rounded-md border border-[#d3e0e7] bg-white px-4 text-sm font-semibold text-[#132b42] transition hover:border-[#0068ae] hover:bg-[#f2f6f8] active:translate-y-px">
                  退出
                </button>
              </form>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
