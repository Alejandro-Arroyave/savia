# 03 · Stack técnico

> Decidido el 2026-07-14. El equipo domina **JavaScript/TypeScript**, quiere un **servidor
> GraphQL propio** (no auto-generado), y prioriza **balance entre costo y trabajo de DevOps**.

## Requisitos que guiaron la elección

- Disponible **24/7**.
- Carga baja (es un MVP).
- Disponible para **Android y iOS**.
- Preferencias del usuario (todas aceptadas): **PostgreSQL**, **Auth0**, **GraphQL**.

## Stack elegido

| Capa | Elección | Notas |
|---|---|---|
| **Móvil** | **React Native + Expo** (TypeScript) | Cross-platform (un solo código iOS+Android). Se descartó doble desarrollo nativo por costo/tiempo del MVP. |
| **Cliente GraphQL** | **Apollo Client** (o urql) | Cache, estados de carga/error, hooks. |
| **Auth** | **Auth0** | Email + Google social. JWT validado en la API. Free tier cubre el MVP. |
| **API** | **Node.js + TS + GraphQL Yoga + Pothos + Prisma** | Servidor GraphQL liviano, schema code-first (Pothos), ORM (Prisma). |
| **Worker** | Proceso **cron** (~cada 15 min) | Calcula qué avisos vencen y los envía por Expo Push. |
| **Notificaciones** | **Expo Push** | Envía a APNs (iOS) + FCM (Android) con una sola API. |
| **Base de datos** | **PostgreSQL** gestionado | Railway para el MVP; **Neon** como alternativa serverless. |
| **Hosting** | **Railway** | API + worker + Postgres en un solo lugar. ~US$5–15/mes. Always-on real. |

## Por qué cross-platform y por qué Expo

- Para el alcance del MVP (formularios, listas, calendario, push) no hay nada que exija nativo puro.
- **Expo** porque: mismo lenguaje que el backend (TS), `expo-notifications` hace las push casi
  triviales, y clientes GraphQL maduros. (Flutter sería la alternativa si el equipo supiera Dart.)

## Por qué NO serverless para el backend

El requisito de notificaciones ("día antes" + "mismo día", a una hora elegida) necesita un
**proceso que corra siempre** (un cron/worker), no solo request/response. Por eso se eligió un
**contenedor always-on** (Railway) en vez de FaaS puro. Además el requisito de 24/7 lo pide igual.

## Arquitectura en una frase

App Expo → (login Auth0, guarda push token) → **API GraphQL** (Yoga+Pothos+Prisma) ↔ **Postgres**;
en paralelo un **worker cron** lee Postgres, resuelve qué avisos vencen según la hora/zona horaria
de cada usuario, y los manda por **Expo Push**.

## Arquitectura de notificaciones (patrón recomendado)

1. Se guarda por planta `última fecha` + `frecuencia`; se calcula la próxima fecha (`nextDueAt`).
2. Un **worker cron** (cada ~15 min) consulta qué avisos vencen, considerando **hora y zona
   horaria** de cada usuario.
3. Envía vía **Expo Push** y marca el aviso como **enviado** (idempotencia, no duplicar).
4. Se guarda el **push token** de cada dispositivo al iniciar sesión.

> El modelo de datos ya soporta esto con la tabla `Notification` y su índice único. Ver [`04-data-model.md`](04-data-model.md).

## Estructura de repo sugerida (monorepo TS)

```
savia/
├─ apps/
│  ├─ mobile/        # Expo (React Native)
│  └─ api/           # GraphQL Yoga + Pothos + Prisma
│     └─ worker/     # cron de notificaciones (mismo proyecto o servicio aparte)
├─ packages/
│  └─ shared/        # tipos compartidos + GraphQL codegen
├─ prisma/schema.prisma
└─ package.json      # pnpm workspaces (o Turborepo)
```

Usar **GraphQL Codegen** para generar tipos TS del schema y compartir contratos entre app y server.

## Advertencias (gotchas) para quien implemente

1. **Expo push requiere un *development build*** (no funcionan en Expo Go). Se resuelve con
   **EAS Build** en la nube; tenerlo en el plan desde el día 1.
2. **Zonas horarias:** guardar hora de aviso **+ timezone IANA** del usuario y calcular
   "día antes / mismo día" en esa zona, no en UTC del servidor.

## Alternativas consideradas (por si cambia el criterio)

- **Flutter** en vez de React Native (si el equipo prefiriera Dart).
- **Hasura / PostGraphile** para auto-generar el GraphQL desde Postgres (descartado: se prefirió
  servidor propio por la lógica de negocio de notificaciones).
- **Neon** en vez de Railway para la BD (Postgres serverless).
