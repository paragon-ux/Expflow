# Phase 7 Prompt - Pilot and Empirical Evaluation

**Repository workflow authority:** `docs/internal/BUILD_WEEK_WORKFLOW_CURRENT.md`
**Phase:** 7
**Gate:** BW-C - Pilot Proven
**Baseline:** repository state accepted at the preceding phase exit
**Status:** execute only after Phase 6 is accepted, merged, and post-merge validated
**Primary execution agent:** Codex until superseded
**Primary skill:** `expflow-testing-security-migration`
**Secondary skills:** `expflow-material-storage-sync`, `expflow-authority-semantics-workflows`, `expflow-projections-reproduction`

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, and **SHOULD NOT** are definitive requirements.

## 1. Objective

Use Expflow in at least one real attributable workflow and produce empirical evidence about utility, usability, safety, recovery, portability, and adoption friction.

The phase output is working repository behavior, focused and full tests, durable evidence, updated status, and an accepted completion report. A document, schema, mock, screenshot, placeholder, or successful-looking response does not prove the phase outcome.

## 2. Entry Requirements

Before editing, Codex SHALL:

1. confirm Phase 6 acceptance, merge, and post-merge validation;
2. run the external launcher with the Expflow repository path and `--phase 7`;
3. inspect branch, `HEAD`, staged, unstaged, and untracked state;
4. read repository `AGENTS.md`;
5. read `docs/internal/BUILD_WEEK_WORKFLOW_CURRENT.md`;
6. read `docs/internal/CURRENT_STATUS_MATRIX.md`;
7. read `docs/internal/GLOSSARY.md`;
8. read the inherited Phase 1 prompt for safety and compatibility decisions;
9. read the accepted Phase 6 completion report and closure review;
10. read this prompt and relevant repository-local skills;
11. inspect relevant source, tests, schemas, registries, and evidence;
12. record runtime and package versions required by the phase;
13. run baseline checks appropriate to the surfaces the phase will change.

A conflict between repository authorities is a hard stop. Do not resolve it by rewriting authority automatically.

## 3. Locked Decisions

- The pilot uses real project work, not a synthetic fixture alone.
- Failures, abandonments, workarounds, and unknown outcomes remain first-class evidence.
- Participants, source material, and telemetry require explicit consent and disclosure policy.
- Metrics and success criteria are defined before interpreting results.
- Product changes during the pilot are recorded and separated from baseline observations.
- Product claims are updated only from observed evidence.
- The ordinary Expflow CLI remains `init`, `sync`, `status`, and `restore`.
- Protected architecture and frozen release bodies remain unchanged unless an explicit authorized migration supersedes this phase.

## 4. Required Phase Inventory

Create and maintain this table from entry through completion:

| ID    | Workstream or finding | Baseline evidence | Risk     | Owner | Status      | Implementation evidence | Test evidence |
| ----- | --------------------- | ----------------- | -------- | ----- | ----------- | ----------------------- | ------------- |
| P7-01 | Pilot charter         | Required          | Classify | Codex | not started | -                       | -             |
| P7-02 | Baseline              | Required          | Classify | Codex | not started | -                       | -             |
| P7-03 | Environment           | Required          | Classify | Codex | not started | -                       | -             |
| P7-04 | Tasks                 | Required          | Classify | Codex | not started | -                       | -             |
| P7-05 | Instrumentation       | Required          | Classify | Codex | not started | -                       | -             |
| P7-06 | Observation           | Required          | Classify | Codex | not started | -                       | -             |
| P7-07 | Safety                | Required          | Classify | Codex | not started | -                       | -             |
| P7-08 | Portability           | Required          | Classify | Codex | not started | -                       | -             |
| P7-09 | Measures              | Required          | Classify | Codex | not started | -                       | -             |
| P7-10 | Qualitative analysis  | Required          | Classify | Codex | not started | -                       | -             |
| P7-11 | Issue ledger          | Required          | Classify | Codex | not started | -                       | -             |
| P7-12 | Change control        | Required          | Classify | Codex | not started | -                       | -             |
| P7-13 | Claim review          | Required          | Classify | Codex | not started | -                       | -             |
| P7-14 | Pilot report          | Required          | Classify | Codex | not started | -                       | -             |

Allowed statuses are `not started`, `reproducing`, `ready`, `in progress`, `blocked`, `review`, `complete`, and `deferred by explicit authority`.

A workstream is complete only when its implementation and test evidence are both recorded.

## 5. Required Workstreams

### 5.1 Pilot Charter

Define project, participant roles, workflow, duration, scope, risks, consent, data handling, and stop rules before interpreting results.

### 5.2 Baseline

Record existing workflow time, tools, errors, recovery method, and portability practice.

### 5.3 Environment

Record operating system, runtime versions, repository state, package versions, and network assumptions.

### 5.4 Tasks

Define representative `init`, `status`, `sync`, `restore`, GUI, advanced-read, intake, and package tasks as applicable.

### 5.5 Instrumentation

Capture timestamps, commands, outcomes, errors, retries, decisions, and evidence without exposing secrets.

### 5.6 Observation

Record user intent, expectations, confusion, workarounds, and abandonment.

### 5.7 Safety

Record overwritten-work prevention, refusal behavior, recovery, and unknown outcomes.

### 5.8 Portability

Execute a real package handoff or relocation when in pilot scope.

### 5.9 Measures

Calculate task completion, time, error rate, recovery time, help use, decision burden, and confidence from preserved observations.

### 5.10 Qualitative Analysis

Code observations by category without converting opinion into fact.

### 5.11 Issue Ledger

Create reproducible findings with severity and evidence.

### 5.12 Change Control

Separate pilot-blocking emergency fixes from post-pilot recommendations.

### 5.13 Claim Review

Update status and external claims only with earned evidence and explicit limits.

### 5.14 Pilot Report

Produce a complete reproducible report and evidence manifest.

## 6. Permitted Scope

Phase work MAY include source, tests, contracts, examples, and documentation directly required by the workstreams above; backward-compatible additive machine contracts; focused internal refactoring required to establish a documented boundary; deterministic validators or fixtures required by an exit criterion; active status and completion-report updates backed by evidence; performance and security instrumentation required by the phase; and migration code only when the phase explicitly owns format evolution.

Every changed file MUST map to a required workstream or validation obligation.

## 7. Prohibited Scope

Phase work MUST NOT include internal fixtures as the only pilot, fabricated participants, retrospective metric invention, hidden failed tasks, silent telemetry, secret or personal-data disclosure, editing results to support desired claims, calling one successful demo production proof, unrecorded product changes, Phase 8 integration, replacement of `AGENTS.md` or the active workflow, replacement of the Phase 1 prompt, `Expflow-Test` or nested package dependencies, machine-absolute paths, direct `.git/hooks` edits or hook bypasses, test deletion or weakening to obtain a pass, later-phase placeholders represented as implementation, or protected-body edits for reference reconciliation.

## 8. Evidence Requirements

- Preserve baseline and final Git commit identifiers.
- Record exact commands, working directory, evaluated Git state, exit code, stdout, and stderr.
- Hash durable evidence artifacts.
- Separate repository validation, global-skill validation, and optional external-harness results.
- Preserve failed and partial runs when they explain a decision.
- Record before-and-after user-visible behavior where the phase changes a surface.
- Record machine-contract examples where the phase changes structured output.
- Record compatibility evidence for existing callers and persisted state.
- Record protected-surface staged and commit-range evidence.
- Record limitations and untested environments honestly.
- Do not grade raw hidden-thought traces or planning documents as product evidence.
- Do not count duplicate evidence as independent corroboration.

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
18. At least one representative real workflow is completed or honestly abandoned with evidence.
19. Every reported metric is reproducible from preserved observations.
20. Product claims distinguish internal verification from pilot evidence.
21. Pilot failures generate actionable reproducible findings.

## 11. Completion Report

The report MUST contain verdict; phase and gate; baseline and final commits; branch and runtime versions; objective and delivered outcome; workstream disposition table; files changed grouped by source, tests, contracts, documentation, UI, packaging, and evidence; focused checks with evaluated Git state and exit codes; full validation table; before-and-after behavior or contract examples; compatibility audit; security and recovery audit; protected-surface audit; scope audit; known limitations; staged, unstaged, and untracked state; independent reviewer verdict; and exact next authorized action.

## 12. Handoff

The next phase is Phase 8. Begin it only after Phase 7 exits under the active workflow.
