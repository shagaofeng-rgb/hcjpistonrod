import { NextResponse } from "next/server";
import { hasDatabaseConfig } from "@/lib/admin/db";
import { collectVisitorEvent, type VisitorEventInput } from "@/lib/analytics/visitor-analytics";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 5_000;
const allowedEvents = new Set(["page_view", "rfq_open", "contact_click"]);

function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for") || "";
  return forwarded.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "";
}

function isSameSiteOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const originHost = new URL(origin).hostname;
    return originHost === new URL(request.url).hostname;
  } catch {
    return false;
  }
}

function asRecord(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).filter(([key, item]) => typeof item === "string" && /^[a-zA-Z0-9_]+$/.test(key)).slice(0, 8));
}

export async function POST(request: Request) {
  if (!hasDatabaseConfig()) return NextResponse.json({ ok: false, error: "Analytics storage is unavailable." }, { status: 503 });
  if (!isSameSiteOrigin(request)) return NextResponse.json({ ok: false, error: "Invalid request origin." }, { status: 403 });
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_BODY_BYTES) return NextResponse.json({ ok: false, error: "Request is too large." }, { status: 413 });

  let payload: Record<string, unknown>;
  try {
    payload = await request.json() as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid analytics payload." }, { status: 400 });
  }
  const eventName = typeof payload.eventName === "string" ? payload.eventName : "";
  const pagePath = typeof payload.pagePath === "string" ? payload.pagePath : "";
  const visitorId = typeof payload.visitorId === "string" ? payload.visitorId : "";
  const sessionId = typeof payload.sessionId === "string" ? payload.sessionId : "";
  if (!allowedEvents.has(eventName) || !pagePath || visitorId.length < 16 || sessionId.length < 16) {
    return NextResponse.json({ ok: false, error: "Invalid analytics event." }, { status: 400 });
  }

  try {
    const result = await collectVisitorEvent(
      {
        eventName: eventName as VisitorEventInput["eventName"],
        pagePath,
        pageTitle: typeof payload.pageTitle === "string" ? payload.pageTitle.slice(0, 160) : undefined,
        referrer: typeof payload.referrer === "string" ? payload.referrer.slice(0, 700) : undefined,
        language: typeof payload.language === "string" ? payload.language.slice(0, 30) : undefined,
        visitorId,
        sessionId,
        utm: asRecord(payload.utm),
        webdriver: payload.webdriver === true,
      },
      {
        host: new URL(request.url).hostname,
        ip: getClientIp(request),
        userAgent: request.headers.get("user-agent") || "",
        country: request.headers.get("x-vercel-ip-country") || undefined,
      },
    );
    return NextResponse.json({ ok: true, accepted: result.accepted }, { status: 202 });
  } catch (error) {
    console.error("[analytics] collection failed", { message: error instanceof Error ? error.message : "unknown error" });
    return NextResponse.json({ ok: false, error: "Analytics event could not be recorded." }, { status: 503 });
  }
}
