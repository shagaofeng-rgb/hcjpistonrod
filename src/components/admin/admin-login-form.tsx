"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export function AdminLoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    setError("");
    setLoading(true);

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (!response.ok || !result.ok) {
        setError(result?.error?.message ?? "登录失败，请稍后重试。");
        return;
      }

      window.location.href = "/admin";
    } catch {
      setError("网络异常，请检查连接后重试。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <div>
        <label className="text-sm font-semibold text-slate-700" htmlFor="account">
          账号
        </label>
        <input
          id="account"
          name="account"
          type="text"
          autoComplete="username"
          required
          className="mt-2 h-11 w-full rounded-md border border-slate-200 px-3 outline-none ring-[#174a8b]/20 focus:ring-4"
          placeholder="请输入邮箱或用户名"
        />
      </div>

      <div>
        <label className="text-sm font-semibold text-slate-700" htmlFor="password">
          密码
        </label>
        <div className="relative mt-2">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            className="h-11 w-full rounded-md border border-slate-200 px-3 pr-11 outline-none ring-[#174a8b]/20 focus:ring-4"
            placeholder="请输入密码"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-slate-500 hover:bg-slate-100"
            title={showPassword ? "隐藏密码" : "显示密码"}
            aria-label={showPassword ? "隐藏密码" : "显示密码"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 text-sm">
        <label className="inline-flex items-center gap-2 text-slate-600">
          <input name="remember" type="checkbox" className="h-4 w-4 rounded border-slate-300" />
          记住登录状态
        </label>
        <a href="mailto:ada@hcjpistonrod.com" className="font-semibold text-[#174a8b]">
          忘记密码
        </a>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#174a8b] px-4 font-semibold text-white hover:bg-[#0b2f5f] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : null}
        {loading ? "登录中" : "登录"}
      </button>
    </form>
  );
}
