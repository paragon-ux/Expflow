# Phase 1 Completion Report - Ordinary UX/UI Corrections

**Status:** complete
**Phase:** 1 - Ordinary UX/UI Corrections
**Gate:** BW-A - UX Control Surface Ready
**Verdict:** GO

## Baseline and final commit

- Baseline: Expflow v1.0.1 at `99ad975a2b3e1f4b6c67020b219db7ff6d64acf7` on branch `feat/build-week-governance`.
- Implementation checkpoint: `c6ad308700f66eab784fddebda1a823846f6855f` (`Complete Phase 1 CLI UX checkpoint`).
- Final documentation state: report and evidence updated after validation.

## Scope delivered

Phase 1 preserved the four ordinary commands and improved only the ordinary CLI/material UX surface:

- `status` now gives actionable human output, keeps uninitialized exit `0`, and exposes additive history and node-history views.
- `sync --dry-run` now reports path-level changes, counts by kind, candidate digest, current head, and provisional identity labels.
- `restore --dry-run` now previews path effects without mutation.
- `restore` now refuses conflicting unrecorded drift by default and supports explicit `--force` override.
- Per-command help is non-mutating and documents Phase 1 options.
- Unsupported options and malformed usage fail with exit `2`.
- Runtime errors use remediation-first human output and JSON error objects under `--json`.
- Machine output compatibility is additive: existing status and receipt fields remain unchanged.

No GUI, Phase 2+ feature, fifth ordinary command, immutable architecture edit, or frozen release-body edit was made.

## Source and tests changed

- `src/cli/index.ts`, `src/cli/format.ts`: strict parsing, per-command help, human formatting, JSON errors.
- `src/operations/runtime.ts`, `src/operations/restore-plan.ts`: restore preview, drift guard, status history, node history, additive sync/status details.
- `src/material/changes.ts`, `src/material/store.ts`, `src/material/types.ts`: change classification, node revision listing, additive status fields.
- `tools/check-protected-surfaces.ts`, `package.json`: repository-owned protected-surface validation added to `validate`.
- `tests/unit/cli-ux.test.ts`: ordinary CLI process tests for exit codes, help, status, sync preview, restore preview/refusal, and JSON errors.
- `tests/unit/restore-safety.test.ts`, `tests/unit/status-discovery.test.ts`, `tests/unit/machine-compat.test.ts`: runtime and compatibility regressions.
- `tests/unit/protected-surface-checker.test.ts`, `tests/contracts/package-verify.ts`: validation and package-help coverage.

## Finding dispositions

See `PHASE_01_FINDING_INVENTORY.md`.

All active Phase 1 findings F1-F12 and F14 are implemented and covered by focused tests or package verification. F13 remains historical and not reproduced on v1.0.1.

## Evidence

- Before transcripts: `PHASE_01_BASELINE_TRANSCRIPT.txt`, `PHASE_01_BASELINE_RESTORE_SAFETY_TRANSCRIPT.txt`.
- After transcripts: `PHASE_01_AFTER_TRANSCRIPT.txt`, `PHASE_01_AFTER_RESTORE_SAFETY_TRANSCRIPT.txt`.
- CLI UX contract note: `PHASE_01_CLI_UX_SPEC.md`.

The after transcripts show:

- uninitialized `status` exits `0` and recommends `expflow init`;
- `status` labels project id, current project version, pending paths, next action, and restore references;
- `sync --dry-run` is non-mutating and labels provisional identities;
- unsupported `status --dry-run` exits `2`;
- per-command `sync --help` exits `0` without executing;
- `restore --dry-run` previews conflicting drift without mutation;
- default `restore` refuses conflicting drift with exit `1`;
- `restore --force` overwrites explicitly and records a forward commit.

## Validation table

| Command                                                                                                                                            | Evaluated Git state                                                                | Exit code | Result                                                                                           |
| -------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | --------: | ------------------------------------------------------------------------------------------------ |
| `npx vitest run tests/unit/cli-ux.test.ts tests/unit/restore-safety.test.ts tests/unit/status-discovery.test.ts tests/unit/machine-compat.test.ts` | pre-checkpoint worktree                                                            |         0 | PASS - 22 tests                                                                                  |
| `npx vitest run tests/unit/protected-surface-checker.test.ts`                                                                                      | pre-checkpoint worktree                                                            |         0 | PASS - 7 tests                                                                                   |
| `npm run typecheck`                                                                                                                                | pre-checkpoint worktree                                                            |         0 | PASS                                                                                             |
| `npm run lint`                                                                                                                                     | pre-checkpoint worktree                                                            |         0 | PASS                                                                                             |
| `git diff --cached --check`                                                                                                                        | staged checkpoint                                                                  |         0 | PASS                                                                                             |
| `npm run check:config-references`                                                                                                                  | docs/evidence worktree after checkpoint `c6ad308700f66eab784fddebda1a823846f6855f` |         0 | PASS                                                                                             |
| `npm run check:skill-contracts`                                                                                                                    | docs/evidence worktree after checkpoint `c6ad308700f66eab784fddebda1a823846f6855f` |         0 | PASS                                                                                             |
| `npm run check:protected-surfaces`                                                                                                                 | docs/evidence worktree after checkpoint `c6ad308700f66eab784fddebda1a823846f6855f` |         0 | PASS                                                                                             |
| `npm run validate`                                                                                                                                 | docs/evidence worktree after checkpoint `c6ad308700f66eab784fddebda1a823846f6855f` |         0 | PASS - 17 test files, 143 tests, contracts, registries, schemas, fixtures, build, package verify |
| `npm pack --dry-run`                                                                                                                               | docs/evidence worktree after checkpoint `c6ad308700f66eab784fddebda1a823846f6855f` |         0 | PASS - `expflow-1.0.1.tgz`, 260 files                                                            |

## Scope audit

- Four-command boundary: preserved.
- Exit contracts: `status` uninitialized `0`, operational failures `1`, usage failures `2`.
- v1.0.1 compatibility: receipts keep exact v1 keys; status additions are additive.
- Protected surfaces: no edits to `docs/architecture/**` or `docs/releases/**`.
- Retired evidence locations: not used as active dependencies.
- Phase 2-9 launcher: untouched.

## Handoff state

At report completion, implementation checkpoint `c6ad308700f66eab784fddebda1a823846f6855f` is committed. Documentation and evidence closeout files are ready for final staging after the final validation rerun.

Next authorized action after accepting this report: select Phase 2 according to `docs/internal/BUILD_WEEK_WORKFLOW_CURRENT.md`. Phase 2-9 work remains unauthorized until that acceptance step occurs.
