# Phase 3 Completion Report - Stable Read Models

**Status:** candidate validated; independent phase review pending
**Phase:** 3 - Stable Read Models
**Gate:** BW-B - Workflow Portability Surface Ready
**Verdict:** implementation complete; full validation PASS; review pending
**Integration base:** `2f9cc656f1554139a6cd64ed13456cb821408951`
**Phase branch:** `feat/build-week-phase-03-stable-read-models`
**Candidate head:** `680a1586d29633bd03fdadb6be6b3728969f2113`
**Review report:** pending

## Runtime versions

- Node: `v22.19.0`
- npm: `11.12.1`
- Python: `3.11.9`
- Git: `2.53.0.windows.1`

## Objective

Phase 3 exposes stable, bounded, versioned application read models over already implemented authority, semantic, workflow, projection, reproduction, and material linkage records. The phase does not add authority semantics, mutation commands, portable package behavior, pilot evidence, or Guerilla integration.

## Workstream disposition

| ID    | Workstream          | Baseline evidence                                                                                          | Risk   | Owner | Status   | Implementation evidence                                                                                                                               | Test evidence                                                                                 |
| ----- | ------------------- | ---------------------------------------------------------------------------------------------------------- | ------ | ----- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| P3-01 | Read-model envelope | Advanced runtimes exposed family-specific lists without envelope                                           | High   | Codex | complete | `src/read-models/types.ts`, `src/read-models/runtime.ts` define version, project, material head, generated-at, completeness, warning, and page fields | `tests/unit/read-models.test.ts` deterministic envelope test                                  |
| P3-02 | Authority view      | Authority runtime listed current accepted sources and documents                                            | High   | Codex | complete | `authority_sources`, `authority_documents`, and `authority_decisions` expose proposed, accepted, rejected, revoked, superseded, and deferred states   | Authority state-separation test                                                               |
| P3-03 | Semantic view       | Semantic runtime listed assertions, decisions, conflicts, reviews, correspondence, and clusters separately | High   | Codex | complete | Semantic collections preserve assertions, decisions, conflicts, review requests, source correspondence, and artifact clusters                         | Conflict and assertion pagination tests                                                       |
| P3-04 | Workflow view       | Workflow runtime listed occurrences, virtual artifacts, and materialization events                         | High   | Codex | complete | Workflow collections preserve material, completion, verification, reuse, virtual availability, and materialization states                             | Workflow state-separation test                                                                |
| P3-05 | Projection view     | Projection runtime listed manifest revisions and accepted-only heads                                       | High   | Codex | complete | Manifest revision and head collections expose generated, proposed, accepted, rejected, stale, superseded, and conflicted states                       | Projection state test                                                                         |
| P3-06 | Reproduction view   | Reproduction runtime listed regeneration, equivalence, and reuse records                                   | High   | Codex | complete | Reproduction collections preserve unknown regeneration, equivalence classification, and reuse completion states                                       | Reproduction unknown and reuse-complete tests                                                 |
| P3-07 | Material linkage    | Advanced records stored material refs but lacked a common read view                                        | Medium | Codex | complete | Read-model items expose tree, node, node-revision, path, and operation references; material tree and receipt collections are included                 | Material linkage assertion in read-model tests                                                |
| P3-08 | Ordering            | Family stores sorted differently by local created/id fields                                                | High   | Codex | complete | Every collection page is sorted by `created_at` then `record_ref` with explicit order metadata                                                        | Deterministic reread and pagination tests                                                     |
| P3-09 | Filtering           | No common application filter boundary existed                                                              | Medium | Codex | complete | `state` filter uses canonical read-model states and returns bounded pages                                                                             | Workflow `state: complete` test                                                               |
| P3-10 | Pagination          | Existing list calls were unbounded                                                                         | High   | Codex | complete | Limit is bounded to 1-100; stable base64url cursors carry collection and sort key; invalid cursors and limits are refused                             | Cursor, next-page, invalid-cursor, and invalid-limit tests                                    |
| P3-11 | Change inspection   | Existing state change evidence lived in family records and receipts                                        | Medium | Codex | complete | Material operation receipts and cursor-based collection reads expose committed change inspection without a new mutation or raw-store client contract  | Material operation receipt export and GUI bridge read-model tests                             |
| P3-12 | Performance         | No representative read-model budget existed                                                                | Medium | Codex | complete | Read models cap pages at 100 records and avoid creating record-family directories during reads                                                        | 120-record semantic assertion fixture returns first 100 records under a 2,000 ms local budget |

## Delivered surfaces

- `createReadModelRuntime` is exported from the package root.
- `src/read-models/runtime.ts` provides `overview` and `list` operations.
- `src/read-models/types.ts` defines the read-model envelope, collection, item, material-reference, pagination, and input types.
- `createGuiBridge().listReadModelRecords` and `/api/read-models/list` expose the read-model service to the local Expflow GUI without browser raw-store access.

## Files changed

Source:

- `src/read-models/runtime.ts`
- `src/read-models/types.ts`
- `src/read-models/README.md`
- `src/gui/bridge.ts`
- `src/index.ts`
- `src/README.md`

GUI:

- `apps/gui/server.mjs`
- `apps/gui/README.md`

Tests and package checks:

- `tests/unit/read-models.test.ts`
- `tests/unit/gui-bridge.test.ts`
- `tests/unit/gui-shell.test.ts`
- `tests/contracts/package-verify.ts`
- `tests/README.md`

Documentation:

- `README.md`
- `README_DEV.md`
- `docs/internal/phase_reports/PHASE_03_COMPLETION_REPORT.md`

## Focused validation

| Command                                                                                                    | Evaluated state  | Exit | Result                                                                               |
| ---------------------------------------------------------------------------------------------------------- | ---------------- | ---: | ------------------------------------------------------------------------------------ |
| `npx vitest run tests/unit/read-models.test.ts`                                                            | Phase 3 worktree |    0 | PASS - 6 tests, including 120-record performance fixture under 2,000 ms local budget |
| `npx vitest run tests/unit/read-models.test.ts tests/unit/gui-bridge.test.ts tests/unit/gui-shell.test.ts` | Phase 3 worktree |    0 | PASS - 3 files / 15 tests                                                            |
| `npm run typecheck`                                                                                        | Phase 3 worktree |    0 | PASS                                                                                 |
| `npm run lint`                                                                                             | Phase 3 worktree |    0 | PASS                                                                                 |
| `npm run format:check`                                                                                     | Phase 3 worktree |    0 | PASS                                                                                 |
| `npm run package:verify`                                                                                   | Phase 3 worktree |    0 | PASS - package installs outside checkout and exports `createReadModelRuntime`        |

## Full validation

| Command            | Evaluated state  | Exit | Result                                                                                                                                                                                                 |
| ------------------ | ---------------- | ---: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npm run validate` | Phase 3 worktree |    0 | PASS - config references, skill contracts, protected surfaces, format, lint, typecheck, 20 test files / 161 tests, contracts, registries, schemas, examples, fixtures, build, and package verification |

## Contract examples

Read-model page responses include:

- `read_model_version: "1.0.0"`;
- `model: "expflow.advanced-records"`;
- `project_id`;
- `material_head_tree_revision_id`;
- deterministic `generated_at` derived from the current material head;
- `completeness`;
- `warnings`;
- `page.limit`, `page.next_cursor`, `page.total_count`, and `page.order`;
- item-level `collection`, `record_ref`, `state`, `created_at`, `material_refs`, and `record`.

## Compatibility audit

- Ordinary CLI command set remains `init`, `sync`, `status`, `restore`.
- Existing machine output and persisted records are unchanged.
- Package exports are additive: `createReadModelRuntime` and read-model types are exported without removing existing exports.
- The local GUI bridge gains an additive read-model method and server endpoint.
- No schema migration or persisted record version change is introduced.

## Security and recovery audit

- Read models are read-only and do not create, update, or delete Expflow records.
- The read service does not execute imported or generated code.
- The GUI server route remains in the fixed endpoint table and does not construct shell commands.
- Invalid cursors and out-of-range limits fail with actionable `ExpflowError` codes.
- Unknown, partial, stale, conflicted, proposed, accepted, rejected, and completed states remain distinct where applicable.

## Protected-surface audit

No immutable architecture or frozen release body was edited.

## Scope audit

- Phase 3 adds documented stable read services only.
- No evidence intake workflow, portable workflow package, pilot, empirical evaluation, Guerilla profile, or causal event GUI was introduced.
- No raw `.expflow` storage contract is exposed to clients.
- No machine-absolute paths are persisted by the read-model contract.

## Known limitations

- Read-model `generated_at` is deterministic for a committed material head, not a wall-clock query timestamp.
- Change inspection is exposed through bounded collection cursors and material operation receipts; no changed-since API is added in Phase 3.
- Performance evidence is a local representative unit fixture, not a hosted benchmark.

## Handoff state

Phase 3 implementation and full validation are complete pending independent phase review.
