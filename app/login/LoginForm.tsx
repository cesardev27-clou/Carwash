"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { TextField } from "@/components/ui/TextField";

export function LoginForm() {
  const router = useRouter();
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: correo.trim(),
      password,
    });

    if (error) {
      setError("Correo o contraseña incorrectos");
      setLoading(false);
      return;
    }

    router.replace("/registro");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <TextField
        label="Correo"
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="nombre@correo.com"
        value={correo}
        onChange={setCorreo}
        required
        autoFocus
      />
      <TextField
        label="Contraseña"
        type="password"
        autoComplete="current-password"
        placeholder="Tu contraseña"
        value={password}
        onChange={setPassword}
        required
      />
      {error && (
        <p className="rounded-lg bg-danger/5 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}
      <button type="submit" className="btn-accent w-full" disabled={loading}>
        {loading ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  );
}
