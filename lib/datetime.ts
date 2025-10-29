// lib/datetime.ts
export function toDatetimeLocal(d: Date = new Date()): string {
  const z = (n: number) => `${n}`.padStart(2, "0");
  const tz = d.getTimezoneOffset();
  const t = new Date(d.getTime() - tz * 60_000);
  // YYYY-MM-DDTHH:mm
  return `${t.getFullYear()}-${z(t.getMonth() + 1)}-${z(t.getDate())}T${z(t.getHours())}:${z(t.getMinutes())}`;
}
