# Gestor de Dinero (Web)

Aplicación web para gestionar cuentas y transacciones.

## Requisitos
- Node.js
- Postgres

## Configuración
- Copia `.env.example` a `.env` y ajusta:
  - `DATABASE_URL` (Postgres)
  - `JWT_SECRET` (clave privada para firmar tokens JWT)

Ejemplo de `DATABASE_URL`:
`postgresql://USUARIO:CLAVE@localhost:5432/Proyectos?schema=public`

## Supabase (Postgres en la nube)
- Crea un proyecto en Supabase y usa su Postgres como `DATABASE_URL`.
- En Supabase: **Project Settings → Database → Connection string**.
- Pega esa cadena en `DATABASE_URL` (local) o como variable de entorno (producción).

Este repo ya incluye migraciones SQL para crear el esquema en Supabase en `supabase/migrations`.

## Base de datos
- Aplicar migraciones:
  - `npm run prisma:migrate:deploy`

Cuando actualices el proyecto y haya cambios en la base de datos, vuelve a ejecutar `npm run prisma:migrate:deploy`.

Si necesitas regenerar Prisma Client (recomendado tras cambios de schema):
- `npm run prisma:generate`

Si en Windows te sale `EPERM` al regenerar (archivo en uso), detén `npm run dev` y ejecuta:
- PowerShell: `$env:PRISMA_CLIENT_ENGINE_TYPE='binary'; npm run prisma:generate`
- CMD: `set PRISMA_CLIENT_ENGINE_TYPE=binary` y luego `npm run prisma:generate`

## Ejecutar
- Todo junto (frontend + API):
  - `npm run dev`

## Producción (24/7)
Para que esté activo todo el tiempo, despliega en Render con el blueprint `render.yaml`:
- `gestor-api` (API, Docker, always-on)
- `gestor-web` (frontend, static)

Variables:
- Render (API): `DATABASE_URL`, `JWT_SECRET`, `PORT=3001`
- Render (frontend): `VITE_API_BASE_URL=https://TU-API.onrender.com`

## Producción (Vercel)
- Vercel soporta frontend + API (serverless).
- Variables en Vercel (Project → Settings → Environment Variables):
  - `DATABASE_URL` (Supabase Postgres, recomendado Session Pooler si tu red es IPv4)
  - `JWT_SECRET` (clave larga)
  - `VITE_API_BASE_URL` (opcional; si lo dejas vacío/omitido, el frontend usa `/api` del mismo dominio)

Reducir “cold start” (mejor esfuerzo):
- En GitHub → Settings → Secrets and variables → Actions → agrega `KEEP_ALIVE_URL` con tu dominio de Vercel.
- El workflow `.github/workflows/keep-alive.yml` hace ping a `/api/health` cada 5 minutos.

O separado:
- API: `npm run api:dev` (http://localhost:3001)
- Frontend: `npm run client:dev` (http://localhost:5173)

## Endpoints principales
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/me` y `PATCH /api/me`
- Cuentas: `GET/POST /api/accounts`, `GET/PATCH/DELETE /api/accounts/:id`
- Transacciones: `GET/POST /api/transactions`, `GET/PATCH/DELETE /api/transactions/:id`

## Reportes
- Ruta: `/reportes`
- Incluye: totales (ingresos/gastos/neto), gasto por categoría y saldo por cuenta.

## Resumen mensual
- Ruta: `/resumen`
- Muestra el resumen del mes (cuenta seleccionada vs total de todas las cuentas).
