# Phase 6 Precision Review

**Skill:** `expflow-build-week-pr-review-precision`
**Skill version:** `1.1.0`
**Review mode:** precision-first
**Review type:** phase
**Phase:** 6 - Evidence-Backed Gap Closure
**Base:** `bf3a94105d355105f37ae5a2201f55a771765142`
**Reviewed head:** `b65085e056d816b842c8c64c8f2be18de817b2f4`
**Diff:** `bf3a94105d355105f37ae5a2201f55a771765142...b65085e056d816b842c8c64c8f2be18de817b2f4`
**Reviewer:** independent Codex subagent
**Verdict:** BLOCK

## Review Target

- Scope: one new file, `docs/internal/phase_reports/PHASE_06_COMPLETION_REPORT.md`.
- Merge base: `bf3a94105d355105f37ae5a2201f55a771765142`.
- Branch: `fix/build-week-phase-06-gap-closure`.

## Summary

The reviewer found no verified open Phase 3, Phase 4, Phase 5, or BW-B product finding that Phase 6 failed to remediate.

The candidate was blocked because the phase evidence did not satisfy repository workflow controls: the active Phase 6 prompt was absent from the repository, and the completion report did not identify the exact reviewed candidate head.

## Verified Finding Ledger

| ID  | Priority | Finding                                                                                        | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                              | Required remediation                                                                                                                                                                                                             |
| --- | -------- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1  | P1       | Phase 6 entry and contract verification depended on a missing repository-owned Phase 6 prompt. | `AGENTS.md` requires the active phase prompt under `docs/internal/phase_prompts/`; `AGENTS.md` says an external launcher is not authority; `docs/internal/BUILD_WEEK_WORKFLOW_CURRENT.md` requires the phase prompt to be present and unambiguous. `git ls-tree -r HEAD docs/internal/phase_prompts` at `b65085e056d816b842c8c64c8f2be18de817b2f4` returned only the Phase 1 prompt, while the Phase 6 report cited only external launcher readiness. | Add or restore a repository-owned Phase 6 prompt, or record an explicit repository-authoritative decision that the workflow Phase 6 definition is the complete controlling prompt, then rerun applicable documentation controls. |
| F2  | P1       | The Phase 6 report did not identify the exact candidate head.                                  | `AGENTS.md` requires phase reports to identify exact base and head. `docs/internal/phase_reports/PHASE_06_COMPLETION_REPORT.md` at `b65085e056d816b842c8c64c8f2be18de817b2f4` said `Candidate head: pending commit`, but the reviewed head was `b65085e056d816b842c8c64c8f2be18de817b2f4`.                                                                                                                                                            | Update the report to record the exact reviewed candidate head and distinguish later administrative closeout or report commits from the reviewed head.                                                                            |

## Verification

| Command or procedure                              | Evaluated state                            | Exit | Result                                                                                        |
| ------------------------------------------------- | ------------------------------------------ | ---: | --------------------------------------------------------------------------------------------- |
| `git status --short --branch`                     | `b65085e056d816b842c8c64c8f2be18de817b2f4` |    0 | Clean branch `fix/build-week-phase-06-gap-closure`.                                           |
| `git diff --name-status bf3a941...b65085e`        | reviewed range                             |    0 | Only `docs/internal/phase_reports/PHASE_06_COMPLETION_REPORT.md` added.                       |
| `git diff --check bf3a941...b65085e`              | reviewed range                             |    0 | PASS.                                                                                         |
| `git ls-tree -r HEAD docs/internal/phase_prompts` | `b65085e056d816b842c8c64c8f2be18de817b2f4` |    0 | Only Phase 1 prompt present; no Phase 6 prompt.                                               |
| Prior report inspection                           | Phase 3/4/5 reports and BW-B review        |    0 | Phase 3 F1 closed; Phase 4 no findings; Phase 5 F1/F2 closed; BW-B no verified gate findings. |

## Handoff

The parent orchestrator must resolve F1 and F2, run applicable documentation/config/protected checks, and request bounded closure review. Product code remains unauthorized unless the repository-owned Phase 6 prompt newly identifies an eligible reproduced gap.
