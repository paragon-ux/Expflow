# Phase 7 Completion Report - Pilot and Empirical Evaluation

**Status:** candidate complete; focused checks PASS; full validation pending; review pending
**Phase:** 7 - Pilot and Empirical Evaluation
**Gate:** BW-C - Pilot Proven
**Verdict:** one real repository-owned workflow completed; one pilot-found portability/evidence defect fixed; claims limited to observed evidence
**Integration base:** `bbdb28375d42c1317ddd1b3e3c6b4ca113e3d0c5`
**Phase branch:** `feat/build-week-phase-07-pilot-evaluation`
**Candidate head:** pending commit
**Review report:** pending

## Runtime Versions

- Node: `v22.19.0`
- npm: `11.12.1`
- Python: `3.11.9`
- Git: `2.53.0.windows.1`

## Objective

Phase 7 uses Expflow in a real project and produces empirical evidence about utility, usability, safety, recovery, portability, and adoption friction.

The selected real project was a repository-owned Phase 7 documentation evidence workflow. It avoided private data and external participant material while still exercising actual project work: creating, revising, previewing, committing, refusing unsafe restore, and validating relocated initialized state.

## Workstream Disposition

| ID    | Workstream or finding | Baseline evidence                                           | Risk              | Owner | Status   | Implementation evidence                                                    | Test evidence                                                     |
| ----- | --------------------- | ----------------------------------------------------------- | ----------------- | ----- | -------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| P7-01 | Pilot charter         | No pilot evidence before Phase 7                            | Evidence validity | Codex | complete | `project/pilot-charter.md`                                                 | Report and manifest trace charter to command evidence             |
| P7-02 | Baseline              | Git/report practice without Expflow local material workflow | Claim integrity   | Codex | complete | `project/task-packet.md`                                                   | Uninitialized status and initial clean status recorded            |
| P7-03 | Environment           | Phase branch at `bbdb28375d42c1317ddd1b3e3c6b4ca113e3d0c5`  | Reproducibility   | Codex | complete | Runtime versions in this report                                            | Baseline controls passed                                          |
| P7-04 | Tasks                 | Required ordinary CLI and safety workflow                   | Usability         | Codex | complete | `COMMAND_TRANSCRIPT.md`                                                    | 17 pilot workflow command outcomes recorded                       |
| P7-05 | Instrumentation       | No telemetry before phase                                   | Privacy           | Codex | complete | Transcript records commands, exits, timings, and summaries without secrets | Redaction policy and manifest                                     |
| P7-06 | Observation           | No raw pilot observations before phase                      | Evidence quality  | Codex | complete | `project/raw-observations.md`                                              | Measures derive from preserved observations                       |
| P7-07 | Safety                | Restore refusal needed real drift evidence                  | Data loss         | Codex | complete | Restore conflict refusal recorded as exit 1                                | CLI safety regression suite passed                                |
| P7-08 | Portability           | Initial pilot found machine-absolute `root_path`            | Portability       | Codex | complete | `src/operations/runtime.ts` stores `root_path` as `.`                      | Material runtime regression and post-fix relocation status passed |
| P7-09 | Measures              | No empirical measures before phase                          | Claim integrity   | Codex | complete | `MEASURES.md`                                                              | Metrics trace to command transcript                               |
| P7-10 | Qualitative analysis  | No qualitative pilot notes before phase                     | Overclaiming      | Codex | complete | `PILOT_REPORT.md` qualitative observations                                 | Unsupported claims are explicitly excluded                        |
| P7-11 | Issue ledger          | No pilot issue ledger before phase                          | Follow-up quality | Codex | complete | `ISSUE_LEDGER.md` records P7-F1                                            | Focused regression closes P7-F1                                   |
| P7-12 | Change control        | Product change discovered during pilot                      | Compatibility     | Codex | complete | Runtime fix is separated from baseline observations                        | Focused tests and post-fix scan passed                            |
| P7-13 | Claim review          | Status matrix still said no pilot evidence                  | Product claims    | Codex | complete | Completion report limits claims to one repository-owned workflow           | Full validation pending                                           |
| P7-14 | Pilot report          | No Phase 7 pilot report before phase                        | Gate evidence     | Codex | complete | `PILOT_REPORT.md` and this report                                          | Independent review pending                                        |

## Files Changed

Source:

- `src/operations/runtime.ts`

Tests:

- `tests/unit/material-runtime.test.ts`

Examples:

- `examples/project.example.json`

Documentation and evidence:

- `docs/internal/pilot_evidence/phase_07/EVIDENCE_MANIFEST.md`
- `docs/internal/pilot_evidence/phase_07/COMMAND_TRANSCRIPT.md`
- `docs/internal/pilot_evidence/phase_07/ISSUE_LEDGER.md`
- `docs/internal/pilot_evidence/phase_07/MEASURES.md`
- `docs/internal/pilot_evidence/phase_07/PILOT_REPORT.md`
- `docs/internal/pilot_evidence/phase_07/project/README.md`
- `docs/internal/pilot_evidence/phase_07/project/pilot-charter.md`
- `docs/internal/pilot_evidence/phase_07/project/raw-observations.md`
- `docs/internal/pilot_evidence/phase_07/project/redaction-policy.md`
- `docs/internal/pilot_evidence/phase_07/project/task-packet.md`
- `docs/internal/pilot_evidence/phase_07/post_fix_project/README.md`
- `docs/internal/pilot_evidence/phase_07/post_fix_project/check-note.md`
- `docs/internal/phase_reports/PHASE_07_COMPLETION_REPORT.md`

No schemas, GUI files, package exports, or ordinary command names were changed.

## Focused Validation

| Command                                                                                                                                                                  | Evaluated state      | Exit | Result                                |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------- | ---: | ------------------------------------- |
| `npm run check:skill-contracts`                                                                                                                                          | Phase 7 entry branch |    0 | PASS                                  |
| `npm run check:config-references`                                                                                                                                        | Phase 7 entry branch |    0 | PASS                                  |
| `npm run check:protected-surfaces`                                                                                                                                       | Phase 7 entry branch |    0 | PASS                                  |
| `npm run build`                                                                                                                                                          | After root-path fix  |    0 | PASS                                  |
| `npx vitest run tests/unit/material-runtime.test.ts tests/unit/cli-ux.test.ts`                                                                                           | After root-path fix  |    0 | PASS - 2 files / 26 tests             |
| `npx vitest run tests/unit/material-runtime.test.ts tests/unit/cli-ux.test.ts tests/unit/portable-package-runtime.test.ts tests/unit/security-migration-runtime.test.ts` | Phase 7 worktree     |    0 | PASS - 4 files / 36 tests             |
| `npm pack --dry-run`                                                                                                                                                     | Phase 7 worktree     |    0 | PASS - `expflow-1.0.1.tgz`, 292 files |

## Full Validation

| Command            | Evaluated state             | Exit | Result                                                                                                |
| ------------------ | --------------------------- | ---: | ----------------------------------------------------------------------------------------------------- |
| `npm run validate` | Phase 7 worktree, attempt 1 |    1 | FAIL - contract verification reported `project.example.json` byte mismatch after example edit         |
| `npm run validate` | Phase 7 worktree, attempt 2 |    1 | FAIL - formatting check reported this completion report needed Prettier after validation-table update |
| `npm run validate` | Phase 7 worktree, attempt 3 |    0 | PASS - 22 test files / 176 tests; contract, schema, build, and package checks passed                  |

## Before and After Behavior

Before the fix, a newly initialized project metadata file persisted `root_path` as a machine-absolute local path.

After the fix, newly initialized project metadata stores `root_path` as `.`, the focused regression passes, the post-fix metadata scan reports `contains_absolute=False`, and a copied initialized workspace reports clean status from a relocated temporary directory.

## Compatibility Audit

- Ordinary CLI remains `init`, `sync`, `status`, and `restore`.
- `root_path` remains present in project records and still satisfies the existing schema.
- No package export changed.
- No machine-readable receipt or status field was removed.
- Existing persisted projects with prior `root_path` values are not rewritten by this phase.

## Security and Recovery Audit

- The pilot used repository-owned documents only.
- No secrets, credentials, personal data, hidden-thought traces, or external private material were recorded.
- Default restore refusal preserved unrecorded drift and committed no new project version.
- No generated code execution, network service, archive extraction, or hook dispatch was introduced.

## Protected-Surface Audit

No immutable architecture or frozen release body was edited.

## Scope Audit

- Phase 7 did not add Phase 8 integration.
- Phase 7 did not add new ordinary commands.
- Phase 7 did not claim broad adoption, GUI usability, external participant success, or production support.
- The only product code change closes a pilot-discovered evidence/portability defect.

## Known Limitations

- The pilot used one repository-owned workflow and one operator.
- The pilot did not include external human participants.
- GUI usability remains unproven.
- Portable workflow package usability with richer advanced records remains a follow-up.

## Handoff State

Phase 7 candidate evidence is complete pending full validation, independent phase review, BW-C gate review, merge, and post-merge validation. If those pass, Phase 8 is the next authorized phase.
