# Expflow Build Week Workflow

**Version:** 3.0  
**Status:** active authoritative execution workflow  
**Baseline:** Expflow `v1.0.1` (historical Build Week starting point)  
**Completed:** Phases 1–7 released in `v1.1.0` at `a1eaaad4c226eb3722f13804ece561b8cf275378`  
**Status:** paused after BW-C; Phases 8–9 are not currently authorized  
**Review model:** one comprehensive phase review, bounded closure, one gate review at gate exit  
**Execution model:** repository-local parent orchestrator with one independent read-only reviewer  
**Integration direction:** profile-driven Guerilla causal events without native-state ownership

The words **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, and **SHOULD NOT** are normative.

---

## 1. Authority and purpose

This document owns:

- gate and phase order;
- authorization;
- branch and merge progression;
- phase and gate acceptance;
- review cadence;
- validation cadence;
- evidence requirements;
- status advancement;
- recovery and handoff.

`AGENTS.md` supplies routing and cross-cutting invariants.

Phase prompts supply detailed implementation contracts.

The precision-review skill supplies reviewer procedure.

No external launcher, chat prompt, branch name, agent memory, or completion claim overrides this workflow.

---

## 2. Efficiency principles

Build Week uses four control layers:

1. **workstream checks** — narrow, frequent, implementation-owned;
2. **phase candidate validation** — broad, once per candidate;
3. **phase precision review** — comprehensive, once per phase;
4. **gate review** — aggregate, once at the gate boundary.

Do not collapse these layers.

Do not repeat a broader layer when a narrower layer is sufficient.

The Phase 1 execution history established these process corrections:

- a reviewer loop must not become an unlimited rediscovery loop;
- a remediation re-review must not reopen unrelated phase surfaces;
- evidence-only corrections must not trigger production-level review and validation by default;
- repository-local skills must be installed and contract-checked before a phase begins;
- expensive validation must be tied to changed risk, not narration milestones;
- the orchestrator’s own inspection is not a substitute for independent review;
- independent review should not duplicate a prior self-review artifact;
- a transient test-runner failure may be rerun once but must remain recorded;
- exact full commit hashes must be used in durable reports;
- no phase work begins while the prior phase acceptance is unresolved.

---

## 3. Repository and branch model

Keep `main` protected.

Use one rolling integration branch:

```text
feat/build-week-integration
```

An existing non-protected branch may serve as the integration branch when repository history already establishes it and rewriting would add risk.

Create one branch per phase from the current integration tip:

```text
feat/build-week-phase-02-gui-foundation
feat/build-week-phase-03-stable-read-models
feat/build-week-phase-04-evidence-authority
feat/build-week-phase-05-portable-package
fix/build-week-phase-06-gap-closure
feat/build-week-phase-07-pilot-evaluation
feat/build-week-phase-08-guerilla-contracts
feat/build-week-phase-09-causal-event-gui
```

Do not stack a new phase on an unmerged phase branch.

Each phase record must include:

- integration base;
- phase branch;
- candidate review head;
- accepted head;
- merge commit;
- post-merge validation result.

---

## 4. Current-state resolution

At the start of any pass:

1. inspect Git state;
2. read repository orientation and relevant ADRs;
3. read `AGENTS.md`;
4. read this workflow;
5. read current status and active phase;
6. read only the active phase prompt and relevant normative sources;
7. read the review skill before invoking a reviewer;
8. inspect relevant source, tests, and accepted evidence.

Determine current phase from repository evidence.

Phase 1 must be accepted, merged, and post-merge validated before Phase 2 begins.

If Phase 1 is still in review or administrative closeout, finish that bounded work first.

---

## 5. Locked invariants

The following apply to all phases:

- native systems retain native authority;
- the ordinary CLI remains `init`, `sync`, `status`, `restore`;
- restore remains byte-exact, append-only, recoverable, previewable, and consent-safe;
- provisional identity remains explicit;
- machine and persisted compatibility remain deliberate;
- Expflow GUI is rooted at `apps/gui/`;
- GUI and integrations use documented surfaces, not raw storage;
- uncertainty and partial states remain visible;
- evidence does not become authority without an explicit decision;
- Guerilla observes and reconciles but does not repair Expflow state;
- protected architecture and frozen release bodies remain protected;
- no phase claims proof that its evidence does not support.

---

## 6. Gate map

| Gate                                      | Phases | Primary question                                                                                       | Review depth                                        |
| ----------------------------------------- | -----: | ------------------------------------------------------------------------------------------------------ | --------------------------------------------------- |
| BW-A — UX Control Surface Ready           |    1–2 | Can users safely understand and operate existing material capability through CLI and GUI?              | Detailed user-safety integration review             |
| BW-B — Workflow Portability Surface Ready |    3–5 | Are advanced records exposed, reconciled, and portable without losing authority or provenance?         | Detailed contract and round-trip integration review |
| BW-C — Pilot Proven                       |    6–7 | Are remaining changes evidence-backed, and do real workflows support the claims?                       | Evidence and empirical-claim review                 |
| BW-D — Causal Integration Ready           |    8–9 | Can causal events be observed and presented without replacing native authority or inventing causation? | Cross-system causal-integrity review                |

A gate review is not a second phase review. It examines aggregate behavior and claims that cannot be established by one phase in isolation.

---

# Part I — Standard phase lifecycle

## 7. Phase entry

A phase may enter only when:

- the preceding phase is accepted and merged;
- post-merge validation passed;
- the integration branch is clean;
- the phase branch is created from the recorded integration tip;
- required governance and skills pass repository controls;
- the phase prompt is present and unambiguous.

At entry, record:

- phase number and title;
- integration base;
- runtime and package versions;
- relevant inherited limitations;
- exit criteria;
- gate criteria when applicable;
- protected and compatibility boundaries.

### Baseline validation

Run full baseline validation when:

- this is the first phase after an environment or dependency change;
- the integration tip lacks accepted current validation;
- toolchain versions materially changed;
- inherited state is suspect.

Otherwise, cite the accepted post-merge validation from the immediate prior phase and run only phase-relevant smoke checks.

This prevents eight redundant full baseline runs over an unchanged integration state.

---

## 8. Phase implementation

Divide the phase into bounded workstreams.

For each workstream:

1. identify the controlling requirement;
2. inspect the current behavior;
3. reproduce the gap when applicable;
4. implement the smallest coherent change;
5. add focused tests;
6. run focused checks;
7. inspect the diff;
8. checkpoint coherent work.

Do not create reviewer reports during implementation.

The parent orchestrator may keep an implementation finding log, but it must not masquerade as independent review or force duplicate reviewer coverage.

Subagents:

- may handle an isolated workstream;
- must receive explicit scope and ownership;
- must not spawn further agents;
- must not act as the phase reviewer;
- must return a diff and verification evidence to the parent.

---

## 9. Phase candidate

Before independent review:

- complete implementation;
- complete focused tests;
- complete required docs and examples;
- complete the candidate phase report;
- run config-reference, skill-contract, and protected-surface checks as applicable;
- run full phase validation once;
- run package verification when package surface changes;
- commit a stable candidate head;
- ensure the worktree is clean.

The candidate report may state `review pending`.

Do not repeatedly update and recommit review status while the reviewer is running.

Prepare a compact review packet:

- phase and title;
- exact base, head, merge base, and diff;
- controlling prompt;
- relevant normative contracts;
- changed-file summary;
- candidate report;
- focused and full validation results;
- known limitations;
- pre-existing failures.

Do not send full implementation transcripts or chain-of-thought logs.

---

## 10. Comprehensive phase review

Each phase receives exactly one comprehensive review using the repository precision-review skill.

The comprehensive review:

- examines all changed lines;
- follows affected behavior into direct callers and consumers;
- checks phase exit criteria;
- checks compatibility and protected surfaces;
- attempts to falsify suspicions;
- reports only verified defects;
- creates the frozen phase finding ledger.

The result is:

- `PASS`;
- `CAUTION`;
- `BLOCK`.

`CAUTION` and `BLOCK` keep the phase open.

An empty ledger is valid.

The reviewer remains read-only.

The parent orchestrator must reject a review that lacks skill attestation, exact target, ledger, scope audit, and verification basis.

---

## 11. Frozen finding ledger

After comprehensive review, the finding ledger is frozen.

The parent orchestrator must disposition every `F` ID as:

- fixed;
- not reproducible;
- duplicate;
- intentional behavior;
- out of scope.

A non-fixed disposition requires stronger repository evidence than the finding.

Confirmed in-scope findings must be fixed regardless of provisional severity.

The frozen ledger prevents remediation review from becoming a fresh exploratory review.

---

## 12. Remediation

For each confirmed finding:

1. reproduce it;
2. make the smallest root-cause fix;
3. add focused regression coverage;
4. run focused checks;
5. update finding dispositions;
6. commit coherent remediation.

### Full validation after remediation

Rerun full validation when remediation changed:

- production code;
- schemas, registries, or compatibility contracts;
- package exports or package contents;
- build or test infrastructure;
- protected-surface enforcement.

Use targeted checks when remediation changed only:

- report commit references;
- review-status wording;
- Markdown table structure;
- formatting;
- a non-normative evidence index.

Evidence-only changes that alter a material completion claim require targeted claim verification, not a new general code review.

---

## 13. Focused closure review

Closure review is limited to:

- original frozen finding IDs;
- remediation diff;
- regression tests;
- relevant validation evidence;
- direct regressions introduced by remediation.

The closure reviewer must not restart the comprehensive phase review.

A new finding may be added only when:

1. remediation directly introduced it; or
2. verification of an original finding deterministically exposed the same root cause on another supported path.

The reviewer must state the relationship.

Unrelated observations are routed to:

- the current gate review when gate-relevant;
- Phase 6 gap closure when evidence-backed;
- a non-blocking issue ledger;
- a future authorized phase.

They do not keep the current phase open.

### Administrative closeout

After closure `PASS`, the parent may correct non-material report metadata without another reviewer loop.

Administrative closeout includes:

- replacing abbreviated hashes with full hashes;
- recording the accepted reviewer verdict;
- removing stale `pending` wording;
- aligning tables and paths;
- formatting.

The parent runs deterministic documentation and reference checks and records the correction in the final report.

A new independent review is required only when the closeout changes behavioral scope, finding disposition, compatibility status, gate claim, or acceptance rationale.

---

## 14. Phase acceptance

A non-gate-closing phase is accepted when:

- implementation exit criteria pass;
- full candidate validation passed;
- the comprehensive review completed;
- the frozen ledger is closed;
- focused closure review returned `PASS` when findings existed;
- administrative closeout is complete;
- the phase branch is clean;
- the final accepted code head is recorded.

The accepted code head may precede a documentation-only administrative closeout commit. Both must be recorded.

---

## 15. Phase merge

After acceptance:

1. verify the integration branch remains at the expected base;
2. merge the phase branch with an explicit merge commit;
3. do not squash unless repository policy requires it;
4. run post-merge validation once;
5. record merge commit and result;
6. update active status;
7. authorize the next phase.

Suggested message:

```text
merge(phase-N): complete <phase title>
```

Do not merge directly into `main`.

### Post-merge failure

A post-merge failure keeps the phase open.

Create a bounded repair branch from the merge commit, fix the integration defect, run focused and full checks as appropriate, obtain focused closure review, merge the repair, and rerun post-merge validation.

---

# Part II — Gate lifecycle

## 16. Gate review timing

A gate review occurs only after the closing phase has completed its phase review and frozen ledger closure:

- Phase 2 closes BW-A;
- Phase 5 closes BW-B;
- Phase 7 closes BW-C;
- Phase 9 closes BW-D.

The gate review evaluates the proposed aggregate gate state before the closing phase is merged, or a deterministic merge preview when available.

Only one comprehensive gate review is required.

Gate remediation receives bounded closure review under the same frozen-ledger rules.

---

## 17. Gate review scope

A gate reviewer reads:

- gate criteria from this workflow;
- accepted member-phase reports;
- phase reviewer verdicts;
- relevant integration tests and demonstrations;
- known limitations;
- the proposed aggregate state.

A gate reviewer does not automatically reread every changed line from every member phase.

Line-level inspection is triggered only by:

- contradictory phase claims;
- cross-phase integration failure;
- compatibility mismatch;
- security or authority-boundary concern;
- insufficient phase-review evidence;
- a reproduced gate-level defect.

Gate findings use `G1`, `G2`, and so on, separate from phase finding IDs.

Gate findings must satisfy the same precision threshold as phase findings.

---

## 18. Gate-specific review depth

### BW-A — UX Control Surface Ready

Review end-to-end ordinary material workflows across CLI and GUI:

- initialization and project selection;
- clean, drifted, invalid, loading, empty, and error states;
- sync preview and execution agreement;
- revision discovery;
- restore preview, consent, execution, and recovery;
- CLI/GUI compatibility;
- canonical terminology in technical details;
- accessibility of critical operations;
- absence of raw-store coupling.

Do not re-review Phase 1 source line by line unless GUI integration exposes a contradiction.

### BW-B — Workflow Portability Surface Ready

Review cross-phase contract integrity:

- stable read-model versioning and determinism;
- evidence provenance and uncertainty;
- authority acceptance boundaries;
- correspondence and conflict state;
- package manifest and addressing;
- export/import round trip;
- relocation;
- collision behavior;
- archive security;
- atomicity or recovery;
- no raw-store application dependency.

Use representative end-to-end fixtures and clean-environment package tests.

### BW-C — Pilot Proven

Review evidence quality, not code volume:

- Phase 6 changes cite reproduced evidence;
- pilot participants, environment, timing, and workflows are attributable;
- successes, friction, failures, recovery, decisions, and unknowns are preserved;
- metrics derive from evidence;
- negative results remain visible;
- fixtures are not presented as external pilots;
- claims are reduced or qualified where evidence is weak;
- privacy and consent are handled.

Do not block because a pilot result is unfavorable. Block only for invalid evidence, unsupported claims, or unresolved product defects that invalidate the pilot outcome.

### BW-D — Causal Integration Ready

Review cross-system causal integrity:

- profile version and native compatibility;
- complete command classification;
- before/after observation semantics;
- typed pending, unknown, failed, conflicted, and completed outcomes;
- native authority references;
- idempotency or deduplication;
- causal-edge evidence;
- secret and credential boundaries;
- GUI use of stable event contracts;
- no raw-store coupling;
- no correlation presented as causation;
- no Guerilla repair of Expflow state.

---

## 19. Gate acceptance and merge

A gate closes when:

- all member phases are accepted;
- the gate review returns `PASS`;
- all gate findings are closed through focused closure;
- the closing phase head is unchanged in material behavior;
- the proposed merged state passes required integration validation;
- the gate report states limitations honestly.

After gate `PASS`, merge the closing phase and run post-merge validation.

Update current status to the next gate.

---

# Part III — Phase definitions

## 20. Phase 1 — Ordinary UX/UI Corrections

**State:** inherited completion candidate or accepted state, according to current repository evidence.

Required behavior includes:

- actionable human status;
- path-level sync preview;
- revision discovery;
- restore preview;
- drift refusal and explicit override;
- explicit provisional identity;
- labeled identifiers;
- remediation-first errors;
- per-command help including exit semantics;
- backward-compatible machine output.

Before Phase 2, Phase 1 must have an accepted precision-review record and merge state.

---

## 21. Phase 2 — Expflow GUI Foundation

**Objective:** establish a local GUI over documented material operations and read models.

Required outcomes:

- application shell under `apps/gui/`;
- project selection and initialization state;
- material state and drift;
- tree and node history;
- sync plan and execution;
- restore plan and execution;
- receipt and recovery inspection;
- accessible loading, empty, error, and recovery states;
- technical detail panels;
- no raw `.expflow` coupling;
- preserved CLI and machine compatibility.

Phase review is detailed on the changed GUI and operation surfaces.

BW-A gate review is end-to-end across Phase 1 CLI and Phase 2 GUI.

---

## 22. Phase 3 — Stable Read Models

**Objective:** expose deterministic versioned application read models.

Required outcomes:

- stable schemas and versions;
- deterministic ordering and filtering;
- pagination where required;
- explicit lifecycle, uncertainty, and conflict states;
- examples and representative fixtures;
- performance evidence;
- no mutation through projection;
- no raw-store application dependency.

Phase review focuses on API contracts, determinism, compatibility, and consumers.

No separate gate review occurs after Phase 3.

---

## 23. Phase 4 — Evidence Intake and Authority Reconciliation

**Objective:** ingest partial attributed evidence without inventing certainty or authority.

Required outcomes:

- original evidence preservation;
- provenance, attribution, and capture method;
- normalization with source identity;
- uncertainty and confidence;
- authority registration and scope decisions;
- correspondence proposals;
- duplicate, conflict, unresolved, and low-confidence states;
- accept, reject, split, merge, and defer operations;
- security handling for untrusted evidence and secrets.

Phase review focuses on provenance, authority boundaries, decision auditability, and security.

No separate gate review occurs after Phase 4.

---

## 24. Phase 5 — Portable Workflow Package

**Objective:** export, validate, relocate, import, and recover portable workflow state.

Required outcomes:

- deterministic versioned manifest;
- repository-relative and semantic addressing;
- included and external dependency distinction;
- unresolved dependency and readiness state;
- identity and provenance preservation;
- collision policy;
- archive safety and resource limits;
- integrity verification;
- atomic import or deterministic recovery;
- clean-environment relocation;
- round-trip equivalence evidence.

Phase review focuses on package implementation and security.

BW-B gate review covers Phases 3–5 as an integrated portability surface.

---

## 25. Phase 6 — Evidence-Backed Gap Closure

**Objective:** correct only demonstrated product, compatibility, performance, or pilot-blocking gaps.

Every change must cite:

- a reproduced defect;
- a failed prior exit criterion;
- a pilot blocker;
- a compatibility failure;
- a demonstrated performance failure.

No speculative feature work.

Phase review focuses on evidence traceability and root-cause correction.

No separate gate review occurs after Phase 6.

---

## 26. Phase 7 — Pilot and Empirical Evaluation

**Objective:** execute real attributable workflows and evaluate outcomes.

Required outcomes:

- real human or agent work;
- participants, environment, timestamps, and duration;
- attributable inputs and outputs;
- successes, friction, failures, recovery, and decisions;
- evidence-derived metrics;
- preserved negative results;
- privacy and consent;
- reproducibility and limitations;
- claim updates.

Phase review is evidence-centric and may contain little or no code review.

BW-C gate review assesses whether Phase 6 changes and Phase 7 evidence support product claims.

---

## 27. Phase 8 — Guerilla Profile and Event Contracts

**Objective:** define and implement profile-driven observation and typed event reconciliation.

Required outcomes:

- data-driven profile;
- native version compatibility;
- complete command classification;
- before and after observation;
- native references;
- typed invocation and outcome states;
- causal-evidence requirements;
- idempotency or deduplication;
- secret and credential boundaries;
- conformance tests.

Guerilla remains an observer and event authority, not Expflow state authority.

Phase review focuses on contracts, classification completeness, outcome semantics, and security.

No separate gate review occurs after Phase 8.

---

## 28. Phase 9 — Guerilla Causal Event View GUI

**Objective:** present evidence-backed causal event history over stable Phase 8 contracts.

Required outcomes:

- event and causal-link views;
- distinct invocation, observation, result, reconciliation, and evidence;
- explicit pending, unknown, conflicted, failed, and completed states;
- resolvable native authority links;
- deterministic filtering, ordering, and selection;
- accessible loading, empty, and error states;
- no raw-store coupling;
- no unsupported causal certainty.

Phase review focuses on the GUI and Phase 8 contract consumption.

BW-D gate review covers cross-system causal integrity across Phases 8–9.

---

# Part IV — Cost, context, and handoff

## 29. Context discipline

Use one parent context and one reviewer subagent for the active phase.

Do not:

- send full conversation transcripts to reviewers;
- repeatedly load unchanged governance;
- run external-chatbot reviews;
- spawn reviewer-of-reviewer agents;
- perform a second comprehensive phase review after remediation;
- polish accepted evidence indefinitely.

At approximately 80% of available context:

1. stop beginning new workstreams;
2. finish the current atomic change when safe;
3. run focused checks;
4. commit coherent work;
5. record exact Git state;
6. write a deterministic continuation handoff.

---

## 30. Validation matrix

| Event                                   |        Focused checks |                  Full validation |                        Package dry run |         Independent review |
| --------------------------------------- | --------------------: | -------------------------------: | -------------------------------------: | -------------------------: |
| phase entry with accepted prior merge   |            smoke only |                      conditional |                                     no |                         no |
| workstream checkpoint                   |                   yes |                               no |                                     no |                         no |
| phase candidate                         |                   yes |                              yes | when package changes or phase requires | comprehensive phase review |
| code/contract remediation               |                   yes |                              yes |                          when affected |            focused closure |
| evidence-only administrative correction | docs/reference checks |                    no by default |     only when package contents changed |              no by default |
| gate candidate                          |    integration checks | yes when aggregate state changed |                          when relevant |  comprehensive gate review |
| gate remediation                        |                   yes |                       risk-based |                          when relevant |            focused closure |
| phase merge                             |   smoke plus controls |                              yes |                          when relevant |                         no |
| post-merge repair                       |                   yes |                              yes |                          when relevant |            focused closure |

---

## 31. Handoff record

Every stop or phase transition records:

- current gate and phase;
- activity type;
- integration base;
- phase branch and head;
- candidate and accepted heads;
- frozen finding IDs and dispositions;
- gate finding IDs when applicable;
- changed files;
- exact Git status;
- last passing checks;
- known transient failures;
- reviewer verdict;
- blocker or next authorized action.

---

## 32. Program completion

Build Week completes when:

- Phases 1–9 are accepted;
- each phase received one comprehensive precision review;
- every frozen phase ledger is closed;
- BW-A through BW-D gate reviews pass;
- every phase is merged into the integration branch;
- every post-merge validation passes;
- the final branch is clean;
- package and compatibility verification pass;
- reports identify exact commits;
- product and empirical claims match evidence.

Merging the integration branch to `main` requires separate user authorization.

<!-- config-reference-index:start -->

- `.config-reference-reconciliation.yaml` - active workflow role
- `AGENTS.md` - source-of-truth order
- `docs/internal/phase_prompts/PHASE_01_UX_UI_FIXES.md` - active phase 1 authority

<!-- config-reference-index:end -->
