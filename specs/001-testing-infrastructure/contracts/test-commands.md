# Contract: Test Commands

The interface this feature exposes is a set of **commands** and their **exit-code / output
contract**. Developers and CI depend on these; they must remain stable.

## Root command (whole suite)

| Field | Value |
|---|---|
| Command | `pnpm test` (root) → runs `pnpm -r test` |
| Input | none |
| Success | Exit code `0` when every workspace's tests pass (or a workspace has no tests) |
| Failure | Non-zero exit when any test in any workspace fails or errors (FR-002) |
| Output | Per-workspace Jest summaries; the failing workspace and test are named on failure |
| Preconditions | `pnpm install` has run; no DB/network/Auth0/device required (FR-007) |

## Per-workspace commands (scoped feedback, FR-003)

| Command | Scope | Notes |
|---|---|---|
| `pnpm --filter @savia/shared test` (alias `pnpm test:shared`) | `packages/shared` | Node ESM unit tests; target < 30 s (SC-004) |
| `pnpm --filter @savia/api test` (alias `pnpm test:api`) | `apps/api` (incl. worker) | Node ESM unit tests |
| `pnpm --filter @savia/mobile test` (alias `pnpm test:mobile`) | `apps/mobile` | jest-expo + RNTL |

Each workspace `test` script is `jest --passWithNoTests`, so:

| Situation | Result |
|---|---|
| Tests present and passing | Exit `0` |
| Tests present, ≥1 failing/erroring | Non-zero exit (FR-002) |
| No test files found | Exit `0`, reported as "no tests" (FR-010) |

## Discovery contract (FR-009)

- A new test is picked up with no extra wiring when named `*.test.ts` / `*.test.tsx` and placed
  beside the code it covers (Jest default `testMatch`).

## Explicit non-contract (out of scope)

- No coverage threshold gates the run this iteration (FR-011); coverage is opt-in only.
- No snapshot assertions are part of the suite (FR-008).
- No CI workflow is defined here; CI is expected to call `pnpm test` unchanged (later feature).
