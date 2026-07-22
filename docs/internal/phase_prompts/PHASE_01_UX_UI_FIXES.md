# Phase 1 Prompt — Ordinary UX/UI Corrections

**Workflow authority:** `docs/internal/BUILD_WEEK_WORKFLOW_CURRENT.md` <!-- config-docref -->  
**Phase:** 1  
**Gate:** BW-A — UX Control Surface Ready  
**Baseline:** Expflow `v1.1.0`  
**Status:** authorized to start  
**Primary execution agent:** Kimi until superseded  
**Primary skills:** `expflow-material-storage-sync`, `expflow-testing-security-migration`  
**Secondary skill:** `expflow-contracts-protocol` when machine contracts change

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, and **SHOULD NOT** are definitive requirements.

---

## 1. Objective

Repair the ordinary Expflow user loop without changing core architecture or entering GUI implementation.

A user who has not read internal specifications MUST be able to understand and safely execute:

```text
expflow init
expflow status
expflow sync --dry-run
expflow sync
expflow status
expflow restore --dry-run <reference>
expflow restore <reference>
```

The phase output is working behavior, tests, and evidence.

Documentation-only explanations do not satisfy a behavioral defect.

---

## 2. Entry requirements

Before editing:

1. read the orientation folder;
2. read repository build guidance;
3. read root governance;
4. resolve the active workflow, status, glossary, prompt, report, architecture, and frozen-evidence roles;
5. read relevant material, transaction, recovery, identity, CLI, and compatibility architecture;
6. read required local skills;
7. record branch, `HEAD`, staged, unstaged, and untracked state;
8. record Node, npm, Python, and package versions;
9. run the three repository control checks;
10. run the current baseline validation;
11. execute a clean `init -> sync -> status -> restore` round trip;
12. preserve the baseline transcript in the phase evidence location.

Do not depend on `Expflow-Test`, a nested Build Week package, or an external harness.

Review reports are findings to reproduce, not active dependencies.

---

## 3. Accepted decisions

These decisions are locked for Phase 1 unless contrary evidence requires escalation.

### D1 — Uninitialized query contract

`status` on an uninitialized directory remains a successful read-only query with exit code `0`.

Human output MUST explain the uninitialized state and recommend `expflow init`.

`sync` and `restore` continue to fail operationally with exit `1`.

Unknown commands remain usage failures with exit `2`.

### D2 — Restore safety

Restore remains byte-exact and forward-committing.

Phase 1 MUST add:

- non-mutating preview;
- selected source revision;
- affected paths;
- conflicting-drift detection;
- refusal by default;
- explicit override when architecture permits;
- authoritative-effect and recovery messaging.

### R1 — Provisional identity

Public v1.1.0 behavior confirms that identity shown before commitment may be provisional.

Machine output MUST expose a stable provisional/committed distinction, omit identity until commitment, or make allocation deterministic without changing identity semantics silently.

Human output MUST label provisional identity whenever it is shown.

### R2 — Historical collision

The v1.0.0 post-restore node-revision collision was not reproduced on v1.1.0.

It MUST NOT enter the active error taxonomy or Phase 1 acceptance suite unless newly reproduced.

### Naming

The approved future GUI name is **Expflow GUI**.

The future GUI root is `apps/gui/`.

No GUI implementation belongs in Phase 1.

---

## 4. Required finding inventory

Create a Phase 1 finding table:

| ID  | Finding | Reproduction | Severity | Decision | Implementation evidence | Test evidence |
| --- | ------- | ------------ | -------- | -------- | ----------------------- | ------------- |

At minimum, cover:

- terse human status;
- unhelpful uninitialized messaging;
- dry-run count without path plan;
- revision discovery gap;
- restore preview absence;
- silent overwrite of conflicting unrecorded drift;
- opaque identifier labels;
- provisional identity ambiguity;
- remediation-poor errors;
- help discoverability for existing identity and concurrency flags;
- any additional ordinary-flow defect reproduced from current source.

Classify each finding as:

- reproduced;
- not reproduced;
- already fixed;
- intentional;
- documentation gap;
- architecture conflict;
- future-phase concern;
- blocked by missing evidence.

---

## 5. Permitted scope

Phase 1 MAY change:

- human-readable output for `init`, `status`, `sync`, and `restore`;
- additive flags under the existing four-command boundary;
- backward-compatible additive machine fields;
- shared read models required by ordinary operations;
- status and history reads required for revision discovery;
- sync and restore planning;
- restore drift checks;
- remediation messages;
- ordinary CLI help and examples;
- focused material, operation, and CLI helpers;
- unit, integration, CLI snapshot, recovery, and compatibility tests;
- user documentation describing implemented behavior;
- active status;
- the Phase 1 completion report.

---

## 6. Prohibited scope

Phase 1 MUST NOT implement:

- Expflow GUI or any GUI shell;
- evidence intake;
- portable workflow package export/import;
- new authority, semantic, workflow, projection, regeneration, equivalence, verification, or reuse semantics;
- Guerilla profiles, events, causal edges, or GUI;
- FIMP or Reqtrace integration;
- hosted services, accounts, billing, cloud sync, or remote collaboration;
- branch or merge semantics;
- raw record-store commands;
- a new state-owning adapter;
- a fifth ordinary command;
- broad source-tree restructuring;
- breaking v1 behavior without an explicit decision;
- edits to immutable architecture or frozen release bodies.

Do not create later-phase placeholders to make Phase 1 appear complete.

---

## 7. Canonical and external terminology

Use canonical internal terms in source, tests, machine output, and technical details:

- material node;
- node revision;
- tree revision;
- material head;
- operation receipt;
- pending changes;
- restore intent;
- staging;
- recovery state;
- provisional identity.

Human output MAY use:

- project;
- current project version;
- changes;
- file version;
- restore preview;
- needs attention;
- safe next action.

External wording MUST NOT rename schema fields or weaken internal semantics.

---

## 8. Required implementation

### 8.1 Human-readable `status`

Default human output MUST communicate:

- initialized or uninitialized state;
- clean, drifted, recovery-required, or other primary state;
- labeled current project or material-head reference when available;
- pending change count and kinds when drifted;
- concise next action;
- how to request machine-readable or technical details.

The output MUST NOT be only `clean`, `drifted`, or `uninitialized`.

Human and JSON output MUST derive from a shared state model.

### 8.2 Actionable `sync --dry-run`

The preview MUST show:

- total changes;
- deterministic path ordering;
- change kind for each affected path;
- identity directive where relevant;
- provisional identity labeling;
- current and expected material head where relevant;
- no mutation.

Human and JSON preview MUST derive from the same plan.

### 8.3 Revision discovery

Users MUST be able to discover valid tree and node restore references through the existing four-command surface after original command output is gone.

A conforming implementation MAY add backward-compatible options or fields to `status`.

It MUST provide:

- recent tree revisions;
- current head identification;
- operation and timestamp context when available;
- bounded output or pagination;
- node history for a selected path or node when required;
- exact restore syntax;
- machine-readable output.

It MUST NOT require raw `.expflow` storage access.

### 8.4 Restore preview

Tree and node restore MUST support a non-mutating preview using the same planning logic as execution.

The preview MUST disclose:

- selected source reference;
- current material head;
- affected paths;
- create, update, remove, and unchanged classification where available;
- current working-tree drift;
- conflicting versus unrelated drift;
- paths that would overwrite unrecorded changes;
- expected forward-commit behavior;
- required correction or override before execution.

### 8.5 Restore drift protection

Restore MUST NOT silently overwrite conflicting unrecorded changes.

Default behavior SHALL refuse when conflicting drift exists.

The refusal MUST explain:

- conflicting paths;
- whether recorded state changed;
- how to inspect;
- how to sync or resolve drift;
- the explicit override when permitted.

Whole-tree and node restore require separate tests.

Unrelated drift MUST be tested separately and handled according to documented planning semantics.

### 8.6 Identifier labeling

Human output MUST label:

- project ID;
- tree revision ID;
- node ID and revision;
- operation receipt or operation ID;
- provisional identity;
- committed identity.

Do not expose undocumented identifier encoding.

### 8.7 Remediation-first errors

For each touched error class, communicate:

```text
what failed
why Expflow knows it failed
whether authoritative state changed
what the user can safely do next
how to inspect details
```

Prioritize:

- uninitialized project;
- already initialized project;
- invalid restore reference;
- missing tree revision;
- missing node revision;
- stale expected head;
- live lock;
- stale lock;
- recovery-required state;
- restore conflict;
- validation failure;
- unsupported option or argument.

### 8.8 Help and discoverability

Help MUST document:

- four ordinary commands;
- `--root`;
- `--json`;
- dry-run behavior;
- restore reference syntax;
- restore preview;
- restore override;
- `--move`;
- `--new-node`;
- `--replace-node`;
- `--expected-head`;
- revision discovery through the approved existing surface;
- exit code contract.

No new ordinary command may be added.

### 8.9 Machine compatibility

Machine output changes MUST be additive and backward compatible.

Existing fields MUST retain meaning.

New fields MUST:

- use canonical internal terms;
- have deterministic shapes;
- distinguish provisional and committed identity;
- remain consistent across human and JSON projections;
- receive schema or contract tests when applicable.

---

## 9. Required tests

Add or update focused tests for:

### Status

- uninitialized exit `0` and next action;
- clean output;
- drifted output with counts and kinds;
- recovery-required or equivalent state;
- human and JSON shared semantics.

### Sync preview

- path-level additions, modifications, removals, and moves;
- deterministic ordering;
- no mutation;
- provisional identity;
- expected-head context;
- parity between human and JSON data.

### Revision discovery

- recent tree revisions;
- current head labeling;
- bounded output;
- node-history lookup;
- exact restore references;
- no raw-store coupling.

### Restore preview and safety

- tree preview;
- node preview;
- no mutation;
- conflicting drift refusal;
- unrelated drift handling;
- explicit override;
- affected-path accuracy;
- create, update, and remove cases;
- append-only forward commit;
- byte-exact result;
- recovery state;
- stale head;
- lock behavior.

### Compatibility

- existing JSON fields;
- existing exit codes;
- existing four commands;
- existing sync flags;
- package exports;
- persisted record compatibility;
- CLI snapshot compatibility.

Every previously silent or ambiguous failure corrected by the phase requires a focused regression test.

---

## 10. Required documentation

Update only documentation supported by implemented behavior.

At minimum review:

- root README;
- CLI or usage documentation;
- current status;
- glossary when external and internal translation changes;
- directly affected source-directory README files;
- Phase 1 completion report.

Do not update future GUI or integration documentation as though later phases shipped.

---

## 11. Required validation order

Run in repository build-guidance order:

1. `npm run check:skill-contracts`;
2. `npm run check:config-references`;
3. `npm run check:protected-surfaces`;
4. focused Phase 1 tests;
5. relevant lint and typecheck;
6. full repository validation;
7. `npm pack --dry-run`;
8. staged diff check;
9. unstaged diff check;
10. commit-range or CI-equivalent checks when available.

Commands writing shared outputs MUST run sequentially.

Record exact commands, evaluated Git state, exit codes, and results.

---

## 12. Exit criteria

Phase 1 returns `GO` only when:

1. every accepted finding has a disposition;
2. default status is actionable;
3. dry-run presents a deterministic path-level plan;
4. valid tree and node references are discoverable through the existing command surface;
5. tree and node restore support non-mutating preview;
6. conflicting unrecorded drift cannot be overwritten silently;
7. override behavior is explicit and tested;
8. identifiers are labeled;
9. provisional identity is explicit to machine and human consumers;
10. remediation-first errors are implemented for touched classes;
11. human and machine output share semantic models;
12. existing machine compatibility is preserved;
13. the four-command boundary remains intact;
14. focused and full validation pass;
15. protected surfaces pass;
16. current status is updated;
17. a complete Phase 1 report is accepted;
18. independent review returns `GO`;
19. no Phase 2 or later implementation was introduced.

---

## 13. Stop conditions

Stop and report `NO-GO` or bounded partial completion when:

- implementation requires architecture mutation;
- safe restore behavior cannot remain additive and compatible;
- revision discovery requires undocumented storage access;
- human and machine semantics would diverge;
- a fifth command appears necessary;
- tests must be deleted or weakened;
- a later-phase feature is used to hide a Phase 1 gap;
- the v1.1.0 baseline cannot be reproduced;
- required repository checks fail;
- protected bodies require editing;
- staged ownership is ambiguous;
- machine output compatibility cannot be preserved.

Do not change a locked decision merely to keep moving.

---

## 14. Completion report

Create the report at the repository-declared Phase 1 report role.

The report MUST include:

- verdict;
- baseline and final commit;
- branch and versions;
- finding-disposition table;
- before and after CLI transcripts;
- changed human output;
- machine compatibility changes;
- source and tests changed;
- focused test results;
- full validation table;
- restore safety and recovery evidence;
- protected-surface audit;
- config-reference and skill-contract results;
- scope audit;
- known limitations;
- staged, unstaged, and untracked state;
- recommendation to authorize or block Phase 2.

---

## 15. Handoff

At completion or interruption, record:

- active phase;
- objective;
- current `HEAD`;
- files changed;
- Git state;
- last passing check;
- exact failure when blocked;
- evidence location;
- remaining tasks;
- exact next authorized action.

The next agent MUST be able to continue without retired repositories or the original conversation.

---

## Config Reference Index

<!-- config-reference-index:start -->

- `AGENTS.md` - active Phase 1 governance
- `.config-reference-reconciliation.yaml` - active Phase 1 prompt role
- `docs/internal/BUILD_WEEK_WORKFLOW_CURRENT.md` - active Phase 1 authority

<!-- config-reference-index:end -->
