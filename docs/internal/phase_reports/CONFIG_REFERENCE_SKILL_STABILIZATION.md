# Config Reference Skill Stabilization

## Final Verdict

GO

The repository-local config-reference skill and the global manager now use a repository-owned role contract instead of repeated concrete document paths in required-reading blocks. Repository validation is independent of user-home paths and external harnesses.

## Baseline

- Branch: `main`
- Baseline commit: `ba7292e9616a055ed5e25da8734c2b49a9f66ec9`
- Package version: Expflow `1.0.1`
- Scope: governance, skills, checks, tests, CI wiring, and reports only
- Runtime or Phase 1 implementation changes: none

## Inference Previously Required

| Previous issue                                                                      | Stabilization                                                                                             |
| ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Domain skills repeated bare or concrete document paths.                             | Required-reading dependencies now use `## Required Reading Roles`.                                        |
| Current Build Week authority and historical v1 workflow evidence could be confused. | Role classes separate `active-authority` from `immutable-architecture` and `frozen-evidence`.             |
| Moved root-level v1 documents could be guessed or recreated.                        | The checker rejects known moved active-root document paths in skill and workflow surfaces.                |
| Unmarked operational paths could drift outside deterministic checks.                | Role mappings are marked concrete references and reconciled through indexes or the protected sidecar.     |
| Workflow release-note path could drift silently.                                    | `.github/workflows/release.yml` now uses a marked `RELEASE_NOTES_FILE` value.                             |
| Skill validation depended on a machine-specific validator path.                     | The validator path is used only at run time and recorded as evidence, not persisted in repository policy. |

## Repository Contract Added Or Updated

- Contract: `.config-reference-reconciliation.yaml`
- Bootstrap: conventional root contract filename
- Commands declared: `npm run check:config-references`, `npm run check:skill-contracts`, `npm run validate`
- Surfaces declared: agent governance, repository skills, workflows, package scripts

## Stable Path Anchors

Declared roles: 18.

Role classes:

- `active-authority`
- `active-evidence`
- `immutable-architecture`
- `frozen-evidence`

Directory roles:

- `phase_reports`
- `release_archive`

All role targets resolved in the staged Git snapshot.

## Skills Updated

Repository skills migrated to role-based required reading: 6.

- `.agents/skills/config-reference-reconciliation/SKILL.md`
- `.agents/skills/expflow-authority-semantics-workflows/SKILL.md`
- `.agents/skills/expflow-contracts-protocol/SKILL.md`
- `.agents/skills/expflow-material-storage-sync/SKILL.md`
- `.agents/skills/expflow-projections-reproduction/SKILL.md`
- `.agents/skills/expflow-testing-security-migration/SKILL.md`

The global manager skill was updated outside the repository to discover semantic roles from the repository contract and to avoid hardcoded Expflow or user-home paths.

## Workflow Inputs Updated

- `.github/workflows/release.yml` now declares `RELEASE_NOTES_FILE` once and marks it with `config-docref`.
- `.github/workflows/phase-1-contract.yml` now runs `npm run check:skill-contracts` in commit-range mode.

## Operational References Marked

Added marked references in staged check: 22.

The marked set includes the role contract mappings and the release workflow notes-file input.

## Reverse Indexes Updated

- Mutable target indexes checked: 13.
- Protected sidecar sections checked: 9.
- Protected bodies modified for reconciliation: none.
- Newly installed protected release-note target: allowed with protected-sidecar evidence.

## Skill Path Checker

Added:

```text
npm run check:skill-contracts
```

The checker validates the complete Git-index snapshot for the repository-declared surfaces. It rejects missing roles, unknown role consumers, bare required-reading paths, moved legacy root-document paths, invalid skill frontmatter, unresolved role targets, unsafe role paths, and workflow document-input drift.

Commit-range mode is supported:

```text
npm run check:skill-contracts -- --base <base-sha> --head <head-sha>
```

## Focused Tests

- `tests/unit/config-reference-checker.test.ts`: 13 tests passed.
- `tests/unit/skill-contract-checker.test.ts`: 5 tests passed.
- Document-move role test: passed.
- Missing-role test: passed.
- Bare required-reading path test: passed.
- Protected target installation test: passed.
- Fenced managed-index example test: passed.

## Limit And Outcome Test Reruns

- Repository-owned focused tests: PASS.
- Optional external harness at `C:\Users\USER\Desktop\Frameworks\Expflow-Skill-Test`: attempted twice and timed out after 180 seconds and 360 seconds.
- The optional harness is not a repository dependency and no harness path was persisted to repository or global-skill policy.

## Repository Validation

| Check                                                                                                  | Result                                                              |
| ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| `npm run check:config-references`                                                                      | PASS; 25 governed source files, 22 added references, 0 unreconciled |
| `npm run check:skill-contracts`                                                                        | PASS; 18 roles, 6 repository skills, 2 workflows                    |
| Temporary commit-range config-reference check                                                          | PASS                                                                |
| Temporary commit-range skill-contract check                                                            | PASS                                                                |
| Relocated worktree skill-contract check                                                                | PASS                                                                |
| Relocated worktree config-reference check                                                              | PASS                                                                |
| Repository skill validator                                                                             | PASS for 6 repository skills                                        |
| Global manager validator                                                                               | PASS at installed path and temporary skill root                     |
| `npx vitest run tests/unit/config-reference-checker.test.ts tests/unit/skill-contract-checker.test.ts` | PASS; 18 tests                                                      |
| `npm run validate`                                                                                     | PASS; 111 Vitest tests and repository checks                        |
| `npm pack --dry-run`                                                                                   | PASS; `expflow-1.0.1.tgz`                                           |
| `git diff --cached --check`                                                                            | PASS                                                                |
| `git diff --check`                                                                                     | PASS with pre-existing `.prettierignore` line-ending warning        |

## Remaining Unmarked References

Optional supporting references in repository skills remain explicit repository-relative paths. They are not required-reading dependencies and are not treated as operational drift gates.

## Remaining Inference

None for repository skill required-reading paths, active versus historical authority, workflow release-note input, or repository validation commands.

The optional external harness remains a non-blocking evidence surface because it timed out and is not part of repository validation.

## Unchanged Boundaries

- No Expflow runtime source was changed.
- No Phase 1 implementation was started.
- No architecture or frozen release body was edited for reconciliation.
- No hook manager was installed.
- No direct `.git/hooks/` edits were made.
- No machine-absolute path was persisted in repository policy, package scripts, or the global skill.
