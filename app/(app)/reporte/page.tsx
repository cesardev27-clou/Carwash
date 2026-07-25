import { createClient } from "@/lib/supabase/server";
import { formatPEN, formatTimeLima, todayInLima, limaDayRangeUtc } from "@/lib/format";
import { ReporteFiltros } from "./ReporteFiltros";

export const metadata = { title: "Reporte del día — Carwash" };

type SP = { [k: string]: string | string[] | undefined };

function one(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function ReportePage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const hoy = todayInLima();
  const desde = one(sp.desde) || hoy;
  const hastaRaw = one(sp.hasta) || desde;
  const hasta = hastaRaw < desde ? desde : hastaRaw;
  const lavadorFiltro = one(sp.lavador) || "";

  const supabase = await createClient();

  // Lavadores para el filtro (incluye inactivos por historial)
  const { data: lavadores } = await supabase
    .from("lavadores")
    .select("id, nombre, apellido")
    .order("nombre", { ascending: true });

  // Rango UTC que cubre [desde, hasta] en días de Lima
  const inicio = limaDayRangeUtc(desde).desde;
  const fin = limaDayRangeUtc(hasta).hasta;

  let query = supabase
    .from("atenciones")
    .select(
      "id, fecha_hora, cliente_nombre, placa, precio, lavador_id, servicios(nombre), tipos_vehiculo(nombre), lavadores(nombre, apellido), formas_pago(nombre)"
    )
    .gte("fecha_hora", inicio)
    .lt("fecha_hora", fin)
    .order("fecha_hora", { ascending: false });

  if (lavadorFiltro) query = query.eq("lavador_id", lavadorFiltro);

  const { data: atencionesRaw } = await query;
  type Row = {
    id: string;
    fecha_hora: string;
    cliente_nombre: string;
    placa: string;
    precio: number;
    lavador_id: string;
    servicios: { nombre: string } | null;
    tipos_vehiculo: { nombre: string } | null;
    lavadores: { nombre: string; apellido: string } | null;
    formas_pago: { nombre: string } | null;
  };
  const atenciones = (atencionesRaw ?? []) as unknown as Row[];

  const total = atenciones.reduce((s, a) => s + Number(a.precio), 0);

  // Desglose por lavador
  const porLavador = new Map<string, { nombre: string; total: number; n: number }>();
  for (const a of atenciones) {
    const nombre = a.lavadores ? `${a.lavadores.nombre} ${a.lavadores.apellido}` : "—";
    const cur = porLavador.get(nombre) ?? { nombre, total: 0, n: 0 };
    cur.total += Number(a.precio);
    cur.n += 1;
    porLavador.set(nombre, cur);
  }

  // Desglose por forma de pago
  const porForma = new Map<string, { nombre: string; total: number; n: number }>();
  for (const a of atenciones) {
    const nombre = a.formas_pago?.nombre ?? "—";
    const cur = porForma.get(nombre) ?? { nombre, total: 0, n: 0 };
    cur.total += Number(a.precio);
    cur.n += 1;
    porForma.set(nombre, cur);
  }

  const mismoDia = desde === hasta;

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-ink">Reporte</h1>
        <p className="mt-0.5 text-sm text-muted">
          {mismoDia
            ? `Atenciones del ${desde}`
            : `Atenciones del ${desde} al ${hasta}`}
        </p>
      </div>

      <ReporteFiltros
        hoy={hoy}
        desde={desde}
        hasta={hasta}
        lavador={lavadorFiltro}
        lavadores={lavadores ?? []}
      />

      {/* Resumen */}
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="card p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            Total del período
          </p>
          <p className="mt-1 text-2xl font-bold text-accent">{formatPEN(total)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            Atenciones
          </p>
          <p className="mt-1 text-2xl font-bold text-ink">{atenciones.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            Ticket promedio
          </p>
          <p className="mt-1 text-2xl font-bold text-ink">
            {formatPEN(atenciones.length ? total / atenciones.length : 0)}
          </p>
        </div>
      </div>

      {/* Desgloses */}
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="card p-4">
          <h2 className="mb-2 text-sm font-semibold text-ink">Por lavador</h2>
          <Breakdown rows={[...porLavador.values()].sort((a, b) => b.total - a.total)} />
        </div>
        <div className="card p-4">
          <h2 className="mb-2 text-sm font-semibold text-ink">Por forma de pago</h2>
          <Breakdown rows={[...porForma.values()].sort((a, b) => b.total - a.total)} />
        </div>
      </div>

      {/* Lista */}
      <div className="mt-3 card overflow-hidden">
        <h2 className="border-b border-hairline px-4 py-3 text-sm font-semibold text-ink">
          Detalle de atenciones
        </h2>
        {atenciones.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted">
            No hay atenciones en este período.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted">
                  <th className="px-4 py-2 font-medium">Hora</th>
                  <th className="px-4 py-2 font-medium">Placa</th>
                  <th className="px-4 py-2 font-medium">Cliente</th>
                  <th className="px-4 py-2 font-medium">Servicio</th>
                  <th className="px-4 py-2 font-medium">Tipo</th>
                  <th className="px-4 py-2 font-medium">Lavador</th>
                  <th className="px-4 py-2 font-medium">Pago</th>
                  <th className="px-4 py-2 text-right font-medium">Precio</th>
                </tr>
              </thead>
              <tbody>
                {atenciones.map((a) => (
                  <tr key={a.id} className="border-t border-hairline">
                    <td className="whitespace-nowrap px-4 py-2.5 text-muted">
                      {formatTimeLima(a.fecha_hora)}
                    </td>
                    <td className="px-4 py-2.5 font-semibold text-ink">{a.placa}</td>
                    <td className="px-4 py-2.5 text-ink">{a.cliente_nombre}</td>
                    <td className="px-4 py-2.5 text-ink">{a.servicios?.nombre ?? "—"}</td>
                    <td className="px-4 py-2.5 text-muted">{a.tipos_vehiculo?.nombre ?? "—"}</td>
                    <td className="px-4 py-2.5 text-ink">
                      {a.lavadores ? `${a.lavadores.nombre} ${a.lavadores.apellido}` : "—"}
                    </td>
                    <td className="px-4 py-2.5 text-muted">{a.formas_pago?.nombre ?? "—"}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-right font-semibold text-ink">
                      {formatPEN(a.precio)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-hairline bg-canvas/60">
                  <td colSpan={7} className="px-4 py-2.5 text-right font-medium text-muted">
                    Total
                  </td>
                  <td className="px-4 py-2.5 text-right text-base font-bold text-accent">
                    {formatPEN(total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Breakdown({
  rows,
}: {
  rows: { nombre: string; total: number; n: number }[];
}) {
  if (rows.length === 0)
    return <p className="py-3 text-sm text-muted">Sin datos.</p>;
  return (
    <ul className="divide-y divide-hairline">
      {rows.map((r) => (
        <li key={r.nombre} className="flex items-center justify-between py-2">
          <span className="text-sm text-ink">
            {r.nombre} <span className="text-muted">· {r.n}</span>
          </span>
          <span className="text-sm font-semibold text-ink">{formatPEN(r.total)}</span>
        </li>
      ))}
    </ul>
  );
}
