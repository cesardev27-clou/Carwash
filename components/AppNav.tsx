"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/registro", label: "Registrar", icon: PlusIcon },
  { href: "/reporte", label: "Reporte", icon: ChartIcon },
  { href: "/config", label: "Configuración", icon: GearIcon },
];

export function AppNav({
  carwashNombre,
  correo,
}: {
  carwashNombre: string;
  correo: string;
}) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/config" ? pathname.startsWith("/config") : pathname === href;

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-hairline bg-primary text-white">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15 text-sm font-bold">
              CW
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold leading-tight">
                {carwashNombre}
              </p>
              <p className="truncate text-xs text-white/70 leading-tight">
                {correo}
              </p>
            </div>
          </div>

          {/* Nav desktop */}
          <nav className="hidden items-center gap-1 sm:flex">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "bg-white/15 text-white"
                    : "text-white/75 hover:bg-white/10 hover:text-white"
                )}
              >
                {item.label}
              </Link>
            ))}
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="ml-1 rounded-lg px-3 py-1.5 text-sm font-medium text-white/75 hover:bg-white/10 hover:text-white"
              >
                Salir
              </button>
            </form>
          </nav>

          {/* Salir móvil */}
          <form action="/auth/signout" method="post" className="sm:hidden">
            <button
              type="submit"
              className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-white/80 hover:bg-white/10"
            >
              Salir
            </button>
          </form>
        </div>
      </header>

      {/* Bottom nav móvil */}
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-hairline bg-surface pb-[env(safe-area-inset-bottom)] sm:hidden">
        <div className="mx-auto flex max-w-5xl items-stretch justify-around">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors",
                  active ? "text-accent" : "text-muted"
                )}
              >
                <Icon className="h-5 w-5" active={active} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

function PlusIcon({ className }: { className?: string; active?: boolean }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
function ChartIcon({ className }: { className?: string; active?: boolean }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <rect x="7" y="11" width="3" height="6" />
      <rect x="13" y="7" width="3" height="10" />
    </svg>
  );
}
function GearIcon({ className }: { className?: string; active?: boolean }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.2.61.79 1.02 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
