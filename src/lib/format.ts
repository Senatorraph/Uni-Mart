export function formatNaira(value: number | string | null | undefined): string {
  const n = typeof value === "string" ? parseFloat(value) : value ?? 0;
  if (!isFinite(n as number)) return "₦0";
  return "₦" + (n as number).toLocaleString("en-NG", { maximumFractionDigits: 0 });
}
