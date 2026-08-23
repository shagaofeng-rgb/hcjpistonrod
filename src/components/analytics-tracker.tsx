"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const VISITOR_KEY = "hcj_visitor_id";
const SESSION_KEY = "hcj_session_id";
const PRODUCTION_HOSTS = new Set(["hcjpistonrod.com", "www.hcjpistonrod.com"]);

function identity(storage: Storage, key: string) {
  const existing = storage.getItem(key);
  if (existing) return existing;
  const value = crypto.randomUUID();
  storage.setItem(key, value);
  return value;
}

function readUtm(search: string) {
  const params = new URLSearchParams(search);
  return Object.fromEntries(["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].flatMap((key) => {
    const value = params.get(key);
    return value ? [[key, value.slice(0, 120)]] : [];
  }));
}

export function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!PRODUCTION_HOSTS.has(window.location.hostname)) return;
    const visitorId = identity(window.localStorage, VISITOR_KEY);
    const sessionId = identity(window.sessionStorage, SESSION_KEY);
    const timer = window.setTimeout(() => {
      void fetch("/api/analytics/collect", {
        method: "POST",
        keepalive: true,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          eventName: "page_view",
          pagePath: pathname,
          pageTitle: document.title,
          referrer: document.referrer,
          language: navigator.language,
          visitorId,
          sessionId,
          utm: readUtm(window.location.search),
          webdriver: navigator.webdriver,
        }),
      }).catch(() => undefined);
    }, 750);
    return () => window.clearTimeout(timer);
  }, [pathname, searchParams]);

  return null;
}
