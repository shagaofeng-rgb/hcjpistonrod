import type { Metadata } from "next";
import Image from "next/image";
import { AdminLoginForm } from "@/components/admin/admin-login-form";

export const metadata: Metadata = {
  title: "后台登录",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ initialized?: string }> }) {
  const { initialized } = await searchParams;
  return (
    <main className="grid min-h-screen place-items-center bg-[#f4f6f9] px-4 py-10">
      <section className="w-full max-w-md rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative h-14 w-14 overflow-hidden rounded-md border border-slate-200">
            <Image src="/xijiu-logo.png" alt="锡玖后台 Logo" fill className="object-contain p-1.5" sizes="56px" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-950">锡玖网站管理后台</h1>
            <p className="mt-1 text-sm text-slate-500">请使用管理员账号登录</p>
          </div>
        </div>

        <div className="mt-6">
          {initialized === "1" ? <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">管理员已创建，请使用新密码登录。</div> : null}
          <AdminLoginForm />
        </div>

      </section>
    </main>
  );
}
