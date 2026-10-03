# Feature Specification: Automated Testing Infrastructure

**Feature Branch**: `001-testing-infrastructure`

**Created**: 2026-10-02

**Status**: Draft

**Input**: User description: "Set up the project's automated testing infrastructure so that business logic and critical user flows can be tested, as required by the constitution (Principle VIII)."

## User Scenarios & Testing *(mandatory)*

The actors here are **developers** working on the Savia monorepo and the **automation (CI)** that
runs on their changes. The value is a reliable, low-friction way to prove that a change is safe,
so the constitution's "green tests" quality gate becomes enforceable.

### User Story 1 - Run the whole suite with one command (Priority: P1)

A developer finishing a change runs a single command from the monorepo root and gets one clear
aggregate result (pass/fail) covering every workspace. If anything fails, the command fails.

**Why this priority**: This is the heart of the quality gate. Without a one-shot, whole-repo run
that fails loudly, "a task is not complete if its tests do not pass" cannot be enforced. It is the
minimum viable slice: even alone it delivers a usable gate.

**Independent Test**: From a clean checkout, run the single root command and confirm it discovers
and runs tests across all workspaces and exits successfully; introduce one failing test and
confirm the same command now reports failure.

**Acceptance Scenarios**:

1. **Given** a clean checkout, **When** the developer runs the single root test command, **Then**
   tests from every workspace run and the command reports an aggregate pass with a success exit.
2. **Given** a test that fails in any one workspace, **When** the developer runs the root test
   command, **Then** the aggregate result is failure and the failing workspace/test is named.

---

### User Story 2 - Fast, scoped feedback per workspace (Priority: P2)

While working inside one workspace (shared logic, the API/worker, or the mobile app), a developer
runs only that workspace's tests to get quick feedback without paying for the whole suite.

**Why this priority**: Keeps the day-to-day loop fast so developers actually run tests. Important,
but the gate (P1) can function without it.

**Independent Test**: From a single workspace, run its scoped test command and confirm only that
workspace's tests run and report pass/fail.

**Acceptance Scenarios**:

1. **Given** the developer is working on shared business logic, **When** they run the shared
   workspace's test command, **Then** only that workspace's tests run and report a result.
2. **Given** the developer is working on the mobile app, **When** they run the mobile workspace's
   test command, **Then** only mobile tests run and report a result.

---

### User Story 3 - Suite ships green with one real test per layer (Priority: P3)

The infrastructure is delivered with at least one meaningful test for each of the three layers —
shared business logic, the worker's timezone scheduling, and the mobile UI — so the suite is green
on day one and proves the harness works for every kind of code.

**Why this priority**: Proves each layer's harness end to end and gives the gate a non-empty,
passing baseline. Depends on P1 existing first.

**Independent Test**: On a clean checkout, confirm the suite contains and passes a unit test for
shared date/status logic, a unit test for the worker's timezone scheduling, and a mobile
care-status component test, with no external services needed.

**Acceptance Scenarios**:

1. **Given** a clean checkout, **When** the suite runs, **Then** a unit test exercising the shared
   date/status logic passes.
2. **Given** a clean checkout, **When** the suite runs, **Then** a unit test exercising the
   worker's timezone scheduling (user-timezone "day before / day of" logic) passes.
3. **Given** a clean checkout, **When** the suite runs, **Then** a mobile test that renders a
   care-status component (e.g. `CareStatChip`/`PlantCard`) and asserts on its watering/fertilizing
   state passes.

---

### Edge Cases

- **A workspace has no tests yet**: the run MUST treat "no tests found" as a non-failing, clearly
  reported outcome (so a not-yet-tested workspace does not block the gate), while still failing if
  a configured test errors.
- **A single failure anywhere**: any failing or errored test MUST make the aggregate run fail (a
  non-zero result), so the gate cannot be passed with a red test.
- **Flaky or environment-dependent tests**: seed tests MUST be deterministic and MUST NOT depend on
  a database, network, Auth0 tenant, wall-clock timezone, or a physical device/emulator.
- **Snapshot tests**: MUST NOT be introduced, even where tempting (e.g. rendering a component).

## Clarifications

### Session 2026-10-02

- Q: Should the seed suite also require a unit test for the worker's timezone scheduling logic? → A: Yes — the seed covers three layers: shared + worker + mobile.
- Q: Should this iteration enforce a minimum code-coverage threshold? → A: No — stand up the harness green first; a threshold can be added later.
- Q: Is wiring the actual CI pipeline part of this feature? → A: No — deliver the local one-command run that CI will call; CI wiring is a later feature.
- Q: Which mobile UI should the single seed mobile test cover? → A: A care-status component (e.g. `CareStatChip`/`PlantCard`) rendering watering/fertilizing state.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A single command run from the monorepo root MUST execute every workspace's automated
  tests and report one aggregate pass/fail result.
- **FR-002**: The aggregate run MUST fail (non-success result) whenever any test fails or errors.
- **FR-003**: Each workspace (shared business logic, API/worker, mobile app) MUST be testable in
  isolation via its own scoped command for fast feedback.
- **FR-004**: Pure business-logic workspaces (shared and worker) MUST support unit tests.
- **FR-005**: The mobile app MUST support tests that render components and exercise critical user
  flows defined in a spec.
- **FR-006**: The delivered suite MUST include at least one real unit test for the shared
  date/status logic, one unit test for the worker's timezone scheduling (user-timezone "day before
  / day of" logic), and one mobile test rendering a care-status component (e.g.
  `CareStatChip`/`PlantCard`) — and all MUST pass on a clean checkout.
- **FR-011**: The aggregate run MUST NOT fail on code-coverage grounds in this iteration (no
  enforced coverage threshold); coverage may be collected/reported but does not gate the run.
- **FR-007**: Seed tests MUST be deterministic and MUST run without external dependencies
  (database, network, Auth0, device/emulator).
- **FR-008**: Snapshot tests MUST NOT be used anywhere in the suite.
- **FR-009**: New test files MUST be discovered by a conventional location/naming pattern, so adding
  a test requires no additional wiring.
- **FR-010**: "No tests found" in a workspace MUST be a clearly reported, non-failing outcome.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A developer can run the entire suite with exactly one command from the repo root and
  read a single pass/fail result.
- **SC-002**: On a clean checkout with no code changes, the suite passes, including at least one
  pure-logic test and at least one mobile UI test.
- **SC-003**: Introducing a single failing test anywhere causes the root command to report failure
  100% of the time.
- **SC-004**: A developer can run a single workspace's tests in isolation and see results in under
  30 seconds for the shared workspace on a typical developer machine.
- **SC-005**: The seed suite completes with zero reliance on external services (no database,
  network, Auth0, or device), so it runs the same locally and in automation.

## Assumptions

- **Actors**: developers working in the monorepo and the automation (CI) that runs the same root
  command. Wiring the actual CI pipeline is out of scope; this feature delivers the command CI will
  call.
- **Toolchain is fixed by the constitution (Principle VIII)** and is therefore an assumption rather
  than a requirement here: Jest for pure business logic (shared, worker); jest-expo + React Native
  Testing Library for the mobile app; Maestro/E2E out of scope.
- **Monorepo orchestration**: the repo uses pnpm workspaces, and a root script fans the test run
  out across workspaces.
- **No enforced coverage threshold** (confirmed in clarification): the first iteration focuses on a
  working, green-on-day-one harness; a minimum-coverage gate can be added later if desired.
- **CI wiring is out of scope** (confirmed in clarification): this feature delivers the local
  one-command run; standing up the CI workflow that calls it is a separate later feature.
- **Scope boundaries**: end-to-end testing (Maestro) and writing exhaustive tests for the existing
  7 screens are explicitly out of scope; this feature stands up the harness plus one representative
  test per layer (shared, worker, mobile).
