# 07 · Puesta en marcha (dev)

> Cómo levantar el monorepo en local. Estructura decidida en [`03-tech-stack.md`](03-tech-stack.md).

## Estructura del monorepo

```
savia/
├─ apps/
│  ├─ api/            # GraphQL Yoga + Pothos + Prisma  (@savia/api)
│  │  └─ src/worker/  # cron de notificaciones (Expo Push)
│  └─ mobile/         # Expo (React Native)             (@savia/mobile)
├─ packages/
│  └─ shared/         # lógica/tipos compartidos         (@savia/shared)
├─ prisma/schema.prisma
├─ docker-compose.yml # Postgres local
└─ package.json       # pnpm workspaces
```

## Requisitos

- Node ≥ 22 (hay v24 en la máquina; ver [`05-environment.md`](05-environment.md)).
- pnpm → `corepack enable` (viene con Node).
- Docker (para Postgres local) **o** una URL de Postgres gestionada (Railway/Neon).

## Pasos

```bash
# 1. Dependencias
corepack enable
pnpm install

# 2. Variables de entorno
cp .env.example .env
cp apps/api/.env.example apps/api/.env
#   (rellena AUTH0_DOMAIN / AUTH0_AUDIENCE cuando tengas el tenant)

# 3. Base de datos local + migración
docker compose up -d db
pnpm prisma:generate
pnpm prisma:migrate      # crea las tablas (primera migración)

# 4. Arrancar servicios (en terminales separadas)
pnpm dev:api             # API GraphQL  → http://localhost:4001/graphql
pnpm dev:worker          # worker de notificaciones (cron)
pnpm dev:mobile          # Expo (escanea el QR con Expo Go / dev build)
```

## Probar sin Auth0 (modo desarrollo)

Mientras no haya tenant de Auth0, la API permite identificar un usuario de prueba con el header
`x-dev-user-email` (solo si `AUTH0_DOMAIN` **no** está definido). En el explorador GraphQL Yoga
(`http://localhost:4001/graphql`), añade en "Headers":

```json
{ "x-dev-user-email": "test@savia.app" }
```

Ejemplo de flujo completo:

```graphql
mutation {
  addPlant(
    name: "Potos"
    species: "Epipremnum aureum"
    care: [
      { type: WATERING, intervalDays: 7, lastDoneAt: "2026-07-10" }
      { type: FERTILIZING, intervalDays: 30, lastDoneAt: "2026-07-01" }
    ]
  ) { id name schedules { type nextDueAt } }
}

query { myPlants { id name schedules { type nextDueAt lastDoneAt } } }

mutation { logCare(plantId: "<id>", type: WATERING) { type lastDoneAt nextDueAt } }
```

En la app móvil, define `EXPO_PUBLIC_DEV_USER_EMAIL=test@savia.app` para que Expo Go mande ese
mismo header automáticamente.

## Notas

- **Push reales requieren un development build** (EAS Build), no funcionan en Expo Go. Para
  desarrollar el resto de la app, Expo Go sirve.
- El worker y la API comparten el mismo proyecto (`@savia/api`); en Railway se despliegan como
  **dos servicios** apuntando al mismo código: `pnpm start` y `pnpm start:worker`.
- `@savia/shared` se importa como código fuente (TS) vía workspace; no requiere build en dev.
- Auth: sin `AUTH0_DOMAIN` configurado, la API acepta peticiones anónimas (útil para probar el
  esquema en el explorador de GraphQL Yoga); con Auth0 configurado, exige `Authorization: Bearer`.

## Estado del scaffolding

Implementado:
- **API**: esquema GraphQL (queries `me`/`myPlants`/`plant`/`calendarEvents`, mutations
  `addPlant`/`logCare`/`updateNotificationPrefs`/`registerPushToken`) y worker completo
  (materializar + despachar con zona horaria).
- **App (Expo)**: 7 pantallas conectadas a la API —
  Login, Registro, Mis plantas, Calendario (puntos por tipo + agenda continua), Detalle de
  planta, Registrar planta y Ajustes. Con navegación (`@react-navigation`), tema claro/oscuro,
  i18n (`i18n-js`, es por defecto), Apollo Client y auth por contexto (modo dev por email;
  Auth0 preparado para después).

Estructura de la app (`apps/mobile/src/`): `theme/`, `i18n/`, `auth/`, `graphql/`, `domain/`,
`components/`, `navigation/`, `screens/`.

Pendiente (siguiente iteración): integración real de Auth0, GraphQL Codegen para tipos del
cliente, selector de fecha en "Registrar planta" (hoy asume la última fecha = hoy), y la
primera migración de Prisma contra una BD real.
