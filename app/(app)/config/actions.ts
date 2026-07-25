"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { validarTelefono, soloDigitos } from "@/lib/validation";

type Result = { ok: true } | { ok: false; error: string };

// ---------------- Tipos de vehículo ----------------
export async function guardarTipo(input: {
  id?: string;
  nombre: string;
  orden: number;
}): Promise<Result> {
  const supabase = await createClient();
  const nombre = input.nombre.trim();
  if (!nombre) return { ok: false, error: "Ingresa el nombre" };

  if (input.id) {
    const { error } = await supabase
      .from("tipos_vehiculo")
      .update({ nombre, orden: input.orden })
      .eq("id", input.id);
    if (error) return { ok: false, error: "No se pudo guardar" };
  } else {
    const { error } = await supabase
      .from("tipos_vehiculo")
      .insert({ nombre, orden: input.orden });
    if (error) return { ok: false, error: "No se pudo crear" };
  }
  revalidatePath("/config/tipos");
  return { ok: true };
}

export async function toggleTipo(id: string, activo: boolean): Promise<Result> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("tipos_vehiculo")
    .update({ activo })
    .eq("id", id);
  if (error) return { ok: false, error: "No se pudo actualizar" };
  revalidatePath("/config/tipos");
  return { ok: true };
}

// ---------------- Servicios + matriz de precios ----------------
export async function guardarServicio(input: {
  id?: string;
  nombre: string;
  descripcion: string;
  grupo: string;
  precios: { tipo_vehiculo_id: string; precio: string }[];
}): Promise<Result> {
  const supabase = await createClient();
  const nombre = input.nombre.trim();
  if (!nombre) return { ok: false, error: "Ingresa el nombre del servicio" };

  let servicioId = input.id;

  if (servicioId) {
    const { error } = await supabase
      .from("servicios")
      .update({
        nombre,
        descripcion: input.descripcion.trim() || null,
        grupo: input.grupo.trim() || null,
      })
      .eq("id", servicioId);
    if (error) return { ok: false, error: "No se pudo guardar el servicio" };
  } else {
    const { data, error } = await supabase
      .from("servicios")
      .insert({
        nombre,
        descripcion: input.descripcion.trim() || null,
        grupo: input.grupo.trim() || null,
      })
      .select("id")
      .single();
    if (error || !data) return { ok: false, error: "No se pudo crear el servicio" };
    servicioId = data.id;
  }

  // Reemplaza la matriz de precios del servicio
  await supabase.from("precios").delete().eq("servicio_id", servicioId);
  const filas = input.precios
    .filter((p) => p.precio.trim() !== "" && !Number.isNaN(Number(p.precio)))
    .map((p) => ({
      servicio_id: servicioId!,
      tipo_vehiculo_id: p.tipo_vehiculo_id,
      precio: Number(p.precio),
    }));
  if (filas.length) {
    const { error } = await supabase.from("precios").insert(filas);
    if (error) return { ok: false, error: "El servicio se guardó, pero fallaron algunos precios" };
  }

  revalidatePath("/config/servicios");
  return { ok: true };
}

export async function toggleServicio(id: string, activo: boolean): Promise<Result> {
  const supabase = await createClient();
  const { error } = await supabase.from("servicios").update({ activo }).eq("id", id);
  if (error) return { ok: false, error: "No se pudo actualizar" };
  revalidatePath("/config/servicios");
  return { ok: true };
}

// ---------------- Lavadores ----------------
export async function guardarLavador(input: {
  id?: string;
  nombre: string;
  apellido: string;
  telefono: string;
}): Promise<Result> {
  const supabase = await createClient();
  const nombre = input.nombre.trim();
  const apellido = input.apellido.trim();
  const telefono = soloDigitos(input.telefono);
  if (!nombre) return { ok: false, error: "Ingresa el nombre" };
  if (!apellido) return { ok: false, error: "Ingresa el apellido" };
  const errTel = validarTelefono(telefono);
  if (errTel) return { ok: false, error: errTel };

  if (input.id) {
    const { error } = await supabase
      .from("lavadores")
      .update({ nombre, apellido, telefono })
      .eq("id", input.id);
    if (error) return { ok: false, error: "No se pudo guardar" };
  } else {
    const { error } = await supabase
      .from("lavadores")
      .insert({ nombre, apellido, telefono });
    if (error) return { ok: false, error: "No se pudo crear" };
  }
  revalidatePath("/config/lavadores");
  return { ok: true };
}

export async function toggleLavador(id: string, activo: boolean): Promise<Result> {
  const supabase = await createClient();
  const { error } = await supabase.from("lavadores").update({ activo }).eq("id", id);
  if (error) return { ok: false, error: "No se pudo actualizar" };
  revalidatePath("/config/lavadores");
  return { ok: true };
}

// ---------------- Formas de pago ----------------
export async function guardarForma(input: {
  id?: string;
  nombre: string;
}): Promise<Result> {
  const supabase = await createClient();
  const nombre = input.nombre.trim();
  if (!nombre) return { ok: false, error: "Ingresa el nombre" };

  if (input.id) {
    const { error } = await supabase
      .from("formas_pago")
      .update({ nombre })
      .eq("id", input.id);
    if (error) return { ok: false, error: "No se pudo guardar" };
  } else {
    // moneda por defecto PEN (Soles)
    const { error } = await supabase
      .from("formas_pago")
      .insert({ nombre, moneda: "PEN" });
    if (error) return { ok: false, error: "No se pudo crear" };
  }
  revalidatePath("/config/pagos");
  return { ok: true };
}

export async function toggleForma(id: string, activo: boolean): Promise<Result> {
  const supabase = await createClient();
  const { error } = await supabase.from("formas_pago").update({ activo }).eq("id", id);
  if (error) return { ok: false, error: "No se pudo actualizar" };
  revalidatePath("/config/pagos");
  return { ok: true };
}
