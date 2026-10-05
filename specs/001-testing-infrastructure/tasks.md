---
description: "Task list for Automated Testing Infrastructure"
---

# Tasks: Automated Testing Infrastructure

**Input**: Design documents from `specs/001-testing-infrastructure/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/test-commands.md

**Tests**: This feature *is* the test harness. The "test tasks" are the three seed tests
(User Story 3); no additional TDD contract/integration tests are requested.

**Organization**: Tasks are grouped by user story so each can be implemented and verified
independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: US1 / US2 / US3 (setup, foundational and polish tasks carry no story label)

## Path Conventions

Mobile + API monorepo (pnpm workspaces): `packages/shared/`, `apps/api/`, `apps/mobile/`.
Tests are co-located with the code as `*.test.ts` / `*.test.tsx`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Bring in the test tooling the constitution mandates (Jest + jest-expo + RNTL).

- [ ] T001 [P] Add Jest dev dependencies (`jest`, `ts-jest`, `@types/jest`) to `packages/shared/package.json`
- [ ] T002 [P] Add Jest dev dependencies (`jest`, `ts-jest`, `@types/jest`) to `apps/api/package.json`
- [ ] T003 [P] Add mobile test dev dependencies (`jest`, `jest-expo`, `@testing-library/react-native`, `react-test-renderer@18.3.1`, `@types/jest`) to `apps/mobile/package.json`
- [ ] T004 Run `pnpm install` at the repo root to materialize the new dev dependencies (depends on T001–T003)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create the per-workspace Jest harness every user story depends on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T005 [P] Create `packages/shared/jest.config.ts` — ts-jest ESM (`preset: 'ts-jest/presets/default-esm'`, `extensionsToTreatAsEsm: ['.ts']`, `isolatedModules: true`, `testEnvironment: 'node'`)
- [ ] T006 [P] Create `apps/api/jest.config.ts` — same ts-jest ESM settings as T005, `roots: ['<rootDir>/src']`, `testEnvironment: 'node'`
- [ ] T007 [P] Create `apps/mobile/babel.config.js` — `presets: ['babel-preset-expo']` (required by jest-expo)
- [ ] T008 [P] Create `apps/mobile/jest.config.js` — `preset: 'jest-expo'`, `setupFilesAfterEnv: ['<rootDir>/jest.setup.ts']`
- [ ] T009 [P] Create `apps/mobile/jest.setup.ts` — register RNTL built-in matchers (`import '@testing-library/react-native/extend-expect'`) and any theme/i18n test helpers

**Checkpoint**: `jest` can run in every workspace (even with zero tests).

---

## Phase 3: User Story 1 - Run the whole suite with one command (Priority: P1) 🎯 MVP

**Goal**: One root command runs every workspace's tests and fails if any test fails.

**Independent Test**: `pnpm test` exits 0 on a clean checkout; adding one failing test makes the
same command exit non-zero and name the failing workspace/test.

### Implementation for User Story 1

- [ ] T010 [P] [US1] Add `"test": "jest --passWithNoTests"` to `packages/shared/package.json`
- [ ] T011 [P] [US1] Add `"test": "jest --passWithNoTests"` to `apps/api/package.json`
- [ ] T012 [P] [US1] Add `"test": "jest --passWithNoTests"` to `apps/mobile/package.json`
- [ ] T013 [US1] Add root `"test": "pnpm -r test"` to `package.json` (aggregate run; non-zero exit if any workspace fails — FR-001, FR-002)
- [ ] T014 [US1] Verify gate behavior: `pnpm test` exits 0 with no tests (FR-010); add a throwaway failing test, confirm non-zero exit naming the failure, then remove it

**Checkpoint**: The one-command quality gate works and propagates failures.

---

## Phase 4: User Story 2 - Fast, scoped feedback per workspace (Priority: P2)

**Goal**: Run a single workspace's tests in isolation for a quick loop.

**Independent Test**: Each scoped command runs only its workspace; `pnpm test:shared` finishes in
under 30 s.

### Implementation for User Story 2

- [ ] T015 [US2] Add root scoped aliases `test:shared`, `test:api`, `test:mobile` (via `pnpm --filter @savia/<ws> test`) to `package.json` (same file as T013 — sequence after it)
- [ ] T016 [US2] Verify each alias runs only its own workspace, and confirm `pnpm test:shared` completes in under 30 s (FR-003, SC-004)

**Checkpoint**: Scoped per-workspace runs work alongside the aggregate run.

---

## Phase 5: User Story 3 - Suite ships green with one real test per layer (Priority: P3)

**Goal**: One meaningful passing test for each layer so the suite is green on day one.

**Independent Test**: On a clean checkout, a shared unit test, a worker timezone unit test, and a
mobile care-status component test all pass with no external services.

### Implementation for User Story 3

- [ ] T017 [P] [US3] Create `packages/shared/src/index.test.ts` — unit-test `computeNextDue` and `careStatus` for the three kinds (`today` when diff 0, `upcoming` when diff > 0, `overdue` when diff < 0) using fixed `Date` inputs
- [ ] T018 [P] [US3] Create `apps/api/src/worker/time.test.ts` — unit-test `zonedTimeToUtc` for a known IANA zone (e.g. `America/Bogota`, UTC−5) with a fixed date + `notifyHour`, asserting the resulting UTC instant; deterministic, no clock dependence (Principle II, FR-007)
- [ ] T019 [P] [US3] Create `apps/mobile/src/components/CareStatChip.test.tsx` — render the component for `WATERING` and `FERTILIZING` states wrapped in `ThemeProvider` + initialized i18n; assert the rendered care label/value (no snapshot — FR-008)
- [ ] T020 [US3] Run `pnpm test` and confirm all three seed tests pass on a clean checkout with network disconnected (FR-006, FR-007, SC-002, SC-005)

**Checkpoint**: All three layers proven; suite green from day one.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T021 [P] Ensure no coverage threshold is configured; add `coverage/` to `.gitignore`; optionally add a `test:coverage` alias to `package.json` (FR-011)
- [ ] T022 [P] Confirm no snapshot assertions exist in any test file (FR-008)
- [ ] T023 [P] Document the test commands (`pnpm test` + per-workspace) in `docs/07-dev-setup.md`
- [ ] T024 Run the `quickstart.md` validation scenarios end to end (SC-001, SC-002, SC-003, SC-005)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: start immediately; T004 after T001–T003.
- **Foundational (Phase 2)**: after Setup — **blocks all user stories**.
- **User Stories (Phase 3–5)**: each depends only on Foundational; independent of each other
  (except T015 shares `package.json` with T013, so sequence it after).
- **Polish (Phase 6)**: after the user stories you intend to ship.

### User Story Dependencies

- **US1 (P1)**: after Foundational. No dependency on US2/US3.
- **US2 (P2)**: after Foundational. Shares root `package.json` with US1's T013 — sequence T015 after T013.
- **US3 (P3)**: after Foundational. Independent of US1/US2 (though US1's aggregate run is what finally executes these tests).

### Parallel Opportunities

- Setup: T001, T002, T003 in parallel (different `package.json` files).
- Foundational: T005, T006, T007, T008, T009 in parallel (different files).
- US1: T010, T011, T012 in parallel (different `package.json` files); T013 then T014.
- US3: T017, T018, T019 in parallel (different test files); T020 after.
- Polish: T021, T022, T023 in parallel; T024 last.

---

## Parallel Example: Foundational

```bash
# Create all Jest configs together (different files):
Task: "Create packages/shared/jest.config.ts (ts-jest ESM, node)"
Task: "Create apps/api/jest.config.ts (ts-jest ESM, node)"
Task: "Create apps/mobile/babel.config.js (babel-preset-expo)"
Task: "Create apps/mobile/jest.config.js (jest-expo preset)"
Task: "Create apps/mobile/jest.setup.ts (RNTL matchers)"
```

## Parallel Example: User Story 3 seed tests

```bash
Task: "Create packages/shared/src/index.test.ts (computeNextDue, careStatus)"
Task: "Create apps/api/src/worker/time.test.ts (zonedTimeToUtc)"
Task: "Create apps/mobile/src/components/CareStatChip.test.tsx (care-status render)"
```

---

## Implementation Strategy

### MVP First (through User Story 1)

1. Phase 1: Setup → 2. Phase 2: Foundational → 3. Phase 3: US1.
4. **STOP and VALIDATE**: `pnpm test` runs green (no tests) and fails on a planted failure.

### Incremental Delivery

- Setup + Foundational → harness ready.
- + US1 → the one-command gate works (MVP).
- + US2 → fast scoped runs.
- + US3 → suite green with one real test per layer.
- Polish → docs + guards (no coverage gate, no snapshots) + quickstart validation.

---

## Notes

- [P] = different files, no dependencies.
- The worker timezone test (T018) protects the project's highest-risk logic (Principle II).
- The known UTC rounding bug in `packages/shared` is **out of scope here**; T017 asserts current
  documented behavior only — fixing it is a separate feature.
- Commit after each task or logical group (you commit; auto-commit stays disabled).
