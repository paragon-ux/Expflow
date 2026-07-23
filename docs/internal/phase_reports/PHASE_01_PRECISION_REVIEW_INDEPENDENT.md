# Expflow Build Week Precision Review

## Skill attestation

- Skill: `expflow-build-week-pr-review-precision`
- Skill version: `1.1.0`
- Review mode: `precision-first`
- Assigned phase: `Phase 1 - Ordinary UX/UI Corrections`
- Review type: `phase`
- Base: `99ad975a2b3e1f4b6c67020b219db7ff6d64acf7`
- Head: `011de6b1c69e0fe0fecbb68395d799c0b8976101`
- Diff: `99ad975a2b3e1f4b6c67020b219db7ff6d64acf7...011de6b1c69e0fe0fecbb68395d799c0b8976101`
- Authority read: `AGENTS.md`, orientation docs, `README_DEV.md`, `.config-reference-reconciliation.yaml`, active workflow, status matrix, glossary, Phase 1 prompt, Phase 1 completion/prior review reports, required local skills, relevant architecture/protocol excerpts, affected source/tests
- Reviewer mode: `read-only`

## Verdict

BLOCK

## Review target

- Phase: Phase 1 - Ordinary UX/UI Corrections
- Base: `99ad975a2b3e1f4b6c67020b219db7ff6d64acf7`
- Head: `011de6b1c69e0fe0fecbb68395d799c0b8976101`
- Merge base: `99ad975a2b3e1f4b6c67020b219db7ff6d64acf7`
- Scope: Phase 1 ordinary CLI UX, restore safety, machine compatibility, protected-surface evidence, and completion claims.

## Release or phase risk

One Phase 1 exit requirement is demonstrably unmet: CLI help does not document the required exit-code contract. The ordinary behavior and broader validation otherwise passed in this review, but the Phase 1 prompt makes help discoverability a required implementation surface, so the completion claim cannot be accepted as-is.

## Verified-finding ledger

| ID  | Reviewer priority | Verified defect                                 | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Suggested direction                                                                                                                                                    |
| --- | ----------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F16 | P1                | CLI help omits the required exit-code contract. | Contract: `docs/internal/phase_prompts/PHASE_01_UX_UI_FIXES.md` section 8.8 says help MUST document the exit-code contract. Trigger: `expflow --help`, `expflow status --help`, or `expflow restore --help` at `011de6b1`. Evidence: executed `node node_modules/tsx/dist/cli.mjs src/cli/index.ts --help`, `status --help`, and `restore --help`; all exited 0 and listed usage/options but no `status` uninitialized `0`, operational failure `1`, or usage failure `2` semantics. Source at `src/cli/index.ts:18` and `src/cli/index.ts:40` defines help text without exit-code content. Completion report claims per-command help but does not cover this required item. | Add concise exit-code documentation to top-level and/or command-specific help, and add a focused CLI/package verification assertion so the requirement cannot regress. |

## Scope and contract audit

- Phase scope: pass - changes stayed within Phase 1 CLI/material UX, tests, reports, and validation tooling.
- Compatibility: pass - focused machine compatibility tests passed; receipt keys and additive status fields are preserved.
- Protected surfaces: pass - commit-range protected-surface check over the review diff exited 0.
- Completion claims: unsupported - help/discoverability completion is incomplete because the Phase 1 help exit-code contract is absent.

## Verification

| Command or procedure                                                                                                                               | Evaluated state        | Exit | Result                                                                  |
| -------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ---: | ----------------------------------------------------------------------- |
| `node --version; npm --version; python --version; git --version`                                                                                   | worktree at `011de6b1` |    0 | Node `v22.19.0`, npm `11.12.1`, Python `3.11.9`, Git `2.53.0.windows.1` |
| `node node_modules/tsx/dist/cli.mjs src/cli/index.ts --help`                                                                                       | worktree at `011de6b1` |    0 | reproduced F16; no exit-code contract in help                           |
| `node node_modules/tsx/dist/cli.mjs src/cli/index.ts status --help`                                                                                | worktree at `011de6b1` |    0 | reproduced F16; no exit-code contract in command help                   |
| `node node_modules/tsx/dist/cli.mjs src/cli/index.ts restore --help`                                                                               | worktree at `011de6b1` |    0 | reproduced F16; no exit-code contract in command help                   |
| `npm run check:skill-contracts`                                                                                                                    | worktree at `011de6b1` |    0 | passed                                                                  |
| `npm run check:config-references`                                                                                                                  | worktree at `011de6b1` |    0 | passed                                                                  |
| `npm run check:protected-surfaces -- --base 99ad975a2b3e1f4b6c67020b219db7ff6d64acf7 --head 011de6b1c69e0fe0fecbb68395d799c0b8976101`              | commit range           |    0 | passed                                                                  |
| `npx vitest run tests/unit/cli-ux.test.ts tests/unit/restore-safety.test.ts tests/unit/status-discovery.test.ts tests/unit/machine-compat.test.ts` | worktree at `011de6b1` |    0 | passed, 22 tests                                                        |
| `git diff --check 99ad975a2b3e1f4b6c67020b219db7ff6d64acf7...011de6b1c69e0fe0fecbb68395d799c0b8976101`                                             | commit range           |    0 | passed                                                                  |
| `npm run validate`                                                                                                                                 | worktree at `011de6b1` |    0 | passed, including 17 test files / 143 tests, build, package verify      |
| `git status --short`                                                                                                                               | after verification     |    0 | clean                                                                   |

## Parent-orchestrator handoff

- Execution agent: parent orchestrator
- Findings requiring remediation: F16
- Review questions requiring remediation: none
