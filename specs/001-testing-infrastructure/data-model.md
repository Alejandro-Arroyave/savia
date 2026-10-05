# Phase 1 Data Model: Automated Testing Infrastructure

This feature introduces **no domain data entities** — it changes no database schema, no GraphQL
types, and no persisted state. The "entities" below are the configuration and script artifacts the
feature creates, documented so their roles and relationships are explicit.

## Configuration artifacts

| Artifact | Location | Role | Key fields / content |
|---|---|---|---|
| Root test script | `package.json` (root) | Orchestrates all workspaces | `scripts.test = "pnpm -r test"`; optional `test:shared` / `test:api` / `test:mobile` filter aliases |
| Shared Jest config | `packages/shared/jest.config.ts` | Runs node ESM/TS unit tests | ts-jest ESM preset, `testEnvironment: "node"` |
| API Jest config | `apps/api/jest.config.ts` | Runs worker/business unit tests | ts-jest ESM preset, `testEnvironment: "node"` |
| Mobile Jest config | `apps/mobile/jest.config.js` | Runs RN component/flow tests | `preset: "jest-expo"`, `setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"]` |
| Mobile Babel config | `apps/mobile/babel.config.js` | Required by jest-expo transform | `presets: ["babel-preset-expo"]` |
| Mobile Jest setup | `apps/mobile/jest.setup.ts` | Registers RNTL matchers, test helpers | imports RNTL extend-expect; theme/i18n test wrappers |
| Workspace `test` scripts | each workspace `package.json` | Entry point per workspace | `"test": "jest --passWithNoTests"` |

## Relationships

```text
root package.json "test"  ──pnpm -r──▶  packages/shared : jest.config.ts ──▶ *.test.ts (node)
                          ├──────────▶  apps/api        : jest.config.ts ──▶ src/worker/*.test.ts (node)
                          └──────────▶  apps/mobile     : jest.config.js  ──▶ *.test.tsx (jest-expo)
                                                           └── babel.config.js, jest.setup.ts
```

## Seed test artifacts (one per layer)

| Seed test | File | Covers | Determinism note |
|---|---|---|---|
| Shared date/status | `packages/shared/src/index.test.ts` | `computeNextDue`, `careStatus` (documented current behavior) | Pure function, fixed `Date` inputs |
| Worker timezone | `apps/api/src/worker/time.test.ts` | `zonedTimeToUtc` user-timezone scheduling | Fixed date + explicit IANA zone, no clock dependence |
| Mobile care-status | `apps/mobile/src/components/CareStatChip.test.tsx` | Renders watering/fertilizing state via `careStatusView` + `careAccent`/`careIcon` | Wrapped in `ThemeProvider` + i18n; no Apollo/navigation |

## Validation rules (from requirements)

- Any failing/erroring test MUST make the aggregate run fail (FR-002); a workspace with no tests
  MUST pass (`--passWithNoTests`, FR-010).
- Seed tests MUST NOT touch a database, network, Auth0, or device (FR-007).
- No artifact enables a coverage threshold (FR-011) and none uses snapshot assertions (FR-008).
