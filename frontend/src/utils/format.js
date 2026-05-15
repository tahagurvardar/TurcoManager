export const LEAGUE = "Süper Lig";

export function formatMoney(value) {
  const number = Number(value || 0);
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(number);
}

export function formatCompact(value) {
  return new Intl.NumberFormat("tr-TR", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number(value || 0));
}

export function formatDate(value) {
  if (!value) return "Tarih yok";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    weekday: "short",
  }).format(new Date(value));
}

export function percent(value, max = 100) {
  return Math.max(0, Math.min(100, (Number(value || 0) / max) * 100));
}

export function roleLabel(role) {
  return role === "admin" ? "Admin" : "Teknik Direktör";
}
