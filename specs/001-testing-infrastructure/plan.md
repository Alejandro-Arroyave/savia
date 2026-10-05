# Implementation Plan: Automated Testing Infrastructure

**Branch**: `001-testing-infrastructure` | **Date**: 2026-10-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-testing-infrastructure/spec.md`

## Summary

Stand up a monorepo-wide automated test harness so the constitution's "green tests" gate becomes
enforceable. A single root command runs every workspace's tests and fails if any test fails;
each workspace is independently runnable. Pure business logic (`packages/shared`, `apps/api`
worker) is tested with Jest; the mobile app (`apps/mobile`) is tested with jest-expo + React
Native Testing Library. The harness ships green with one representative test per layer (shared
date/status logic, worker timezone scheduling, a mobile care-status component). No coverage gate,
no snapshot tests, no CI wiring in this iteration.

## Technical Context

**Language/Version**: TypeScript 5.6 (strict), Node ≥ 22, ESM (`"type": "module"` across node
workspaces). Mobile: Expo SDK 52, React Native 0.76.9, React 18.3.1.

**Primary Dependencies**: Jest as the runner. Node workspaces (`shared`, `api`): `ts-jest` (ESM
preset). Mobile (`apps/mobile`): `jest-expo` preset + `@testing-library/react-native` +
`react-test-renderer@18.3.1`. Orchestration via pnpm workspaces (`pnpm -r`).

**Storage**: N/A — tests run fully offline; no database, network, Auth0, or device.

**Testing**: Jest (this feature delivers it). Seed tests: 3 (one per layer).

**Target Platform**: Developer machines and (later) CI runners, all on Node. Mobile tests execute
in Node via jest-expo — no simulator/device.

**Project Type**: Mobile + API monorepo (pnpm workspaces): `apps/mobile`, `apps/api` (+ worker),
`packages/shared`.

**Performance Goals**: The `shared` workspace test run completes in under 30 s on a typical dev
machine (SC-004). Seed suite is fast and deterministic.

**Constraints**: Deterministic, no external dependencies (FR-007); no snapshot tests (FR-008); the
run never fails on coverage grounds this iteration (FR-011); "no tests found" is a non-failing,
clearly reported outcome (FR-010).

**Scale/Scope**: 3 workspaces, 3 seed tests, 1 root orchestration script, per-workspace Jest
config. CI pipeline wiring is explicitly out of scope.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle / Gate | Assessment |
|---|---|
| VIII — Pragmatic tests | This feature *implements* the principle: Jest for logic, RNTL for critical UI, no snapshots, Maestro/E2E out of scope. ✅ Direct alignment. |
| I — Shared domain single source | Shared logic is tested inside `packages/shared`; no logic is duplicated into tests elsewhere. ✅ |
| II — Time in user timezone | A seed test covers the worker's `zonedTimeToUtc`. The known UTC bug in `packages/shared` is *not* fixed here (separate feature); the shared seed test asserts current documented behavior only. ✅ (no scope creep) |
| VII / VIII — No snapshot tests | Enforced by convention; seed mobile test asserts on rendered content, not snapshots. ✅ |
| Quality gate — green tests + typecheck | This feature creates the "green tests" gate; tests do not type-check (that stays with `pnpm -r typecheck`), keeping concerns separate. ✅ |
| Framework artifacts in English | Plan and all Phase-0/1 artifacts are in English. ✅ |

**Result**: PASS. No violations; Complexity Tracking not required.

Note: Jest topology (per-workspace configs vs a single root multi-project config) is an
implementation detail, resolved in Phase 0 research — not a constitutional concern.

## Project Structure

### Documentation (this feature)

```text
specs/001-testing-infrastructure/
├── plan.md              # This file (/speckit-plan)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (no domain entities; documents the test-config model)
├── quickstart.md        # Phase 1 output (how to run & validate the suite)
├── contracts/
│   └── test-commands.md # Phase 1 output (the test-command contract: inputs, exit codes, output)
└── tasks.md             # Phase 2 output (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

```text
packages/shared/
├── src/
│   ├── index.ts
│   └── index.test.ts                 # seed: date/status logic (computeNextDue, careStatus)
├── jest.config.ts                    # ts-jest ESM, node environment
└── package.json                      # + "test": "jest --passWithNoTests"

apps/api/
├── src/
│   └── worker/
│       ├── time.ts
│       └── time.test.ts              # seed: zonedTimeToUtc (user-timezone scheduling)
├── jest.config.ts                    # ts-jest ESM, node environment
└── package.json                      # + "test": "jest --passWithNoTests"

apps/mobile/
├── src/
│   └── components/
│       └── CareStatChip.test.tsx     # seed: care-status component render (water/fertilize state)
├── babel.config.js                   # NEW: babel-preset-expo (required by jest-expo)
├── jest.config.js                    # jest-expo preset + RNTL setup
├── jest.setup.ts                     # RNTL matchers; i18n/theme test helpers
└── package.json                      # + "test": "jest --passWithNoTests"

package.json (root)                   # + "test": "pnpm -r test" (+ optional per-workspace aliases)
```

**Structure Decision**: Keep the existing pnpm-workspace layout untouched and add a **per-workspace
Jest configuration** plus a **root orchestration script** (`pnpm -r test`). Tests are co-located
with the code they cover (`*.test.ts` / `*.test.tsx`). This matches the incompatible test
environments (node ESM for `shared`/`api`, jest-expo for `mobile`) and gives per-workspace
isolation (FR-003) for free, while `pnpm -r` provides the single aggregate pass/fail (FR-001,
FR-002). Rationale and alternatives in [research.md](./research.md).

## Complexity Tracking

> No constitution violations — section intentionally empty.
