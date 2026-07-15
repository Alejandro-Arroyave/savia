# 04 · Modelo de datos

> El esquema listo para usar está en [`../prisma/schema.prisma`](../prisma/schema.prisma).
> Este documento explica el porqué de cada decisión.

## Entidades

| Modelo | Rol |
|---|---|
| **User** | Usuario (vinculado a Auth0). Guarda preferencias de notificación y zona horaria. |
| **Plant** | Una planta del usuario (nombre, especie, foto). |
| **CareSchedule** | Estado actual de un tipo de cuidado (riego/abono) de una planta: cada cuánto y próxima fecha. |
| **CareEvent** | Historial: cada vez que se hizo un riego/abono. Alimenta el calendario. |
| **PushToken** | Token de Expo Push por dispositivo del usuario. |
| **Notification** | Avisos programados/enviados. Da idempotencia y auditoría al worker. |

Enums: `CareType { WATERING, FERTILIZING }`, `NotificationKind { DAY_BEFORE, DAY_OF }`,
`NotificationStatus { PENDING, SENT, FAILED, CANCELLED }`.

## Relaciones (cardinalidad)

```
User 1───N Plant 1───N CareSchedule   (única por [plant, type])
                └──────N CareEvent     (log histórico)
User 1───N PushToken
User 1───N Notification
```

## Decisiones clave y su porqué

- **`CareSchedule` usa un `enum CareType`** en vez de campos fijos (`watering*` / `fertilizing*`).
  → Agregar un tercer tipo de cuidado (poda, fumigación) en el futuro **no rompe el esquema**.
  El constraint `@@unique([plantId, type])` garantiza un solo horario por tipo y planta.

- **Fechas de calendario en `@db.Date`** (`lastDoneAt`, `nextDueAt`, `doneAt`, `dueDate`) y
  **instantes en `@db.Timestamptz`** (`createdAt`, `scheduledFor`, `sentAt`, …).
  → La lógica "día antes / mismo día" se resuelve sin ambigüedad de UTC. La zona horaria vive
  en `User.timezone` (IANA) y se aplica al calcular el `scheduledFor` real del aviso.

- **`nextDueAt` indexado** → el worker consulta "qué vence pronto" de forma barata.

- **`CareEvent` (historial) separado de `CareSchedule` (estado actual)** → el calendario
  necesita saber qué días se hizo cada tarea; el estado ("próximo riego") es un dato vivo aparte.

- **`Notification` con `@@unique([plantId, type, kind, dueDate])`** → **idempotencia**: el cron
  puede correr muchas veces sin mandar el mismo aviso dos veces. `status` + `scheduledFor`
  indexados para encontrar los pendientes que ya deben salir.

- **`User.auth0Id` (el `sub` de Auth0) es la llave de identidad**; `email` también único.
  El resto de datos (nombre, contraseña) los gestiona Auth0; aquí solo se referencian.

## Flujo típico (para validar el modelo)

1. Usuario registra planta → se crean 2 `CareSchedule` (riego y abono) con su `intervalDays`
   y `lastDoneAt`; se calcula `nextDueAt`.
2. Al programar, se generan filas `Notification` (`DAY_BEFORE` y `DAY_OF`) con `scheduledFor`
   calculado desde `dueDate` + `notifyHour` en la timezone del usuario.
3. El worker cron busca `Notification` con `status = PENDING` y `scheduledFor <= now()`, envía
   por Expo Push y marca `SENT`.
4. Usuario pulsa "Registrar riego" → se crea un `CareEvent`, se actualiza `lastDoneAt`/`nextDueAt`
   del `CareSchedule`, y se recalculan las próximas `Notification`.

## Posibles campos futuros (mencionados, no incluidos aún)

- `Plant`: notas, ubicación/habitación, apodo.
- Foto: **decisión tomada (2026-07-14) → opcional** (`photoUrl String?`). Ya reflejado en el esquema.
