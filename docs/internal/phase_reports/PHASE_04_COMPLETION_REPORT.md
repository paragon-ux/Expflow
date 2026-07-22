# Phase 4 Completion Report - Evidence Intake and Authority Reconciliation

**Status:** candidate validated; independent phase review pending
**Phase:** 4 - Evidence Intake and Authority Reconciliation
**Gate:** BW-B - Workflow Portability Surface Ready
**Verdict:** implementation complete; focused checks PASS; full validation PASS; review pending
**Integration base:** `060b07596e9d70e5742202df1a00b5be0456017e`
**Phase branch:** `feat/build-week-phase-04-evidence-intake-authority-reconciliation`
**Candidate head:** `cac05cb615cf13beb6ad57ff09a7e99286501c6c`
**Review report:** pending

## Runtime Versions

- Node: `v22.19.0`
- npm: `11.12.1`
- Python: `3.11.9`
- Git: `2.53.0.windows.1`

## Objective

Phase 4 adds a documented TypeScript evidence runtime that ingests attributed workflow evidence, preserves original evidence references and digests, normalizes safe content, quarantines unsafe archives, detects duplicates without inflating corroboration, proposes authority sources without accepting them, records correspondence proposals, preserves conflicts, records artifact candidates, supports explicit human decisions, and exposes intake state through Phase 3 read models.

The phase does not add a fifth ordinary CLI command, portable workflow package export/import, pilot evidence, empirical evaluation, Guerilla profiles, or causal event GUI behavior.

## Workstream Disposition

| ID    | Workstream               | Baseline evidence                                                    | Risk   | Owner | Status   | Implementation evidence                                                                                                                                                                                                                               | Test evidence                                                                                      |
| ----- | ------------------------ | -------------------------------------------------------------------- | ------ | ----- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| P4-01 | Intake envelope          | No attributed evidence intake envelope existed                       | High   | Codex | complete | `EvidenceIntakeRecord` captures source type, capture method, origin, timestamp, actor, tool, digest, media, encoding, disclosure policy, byte length, state, duplicate, normalization, quarantine, authority proposal, secret count, and audit fields | Normalization test verifies digest, attribution, state, and read exposure                          |
| P4-02 | Import boundary          | Existing security helpers did not provide a phase-owned intake entry | High   | Codex | complete | `createEvidenceRuntime().intake` validates files, transcripts, manifests, archives, and external references                                                                                                                                           | Unsupported archive/media refusal test                                                             |
| P4-03 | Quarantine               | Archive quarantine existed as security helper only                   | High   | Codex | complete | Archive intake uses bounded security quarantine and records unsafe archives as blocked/quarantined evidence, not authority                                                                                                                            | Unsafe path traversal archive test                                                                 |
| P4-04 | Normalization            | No attributed normalized evidence record existed                     | High   | Codex | complete | UTF-8/base64/binary/external content is digested; text and JSON normalize deterministically while preserving original digest                                                                                                                          | Text normalization, external reference, and partial JSON warning paths covered by runtime behavior |
| P4-05 | Source registration      | Authority runtime could create source revisions but not from intake  | High   | Codex | complete | Optional authority-source proposal creates a source revision with limitations and no registration decision                                                                                                                                            | Authority proposal test verifies proposed source and no acceptance                                 |
| P4-06 | Artifact extraction      | Artifact candidate extraction had no intake helper                   | Medium | Codex | complete | `recordArtifactCandidate` records semantic artifact-candidate assertions with material refs and limitations                                                                                                                                           | Reconciliation test verifies artifact candidate assertion                                          |
| P4-07 | Correspondence proposals | Source correspondence existed without intake helper                  | High   | Codex | complete | `proposeCorrespondence` records a source-correspondence assertion and source-correspondence record with relation/confidence                                                                                                                           | Reconciliation test verifies correspondence record                                                 |
| P4-08 | Duplicate handling       | Intake idempotency did not exist                                     | High   | Codex | complete | Digest+origin deterministic intake IDs make same evidence retries idempotent; same bytes from different origins are marked duplicate                                                                                                                  | Duplicate and concurrent retry test                                                                |
| P4-09 | Conflict handling        | Conflict runtime existed without intake helper                       | High   | Codex | complete | `declareConflict` records visible semantic conflicts without hiding competing claims                                                                                                                                                                  | Reconciliation test verifies conflict record                                                       |
| P4-10 | Human reconciliation     | Semantic decisions existed without intake action mapping             | High   | Codex | complete | `recordDecision` maps accept, reject, split, merge, defer, revoke, and supersede to immutable semantic decisions                                                                                                                                      | Reconciliation test verifies defer decision                                                        |
| P4-11 | Audit                    | No intake audit record existed                                       | Medium | Codex | complete | Intake records include action, rationale, and evidence refs; decisions include actor, rationale, evidence refs, and outcome                                                                                                                           | Intake and decision tests verify audit-bearing records                                             |
| P4-12 | Read integration         | Phase 3 read models lacked intake collection                         | Medium | Codex | complete | `evidence_intake` read-model collection exposes proposed, stale duplicate, and blocked quarantine states                                                                                                                                              | Read-model exposure tests                                                                          |

## Delivered Surfaces

- `createEvidenceRuntime` is exported from the package root.
- `src/evidence/runtime.ts` provides `intake`, `listIntake`, `proposeCorrespondence`, `declareConflict`, `recordDecision`, and `recordArtifactCandidate`.
- `src/evidence/types.ts` defines intake, correspondence, conflict, decision, artifact, and runtime input/output types.
- `src/evidence/store.ts` persists immutable intake records under `.expflow/records/evidence-intake`.
- `src/read-models/runtime.ts` and `src/read-models/types.ts` expose the `evidence_intake` collection.

## Files Changed

Source:

- `src/core/ids.ts`
- `src/evidence/runtime.ts`
- `src/evidence/store.ts`
- `src/evidence/types.ts`
- `src/evidence/README.md`
- `src/index.ts`
- `src/read-models/runtime.ts`
- `src/read-models/types.ts`
- `src/README.md`

Tests and package checks:

- `tests/unit/evidence-runtime.test.ts`
- `tests/contracts/package-verify.ts`
- `tests/README.md`

Documentation:

- `README.md`
- `README_DEV.md`
- `docs/internal/CURRENT_STATUS_MATRIX.md`
- `docs/internal/phase_reports/PHASE_04_COMPLETION_REPORT.md`

## Focused Validation

| Command                                                                             | Evaluated state  | Exit | Result                                                                            |
| ----------------------------------------------------------------------------------- | ---------------- | ---: | --------------------------------------------------------------------------------- |
| `npx vitest run tests/unit/evidence-runtime.test.ts`                                | Phase 4 worktree |    0 | PASS - 5 tests                                                                    |
| `npx vitest run tests/unit/evidence-runtime.test.ts tests/unit/read-models.test.ts` | Phase 4 worktree |    0 | PASS - 2 files / 11 tests                                                         |
| `npm run typecheck`                                                                 | Phase 4 worktree |    0 | PASS                                                                              |
| `npm run lint`                                                                      | Phase 4 worktree |    0 | PASS                                                                              |
| `npm run format:check`                                                              | Phase 4 worktree |    0 | PASS                                                                              |
| `npm run package:verify`                                                            | Phase 4 worktree |    0 | PASS - package installs outside checkout and exports `createEvidenceRuntime`      |
| `npm run check:skill-contracts`                                                     | Phase 4 worktree |    0 | PASS                                                                              |
| `npm run check:config-references`                                                   | Phase 4 worktree |    0 | PASS                                                                              |
| `npm run check:protected-surfaces`                                                  | Phase 4 worktree |    0 | PASS                                                                              |
| `npm pack --dry-run`                                                                | Phase 4 worktree |    0 | PASS - dry-run tarball `expflow-1.0.1.tgz`, 284 files including `dist/evidence/*` |

## Full Validation

| Command            | Evaluated state  | Exit | Result                                                                                                                                                                                                 |
| ------------------ | ---------------- | ---: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npm run validate` | Phase 4 worktree |    0 | PASS - config references, skill contracts, protected surfaces, format, lint, typecheck, 21 test files / 169 tests, contracts, registries, schemas, examples, fixtures, build, and package verification |

## Contract Examples

Evidence intake records include:

- `schema_version: "2.4"`;
- `intake_id`;
- `project_id`;
- `source_type`;
- `capture_method`;
- `origin`;
- `captured_at`;
- `actor`;
- `digest`;
- `media_type`;
- `encoding`;
- `disclosure_policy`;
- `state`;
- `duplicate_of`;
- `normalized`;
- `quarantine`;
- `authority_source_ref`;
- `secret_finding_count`;
- `audit`.

The read-model collection `evidence_intake` reports normalized evidence as `proposed`, duplicate evidence as `stale`, and quarantined evidence as `blocked`.

## Compatibility Audit

- Ordinary CLI command set remains `init`, `sync`, `status`, and `restore`.
- Package exports are additive: `createEvidenceRuntime` and evidence types are exported without removing existing exports.
- Existing persisted v1 records and machine outputs are unchanged.
- Phase 3 read models receive one additive collection.

## Security and Recovery Audit

- Imported evidence remains untrusted data and is not executed.
- External references are recorded without dereferencing.
- Archive intake uses bounded quarantine and unsafe archive entries become blocked/quarantined intake state.
- Secret-bearing content is counted and handled through the existing security runtime.
- Evidence presence creates proposals and audit records only; it does not accept authority.
- Duplicate intake is deterministic and idempotent for the same digest and origin.

## Protected-Surface Audit

No immutable architecture or frozen release body was edited.

## Scope Audit

- Phase 4 adds evidence intake and reconciliation runtime behavior only.
- No portable package export/import workflow was implemented.
- No pilot, empirical evaluation, Guerilla profile, or causal event GUI was introduced.
- No raw `.expflow` storage contract is exposed to clients.
- No machine-absolute paths are persisted by the evidence contract.

## Known Limitations

- Phase 4 records archive metadata and quarantine state; it does not extract archive contents.
- Evidence intake is exposed as a TypeScript library runtime and read model, not an ordinary CLI command.
- Correspondence confidence is caller-provided deterministic input; no model-assisted similarity scoring is introduced.

## Handoff State

Phase 4 implementation, focused validation, full validation, and package dry-run are complete pending independent phase review.
