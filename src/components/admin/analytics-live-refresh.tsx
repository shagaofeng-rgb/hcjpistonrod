"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export function AnalyticsLiveRefresh() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const refresh = useCallback(() => {
    setRefreshing(true);
    router.refresh();
    window.setTimeout(() => setRefreshing(false), 450);
  }, [router]);
  useEffect(() => {
    const interval = window.setInterval(refresh, 60_000);
    return () => window.clearInterval(interval);
  }, [refresh]);
  return <button type="button" onClick={refresh} disabled={refreshing} className="inline-flex h-10 items-center gap-2 rounded-md border border-[#d3e0e7] bg-white px-3 text-sm font-semibold text-[#132b42] transition hover:border-[#0068ae] disabled:opacity-60"><RefreshCw size={16} className={refreshing ? "animate-spin" : ""} /> {refreshing ? "更新中" : "刷新数据"}</button>;
}
