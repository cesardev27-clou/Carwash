"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TextField } from "@/components/ui/TextField";
import { ActiveToggle } from "@/components/ui/ActiveToggle";
import { formatPEN } from "@/lib/format";
import { guardarServicio, toggleServicio } from "../actions";

type Servicio = {
  id: string;
  nombre: string;
  descripcion: string | null;
  grupo: string | null;
  activo: boolean;
};
type Tipo = { id: string; nombre: string; orden: number };
type PrecioRow = { servicio_id: string; tipo_vehiculo_id: string; precio: number };

export function ServiciosManager({
  servicios,
  tipos,
  precios,
}: {
  servicios: Servicio[];
  tipos: Tipo[];
  precios: PrecioRow[];
}) {
  const router = useRouter();
  const [editId, setEditId] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [grupo, setGrupo] = useState("");
  const [celdas, setCeldas] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // precio[servicio][tipo]
  const precioIndex = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of precios) m.set(`${p.servicio_id}|${p.tipo_vehiculo_id}`, Number(p.precio));
    return m;
  }, [precios]);

  function resetForm() {
    setEditId(null);
    setNombre("");
    setDescripcion("");
    setGrupo("");
    setCeldas({});
    setError(null);
  }

  function startEdit(s: Servicio) {
    setEditId(s.id);
    setNombre(s.nombre);
    setDescripcion(s.descripcion ?? "");
    setGrupo(s.grupo ?? "");
    const next: Record<string, string> = {};
    for (const t of tipos) {
      const val = precioIndex.get(`${s.id}|${t.id}`);
      next[t.id] = val !== undefined ? String(val) : "";
    }
    setCeldas(next);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    setError(null);
    setSaving(true);
    const res = await guardarServicio({
      id: editId ?? undefined,
      nombre,
      descripcion,
      grupo,
      precios: tipos.map((t) => ({
        tipo_vehiculo_id: t.id,
        precio: celdas[t.id] ?? "",
      })),
    });
    setSaving(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    resetForm();
    router.refresh();
  }

  return (
    <div className="space-y-5">
      {/* Formulario servicio + matriz */}
      <form onSubmit={submit} className="card space-y-4 p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">
            {editId ? "Editar servicio" : "Nuevo servicio"}
          </h2>
          {editId && (
            <button type="button" onClick={resetForm} className="text-xs text-muted hover:text-ink">
              Cancelar
            </button>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <TextField
            label="Nombre"
            placeholder="Lavado full"
            value={nombre}
            onChange={setNombre}
            required
          />
          <TextField
            label="Grupo / familia (opcional)"
            placeholder="Lavado"
            value={grupo}
            onChange={setGrupo}
          />
          <TextField
            label="Descripción (opcional)"
            placeholder="Exterior + interior"
            value={descripcion}
            onChange={setDescripcion}
          />
        </div>

        <div>
          <p className="field-label">Precio por tipo de vehículo</p>
          <p className="mb-2 text-xs text-muted">
            Deja en blanco si el servicio no aplica a ese tipo.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tipos.map((t) => (
              <div key={t.id}>
                <label className="mb-1 block text-xs font-medium text-muted">
                  {t.nombre}
                </label>
                <div className="flex items-center rounded-lg border border-hairline bg-surface px-3 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20">
                  <span className="text-sm text-muted">S/</span>
                  <input
                    inputMode="decimal"
                    placeholder="0.00"
                    value={celdas[t.id] ?? ""}
                    onChange={(e) =>
                      setCeldas((c) => ({
                        ...c,
                        [t.id]: e.target.value.replace(/[^\d.]/g, ""),
                      }))
                    }
                    className="w-full bg-transparent px-2 py-2.5 text-ink outline-none placeholder:text-muted/60"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && <p className="field-error">{error}</p>}
        <button type="submit" disabled={saving} className="btn-accent w-full sm:w-auto">
          {saving ? "Guardando…" : editId ? "Guardar cambios" : "Crear servicio"}
        </button>
      </form>

      {/* Tablero de precios */}
      <div className="card overflow-hidden">
        <div className="border-b border-hairline px-4 py-3">
          <h2 className="text-sm font-semibold text-ink">Tablero de precios</h2>
          <p className="text-xs text-muted">Filas: servicios · Columnas: tipos de vehículo.</p>
        </div>
        {servicios.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted">
            Crea tu primer servicio con el formulario de arriba.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted">
                  <th className="px-4 py-2 font-medium">Servicio</th>
                  {tipos.map((t) => (
                    <th key={t.id} className="px-3 py-2 text-right font-medium">
                      {t.nombre}
                    </th>
                  ))}
                  <th className="px-4 py-2 text-right font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {servicios.map((s) => (
                  <tr key={s.id} className="border-t border-hairline align-top">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => startEdit(s)}
                        className="text-left font-medium text-ink hover:text-accent"
                      >
                        {s.nombre}
                      </button>
                      {s.grupo && (
                        <span className="ml-2 badge bg-canvas text-muted">{s.grupo}</span>
                      )}
                      {s.descripcion && (
                        <p className="mt-0.5 text-xs text-muted">{s.descripcion}</p>
                      )}
                    </td>
                    {tipos.map((t) => {
                      const val = precioIndex.get(`${s.id}|${t.id}`);
                      return (
                        <td key={t.id} className="px-3 py-3 text-right">
                          {val !== undefined ? (
                            <span className="font-medium text-ink">{formatPEN(val)}</span>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-4 py-3 text-right">
                      <ActiveToggle
                        activo={s.activo}
                        label={`el servicio "${s.nombre}"`}
                        onToggle={async (next) => {
                          const r = await toggleServicio(s.id, next);
                          if (r.ok) router.refresh();
                          return r;
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
