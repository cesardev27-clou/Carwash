"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TextField } from "@/components/ui/TextField";
import { ActiveToggle } from "@/components/ui/ActiveToggle";
import { guardarTipo, toggleTipo } from "../actions";

type Tipo = { id: string; nombre: string; orden: number; activo: boolean };

export function TiposManager({ tipos }: { tipos: Tipo[] }) {
  const router = useRouter();
  const [editId, setEditId] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [orden, setOrden] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function startNew() {
    setEditId(null);
    setNombre("");
    setOrden(String(tipos.length + 1));
    setError(null);
  }
  function startEdit(t: Tipo) {
    setEditId(t.id);
    setNombre(t.nombre);
    setOrden(String(t.orden));
    setError(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    setError(null);
    setSaving(true);
    const res = await guardarTipo({
      id: editId ?? undefined,
      nombre,
      orden: Number(orden) || 0,
    });
    setSaving(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setNombre("");
    setOrden("");
    setEditId(null);
    router.refresh();
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      {/* Lista */}
      <div className="card overflow-hidden">
        <div className="border-b border-hairline px-4 py-3">
          <h2 className="text-sm font-semibold text-ink">Tipos de vehículo</h2>
          <p className="text-xs text-muted">Las columnas de tu tablero de precios.</p>
        </div>
        {tipos.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted">
            Aún no tienes tipos. Crea tu primer tipo de vehículo →
          </p>
        ) : (
          <ul className="divide-y divide-hairline">
            {tipos.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">
                    <span className="mr-2 text-xs text-muted">#{t.orden}</span>
                    {t.nombre}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => startEdit(t)}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Editar
                  </button>
                  <ActiveToggle
                    activo={t.activo}
                    label={`el tipo "${t.nombre}"`}
                    onToggle={async (next) => {
                      const r = await toggleTipo(t.id, next);
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

      {/* Formulario */}
      <form onSubmit={submit} className="card h-fit space-y-4 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">
            {editId ? "Editar tipo" : "Nuevo tipo"}
          </h2>
          {editId && (
            <button type="button" onClick={startNew} className="text-xs text-muted hover:text-ink">
              Cancelar
            </button>
          )}
        </div>
        <TextField
          label="Nombre"
          placeholder="Camioneta grande"
          value={nombre}
          onChange={setNombre}
          required
        />
        <TextField
          label="Orden"
          inputMode="numeric"
          placeholder="1"
          value={orden}
          onChange={(v) => setOrden(v.replace(/\D+/g, ""))}
          hint="Posición en la lista al registrar."
        />
        {error && <p className="field-error">{error}</p>}
        <button type="submit" disabled={saving} className="btn-accent w-full">
          {saving ? "Guardando…" : editId ? "Guardar cambios" : "Crear tipo"}
        </button>
      </form>
    </div>
  );
}
