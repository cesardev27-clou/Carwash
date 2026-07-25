"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TextField } from "@/components/ui/TextField";
import { ActiveToggle } from "@/components/ui/ActiveToggle";
import { guardarForma, toggleForma } from "../actions";

type Forma = { id: string; nombre: string; moneda: string; activo: boolean };

export function PagosManager({ formas }: { formas: Forma[] }) {
  const router = useRouter();
  const [editId, setEditId] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function resetForm() {
    setEditId(null);
    setNombre("");
    setError(null);
  }
  function startEdit(f: Forma) {
    setEditId(f.id);
    setNombre(f.nombre);
    setError(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    setError(null);
    setSaving(true);
    const res = await guardarForma({ id: editId ?? undefined, nombre });
    setSaving(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    resetForm();
    router.refresh();
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <div className="card overflow-hidden">
        <div className="border-b border-hairline px-4 py-3">
          <h2 className="text-sm font-semibold text-ink">Formas de pago</h2>
          <p className="text-xs text-muted">Moneda por defecto: Soles (PEN).</p>
        </div>
        {formas.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted">
            Aún no hay formas de pago. Crea la primera (ej. Efectivo) →
          </p>
        ) : (
          <ul className="divide-y divide-hairline">
            {formas.map((f) => (
              <li key={f.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{f.nombre}</p>
                  <p className="text-xs text-muted">{f.moneda}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => startEdit(f)}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Editar
                  </button>
                  <ActiveToggle
                    activo={f.activo}
                    label={`la forma "${f.nombre}"`}
                    onToggle={async (next) => {
                      const r = await toggleForma(f.id, next);
                      if (r.ok) router.refresh();
                      return r;
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <form onSubmit={submit} className="card h-fit space-y-4 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">
            {editId ? "Editar forma de pago" : "Nueva forma de pago"}
          </h2>
          {editId && (
            <button type="button" onClick={resetForm} className="text-xs text-muted hover:text-ink">
              Cancelar
            </button>
          )}
        </div>
        <TextField
          label="Nombre"
          placeholder="Yape"
          value={nombre}
          onChange={setNombre}
          required
        />
        <div>
          <span className="field-label">Moneda</span>
          <div className="flex h-[46px] items-center rounded-lg border border-hairline bg-canvas px-3 text-sm text-muted">
            Soles (PEN) · por defecto
          </div>
        </div>
        {error && <p className="field-error">{error}</p>}
        <button type="submit" disabled={saving} className="btn-accent w-full">
          {saving ? "Guardando…" : editId ? "Guardar cambios" : "Crear forma de pago"}
        </button>
      </form>
    </div>
  );
}
