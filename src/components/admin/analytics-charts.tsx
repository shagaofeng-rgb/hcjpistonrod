type TrendPoint = { day: string; pageViews: number; visitors: number };
type Channel = { label: string; pageViews: number; visitors: number };

export function AnalyticsCharts({ trend, channels }: { trend: TrendPoint[]; channels: Channel[] }) {
  const maxTrend = Math.max(...trend.map((point) => point.pageViews), 1);
  const maxChannel = Math.max(...channels.map((channel) => channel.visitors), 1);
  return <div className="grid gap-6 p-5 xl:grid-cols-[1.35fr_0.65fr]">
    <section aria-label="访问趋势图" className="min-w-0">
      <div className="mb-5 flex items-baseline justify-between gap-3"><h3 className="text-sm font-semibold text-[#132b42]">访问趋势</h3><span className="text-xs text-[#526a7c]">每日页面浏览</span></div>
      <div className="overflow-x-auto pb-2">
      <div className="flex h-48 min-w-full items-end gap-1 border-b border-l border-[#d3e0e7] px-3 pt-4" style={{ width: `${Math.max(trend.length * 11, 320)}px` }}>
        {trend.map((point) => <div key={point.day} className="group flex h-full min-w-2 flex-1 flex-col justify-end" title={`${point.day}: ${point.pageViews} 次浏览，${point.visitors} 位访客`}>
          <div className="rounded-t bg-[#0068ae] transition-colors group-hover:bg-[#19a9e5]" style={{ height: `${(point.pageViews / maxTrend) * 100}%` }} />
        </div>)}
      </div>
      </div>
      <div className="mt-2 flex justify-between gap-3 text-[11px] text-[#7890a0]"><span>{trend[0]?.day}</span><span>{trend.at(-1)?.day}</span></div>
      <details className="mt-4 text-sm text-[#526a7c]"><summary className="cursor-pointer font-medium text-[#0068ae]">查看趋势数据表</summary><div className="mt-2 max-h-64 overflow-auto rounded-md border border-[#d3e0e7]"><table className="w-full text-left text-xs"><thead className="sticky top-0 bg-[#f2f6f8]"><tr><th className="px-3 py-2">日期</th><th className="px-3 py-2">页面浏览</th><th className="px-3 py-2">独立访客</th></tr></thead><tbody>{trend.map((point) => <tr key={point.day} className="border-t border-[#e8f0f4]"><td className="px-3 py-2">{point.day}</td><td className="px-3 py-2">{point.pageViews}</td><td className="px-3 py-2">{point.visitors}</td></tr>)}</tbody></table></div></details>
    </section>
    <section aria-label="来源渠道图" className="min-w-0"><h3 className="mb-5 text-sm font-semibold text-[#132b42]">访客来源</h3><div className="grid gap-3">{channels.length ? channels.slice(0, 5).map((channel) => <div key={channel.label}><div className="mb-1 flex items-center justify-between gap-3 text-xs"><span className="truncate text-[#526a7c]">{channel.label}</span><span className="font-semibold text-[#132b42]">{channel.visitors} 位</span></div><div className="h-2 overflow-hidden rounded-full bg-[#e8f0f4]"><div className="h-full rounded-full bg-[#19a9e5]" style={{ width: `${(channel.visitors / maxChannel) * 100}%` }} /></div></div>) : <p className="text-sm text-[#526a7c]">当前范围暂无来源数据。</p>}</div></section>
  </div>;
}
