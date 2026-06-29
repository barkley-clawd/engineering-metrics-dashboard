export type Currency = "USD";

export function formatCost(
  value: number | null | undefined,
  currency: Currency = "USD",
  locale: string = "en-US",
): string {
  if (value == null) return "—";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
