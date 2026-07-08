import { NextResponse } from "next/server";
import { AdminConfigError } from "./db";

export function adminOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, init);
}

export function adminError(message: string, status = 400, code = "ADMIN_ERROR", traceId = crypto.randomUUID()) {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code,
        message,
        traceId,
      },
    },
    { status },
  );
}

export function adminApiError(error: unknown) {
  if (error instanceof AdminConfigError) {
    return adminError(error.message, 503, "ADMIN_CONFIG_REQUIRED");
  }

  return adminError("服务器处理失败，请稍后重试。", 500, "ADMIN_INTERNAL_ERROR");
}

export function pageParams(url: string) {
  const searchParams = new URL(url).searchParams;
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSizeInput = Number(searchParams.get("pageSize") ?? 20);
  const pageSize = [10, 20, 50, 100].includes(pageSizeInput) ? pageSizeInput : 20;
  const keyword = (searchParams.get("keyword") ?? "").trim();
  const offset = (page - 1) * pageSize;

  return { page, pageSize, keyword, offset };
}
