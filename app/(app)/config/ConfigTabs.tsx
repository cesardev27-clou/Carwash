"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/config/tipos", label: "Tipos de vehículo" },
  { href: "/config/servicios", label: "Servicios y precios" },
  { href: "/config/lavadores", label: "Lavadores" },
  { href: "/config/pagos", label: "Formas de pago" },
];

export function ConfigTabs() {
  const pathname = usePathname();
  return (
    <div className="-mx-4 overflow-x-auto px-4">
      <nav className="flex gap-1 border-b border-hairline">
        {tabs.map((t) => {
          const active = pathname === t.href;
          return (
            <Link
              key={t.href}
              href={t.href}
              className={cn(
                "whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "border-accent text-accent"
                  : "border-transparent text-muted hover:text-ink"
              )}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
