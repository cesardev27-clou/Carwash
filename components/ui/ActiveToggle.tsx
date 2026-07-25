"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";

// Interruptor activo/inactivo. Pide confirmación al desactivar (acción sensible).
export function ActiveToggle({
  activo,
  label,
  onToggle,
}: {
  activo: boolean;
  label: string;
  onToggle: (next: boolean) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  function handle() {
    if (activo && !confirming) {
      setConfirming(true);
      return;
    }
    setConfirming(false);
    startTransition(async () => {
      await onToggle(!activo);
    });
  }

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-2">
        <span className="text-xs text-muted">¿Desactivar {label}?</span>
        <button
          onClick={handle}
          disabled={pending}
          className="rounded-md bg-danger/10 px-2 py-1 text-xs font-semibold text-danger hover:bg-danger/15"
        >
          Sí
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="rounded-md px-2 py-1 text-xs font-medium text-muted hover:text-ink"
        >
          No
        </button>
      </span>
    );
  }

  return (
    <button
      onClick={handle}
      disabled={pending}
      className={cn(
        "badge cursor-pointer transition-colors",
        activo
          ? "bg-success/10 text-success hover:bg-success/15"
          : "bg-hairline text-muted hover:bg-hairline/70"
      )}
      title={activo ? "Clic para desactivar" : "Clic para activar"}
    >
      {pending ? "…" : activo ? "Activo" : "Inactivo"}
    </button>
  );
}
