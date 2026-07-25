"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TextField } from "@/components/ui/TextField";
import { ActiveToggle } from "@/components/ui/ActiveToggle";
import { guardarLavador, toggleLavador } from "../actions";
import { validarNombre, validarTelefono, soloDigitos } from "@/lib/validation";

type Lavador = {
  id: string;
  nombre: string;
  apellido: string;
  telefono: string;
  activo: boolean;
};

export function LavadoresManager({ lavadores }: { lavadores: Lavador[] }) {
  const router = useRouter();
  const [editId, setEditId] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [telefono, setTelefono] = useState("");
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function resetForm() {
    setEditId(null);
    setNombre("");
    setApellido("");
    setTelefono("");
    setErrors({});
    setError(null);
  }
  function startEdit(l: Lavador) {
    setEditId(l.id);
    setNombre(l.nombre);
    setApellido(l.apellido);
    setTelefono(l.telefono);
    setErrors({});
    setError(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    const nextErr = {
      nombre: validarNombre(nombre),
      apellido: validarNombre(apellido),
      telefono: validarTelefono(soloDigitos(telefono)),
    };
    setErrors(nextErr);
    if (Object.values(nextErr).some(Boolean)) return;

    setSaving(true);
    const res = await guardarLavador({
      id: editId ?? undefined,
      nombre,
      apellido,
      telefono,
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
    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <div className="card overflow-hidden">
        <div className="border-b border-hairline px-4 py-3">
          <h2 className="text-sm font-semibold text-ink">Lavadores</h2>
        </div>
        {lavadores.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted">
            Aún no hay lavadores. Registra a tu primer lavador →
          </p>
        ) : (
          <ul className="divide-y divide-hairline">
            {lavadores.map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">
                    {l.nombre} {l.apellido}
                  </p>
                  <p className="text-xs text-muted">{l.telefono}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => startEdit(l)}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Editar
                  </button>
                  <ActiveToggle
                    activo={l.activo}
                    label={`a "${l.nombre} ${l.apellido}"`}
                    onToggle={async (next) => {
                      const r = await toggleLavador(l.id, next);
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
            {editId ? "Editar lavador" : "Nuevo lavador"}
          </h2>
          {editId && (
            <button type="button" onClick={resetForm} className="text-xs text-muted hover:text-ink">
              Cancelar
            </button>
          )}
        </div>
        <TextField
          label="Nombre"
          placeholder="Juan"
          value={nombre}
          onChange={setNombre}
          onBlur={() => setErrors((e) => ({ ...e, nombre: validarNombre(nombre) }))}
          error={errors.nombre}
          required
        />
        <TextField
          label="Apellido"
          placeholder="Pérez"
          value={apellido}
          onChange={setApellido}
          onBlur={() => setErrors((e) => ({ ...e, apellido: validarNombre(apellido) }))}
          error={errors.apellido}
          required
        />
        <TextField
          label="Teléfono"
          inputMode="numeric"
          placeholder="987654321"
          value={telefono}
          onChange={(v) => setTelefono(soloDigitos(v))}
          onBlur={() => setErrors((e) => ({ ...e, telefono: validarTelefono(soloDigitos(telefono)) }))}
          error={errors.telefono}
          maxLength={12}
          required
        />
        {error && <p className="field-error">{error}</p>}
        <button type="submit" disabled={saving} className="btn-accent w-full">
          {saving ? "Guardando…" : editId ? "Guardar cambios" : "Crear lavador"}
        </button>
      </form>
    </div>
  );
}
