import { createClient } from "@/lib/supabase/server";
import { TiposManager } from "./TiposManager";

export default async function TiposPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tipos_vehiculo")
    .select("id, nombre, orden, activo")
    .order("orden", { ascending: true })
    .order("nombre", { ascending: true });

  return <TiposManager tipos={data ?? []} />;
}
