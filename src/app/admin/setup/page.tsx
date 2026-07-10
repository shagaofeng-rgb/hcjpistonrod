import type { Metadata } from "next";
import Image from "next/image";
import { AdminSetupForm } from "@/components/admin/admin-setup-form";

export const metadata: Metadata = { title: "初始化管理员", robots: { index: false, follow: false } };

export default async function AdminSetupPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  return (
    <main className="grid min-h-screen place-items-center bg-[#f4f6f9] px-4 py-10">
      <section className="w-full max-w-md rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative h-14 w-14 overflow-hidden rounded-md border border-slate-200">
            <Image src="/xijiu-logo.png" alt="锡玖后台 Logo" fill className="object-contain p-1.5" sizes="56px" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-950">创建后台管理员</h1>
            <p className="mt-1 text-sm text-slate-500">安全链接有效期为30分钟</p>
          </div>
        </div>
        {token ? <AdminSetupForm token={token} /> : <p className="mt-6 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">初始化链接不完整，请使用邮件中的完整链接。</p>}
      </section>
    </main>
  );
}
