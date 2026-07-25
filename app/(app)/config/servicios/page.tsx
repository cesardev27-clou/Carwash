import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ServiciosManager } from "./ServiciosManager";

export default async function ServiciosPage() {
  const supabase = await createClient();

  const [serviciosRes, tiposRes, preciosRes] = await Promise.all([
    supabase
      .from("servicios")
      .select("id, nombre, descripcion, grupo, activo")
      .order("nombre", { ascending: true }),
    supabase
      .from("tipos_vehiculo")
      .select("id, nombre, orden")
      .eq("activo", true)
      .order("orden", { ascending: true }),
    supabase.from("precios").select("servicio_id, tipo_vehiculo_id, precio"),
  ]);

  const tipos = tiposRes.data ?? [];

  if (tipos.length === 0) {
    return (
      <div className="card p-6">
        <h2 className="text-base font-semibold text-ink">
          Primero crea tipos de vehículo
        </h2>
        <p className="mt-1 text-sm text-muted">
          Los precios se definen por tipo de vehículo. Crea al menos uno en{" "}
          <Link href="/config/tipos" className="font-medium text-accent underline">
            Tipos de vehículo
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <ServiciosManager
      servicios={serviciosRes.data ?? []}
      tipos={tipos}
      precios={preciosRes.data ?? []}
    />
  );
}
