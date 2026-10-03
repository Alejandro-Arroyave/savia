# Savia 🌿 — App de cuidado de plantas

> **Handoff para retomar el proyecto.** Este documento resume qué estamos construyendo,
> qué se ha hecho, y las decisiones tomadas, para que cualquier sesión pueda continuar
> exactamente donde lo dejamos. Léelo primero y luego los `docs/`.

## En una frase

**Savia** es una app **móvil** (iOS + Android) para que las personas lleven un registro
juicioso del cuidado de sus plantas del hogar: **riego** y **abono**, con **notificaciones push**
que avisan **el día antes** y **el mismo día** de cada tarea.

> ✅ **Nombre confirmado: "Savia"** (decisión del usuario, 2026-07-14).

## Estado actual (2026-07-14)

| Área | Estado |
|---|---|
| Producto / alcance del MVP | ✅ Definido — ver [`docs/01-product.md`](docs/01-product.md) |
| Diseño UX/UI (alta fidelidad) | ✅ Hecho — mockup navegable de 7 pantallas en [`design/savia-mockup.html`](design/savia-mockup.html) |
| Stack tecnológico | ✅ Decidido — ver [`docs/03-tech-stack.md`](docs/03-tech-stack.md) |
| Modelo de datos | ✅ Diseñado (Prisma) — ver [`docs/04-data-model.md`](docs/04-data-model.md) y [`prisma/schema.prisma`](prisma/schema.prisma) |
| Diagrama ER | ✅ Hecho — ver [`docs/06-er-diagram.md`](docs/06-er-diagram.md) |
| Código / scaffolding | ✅ **Monorepo scaffolded** (pnpm workspaces: `apps/mobile`, `apps/api` + worker, `packages/shared`). |
| Frontend (pantallas) | ✅ **7 pantallas implementadas** en Expo (Login, Registro, Mis plantas, Calendario, Detalle, Registrar planta, Ajustes) con navegación, tema claro/oscuro, i18n y Apollo. |

**El scaffolding de la aplicación ya está implementado:** monorepo con API GraphQL + worker y
las 7 pantallas de la app Expo conectadas a la API (ver detalle en
[`docs/07-dev-setup.md`](docs/07-dev-setup.md)). Lo pendiente es la siguiente iteración (Auth0
real, GraphQL Codegen, primera migración de Prisma contra BD real).

## Índice de documentos

1. [`docs/01-product.md`](docs/01-product.md) — Qué es, funcionalidades, vistas, reglas de negocio.
2. [`docs/02-design.md`](docs/02-design.md) — Dirección UX/UI, paleta, tipografía, sistema de color.
3. [`docs/03-tech-stack.md`](docs/03-tech-stack.md) — Stack elegido y por qué.
4. [`docs/04-data-model.md`](docs/04-data-model.md) — Modelo de datos explicado.
5. [`docs/05-environment.md`](docs/05-environment.md) — Estado del equipo del desarrollador y qué falta instalar.
6. [`docs/06-er-diagram.md`](docs/06-er-diagram.md) — Diagrama entidad-relación (Mermaid).
7. [`docs/07-dev-setup.md`](docs/07-dev-setup.md) — Cómo levantar el monorepo en local.
8. [`design/savia-mockup.html`](design/savia-mockup.html) — Mockup real (ábrelo en un navegador).
9. [`prisma/schema.prisma`](prisma/schema.prisma) — Esquema Prisma listo para usar.

## ⚠️ Contexto importante sobre carpetas

Este proyecto **vive en `/Users/lejoarroyave/Projects/Savia/`** (carpeta propia y nueva).

Existe **otro proyecto sin relación** en `/Users/lejoarroyave/Archie/Equitrack/`: es **Equitrack**,
una app del mundo **equino/carreras** (web con Vite + React y backend Apollo/AWS Lambda).
**No confundir Savia con Equitrack** ni mezclar sus archivos: son productos y stacks distintos.

## Próximos pasos sugeridos

En orden, cuando se decida avanzar:

1. ✅ Diagrama entidad-relación (ER) del modelo de datos → [`docs/06-er-diagram.md`](docs/06-er-diagram.md).
2. ✅ Nombre definitivo de la app confirmado: **Savia**.
3. ✅ Scaffolding del monorepo TypeScript (Expo + API GraphQL + Prisma). Ver estructura en `docs/03-tech-stack.md`.
4. Definir el schema GraphQL completo a partir del modelo Prisma (queries/mutations de negocio).
5. Implementar el worker de notificaciones (cron + Expo Push) — es el punto más delicado (zonas horarias).

## Decisiones tomadas (2026-07-14)

- ✅ **Nombre definitivo: Savia.**
- ✅ **Foto de la planta: opcional** (no obligatoria en el MVP).
- ✅ **Se mantiene la pestaña global "Calendario"** además del calendario por planta.
- ✅ **Puntos del calendario por tipo de evento** (un color/punto por riego vs. abono).
- ✅ **Agenda continua** — el calendario muestra los próximos días encadenados, no un solo día.

## Decisiones abiertas

- Ninguna pendiente por ahora.
