import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { RegistroForm } from "./RegistroForm";

export const metadata = { title: "Registrar atención — Carwash" };

export default async function RegistroPage() {
  const supabase = await createClient();

  const [tiposRes, serviciosRes, preciosRes, lavadoresRes, formasRes] =
    await Promise.all([
      supabase
        .from("tipos_vehiculo")
        .select("id, nombre, orden")
        .eq("activo", true)
        .order("orden", { ascending: true })
        .order("nombre", { ascending: true }),
      supabase
        .from("servicios")
        .select("id, nombre, grupo")
        .eq("activo", true)
        .order("nombre", { ascending: true }),
      supabase.from("precios").select("servicio_id, tipo_vehiculo_id, precio"),
      supabase
        .from("lavadores")
        .select("id, nombre, apellido")
        .eq("activo", true)
        .order("nombre", { ascending: true }),
      supabase
        .from("formas_pago")
        .select("id, nombre, moneda")
        .eq("activo", true)
        .order("nombre", { ascending: true }),
    ]);

  const tipos = tiposRes.data ?? [];
  const servicios = serviciosRes.data ?? [];
  const precios = preciosRes.data ?? [];
  const lavadores = lavadoresRes.data ?? [];
  const formas = formasRes.data ?? [];

  const faltantes: { label: string; href: string }[] = [];
  if (tipos.length === 0)
    faltantes.push({ label: "tipos de vehículo", href: "/config/tipos" });
  if (servicios.length === 0)
    faltantes.push({ label: "servicios", href: "/config/servicios" });
  if (lavadores.length === 0)
    faltantes.push({ label: "lavadores", href: "/config/lavadores" });
  if (formas.length === 0)
    faltantes.push({ label: "formas de pago", href: "/config/pagos" });

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-ink">Registrar atención</h1>
        <p className="mt-0.5 text-sm text-muted">
          Completa los datos del lavado y guarda.
        </p>
      </div>

      {faltantes.length > 0 ? (
        <div className="card p-6">
          <h2 className="text-base font-semibold text-ink">
            Falta configurar tu carwash
          </h2>
          <p className="mt-1 text-sm text-muted">
            Para registrar atenciones primero crea{" "}
            {faltantes.map((f, i) => (
              <span key={f.href}>
                <Link href={f.href} className="font-medium text-accent underline">
                  {f.label}
                </Link>
                {i < faltantes.length - 1 ? ", " : ""}
              </span>
            ))}
            .
          </p>
        </div>
      ) : (
        <RegistroForm
          tipos={tipos}
          servicios={servicios}
          precios={precios}
          lavadores={lavadores}
          formas={formas}
        />
      )}
    </div>
  );
}
