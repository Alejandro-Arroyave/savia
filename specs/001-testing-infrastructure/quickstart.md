# Quickstart: Validate the Testing Infrastructure

A run/validation guide proving the feature works end to end. Implementation details live in
`tasks.md` and the implementation phase; this file only shows how to run and what to expect.

## Prerequisites

- Node ≥ 22 and pnpm (`corepack enable`).
- Dependencies installed: `pnpm install`.
- No database, network, Auth0 tenant, or device/emulator is required (FR-007).

## Run the whole suite (SC-001)

```bash
pnpm test
```

**Expected**: all workspaces run and the command exits `0`. The output includes a Jest summary per
workspace and at least the three seed tests passing (shared, worker, mobile).

## Run a single workspace (SC-004, FR-003)

```bash
pnpm test:shared     # packages/shared — expected < 30s
pnpm test:api        # apps/api (incl. worker)
pnpm test:mobile     # apps/mobile (jest-expo + RNTL)
```

**Expected**: only the chosen workspace's tests run and report pass/fail.

## Validation scenarios

| # | Scenario | Steps | Expected outcome |
|---|---|---|---|
| SC-001 | One-command run | `pnpm test` | Single aggregate pass/fail; exit `0` on clean checkout |
| SC-002 | Green on clean checkout | `pnpm test` with no changes | Passes, incl. ≥1 pure-logic test and ≥1 mobile UI test |
| SC-003 | Gate catches red | Temporarily add a failing assertion, run `pnpm test`, then revert | Run reports failure with non-zero exit; passes again after revert |
| SC-005 | No external services | Disconnect network, run `pnpm test` | Suite still passes identically |
| FR-010 | No-tests workspace | Run a workspace with no `*.test.*` files | Reported as "no tests", exit `0` (non-failing) |

## Seed tests to expect (one per layer)

- `packages/shared/src/index.test.ts` — date/status logic (`computeNextDue`, `careStatus`).
- `apps/api/src/worker/time.test.ts` — `zonedTimeToUtc` user-timezone scheduling.
- `apps/mobile/src/components/CareStatChip.test.tsx` — renders watering/fertilizing care state.

See [contracts/test-commands.md](./contracts/test-commands.md) for the full command/exit-code
contract and [data-model.md](./data-model.md) for the configuration artifacts.

## Out of scope (do not expect)

- A coverage threshold failing the run (FR-011) — coverage is opt-in only.
- Snapshot tests (FR-008).
- A CI workflow — CI will call `pnpm test` unchanged in a later feature.
