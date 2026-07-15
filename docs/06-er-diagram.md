# 06 · Diagrama entidad-relación (ER)

> Generado el 2026-07-14 a partir de [`../prisma/schema.prisma`](../prisma/schema.prisma).
> La explicación de cada decisión está en [`04-data-model.md`](04-data-model.md).
> El diagrama usa sintaxis **Mermaid** (se renderiza en GitHub, VS Code y la mayoría de editores Markdown).

## Cardinalidades (resumen)

```
User 1───N Plant 1───N CareSchedule   (única por [plant, type])
                └──────N CareEvent     (log histórico del calendario)
User 1───N PushToken
User 1───N Notification  (N───1 Plant, relación lógica opcional)
```

## Diagrama

```mermaid
erDiagram
    User ||--o{ Plant : "tiene"
    User ||--o{ PushToken : "registra"
    User ||--o{ Notification : "recibe"
    Plant ||--o{ CareSchedule : "programa (1 por tipo)"
    Plant ||--o{ CareEvent : "historial"

    User {
        string id PK
        string auth0Id UK "sub de Auth0"
        string email UK
        string name "nullable"
        string locale "default es"
        string timezone "IANA, default America/Bogota"
        int notifyHour "0-23, hora local"
        boolean notifyDayBefore "default true"
        boolean notifyDayOf "default true"
        datetime createdAt
        datetime updatedAt
    }

    Plant {
        string id PK
        string userId FK
        string name
        string species "nullable"
        string photoUrl "nullable (foto opcional)"
        datetime createdAt
        datetime updatedAt
    }

    CareSchedule {
        string id PK
        string plantId FK
        enum type "WATERING | FERTILIZING"
        int intervalDays "cada cuántos días"
        date lastDoneAt "nullable"
        date nextDueAt "nullable, indexado"
        datetime createdAt
        datetime updatedAt
    }

    CareEvent {
        string id PK
        string plantId FK
        enum type "WATERING | FERTILIZING"
        date doneAt "día en que se hizo"
        datetime createdAt
    }

    PushToken {
        string id PK
        string userId FK
        string token UK "Expo push token"
        string platform "ios | android, nullable"
        datetime lastUsedAt "nullable"
        datetime createdAt
        datetime updatedAt
    }

    Notification {
        string id PK
        string userId FK
        string plantId "nullable, relación lógica"
        enum type "WATERING | FERTILIZING"
        enum kind "DAY_BEFORE | DAY_OF"
        date dueDate "fecha del evento"
        datetime scheduledFor "instante de envío UTC, indexado"
        enum status "PENDING | SENT | FAILED | CANCELLED"
        datetime sentAt "nullable"
        datetime createdAt
        datetime updatedAt
    }
```

## Constraints e índices relevantes

| Modelo | Restricción | Propósito |
|---|---|---|
| `CareSchedule` | `@@unique([plantId, type])` | Un solo horario por tipo de cuidado y planta. |
| `CareSchedule` | `@@index([nextDueAt])` | El worker consulta "qué vence pronto" barato. |
| `CareEvent` | `@@index([plantId, doneAt])` | Alimenta el calendario por planta y fecha. |
| `Notification` | `@@unique([plantId, type, kind, dueDate])` | **Idempotencia**: el cron no duplica avisos. |
| `Notification` | `@@index([status, scheduledFor])` | Encontrar pendientes que ya deben salir. |
| `User` | `auth0Id` UK, `email` UK | Identidad vía Auth0. |
| `PushToken` | `token` UK | Un token por dispositivo. |

## Notas

- Todas las relaciones `User→*` y `Plant→*` usan `onDelete: Cascade`.
- `Notification.plantId` es una **relación lógica opcional** (no FK dura en el esquema actual),
  para que un aviso pueda sobrevivir aunque su planta cambie; se resuelve por aplicación.
- Fechas de calendario en `@db.Date`; instantes en `@db.Timestamptz(6)` — clave para la lógica
  de "día antes / mismo día" en la zona horaria del usuario.
