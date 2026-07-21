# Expflow Build Week Precision Review

## Skill attestation

- Skill: `expflow-build-week-pr-review-precision`
- Skill version: `1.1.0`
- Review mode: `precision-first`
- Assigned phase: Phase 1 - Ordinary UX/UI Corrections
- Review type: `phase`
- Base: `99ad975a2b3e1f4b6c67020b219db7ff6d64acf7`
- Head: `5a84ef43fd2614303c030ce757d74bd22ea029b3`
- Diff: `99ad975a2b3e1f4b6c67020b219db7ff6d64acf7...5a84ef43fd2614303c030ce757d74bd22ea029b3`
- Authority read: `AGENTS.md`, `docs/internal/orientation/README.md`, `docs/internal/orientation/SYSTEM_1_IMPROVEMENTS.md`, `docs/internal/orientation/SYSTEM_2_IMPROVEMENTS.md`, `docs/internal/BUILD_WEEK_WORKFLOW_CURRENT.md`, `docs/internal/CURRENT_STATUS_MATRIX.md`, `docs/internal/phase_prompts/PHASE_01_UX_UI_FIXES.md`, `docs/internal/phase_reports/PHASE_01_COMPLETION_REPORT.md`, `.agents/skills/expflow-build-week-pr-review-precision/SKILL.md`
- Reviewer mode: `read-only`

## Verdict

BLOCK

## Review target

- Phase: Phase 1 - Ordinary UX/UI Corrections
- Base: `99ad975a2b3e1f4b6c67020b219db7ff6d64acf7`
- Head: `5a84ef43fd2614303c030ce757d74bd22ea029b3`
- Merge base: `99ad975a2b3e1f4b6c67020b219db7ff6d64acf7`
- Scope: Phase 1 ordinary CLI UX and restore-safety completion candidate.

## Release or phase risk

The Phase 1 restore-safety claim was not fully supported at `5a84ef4`: node restore could recreate an unrecorded target-path deletion without explicit override. This violates the Phase 1 default refusal requirement for conflicting working-tree drift.

## Verified-finding ledger

| ID  | Reviewer priority | Verified defect                                                                                                             | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Suggested direction                                                                                                                                                            |
| --- | ----------------- | --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| F15 | P1                | Node restore treats an unrecorded target-path deletion as non-conflicting and commits/recreates the file without `--force`. | Trigger: initialize `a.txt`, sync revision 2, delete tracked `a.txt`, restore `node:<id>@1:a.txt`. Executed reproduction against `5a84ef43fd2614303c030ce757d74bd22ea029b3` returned `requires_force: false`, `conflicting_paths: []`, then `restoreOutcome.status: committed` and recreated `a.txt`. Contract: Phase 1 prompt sections 8.4, 8.5, 9, and 12 require conflicting-drift disclosure, refusal by default, and explicit override. Guard analysis: `tests/unit/restore-safety.test.ts` explicitly expected default recreation after deletion, so existing tests did not prevent the consequence. | In node restore planning, classify target-path deletion as conflicting when restore would write or recreate that path; require explicit overwrite and add regression coverage. |

## Scope and contract audit

- Phase scope: pass - the reviewed change remained within Phase 1 ordinary CLI/material UX surfaces.
- Compatibility: fail - default node restore could mutate unrecorded drift without explicit consent.
- Protected surfaces: pass - `npm run check:protected-surfaces` exited 0 at the reviewed state.
- Completion claims: unsupported - the report claimed conflicting drift could not be overwritten silently, but F15 contradicted that claim.

## Verification

| Command or procedure                                | Evaluated state                                     | Exit | Result         |
| --------------------------------------------------- | --------------------------------------------------- | ---: | -------------- |
| `npm run check:skill-contracts`                     | worktree at `5a84ef4` plus untracked reviewer skill |    0 | passed         |
| `npm run check:config-references`                   | worktree at `5a84ef4` plus untracked reviewer skill |    0 | passed         |
| `npm run check:protected-surfaces`                  | worktree at `5a84ef4` plus untracked reviewer skill |    0 | passed         |
| Inline `npx tsx` node-restore deletion reproduction | `5a84ef43fd2614303c030ce757d74bd22ea029b3`          |    0 | reproduced F15 |

## Parent-orchestrator handoff

- Execution agent: parent orchestrator
- Findings requiring remediation: F15
- Review questions requiring remediation: none

```text
Work in this repository as the parent orchestration and execution agent.

Goal:
Independently reproduce, triage, and resolve every verified finding from the precision review ledger.

Assigned phase:
Phase 1 - Ordinary UX/UI Corrections

Branch:
Create or use a non-protected remediation branch. Preserve unrelated work.

Rules:
- Read repository AGENTS.md, the active Build Week workflow, the assigned phase prompt, relevant architecture, and local skills before editing.
- Triage every verified finding ID: F15.
- Reproduce each finding before changing code.
- Classify each ID as fixed, not-reproducible, duplicate, intentional-behavior, or out-of-scope.
- Provide stronger code-, test-, contract-, or execution-based evidence for every non-fixed classification.
- Fix every confirmed in-scope defect, regardless of provisional priority.
- Do not dismiss a merge-blocking defect merely because it crosses a convenient file or workstream boundary.
- Preserve behavior not implicated by a finding.
- Add or update focused regression tests for each fixed behavior when feasible.
- Do not overwrite unrelated user changes.
- Run repository-defined focused and full verification.
- Do not advance into a later Build Week phase to hide incomplete assigned-phase work.
- Prepare a PR-ready report and request independent re-review.

Verified findings:
- F15 - Node restore treats an unrecorded target-path deletion as non-conflicting and commits/recreates the file without `--force`; require target-path deletion to be conflicting drift unless explicit overwrite is supplied.

Completion report:
- final classification and evidence for every finding ID;
- files changed and behavioral impact;
- focused and full verification commands with results;
- remaining limitations;
- pull-request title and body or exact creation steps;
- re-review request.
```
