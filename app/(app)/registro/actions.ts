"use server";

import { createClient } from "@/lib/supabase/server";
import { todayInLima, TZ } from "@/lib/format";
import {
  validarNombre,
  validarCorreo,
  validarCelular,
  validarPlaca,
  normalizarPlaca,
} from "@/lib/validation";

export type RegistroInput = {
  cliente_nombre: string;
  cliente_correo: string;
  cliente_celular: string;
  placa: string;
  marca_modelo: string;
  tipo_vehiculo_id: string;
  servicio_id: string;
  lavador_id: string;
  forma_pago_id: string;
  fecha: string; // YYYY-MM-DD (zona Lima)
};

export type RegistroResult =
  | { ok: true; resumen: { placa: string; precio: number } }
  | { ok: false; error: string };

// Hora actual de Lima como HH:MM:SS
function limaTimeParts(): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());
}

export async function registrarAtencion(
  input: RegistroInput
): Promise<RegistroResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sesión expirada. Vuelve a ingresar." };

  // Validaciones de servidor (defensa en profundidad)
  const errores = [
    validarNombre(input.cliente_nombre),
    validarCorreo(input.cliente_correo),
    validarCelular(input.cliente_celular),
    validarPlaca(input.placa),
  ].filter(Boolean);
  if (errores.length) return { ok: false, error: errores[0] as string };

  if (!input.tipo_vehiculo_id) return { ok: false, error: "Elige el tipo de vehículo" };
  if (!input.servicio_id) return { ok: false, error: "Elige el servicio" };
  if (!input.lavador_id) return { ok: false, error: "Elige el lavador" };
  if (!input.forma_pago_id) return { ok: false, error: "Elige la forma de pago" };

  // Fecha no futura (regla en zona Lima)
  const hoy = todayInLima();
  if (input.fecha > hoy) {
    return { ok: false, error: "No se permiten fechas futuras" };
  }

  // Construye fecha_hora: si es hoy usa la hora actual; si es pasada, misma hora del día.
  let fechaHora = new Date(`${input.fecha}T${limaTimeParts()}-05:00`);
  const ahora = new Date();
  if (fechaHora.getTime() > ahora.getTime()) fechaHora = ahora;

  // Precio autoritativo desde la matriz -> snapshot
  const { data: precioRow, error: precioErr } = await supabase
    .from("precios")
    .select("precio")
    .eq("servicio_id", input.servicio_id)
    .eq("tipo_vehiculo_id", input.tipo_vehiculo_id)
    .maybeSingle();

  if (precioErr) return { ok: false, error: "No se pudo leer el tarifario" };
  if (!precioRow) {
    return {
      ok: false,
      error: "Ese servicio no tiene precio para el tipo de vehículo elegido",
    };
  }

  const placa = normalizarPlaca(input.placa);

  const { error: insertErr } = await supabase.from("atenciones").insert({
    cliente_nombre: input.cliente_nombre.trim(),
    cliente_correo: input.cliente_correo.trim(),
    cliente_celular: input.cliente_celular.trim(),
    placa,
    marca_modelo: input.marca_modelo.trim() || null,
    tipo_vehiculo_id: input.tipo_vehiculo_id,
    servicio_id: input.servicio_id,
    precio: precioRow.precio,
    lavador_id: input.lavador_id,
    forma_pago_id: input.forma_pago_id,
    fecha_hora: fechaHora.toISOString(),
    // carwash_id se asigna automáticamente por trigger según el usuario.
  });

  if (insertErr) {
    return { ok: false, error: "No se pudo guardar la atención. Intenta de nuevo." };
  }

  return { ok: true, resumen: { placa, precio: Number(precioRow.precio) } };
}
