import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { adminModules } from "@/lib/admin/modules";
import { hasPermission, type AdminUser } from "@/lib/admin/auth";

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
    <div className="min-h-screen bg-[#f2f6f8] text-[#132b42]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-[#183a56] bg-[#061a2f] text-white lg:block">
        <div className="flex items-center gap-3 border-b border-white/10 px-6 py-5">
          <div className="relative h-12 w-12 overflow-hidden rounded-md bg-white">
            <Image src="/xijiu-logo.png" alt="XIJIU Logo" fill className="object-contain p-1.5" sizes="48px" />
          </div>
          <div>
            <div className="text-base font-semibold tracking-[0.04em]">HCJ 管理后台</div>
            <div className="mt-1 text-[11px] uppercase tracking-[0.14em] text-[#81d2f3]">Nantong HCJ Operations</div>
          </div>
        </div>
        <nav className="grid max-h-[calc(100vh-88px)] gap-1 overflow-y-auto px-3 py-5 text-sm">
          {adminModules.filter((item) => hasPermission(user, item.permission)).map((item) => {
            const Icon = item.icon;
            const isActive = active === item.key;
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 transition ${
                  isActive ? "bg-[#0068ae] text-white shadow-[0_8px_24px_rgba(0,104,174,0.24)]" : "text-white/70 hover:bg-white/8 hover:text-white"
                }`}
              >
                <Icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-[#d3e0e7] bg-white/95 backdrop-blur">
          <div className="flex min-h-16 items-center justify-between gap-4 px-5 lg:px-8">
            <div>
              <div className="text-sm font-semibold text-[#061a2f]">网站运营与数据后台</div>
              <div className="text-xs text-[#526a7c]">内容、询盘、SEO 与真实访问分析</div>
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

        <nav className="flex gap-2 overflow-x-auto border-b border-[#d3e0e7] bg-white px-5 py-3 lg:hidden">
          {adminModules.filter((item) => hasPermission(user, item.permission)).map((item) => {
            const Icon = item.icon;
            const isActive = active === item.key;
            return (
              <Link key={item.key} href={item.href} className={`inline-flex h-9 shrink-0 items-center gap-2 rounded-md border px-3 text-sm font-semibold ${isActive ? "border-[#0068ae] bg-[#0068ae] text-white" : "border-[#d3e0e7] text-[#526a7c]"}`}>
                <Icon size={15} /> {item.label}
              </Link>
            );
          })}
        </nav>

        <main className="px-5 py-7 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
