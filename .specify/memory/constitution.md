# Savia Constitution

> Savia is a mobile app (iOS + Android) for caring for home plants: watering and fertilizing,
> with push notifications that remind the user the day before and the day of each task.

This constitution captures only principles, conventions, and decisions that are already
documented in `docs/` or evidenced in the code. It introduces no new standards without backing.

## Core Principles

### I. Shared domain, a single source of truth

Core business logic (care types, date and status computation) MUST live in `packages/shared`
as pure TypeScript, **with no dependency on Prisma or React**, and MUST be reused by the API,
the worker, and the mobile app instead of being reimplemented.

- Enums and contracts (`CareType`, `NotificationKind`, `NotificationStatus`) and functions such
  as `computeNextDue`, `daysUntil`, and `careStatus` are the single origin; the client consumes
  them (e.g. `careStatusView` reuses `careStatus`), it does not rewrite them.
- Repeated UI patterns MUST be centralized in a single component/function (e.g. the icon+color
  tint per care type lives in one place).

**Rationale:** prevents the rule "next date = last date + interval" and the status mapping from
drifting between server, worker, and app. It is the most common source of subtle bugs in this
domain.

### II. Time lives in the user's timezone

All "day before / day of" logic for reminders MUST be computed in the **user's IANA timezone**
(`User.timezone`, e.g. `America/Bogota`), NEVER in the server's UTC.

- Calendar dates are stored as `@db.Date`; send instants as `@db.Timestamptz`. The real instant
  of a reminder is derived from `dueDate` + `notifyHour` in the user's timezone (see
  `zonedTimeToUtc` in the worker).
- No reminder due-date computation may assume the server's clock equals the user's.
- This applies **also to the status the app displays** ("Today / in N days / Overdue"): the
  `careStatus`/`daysUntil` computation MUST use the user's timezone, not UTC nor the device
  clock. The current implementation in `packages/shared` that rounds in UTC is a **known bug to
  fix**, not the intended behavior.

**Rationale:** this is "the classic bug" of reminder apps; the docs mark it as a central,
non-negotiable requirement. Rounding in UTC causes off-by-one-day errors near midnight.

### III. Idempotent notifications

The cron worker MUST be able to run many times without sending the same reminder twice.

- Idempotency is guaranteed at the data level with
  `Notification @@unique([plantId, type, kind, dueDate])`.
- A sent reminder MUST be marked (`status = SENT`) so it is not resent; pending ones are located
  by `status` + `scheduledFor`.

**Rationale:** the cron runs periodically (~every 15 min) and must be safe against retries and
overlaps without spamming the user.

### IV. Data model extensible by care type

Care types MUST be modeled with the `enum CareType`, not with per-type fixed fields
(`watering*` / `fertilizing*`).

- Adding a third care type (pruning, pest control, etc.) MUST NOT require schema changes beyond
  the enum. The `@@unique([plantId, type])` constraint guarantees a single schedule per type and
  plant.
- History (`CareEvent`) is kept separate from current state (`CareSchedule`).

**Rationale:** the MVP starts with watering and fertilizing, but the design is meant to grow
without reworking the model.

### V. Own GraphQL server, code-first and typed end to end

The API MUST be an own GraphQL server (not auto-generated) built with **GraphQL Yoga + Pothos
(code-first schema) + Prisma**. Contracts MUST be shared in a typed way between app and server.

- Typing runs through everything: Prisma → Pothos → GraphQL → client types (GraphQL Codegen).
- Automatic GraphQL generators (Hasura/PostGraphile) are explicitly rejected because the
  notification business logic requires an own server.

**Rationale:** the domain complexity (timezones, idempotency) lives in the business layer; an
own code-first GraphQL keeps that logic explicit and the types verifiable.

### VI. Internationalization with no exceptions (Spanish by default)

No user-facing text may be hardcoded in the source. Every string MUST go through the i18n layer
(`t(...)`), with **Spanish as the default language** and English supported.

- Strings live in `i18n/locales/{es,en}.ts`; components and the domain consume `t(...)`
  (e.g. `careLabel`, `careStatusView`).

**Rationale:** internationalization is a confirmed product requirement, not a later add-on;
hardcoding text would break it at the root.

### VII. Consistent "two rhythms" visual language

Every event type MUST have a fixed color and icon across the whole app, from a single source:

- **Watering** = water blue + droplet; **Fertilizing** = earth ochre + sprout. The
  type → color/icon mapping lives in one place (`careAccent`, `careIcon`) and is consumed through
  shared components.
- States are color-coded consistently ("Today" in the event color, "Overdue" in rust, the rest
  neutral). Light and dark themes MUST be treated with equal care via theme tokens, not loose
  colors.

**Rationale:** at-a-glance recognition is the heart of the approved UX; consistency only holds if
the mapping is unique.

### VIII. Pragmatic tests for what matters

The project adopts a **pragmatic testing standard, not strict TDD across the whole codebase**:

- **Business logic (`packages/shared` and worker):** every new feature MUST include unit tests
  with **Jest**. Each spec's acceptance criteria are translated into tests before or during
  implementation. A task is NOT complete if its tests do not pass.
- **UI (screens and components):** use **React Native Testing Library** for the critical user
  flows defined in the spec. Tests are NOT required for purely visual components, and snapshot
  tests are NOT used.
- **E2E:** out of scope for now; **Maestro** will be evaluated once the app has stable flows.
- Since no test infrastructure exists yet, the **first technical task** is to set up Jest (with
  `jest-expo`, since Expo is used) and React Native Testing Library.

**Rationale:** focus testing effort where the real risk is (dates, timezones, idempotency,
critical flows) without paying the cost of covering purely visual parts. This principle will be
revisited as the project matures.

## Technical Stack & Architecture Constraints

The stack is decided and MUST be respected unless this constitution is formally amended:

- **Mobile:** React Native + Expo (TypeScript), Apollo Client, `expo-notifications`.
- **API + worker:** Node.js + TypeScript, GraphQL Yoga, Pothos, Prisma. The worker is an
  **always-on** cron process (not serverless/FaaS), because the "day before / day of" reminder
  requirement needs a process that runs continuously. API and worker share the `@savia/api`
  project.
- **Data:** managed PostgreSQL (Railway for the MVP; Neon as an alternative). `User→*` and
  `Plant→*` relations use `onDelete: Cascade`.
- **Auth:** Auth0 (email + Google); the JWT is validated in the API. Identity is `User.auth0Id`
  (the Auth0 `sub`); `email` is also unique. **Auth0 is mandatory in production**: the production
  build MUST have `AUTH0_DOMAIN` defined and require `Authorization: Bearer`; the development
  shortcut `x-dev-user-email` MUST be disabled there (it only operates when `AUTH0_DOMAIN` is not
  defined). Push is sent with **Expo Push**, storing the push token per device.
- **Strict TypeScript across the monorepo:** `strict`, `noUncheckedIndexedAccess`, and
  `forceConsistentCasingInFileNames` are enabled in `tsconfig.base.json` and MUST remain.
- **pnpm workspaces monorepo:** `apps/mobile`, `apps/api` (+ `src/worker`), `packages/shared`.
  Node ≥ 22.

## Development Workflow & Quality Gates

- **`docs/` is the source of truth.** Every product, design, stack, or data-model decision MUST
  be reflected in `docs/` (and, where applicable, in `README.md`). The code may not silently
  contradict the docs.
- **Artifact sync verification (required).** Every change MUST be accompanied by a verification
  that the Spec Kit artifacts — this constitution, and the active feature's `spec.md`,
  `plan.md`, and `tasks.md` — remain consistent with the actual state of the application. Run
  `/speckit-analyze` for cross-artifact consistency, and update any artifact that no longer
  matches reality before the change is considered complete. A change that leaves a framework
  artifact stale is NOT done.
- **Framework artifacts in English.** This constitution and all Spec Kit artifacts (specs, plans,
  tasks, checklists) are written in English. This is independent of the product's default
  user-facing language, which remains Spanish (Principle VI).
- **Typecheck required.** `pnpm -r typecheck` MUST pass before integrating changes; strict typing
  is the project's safety net.
- **Green tests.** The tests required by Principle VIII MUST pass for a task to be considered
  complete.
- **Spec-driven development.** Feature work is routed through Spec Kit (`/speckit-specify` →
  `/speckit-plan` → `/speckit-tasks` → `/speckit-implement`).
- **Knowledge graph up to date.** After modifying code, `graphify update .` MUST be run to keep
  `graphify-out/` in sync (AST only, no API cost).
- **Dev mode without Auth0.** While there is no tenant, the API identifies a test user with the
  `x-dev-user-email` header, enabled **only** when `AUTH0_DOMAIN` is not defined.

## Governance

This constitution takes precedence over other project practices. In case of conflict between the
code and these principles, it MUST be flagged explicitly and the path forward asked before
acting; then either the code is corrected or the constitution is formally amended — it is never
silently ignored.

- **Amendments:** require documenting the change and its rationale, and bumping the version.
- **Semantic versioning:** MAJOR for incompatible changes or removal/redefinition of principles;
  MINOR for new principles or sections or materially expanded guidance; PATCH for clarifications
  and non-semantic fixes.
- **Compliance:** every PR or review must verify conformance with these principles; unjustified
  complexity must be challenged.
- **Runtime guidance:** for day-to-day operational conventions, see `CLAUDE.md` at the root.

**Version**: 1.0.0 | **Ratified**: 2026-10-01 | **Last Amended**: 2026-10-01
