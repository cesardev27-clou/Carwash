import { LoginForm } from "./LoginForm";

export const metadata = { title: "Ingresar — Carwash" };

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-lg font-bold text-white">
            CW
          </div>
          <h1 className="text-xl font-semibold text-ink">Carwash</h1>
          <p className="mt-1 text-sm text-muted">
            Ingresa para registrar atenciones
          </p>
        </div>
        <div className="card p-6">
          <LoginForm />
        </div>
        <p className="mt-6 text-center text-xs text-muted">
          Acceso demo: demo@carwash.pe · Carwash2026!
        </p>
      </div>
    </main>
  );
}
