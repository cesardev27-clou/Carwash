# Carwash SaaS — MVP

Aplicación web **B2B / SaaS multi-tenant** para carwashes: cada carwash configura
su tablero (tipos de vehículo, servicios con matriz de precios, lavadores y formas
de pago), registra atenciones de lavado y ve el reporte del día.

## Stack

- **Next.js 15** (App Router) + **React 19**
- **Tailwind CSS** — paleta "Acero & Petróleo"
- **Supabase** (Postgres + Auth + RLS)

## Modelo de datos

El precio **no** vive en el servicio: vive en el cruce **servicio × tipo de vehículo**
(tabla `precios`), como un tablero de precios físico. Al registrar una atención el
precio se guarda como **snapshot**, así el histórico no cambia si luego mueves el tarifario.

Tablas: `carwashes`, `perfiles`, `tipos_vehiculo`, `servicios`, `precios`,
`lavadores`, `formas_pago`, `atenciones`. Todas con **RLS** por `carwash_id`.

### Multi-tenant y seguridad

- Cada registro pertenece a un `carwash_id`.
- **RLS** aísla los datos: un usuario solo ve/modifica los de su carwash.
- El `carwash_id` se asigna **automáticamente** por trigger según el usuario autenticado.
- El navegador usa solo la **anon/publishable key** apoyada en RLS. La `service_role`
  nunca se expone al frontend.

## Variables de entorno

Copia `.env.example` a `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxx
```

## Desarrollo local

```bash
npm install
npm run dev
```

App en http://localhost:3000

### Acceso demo

- **Correo:** demo@carwash.pe
- **Contraseña:** Carwash2026!

## Estructura

```
app/
  login/              Login (Supabase Auth)
  (app)/              Rutas protegidas
    registro/         Registro de atención (flujo principal)
    reporte/          Reporte del día con filtros
    config/           Tipos, servicios+precios, lavadores, formas de pago
lib/supabase/         Clientes SSR (browser, server, middleware)
lib/validation.ts     Validaciones transversales
middleware.ts         Protección de rutas + refresco de sesión
```

## Alcance del MVP

Incluye configuración base, registro de atención, reporte del día y login simple.
Fuera de alcance: comisiones, anular/editar atenciones, búsqueda por placa,
comprobante al cliente, facturación y onboarding público (alta manual del carwash
y su primer usuario en Supabase por ahora).
