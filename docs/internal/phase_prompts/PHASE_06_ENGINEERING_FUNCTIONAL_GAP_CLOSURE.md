# Phase 6 Prompt - Engineering and Functional Gap Closure

**Repository workflow authority:** `docs/internal/BUILD_WEEK_WORKFLOW_CURRENT.md`
**Phase:** 6
**Gate:** BW-C - Pilot Proven
**Baseline:** repository state accepted at the preceding phase exit
**Status:** execute only after Phase 5 and BW-B are accepted, merged, and post-merge validated
**Primary execution agent:** Codex until superseded
**Primary skill:** `expflow-testing-security-migration`
**Secondary skills:** `expflow-material-storage-sync`, `expflow-contracts-protocol`, `expflow-authority-semantics-workflows`, `expflow-projections-reproduction`

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, and **SHOULD NOT** are definitive requirements.

## 1. Objective

Close only reproduced, evidence-backed defects and pilot blockers remaining after Phases 1-5.

Phase 6 is not a feature bucket. The phase output is working repository behavior, focused and full tests, durable evidence, updated status, and an accepted completion report. A document, schema, mock, screenshot, placeholder, or successful-looking response does not prove the phase outcome.

If the Phase 6 inventory finds no eligible unresolved reproduced defect, failed exit criterion, compatibility failure, security issue, performance failure, or severity-one pilot blocker, the authorized implementation is evidence-only: record the inventory, validation, residual limitations, and next action without changing product behavior.

## 2. Entry Requirements

Before editing, Codex SHALL:

1. confirm Phase 5 and BW-B acceptance and post-merge validation;
2. inspect branch, `HEAD`, staged, unstaged, and untracked state;
3. read repository `AGENTS.md`;
4. read `docs/internal/BUILD_WEEK_WORKFLOW_CURRENT.md`;
5. read `docs/internal/CURRENT_STATUS_MATRIX.md`;
6. read `docs/internal/GLOSSARY.md`;
7. read the inherited Phase 1 prompt for safety and compatibility decisions;
8. read the accepted Phase 5 completion report and BW-B gate review;
9. read this prompt and relevant repository-local skills;
10. inspect relevant source, tests, schemas, registries, and phase evidence;
11. record runtime and package versions required by the phase;
12. run baseline checks appropriate to the surfaces the phase will change.

A conflict between repository authorities is a hard stop. Do not resolve it by rewriting authority automatically.

## 3. Locked Decisions

- Every work item MUST cite a reproduced defect, failed exit criterion, compatibility failure, security issue, performance failure, or pilot blocker.
- Items are ranked by user harm, data integrity, security, compatibility, pilot blocking, and recoverability.
- Every fix receives focused regression evidence.
- Architecture changes require explicit escalation and cannot be hidden in a bug fix.
- A finding closes only when evidence proves the actual failure mode is resolved.
- The ordinary Expflow CLI remains `init`, `sync`, `status`, and `restore`.
- Protected architecture and frozen release bodies remain unchanged unless an explicit authorized migration supersedes this phase.

## 4. Required Phase Inventory

Create and maintain this table from entry through completion:

| ID    | Workstream or finding | Baseline evidence | Risk     | Owner | Status      | Implementation evidence | Test evidence |
| ----- | --------------------- | ----------------- | -------- | ----- | ----------- | ----------------------- | ------------- |
| P6-01 | Inventory             | Required          | Classify | Codex | not started | -                       | -             |
| P6-02 | Reproduction          | Required          | Classify | Codex | not started | -                       | -             |
| P6-03 | Triage                | Required          | Classify | Codex | not started | -                       | -             |
| P6-04 | Deduplication         | Required          | Classify | Codex | not started | -                       | -             |
| P6-05 | Root cause            | Required          | Classify | Codex | not started | -                       | -             |
| P6-06 | Fix design            | Required          | Classify | Codex | not started | -                       | -             |
| P6-07 | Implementation        | Required          | Classify | Codex | not started | -                       | -             |
| P6-08 | Regression            | Required          | Classify | Codex | not started | -                       | -             |
| P6-09 | Cross-surface audit   | Required          | Classify | Codex | not started | -                       | -             |
| P6-10 | Security audit        | Required          | Classify | Codex | not started | -                       | -             |
| P6-11 | Performance audit     | Required          | Classify | Codex | not started | -                       | -             |
| P6-12 | Compatibility audit   | Required          | Classify | Codex | not started | -                       | -             |
| P6-13 | Closure ledger        | Required          | Classify | Codex | not started | -                       | -             |

Allowed statuses are `not started`, `reproducing`, `ready`, `in progress`, `blocked`, `review`, `complete`, and `deferred by explicit authority`.

A workstream is complete only when its implementation and test evidence are both recorded. For an evidence-only Phase 6 candidate, implementation evidence is the completed inventory and completion report, and test evidence is the recorded validation proving no product behavior change was required.

## 5. Required Workstreams

### 5.1 Inventory

Aggregate unresolved findings from phase reports, gate reviews, tests, security reviews, performance evidence, package round trips, and status records.

### 5.2 Reproduction

Create or cite minimal deterministic reproduction for each eligible item. If no eligible item exists, record the evidence that no reproduction target remained.

### 5.3 Triage

Assign severity, likelihood, affected authority, compatibility risk, and pilot impact for every eligible item.

### 5.4 Deduplication

Merge duplicate findings while preserving independent evidence sources.

### 5.5 Root Cause

Identify the violated invariant and owning subsystem for every eligible item.

### 5.6 Fix Design

Choose the smallest compatible correction and explicit refusal behavior for every eligible item.

### 5.7 Implementation

Apply bounded changes without opportunistic feature work. Do not change code when no eligible work item requires code.

### 5.8 Regression

Add focused tests that fail before and pass after each fix. If no fix is authorized, cite existing regression coverage and full validation.

### 5.9 Cross-Surface Audit

Verify CLI, GUI, read models, intake, and package behavior remain coherent for the affected surfaces.

### 5.10 Security Audit

Rerun affected security and untrusted-input paths.

### 5.11 Performance Audit

Measure affected budgets and prevent severe regressions.

### 5.12 Compatibility Audit

Verify v1 records, machine outputs, packages, and extension surfaces.

### 5.13 Closure Ledger

Record evidence, residual risk, and pilot readiness for each item.

## 6. Permitted Scope

Phase work MAY include source, tests, contracts, examples, and documentation directly required by the workstreams above; backward-compatible additive machine contracts; focused internal refactoring required to establish a documented boundary; deterministic validators or fixtures required by an exit criterion; active status and completion-report updates backed by evidence; performance and security instrumentation required by the phase; and migration code only when the phase explicitly owns format evolution.

Every changed file MUST map to a required workstream or validation obligation.

## 7. Prohibited Scope

Phase work MUST NOT include uncited feature implementation, cosmetic refactoring unrelated to a finding, rewriting architecture to avoid a failing test, deleting or weakening tests, blanket timeout increases, maturity claims without evidence, Phase 7 pilot simulation, Guerilla work, new ordinary commands, broad dependency churn, replacement of `AGENTS.md` or the active workflow, replacement of the Phase 1 prompt, `Expflow-Test` or nested package dependencies, machine-absolute paths, direct `.git/hooks` edits or hook bypasses, later-phase placeholders represented as implementation, or protected-body edits for reference reconciliation.

## 8. State and Terminology Requirements

Proposed, accepted, rejected, superseded, partial, stale, conflicted, blocked, pending, unknown, and complete states MUST remain distinct where applicable.

Observation MUST NOT be represented as authority. Generated output MUST NOT be represented as accepted output. Materialization MUST NOT be represented as workflow completion. Completion MUST NOT be represented as verification. Verification MUST NOT be represented as reuse approval. Every authoritative effect MUST identify the native system that owns it.

## 9. Validation Order

1. `npm run check:skill-contracts`;
2. `npm run check:config-references`;
3. `npm run check:protected-surfaces`;
4. focused phase tests;
5. relevant formatting, lint, and type checks;
6. relevant schema, registry, fixture, and contract checks;
7. full repository validation;
8. `npm pack --dry-run`;
9. Python validation when affected;
10. `git diff --check`;
11. `git diff --cached --check`;
12. commit-range or CI-equivalent checks.

Record actual commands and exit codes. A test-runner timeout, crash, or nonzero process exit is a failed run even when assertions printed as passing before termination.

## 10. Exit Criteria

1. The user assigned this phase and prior completion evidence was reviewed.
2. Every required workstream has implementation and test evidence.
3. Every accepted finding or requirement has a final disposition.
4. No prohibited later-phase behavior was introduced.
5. No retired repository or package dependency was introduced.
6. No machine-absolute path was persisted.
7. Repository authority and this prompt were read directly.
8. Focused tests pass.
9. Full required validation passes.
10. Machine compatibility obligations pass.
11. Protected surfaces pass.
12. Package and relocation checks pass where applicable.
13. Current status is updated from evidence.
14. The completion report is complete.
15. Independent phase review returns PASS.
16. Independent review confirms the phase verdict.
17. The handoff identifies the next phase without modifying a phase-state machine.
18. Every implemented change maps to an eligible finding.
19. Every eligible pilot blocker is closed, explicitly deferred, or escalated with reason.
20. No new speculative feature entered the phase.
21. The pilot entry checklist has no unresolved severity-one blocker.

## 11. Completion Report

The report MUST contain verdict; phase and gate; baseline and final commits; branch and runtime versions; objective and delivered outcome; workstream disposition table; files changed grouped by source, tests, contracts, documentation, UI, packaging, and evidence; focused checks with evaluated Git state and exit codes; full validation table; before-and-after behavior or contract examples when behavior changes; compatibility audit; security and recovery audit; protected-surface audit; scope audit; known limitations; staged, unstaged, and untracked state; independent reviewer verdict; and exact next authorized action.

## 12. Handoff

The next phase is Phase 7. Begin it only after Phase 6 exits under the active workflow.
