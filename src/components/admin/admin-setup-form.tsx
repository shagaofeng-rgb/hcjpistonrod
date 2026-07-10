"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";

export function AdminSetupForm({ token }: { token: string }) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    formData.set("token", token);
    try {
      const response = await fetch("/api/admin/setup", { method: "POST", body: formData });
      const result = await response.json();
      if (!response.ok || !result.ok) {
        setError(result?.error?.message || "管理员初始化失败，请重新申请链接。");
        return;
      }
      window.location.replace("/admin/login?initialized=1");
    } catch {
      setError("网络异常，请稍后重试。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 grid gap-5">
      <div>
        <label className="text-sm font-semibold text-slate-700" htmlFor="new-password">新密码</label>
        <div className="relative mt-2">
          <input id="new-password" name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={12} maxLength={128} required className="h-11 w-full rounded-md border border-slate-200 px-3 pr-11 outline-none ring-[#174a8b]/20 focus:ring-4" />
          <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-slate-500 hover:bg-slate-100" aria-label={showPassword ? "隐藏密码" : "显示密码"} title={showPassword ? "隐藏密码" : "显示密码"}>
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <p className="mt-2 text-xs leading-5 text-slate-500">至少12位，同时包含大写字母、小写字母、数字和符号。</p>
      </div>
      <div>
        <label className="text-sm font-semibold text-slate-700" htmlFor="confirm-password">确认密码</label>
        <input id="confirm-password" name="confirmation" type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={12} maxLength={128} required className="mt-2 h-11 w-full rounded-md border border-slate-200 px-3 outline-none ring-[#174a8b]/20 focus:ring-4" />
      </div>
      {error ? <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
      <button type="submit" disabled={loading || !token} className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#174a8b] px-4 font-semibold text-white hover:bg-[#0b2f5f] disabled:cursor-not-allowed disabled:opacity-60">
        {loading ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
        {loading ? "正在创建" : "创建超级管理员"}
      </button>
    </form>
  );
}
