export const TZ = "America/Lima";

// Formato de moneda en Soles (PEN)
const soles = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  minimumFractionDigits: 2,
});

export function formatPEN(value: number | string | null | undefined): string {
  const n = typeof value === "string" ? Number(value) : value ?? 0;
  return soles.format(Number.isFinite(n as number) ? (n as number) : 0);
}

// Fecha "hoy" en zona America/Lima como YYYY-MM-DD
export function todayInLima(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

// Convierte un instante ISO a hora legible de Lima
export function formatDateTimeLima(iso: string): string {
  return new Intl.DateTimeFormat("es-PE", {
    timeZone: TZ,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatTimeLima(iso: string): string {
  return new Intl.DateTimeFormat("es-PE", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

// Rango [inicio, fin) en UTC (ISO) para un día calendario de Lima.
// Lima es UTC-5 sin horario de verano.
export function limaDayRangeUtc(dateYmd: string): { desde: string; hasta: string } {
  const desde = new Date(`${dateYmd}T00:00:00-05:00`);
  const hasta = new Date(desde.getTime() + 24 * 60 * 60 * 1000);
  return { desde: desde.toISOString(), hasta: hasta.toISOString() };
}
