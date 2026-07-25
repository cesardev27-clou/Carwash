import { ConfigTabs } from "./ConfigTabs";

export const metadata = { title: "Configuración — Carwash" };

export default function ConfigLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-ink">Configuración</h1>
        <p className="mt-0.5 text-sm text-muted">
          Define el tablero de tu carwash: vehículos, servicios, precios, lavadores y pagos.
        </p>
      </div>
      <ConfigTabs />
      <div className="mt-5">{children}</div>
    </div>
  );
}
