import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppNav } from "@/components/AppNav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("carwash_id, correo, carwashes(nombre)")
    .eq("id", user.id)
    .single();

  const carwashNombre =
    (perfil?.carwashes as { nombre?: string } | null)?.nombre ?? "Mi carwash";

  return (
    <div className="min-h-dvh">
      <AppNav carwashNombre={carwashNombre} correo={perfil?.correo ?? user.email ?? ""} />
      <main className="mx-auto w-full max-w-5xl px-4 pb-28 pt-4 sm:pb-10 sm:pt-6">
        {children}
      </main>
    </div>
  );
}
