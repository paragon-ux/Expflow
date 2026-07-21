# Expflow Build Week Workflow

**Version:** 2.0  
**Status:** active authoritative execution workflow  
**Baseline:** Expflow `v1.0.1`  
**Current gate:** BW-A  
**Current phase:** Phase 1 — Ordinary UX/UI Corrections  
**Primary execution agent:** Kimi until superseded  
**Historical predecessor:** completed Expflow v1 Gates A–D  
**Integration direction:** profile-driven Guerilla causal events; not a state-owning adapter

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, and **SHOULD NOT** are definitive requirements.

---

## 1. Authority and purpose

This document is the active Build Week execution authority.

It owns:

- the current baseline;
- gate and phase order;
- locked Build Week invariants;
- phase authorization;
- required deliverables;
- evidence standards;
- phase and gate entry and exit rules;
- reporting;
- state advancement;
- recovery and handoff.

`AGENTS.md` routes agents to this document and preserves cross-cutting repository invariants. It does not replace this workflow.

The historical Expflow v1 Gates A–D remain completed build evidence. They are not continued or renumbered by this workflow.

---

## 2. Repository-only operating model

The Build Week control surface is installed directly in the active Expflow repository.

The workflow MUST NOT depend on:

- `Expflow-Test/`;
- `Expflow-Test-*`;
- a nested Build Week package;
- a package archive;
- a user-home skill path;
- an external harness path;
- machine-local review sandboxes.

Durable findings from retired external repositories MUST be represented by repository-owned tests, reports, fixtures, specifications, or evidence manifests before those repositories are removed.

Historical reports MAY retain original execution locations as factual provenance. Active execution instructions MUST use current repository roles and paths.

---

## 3. Required pass-start order

Every pass MUST read and execute:

1. orientation index;
2. repository build guidance;
3. Build Week execution orientation;
4. root and applicable nested governance;
5. immutable architecture and normative contracts relevant to the phase;
6. this workflow;
7. machine-readable active state and active phase manifest;
8. role-resolved status and glossary;
9. active phase prompt;
10. required local skills;
11. relevant source and tests;
12. accepted reports as findings to reproduce.

Required operational paths MUST resolve through `.config-reference-reconciliation.yaml`.

A missing or ambiguous required role is a hard stop.

---

## 4. Current determination

At workflow entry:

- Expflow `v1.0.1` is the exact implementation baseline.
- Historical v1 Gates A–D are complete and closed.
- No post-v1.0.1 behavior is claimed without evidence.
- The ordinary CLI remains `init`, `sync`, `status`, and `restore`.
- Advanced authority, semantic, workflow, projection, reproduction, security, and migration families remain primarily library-facing.
- No completed Expflow GUI is claimed.
- No portable workflow package is claimed.
- No external pilot or empirical evaluation is claimed.
- No completed Expflow Guerilla profile or causal event GUI is claimed.

Phase 1 is the only authorized implementation phase until its report is accepted and Gate BW-A advances according to this workflow.

---

## 5. Locked Build Week invariants

### 5.1 Native authority

Native systems remain authoritative for their native state.

Guerilla observes, classifies, and links native operations. It MUST NOT repair or replace Expflow-native state.

### 5.2 Four-command boundary

The ordinary Expflow CLI remains:

```text
init
sync
status
restore
```

No phase may add a fifth ordinary command without an explicit architecture and compatibility decision.

### 5.3 Query and error compatibility

- uninitialized `status` exits `0`;
- operational mutation failures exit `1`;
- unknown commands exit `2`.

### 5.4 Restore

Restore remains:

- byte-exact;
- append-only;
- forward-committing;
- recoverable;
- non-destructive to recorded history.

Phase 1 adds preview, affected-path disclosure, conflicting-drift detection, refusal by default, and explicit override.

### 5.5 Identity

Provisional identity MUST be visible as provisional to machine consumers and to humans when shown.

A provisional ID MUST NOT be described as committed or durable.

### 5.6 GUI

The approved name is **Expflow GUI**.

The implementation root is:

```text
apps/gui/
```

The GUI MUST consume documented application surfaces and MUST NOT treat raw `.expflow` storage as an application contract.

### 5.7 Protected surfaces

Repository-declared architecture and frozen release bodies remain protected.

Reference reconciliation uses the declared sidecar. Body immutability is enforced by a separate repository-owned check.

### 5.8 Compatibility

No phase may silently break v1 command automation, persisted records, machine-readable fields, package boundaries, or public extension behavior.

Breaking changes require an explicit versioning and architecture decision.

### 5.9 Completion evidence

Mocks, prompts, schemas, placeholders, screenshots, and success-shaped responses do not prove implementation.

Every phase requires working behavior, tests, documentation, evidence, and an accepted completion report.

---

## 6. Gates

| Gate                                          | Phases | Purpose                                                                                     | Exit state                                                                                         |
| --------------------------------------------- | -----: | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| **BW-A — UX Control Surface Ready**           |    1–2 | Repair the ordinary CLI and establish the local GUI foundation.                             | Existing material capability is understandable, inspectable, and safe through documented surfaces. |
| **BW-B — Workflow Portability Surface Ready** |    3–5 | Expose stable read models, ingest attributed evidence, and package portable workflow state. | Differentiating Expflow records are usable through application surfaces and portable packages.     |
| **BW-C — Pilot Proven**                       |    6–7 | Close evidence-backed gaps and execute a real pilot.                                        | Product claims are tied to observed workflows, failures, and measurements.                         |
| **BW-D — Causal Integration Ready**           |    8–9 | Add the Expflow Guerilla profile and causal event GUI.                                      | Cross-system events are inspectable while retaining native authority.                              |

A later phase MUST NOT begin before the preceding phase exits.

A later gate MUST NOT begin before the preceding gate returns `GO`.

Preparation documents MAY exist early. Later-phase source implementation MUST remain locked.

---

# Gate BW-A — UX Control Surface Ready

## 7. Phase 1 — Ordinary UX/UI Corrections

**Authorization:** active  
**Controlling prompt role:** Phase 1 UX/UI prompt  
**Objective:** repair the ordinary CLI loop without changing core architecture.

Required outcomes:

- actionable human `status`;
- path-level `sync --dry-run`;
- discoverable tree and node revision references through the existing command surface;
- tree and node restore preview;
- affected-path disclosure;
- conflicting-drift refusal by default;
- explicit override when permitted;
- explicit provisional identity;
- labeled IDs and receipts;
- remediation-first errors;
- backward-compatible machine output;
- help for existing identity and concurrency flags;
- focused and full regression evidence.

**Exit state:** a user can execute and understand:

```text
init -> status -> sync preview -> sync -> status -> restore preview -> restore
```

without copied scrollback, raw storage access, or internal record expertise.

The active prompt contains the exact implementation contract.

---

## 8. Phase 2 — Expflow GUI Foundation

**Authorization:** locked until Phase 1 exits  
**Objective:** create a local GUI client over documented Expflow read and operation surfaces.

Required outcomes:

- local application shell under `apps/gui/`;
- project selection and initialization state;
- material state and drift view;
- tree and node revision history;
- sync plan review and execution;
- restore plan review and execution;
- operation receipt and recovery inspection;
- accessible loading, empty, error, and recovery states;
- technical-detail panels preserving canonical internal terms.

The GUI MUST NOT read undocumented storage or create GUI-only authority.

**Gate BW-A exit:** the ordinary material workflow is usable and safe in both CLI and GUI.

---

# Gate BW-B — Workflow Portability Surface Ready

## 9. Phase 3 — Stable Read Models

**Authorization:** locked  
**Objective:** expose stable application read models for implemented advanced record families.

Required outcomes:

- documented, versioned, deterministic read models;
- stable ordering, filtering, pagination, and change inspection where required;
- explicit proposed, accepted, rejected, superseded, conflicted, stale, partial, and unknown states;
- no application dependency on raw store classes or undocumented paths;
- runnable examples and coherent fixtures;
- performance evidence on representative state.

**Exit state:** existing advanced records are usable through documented application surfaces.

---

## 10. Phase 4 — Evidence Intake and Authority Reconciliation

**Authorization:** locked  
**Objective:** ingest attributed partial workflow evidence and reconcile scoped authority without inventing certainty.

Required outcomes:

- evidence intake envelope;
- provenance and capture method;
- original evidence preservation;
- normalized records;
- authority registration and scope decisions;
- correspondence proposals;
- artifact clustering;
- conflict, duplicate, unresolved, and low-confidence states;
- user-controlled accept, reject, split, merge, or defer decisions;
- security handling for untrusted content and secrets.

**Exit state:** virtual, exported, imported, and material artifacts can be associated without erasing provenance or uncertainty.

---

## 11. Phase 5 — Portable Workflow Package

**Authorization:** locked  
**Objective:** export, validate, import, and resume a workflow occurrence across environments.

Required outcomes:

- versioned package manifest;
- semantic-role and repository-relative addressing;
- selected material and workflow references;
- included versus external evidence policy;
- unresolved dependency and readiness report;
- export and import;
- collision policy;
- safe archive handling;
- deterministic integrity checks;
- relocation and round-trip tests;
- no model requirement at runtime.

**Gate BW-B exit:** a representative workflow occurrence round-trips through a clean environment without losing material, authority, semantic, or workflow identity.

---

# Gate BW-C — Pilot Proven

## 12. Phase 6 — Engineering and Functional Gap Closure

**Authorization:** locked  
**Objective:** close only evidence-backed failures found during Phases 1–5.

Every work item MUST cite:

- a reproduced defect;
- a failed exit criterion;
- a pilot-blocking limitation;
- a compatibility or performance failure.

No speculative feature may enter this phase.

Every fix requires focused regression evidence.

---

## 13. Phase 7 — Pilot and Empirical Evaluation

**Authorization:** locked  
**Objective:** use Expflow in a real project and measure the workflow.

Required outcomes:

- named pilot project and workflow;
- real human or agent work;
- timestamps and duration;
- successes, friction, failures, recoveries, and unknowns;
- user decisions;
- measurable outcomes;
- issue and change ledger;
- claim updates based on observed evidence.

Internal fixtures alone cannot satisfy this phase.

**Gate BW-C exit:** product claims are grounded in real use and measured outcomes.

---

# Gate BW-D — Causal Integration Ready

## 14. Phase 8 — Expflow Guerilla Profile and Event Contracts

**Authorization:** locked  
**Objective:** define and verify profile-driven Guerilla observation of Expflow.

Required outcomes:

- versioned data-only profile;
- native version compatibility;
- command classification;
- before and after observations;
- native identifiers;
- evidence extraction;
- typed outcome reconciliation;
- security boundaries;
- event and causal-link contracts;
- conformance tests;
- proof that Expflow remains native authority.

---

## 15. Phase 9 — Guerilla Causal Event View GUI

**Authorization:** locked  
**Objective:** present causal events without conflating observation and native state.

Required outcomes:

- event timeline and graph;
- native authority links;
- invocation, observation, result, and reconciliation detail;
- explicit pending, unknown, conflicted, and completed states;
- evidence-backed causal edges;
- integration with stable Phase 8 contracts;
- no raw-store coupling.

**Gate BW-D exit:** causal activity is understandable while native authority remains explicit.

---

## 16. Phase procedure

Every phase SHALL follow:

1. verify active state;
2. read orientation, workflow, prompt, and required skills;
3. record baseline and Git state;
4. reproduce accepted findings;
5. implement the smallest authorized change;
6. add focused tests;
7. update evidence and active documentation;
8. reconcile references and roles;
9. run focused checks;
10. run full repository validation;
11. write the phase completion report;
12. perform independent phase review;
13. verify phase exit;
14. advance state only after `GO`.

The implementing agent MUST NOT approve its own gate solely from implementation confidence.

---

## 17. Required repository validation

The required order is:

1. skill-contract validation;
2. config-reference reconciliation;
3. protected-surface verification;
4. focused tests;
5. relevant typecheck and lint;
6. full repository validation;
7. package dry run;
8. staged diff check;
9. unstaged diff check;
10. commit-range or CI-equivalent validation.

Commands that write shared outputs MUST run sequentially.

Reports MUST record actual commands, evaluated Git state, exit codes, and results.

---

## 18. Phase exit

A phase exits only when:

- all required outputs exist;
- focused tests pass;
- full required validation passes;
- references and roles reconcile;
- protected surfaces pass;
- compatibility obligations pass;
- the completion report is complete;
- independent review returns `GO`;
- the phase-exit verifier passes;
- machine active state advances through repository tooling.

`CONDITIONAL GO` is permitted only for bounded, non-semantic work that cannot create a false completion claim.

---

## 19. Gate exit

A gate exits only when:

- every member phase exits;
- aggregate gate criteria pass;
- phase claims match evidence;
- no later-gate implementation was used to conceal incomplete work;
- protected and compatibility audits pass;
- the gate review returns `GO`;
- machine state advances through repository tooling.

---

## 20. Reporting

Every phase report MUST include:

- verdict;
- baseline and final commits;
- active gate and phase;
- artifacts changed;
- focused checks;
- full validation;
- evaluated Git states;
- finding dispositions;
- compatibility audit;
- protected-surface audit;
- scope audit;
- limitations;
- staged, unstaged, and untracked state;
- next authorized action.

Every gate report MUST include:

- member phase verdicts;
- evidence reviewed;
- gate criteria;
- conditions or failures;
- active-state decision.

---

## 21. Evidence vocabulary

Use independently:

- implemented;
- internally verified;
- ordinary surface;
- pilot verified;
- empirically evaluated;
- production-supported.

Do not replace these dimensions with one maturity percentage.

Internal validation MUST NOT be described as external pilot evidence.

---

## 22. Recovery and deadline

Stop when:

- a required role is missing or ambiguous;
- a protected body requires editing;
- a checker fails;
- staged ownership is unknown;
- architecture and phase scope conflict;
- later-phase authority is required;
- machine output cannot remain compatible;
- evidence cannot support the completion claim;
- the deadline arrives.

Before stopping, record:

- active gate and phase;
- exact failure;
- last passing check;
- Git state;
- changed files;
- evidence location;
- next deterministic action.

Incomplete work MUST remain resumable without the original conversation.

---

## Config Reference Index

<!-- config-reference-index:start -->

- `AGENTS.md` - active workflow authority
- `.config-reference-reconciliation.yaml` - active workflow role

<!-- config-reference-index:end -->
