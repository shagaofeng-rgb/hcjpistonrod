export type AdminSearchParams = Record<string, string | string[] | undefined>;

export type AdminDateRangePreset = "all" | "today" | "week" | "month" | "custom";

export type AdminDateRange = {
  preset: AdminDateRangePreset;
  startDate?: string;
  endDate?: string;
  label: string;
};

function valueOf(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function isDate(value: string | undefined): value is string {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`)));
}

function shanghaiToday() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function addDays(value: string, days: number) {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function resolveAdminDateRange(searchParams: AdminSearchParams = {}): AdminDateRange {
  const presetValue = valueOf(searchParams.range);
  const preset: AdminDateRangePreset = ["today", "week", "month", "custom"].includes(presetValue ?? "")
    ? presetValue as AdminDateRangePreset
    : "all";
  const today = shanghaiToday();

  if (preset === "today") return { preset, startDate: today, endDate: today, label: "当天" };

  if (preset === "week") {
    const dayOfWeek = new Date(`${today}T00:00:00Z`).getUTCDay() || 7;
    return { preset, startDate: addDays(today, 1 - dayOfWeek), endDate: today, label: "本周" };
  }

  if (preset === "month") return { preset, startDate: `${today.slice(0, 8)}01`, endDate: today, label: "本月" };

  if (preset === "custom") {
    const startDate = valueOf(searchParams.from);
    const endDate = valueOf(searchParams.to);
    if (isDate(startDate) && isDate(endDate) && startDate <= endDate) {
      return { preset, startDate, endDate, label: `${startDate} 至 ${endDate}` };
    }
    return { preset, label: "自定义日期" };
  }

  return { preset, label: "全部时间" };
}

export function appendDateRangeCondition(where: string[], values: unknown[], column: string, range: AdminDateRange) {
  if (!range.startDate || !range.endDate) return;
  values.push(range.startDate, range.endDate);
  const start = `$${values.length - 1}`;
  const end = `$${values.length}`;
  where.push(`(${column} at time zone 'Asia/Shanghai')::date between ${start}::date and ${end}::date`);
}

export function appendDateOnlyRangeCondition(where: string[], values: unknown[], column: string, range: AdminDateRange) {
  if (!range.startDate || !range.endDate) return;
  values.push(range.startDate, range.endDate);
  where.push(`${column} between $${values.length - 1}::date and $${values.length}::date`);
}
