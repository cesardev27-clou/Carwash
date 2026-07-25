"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { TextField } from "@/components/ui/TextField";
import { SelectField } from "@/components/ui/SelectField";
import { formatPEN, todayInLima } from "@/lib/format";
import {
  validarNombre,
  validarCorreo,
  validarCelular,
  validarPlaca,
  normalizarPlaca,
  soloDigitos,
} from "@/lib/validation";
import { registrarAtencion } from "./actions";
import { cn } from "@/lib/utils";

type Tipo = { id: string; nombre: string; orden: number };
type Servicio = { id: string; nombre: string; grupo: string | null };
type PrecioRow = { servicio_id: string; tipo_vehiculo_id: string; precio: number };
type Lavador = { id: string; nombre: string; apellido: string };
type Forma = { id: string; nombre: string; moneda: string };

const EMPTY = {
  cliente_nombre: "",
  cliente_correo: "",
  cliente_celular: "",
  placa: "",
  marca_modelo: "",
  tipo_vehiculo_id: "",
  servicio_id: "",
  lavador_id: "",
  forma_pago_id: "",
};

export function RegistroForm({
  tipos,
  servicios,
  precios,
  lavadores,
  formas,
}: {
  tipos: Tipo[];
  servicios: Servicio[];
  precios: PrecioRow[];
  lavadores: Lavador[];
  formas: Forma[];
}) {
  const router = useRouter();
  const hoy = todayInLima();
  const firstFieldWrapper = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({ ...EMPTY });
  const [fecha, setFecha] = useState(hoy);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [submitting, setSubmitting] = useState(false);
  const [flash, setFlash] = useState<{ ok: boolean; msg: string } | null>(null);

  const set = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));
  const setErr = (k: string, v: string | null) =>
    setErrors((e) => ({ ...e, [k]: v }));

  // Matriz de precios: "servicio|tipo" -> precio
  const precioMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of precios) m.set(`${p.servicio_id}|${p.tipo_vehiculo_id}`, Number(p.precio));
    return m;
  }, [precios]);

  const precioActual = useMemo(() => {
    if (!form.servicio_id || !form.tipo_vehiculo_id) return undefined;
    return precioMap.get(`${form.servicio_id}|${form.tipo_vehiculo_id}`);
  }, [form.servicio_id, form.tipo_vehiculo_id, precioMap]);

  const sinPrecioCombo =
    !!form.servicio_id && !!form.tipo_vehiculo_id && precioActual === undefined;

  function validarTodo(): boolean {
    const next: Record<string, string | null> = {
      cliente_nombre: validarNombre(form.cliente_nombre),
      cliente_correo: validarCorreo(form.cliente_correo),
      cliente_celular: validarCelular(form.cliente_celular),
      placa: validarPlaca(form.placa),
      tipo_vehiculo_id: form.tipo_vehiculo_id ? null : "Elige el tipo de vehículo",
      servicio_id: form.servicio_id ? null : "Elige el servicio",
      lavador_id: form.lavador_id ? null : "Elige el lavador",
      forma_pago_id: form.forma_pago_id ? null : "Elige la forma de pago",
    };
    setErrors(next);
    return Object.values(next).every((v) => !v) && !sinPrecioCombo;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return; // evita doble envío
    setFlash(null);
    if (!validarTodo()) {
      setFlash({ ok: false, msg: "Revisa los campos marcados" });
      return;
    }
    setSubmitting(true);
    const res = await registrarAtencion({ ...form, fecha });
    if (res.ok) {
      setForm({ ...EMPTY });
      setFecha(hoy);
      setErrors({});
      setFlash({
        ok: true,
        msg: `Atención registrada · ${res.resumen.placa} · ${formatPEN(res.resumen.precio)}`,
      });
      router.refresh();
      // Vuelve al primer campo para la siguiente atención
      firstFieldWrapper.current?.querySelector("input")?.focus();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setFlash({ ok: false, msg: res.error });
    }
    setSubmitting(false);
  }

  const tipoOpts = tipos.map((t) => ({ value: t.id, label: t.nombre }));
  const servicioOpts = servicios.map((s) => ({
    value: s.id,
    label: s.grupo ? `${s.nombre} · ${s.grupo}` : s.nombre,
  }));
  const lavadorOpts = lavadores.map((l) => ({
    value: l.id,
    label: `${l.nombre} ${l.apellido}`,
  }));
  const formaOpts = formas.map((f) => ({ value: f.id, label: f.nombre }));

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      {flash && (
        <div
          role="status"
          className={cn(
            "rounded-lg px-3 py-2.5 text-sm font-medium",
            flash.ok ? "bg-success/10 text-success" : "bg-danger/5 text-danger"
          )}
        >
          {flash.msg}
        </div>
      )}

      {/* Cliente */}
      <section className="card p-4 sm:p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
          Cliente
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div ref={firstFieldWrapper}>
            <TextField
              label="Nombre"
              placeholder="María Torres"
              value={form.cliente_nombre}
              onChange={(v) => set("cliente_nombre", v)}
              onBlur={() => setErr("cliente_nombre", validarNombre(form.cliente_nombre))}
              error={errors.cliente_nombre}
              autoComplete="off"
              autoFocus
              required
            />
          </div>
          <TextField
            label="Correo"
            type="email"
            inputMode="email"
            placeholder="nombre@correo.com"
            value={form.cliente_correo}
            onChange={(v) => set("cliente_correo", v)}
            onBlur={() => setErr("cliente_correo", validarCorreo(form.cliente_correo))}
            error={errors.cliente_correo}
            autoComplete="off"
            required
          />
          <TextField
            label="Celular"
            inputMode="numeric"
            placeholder="987654321"
            value={form.cliente_celular}
            onChange={(v) => set("cliente_celular", soloDigitos(v).slice(0, 9))}
            onBlur={() => setErr("cliente_celular", validarCelular(form.cliente_celular))}
            error={errors.cliente_celular}
            maxLength={9}
            required
          />
        </div>
      </section>

      {/* Vehículo */}
      <section className="card p-4 sm:p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
          Vehículo
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Placa"
            placeholder="ABC-123"
            autoCapitalize="characters"
            value={form.placa}
            onChange={(v) => set("placa", normalizarPlaca(v))}
            onBlur={() => setErr("placa", validarPlaca(form.placa))}
            error={errors.placa}
            autoComplete="off"
            maxLength={10}
            required
          />
          <SelectField
            label="Tipo de vehículo"
            value={form.tipo_vehiculo_id}
            onChange={(v) => {
              set("tipo_vehiculo_id", v);
              setErr("tipo_vehiculo_id", v ? null : "Elige el tipo de vehículo");
            }}
            options={tipoOpts}
            error={errors.tipo_vehiculo_id}
            required
          />
          <TextField
            label="Marca y modelo (opcional)"
            placeholder="Toyota Yaris"
            value={form.marca_modelo}
            onChange={(v) => set("marca_modelo", v)}
            autoComplete="off"
          />
        </div>
      </section>

      {/* Servicio */}
      <section className="card p-4 sm:p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
          Servicio
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Servicio brindado"
            value={form.servicio_id}
            onChange={(v) => {
              set("servicio_id", v);
              setErr("servicio_id", v ? null : "Elige el servicio");
            }}
            options={servicioOpts}
            error={errors.servicio_id}
            required
          />
          {/* Precio en vivo */}
          <div className="flex flex-col justify-end">
            <span className="field-label">Precio</span>
            <div
              className={cn(
                "flex h-[46px] items-center rounded-lg border px-3",
                sinPrecioCombo
                  ? "border-warn/40 bg-warn/5"
                  : "border-hairline bg-canvas"
              )}
            >
              {precioActual !== undefined ? (
                <span className="text-lg font-bold text-accent">
                  {formatPEN(precioActual)}
                </span>
              ) : sinPrecioCombo ? (
                <span className="text-sm text-warn">
                  Sin precio para esta combinación
                </span>
              ) : (
                <span className="text-sm text-muted">
                  Elige servicio y tipo de vehículo
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Fecha, lavador y pago */}
      <section className="card p-4 sm:p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
          Atención
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="field-label" htmlFor="fecha">
              Fecha <span className="text-danger">*</span>
            </label>
            <input
              id="fecha"
              type="date"
              value={fecha}
              max={hoy}
              onChange={(e) => setFecha(e.target.value || hoy)}
              className="field-input"
            />
            <p className="mt-1 text-xs text-muted">Hoy por defecto · sin fechas futuras</p>
          </div>
          <SelectField
            label="Lavador"
            value={form.lavador_id}
            onChange={(v) => {
              set("lavador_id", v);
              setErr("lavador_id", v ? null : "Elige el lavador");
            }}
            options={lavadorOpts}
            error={errors.lavador_id}
            required
          />
          <SelectField
            label="Forma de pago"
            value={form.forma_pago_id}
            onChange={(v) => {
              set("forma_pago_id", v);
              setErr("forma_pago_id", v ? null : "Elige la forma de pago");
            }}
            options={formaOpts}
            error={errors.forma_pago_id}
            required
          />
        </div>
      </section>

      {/* Acción primaria (sticky en móvil) */}
      <div className="sticky bottom-16 z-10 -mx-4 border-t border-hairline bg-canvas/90 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
        <button
          type="submit"
          disabled={submitting}
          className="btn-accent w-full sm:w-auto"
        >
          {submitting ? "Guardando…" : "Registrar atención"}
        </button>
      </div>
    </form>
  );
}
