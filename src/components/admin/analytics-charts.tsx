type TrendPoint = { day: string; pageViews: number; visitors: number };
type Channel = { label: string; pageViews: number; visitors: number };

export function AnalyticsCharts({ trend, channels }: { trend: TrendPoint[]; channels: Channel[] }) {
  const maxTrend = Math.max(...trend.map((point) => point.pageViews), 1);
  const maxChannel = Math.max(...channels.map((channel) => channel.visitors), 1);
  return <div className="grid gap-6 p-5 xl:grid-cols-[1.35fr_0.65fr]">
    <section aria-label="访问趋势图" className="min-w-0">
      <div className="mb-5 flex items-baseline justify-between gap-3"><h3 className="text-sm font-semibold text-[#132b42]">访问趋势</h3><span className="text-xs text-[#7890a0]">页面浏览</span></div>
      <div className="flex h-48 items-end gap-1.5 border-b border-l border-[#d3e0e7] px-3 pt-4">
        {trend.map((point) => <div key={point.day} className="group flex h-full min-w-0 flex-1 flex-col justify-end" title={`${point.day}: ${point.pageViews} 次浏览，${point.visitors} 位访客`}>
          <div className="min-h-1 rounded-t bg-[#0068ae] transition group-hover:bg-[#19a9e5]" style={{ height: `${Math.max((point.pageViews / maxTrend) * 100, 3)}%` }} />
        </div>)}
      </div>
      <div className="mt-2 flex justify-between gap-3 text-[11px] text-[#7890a0]"><span>{trend[0]?.day}</span><span>{trend.at(-1)?.day}</span></div>
    </section>
    <section aria-label="来源渠道图" className="min-w-0"><h3 className="mb-5 text-sm font-semibold text-[#132b42]">访客来源</h3><div className="grid gap-3">{channels.slice(0, 5).map((channel) => <div key={channel.label}><div className="mb-1 flex items-center justify-between gap-3 text-xs"><span className="truncate text-[#526a7c]">{channel.label}</span><span className="font-semibold text-[#132b42]">{channel.visitors}</span></div><div className="h-2 overflow-hidden rounded-full bg-[#e8f0f4]"><div className="h-full rounded-full bg-[#19a9e5]" style={{ width: `${Math.max((channel.visitors / maxChannel) * 100, 3)}%` }} /></div></div>)}</div></section>
  </div>;
}
