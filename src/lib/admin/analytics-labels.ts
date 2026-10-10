export function sourceChannelLabel(value: string | null | undefined) {
  const labels: Record<string, string> = {
    direct: "直接访问",
    organic_search: "自然搜索",
    paid_search: "付费搜索",
    social: "社交媒体",
    referral: "外部引荐",
    campaign: "营销活动",
    email: "邮件",
  };
  return value ? labels[value] || value : "未知来源";
}
