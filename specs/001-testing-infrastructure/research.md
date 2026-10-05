# Phase 0 Research: Automated Testing Infrastructure

All decisions are constrained by the constitution (Principle VIII fixes Jest + jest-expo + React
Native Testing Library; Maestro/E2E out of scope) and by the current stack (ESM `type: module`
node workspaces on Node ≥ 22; Expo SDK 52 / RN 0.76.9 / React 18.3.1 on mobile).

## D1 — Jest topology: per-workspace configs + root orchestration

- **Decision**: Each workspace owns a Jest config and a `test` script; a root `test` script runs
  `pnpm -r test` to fan out and aggregate.
- **Rationale**: The node workspaces need the `node` test environment with ESM/TS transform, while
  mobile needs the `jest-expo` preset (its own transformer, RN module mapping, and environment).
  These presets are mutually incompatible in a single flat config. `pnpm -r` returns a non-zero
  exit if any workspace fails (satisfies FR-001/FR-002) and naturally isolates per-workspace runs
  (FR-003).
- **Alternatives considered**:
  - *Single root Jest `projects` (multi-project) config*: workable, but mixing jest-expo with a
    node ESM project in one config is brittle and obscures per-workspace ownership. Rejected for
    fragility.
  - *A single runner like Vitest across all*: would contradict the constitution's fixed toolchain
    (Jest + jest-expo). Rejected.

## D2 — Transform for node workspaces (`packages/shared`, `apps/api`)

- **Decision**: Jest with **ts-jest** using its ESM preset (`extensionsToTreatAsEsm: ['.ts']`,
  `preset: 'ts-jest/presets/default-esm'`), `testEnvironment: 'node'`.
- **Rationale**: Both workspaces are `type: module` pure TypeScript; ts-jest runs the TS directly
  with no extra babel setup and stays first-party/standard. Type *checking* is deliberately left to
  `pnpm -r typecheck` (constitution), so ts-jest is configured for transform speed (isolatedModules)
  rather than type-aware runs.
- **Alternatives considered**:
  - *@swc/jest*: faster, but introduces swc as a new toolchain the project does not otherwise use.
    Keep as a fallback if ts-jest ESM proves slow.
  - *babel-jest (@babel/preset-typescript)*: strips types without checking; viable but adds babel
    config to otherwise babel-free node workspaces. Rejected for now to avoid extra config.

## D3 — Mobile test stack (`apps/mobile`)

- **Decision**: `jest-expo` preset + **@testing-library/react-native** (RNTL) +
  `react-test-renderer@18.3.1` (must match React). Add a `babel.config.js` with `babel-preset-expo`
  (required by jest-expo) and a `jest.setup.ts` that loads RNTL's built-in Jest matchers.
- **Rationale**: jest-expo is the constitution-mandated preset and configures the RN transform and
  module mapping for Expo SDK 52. RNTL renders components and queries them like a user would,
  enabling the care-status component test without a device. Built-in RNTL matchers (RNTL ≥ 12.4)
  replace the deprecated `@testing-library/jest-native`.
- **Alternatives considered**:
  - *`@testing-library/jest-native` matchers package*: deprecated/merged into RNTL. Rejected.
  - *react-native's default jest preset*: lacks Expo module handling. Rejected.

## D4 — Root orchestration & "no tests found" handling (FR-010)

- **Decision**: Root `package.json` gains `"test": "pnpm -r test"`. Each workspace's `test` script
  runs `jest --passWithNoTests`. Optional root aliases (`test:shared`, `test:api`, `test:mobile`)
  via `pnpm --filter`.
- **Rationale**: `--passWithNoTests` makes an empty-but-valid workspace a non-failing, clearly
  reported outcome (FR-010), while a real failing/erroring test still fails the workspace and thus
  the aggregate `pnpm -r` run (FR-002). Per-workspace filters give the fast scoped loop (FR-003).

## D5 — Test discovery convention (FR-009)

- **Decision**: Co-locate tests next to the code as `*.test.ts` / `*.test.tsx`, using Jest's
  default `testMatch`. No extra wiring needed to pick up new tests.
- **Rationale**: Lowest-friction, conventional, and keeps a test beside the unit it protects.
- **Alternatives considered**: a top-level `tests/` tree — rejected as it separates tests from the
  domain logic they cover and complicates the shared-domain principle.

## D6 — Determinism & isolation (FR-007)

- **Decision**: Node environment for `shared`/`api`; jest-expo (Node-based) for mobile. The worker
  timezone seed test passes fixed `Date` inputs and an explicit IANA zone; the mobile seed test
  wraps the component in the app's `ThemeProvider` and initialized i18n, with no Apollo/navigation.
- **Rationale**: Guarantees the seed suite runs identically locally and in CI with no DB, network,
  Auth0, device, or wall-clock/timezone dependence.

## D7 — Coverage & snapshots (FR-008, FR-011)

- **Decision**: No coverage threshold and coverage collection off by default; an opt-in
  `test:coverage` alias may be added. No snapshot tests anywhere; the mobile seed test asserts on
  concrete rendered content (labels/roles), never `toMatchSnapshot`.
- **Rationale**: Matches the clarified decisions (no coverage gate this iteration) and the
  constitution's ban on snapshot tests.

## Open items deferred to implementation

- Exact ts-jest ESM tsconfig knobs (e.g. `isolatedModules`, module interop) are tactical and will
  be finalized in `/speckit-implement`; D2 allows swapping to @swc/jest if ESM transform is slow.
- Whether `jest.setup.ts` needs explicit i18n initialization depends on how `t(...)` resolves at
  import time; handled during implementation of the mobile seed test.
