"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Lavador = { id: string; nombre: string; apellido: string };

export function ReporteFiltros({
  hoy,
  desde,
  hasta,
  lavador,
  lavadores,
}: {
  hoy: string;
  desde: string;
  hasta: string;
  lavador: string;
  lavadores: Lavador[];
}) {
  const router = useRouter();
  const [d, setD] = useState(desde);
  const [h, setH] = useState(hasta);
  const [lav, setLav] = useState(lavador);

  function aplicar(next?: Partial<{ d: string; h: string; lav: string }>) {
    const params = new URLSearchParams();
    const nd = next?.d ?? d;
    const nh = next?.h ?? h;
    const nl = next?.lav ?? lav;
    params.set("desde", nd);
    params.set("hasta", nh);
    if (nl) params.set("lavador", nl);
    router.push(`/reporte?${params.toString()}`);
  }

  function hoyRapido() {
    setD(hoy);
    setH(hoy);
    aplicar({ d: hoy, h: hoy });
  }

  return (
    <div className="card p-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <div>
          <label className="field-label" htmlFor="desde">Desde</label>
          <input
            id="desde"
            type="date"
            value={d}
            max={hoy}
            onChange={(e) => setD(e.target.value)}
            className="field-input"
          />
        </div>
        <div>
          <label className="field-label" htmlFor="hasta">Hasta</label>
          <input
            id="hasta"
            type="date"
            value={h}
            max={hoy}
            min={d}
            onChange={(e) => setH(e.target.value)}
            className="field-input"
          />
        </div>
        <div>
          <label className="field-label" htmlFor="lavador">Lavador</label>
          <select
            id="lavador"
            value={lav}
            onChange={(e) => setLav(e.target.value)}
            className="field-input appearance-none"
          >
            <option value="">Todos</option>
            {lavadores.map((l) => (
              <option key={l.id} value={l.id}>
                {l.nombre} {l.apellido}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end gap-2">
          <button onClick={() => aplicar()} className="btn-primary flex-1">
            Aplicar
          </button>
          <button onClick={hoyRapido} className="btn-ghost">
            Hoy
          </button>
        </div>
      </div>
    </div>
  );
}
