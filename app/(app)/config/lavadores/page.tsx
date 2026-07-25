import { createClient } from "@/lib/supabase/server";
import { LavadoresManager } from "./LavadoresManager";

export default async function LavadoresPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lavadores")
    .select("id, nombre, apellido, telefono, activo")
    .order("nombre", { ascending: true });

  return <LavadoresManager lavadores={data ?? []} />;
}
