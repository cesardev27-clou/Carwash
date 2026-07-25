import { createClient } from "@/lib/supabase/server";
import { PagosManager } from "./PagosManager";

export default async function PagosPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("formas_pago")
    .select("id, nombre, moneda, activo")
    .order("nombre", { ascending: true });

  return <PagosManager formas={data ?? []} />;
}
