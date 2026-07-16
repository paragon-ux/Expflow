# Expflow Workflow

**Version:** 1.0  
**Date:** 2026-07-16  
**Status:** Authoritative Codex build workflow for Expflow 2.3  
**Architecture baseline:** Expflow Core Architecture v2.2  
**Implementation state at workflow creation:** Architecture lock candidate; implementation not started

---

## 1. Purpose and Source Boundary

This workflow converts the Expflow 2.3 architecture into an executable, evidence-gated build sequence.

The controlling architecture sources are:

1. `EXPFLOW_CONCEPT_PAPER_V2_3.md`;
2. `EXPFLOW_IMPLEMENTATION_SPEC_V2_3.md`;
3. `EXPFLOW_PROTOCOL_SPEC_V2_3.md`;
4. `EXPFLOW_PROJECT_SNAPSHOT_V2_3.md`;
5. `Note-On-Architecture.md`;
6. `V2_3_REVIEW_RESOLUTION.md`;
7. `RELATED_WORK.md`, for positioning only;
8. the normative schemas and examples supplied with version 2.2; and
9. the accepted machine-facing inspection and reconciliation counter-proposal.

The counter-proposal is controlling only for these contract refinements:

- one read-oriented inspection protocol rather than many new ordinary commands;
- an opaque project revision token;
- an opaque incremental change cursor;
- immutable operation-attempt and operation-outcome stages;
- exact idempotency normalization and request digests;
- structured `partial_post_commit` success semantics;
- exact tree-content digest preimages;
- machine-readable protocol envelopes and negative fixtures;
- a separate adapter package boundary.

Guerilla, Reqtrace, Patch-DIFF, and other integrations are outside the Expflow core source boundary. Their needs may motivate generic contracts, but no product-specific behavior may enter the core runtime.

---

## 2. Executive Determination

Expflow 2.3 is an **architecture-complete, schema-rich, pre-implementation core**.

The architecture establishes:

- opaque material nodes;
- immutable node and tree revisions;
- mandatory content digests;
- extensible authority sources;
- immutable assertions, decisions, conflicts, and review requests;
- explicit workflow input and output tree boundaries;
- virtual and materialized artifacts;
- deterministic and model-assisted projections;
- regeneration, equivalence evaluation, and structural reuse;
- four ordinary commands;
- local single-writer material transactions;
- explicit post-commit automation state;
- security and migration requirements.

### 2.1 Core command boundary

The core exposes:

```text
expflow init
expflow sync
expflow status
expflow restore
```

No external inspection, composite revision, cursor, reconciliation, or cross-system idempotency contract is added to core.

### 2.2 Core versus adapter boundary

Expflow core owns native workflow state and the four operations.

A separate adapter owns:

- its external inspection protocol;
- its external revision token;
- its incremental cursor;
- request canonicalization and idempotency;
- lost-response reconciliation;
- capability restrictions;
- writer partition;
- external record translation;
- adapter conformance.

The adapter may use documented core extension exports and normative schemas. It must not read undocumented `.expflow` storage or import internal store implementations.

## 3. Build Pattern

Use this sequence:

```text
architecture package
→ repository control surface
→ focused agent skills
→ architecture decisions
→ machine contracts and fixtures
→ material runtime
→ ownership and reproduction runtime
→ security and migration
→ end-to-end proof
→ adapter packages
```

The four gates are:

| Gate | Phases | Meaning |
|---|---:|---|
| A — Contract Ready | 1–4 | Repository governance, architecture decisions, schemas, fixtures, and generated types are frozen |
| B — Material Core Ready | 5–8 | Immutable stores, sync, identity, transactions, recovery, commands, inspection, and operation resolution work |
| C — Ownership and Reproduction Ready | 9–14 | Authority, semantics, workflow boundaries, projections, regeneration, evaluation, and reuse work |
| D — Hardened and Proven | 15–17 | Security, migration, packaging, and all end-to-end scenarios pass |

No phase may skip its preceding gate.

---

# Gate A — Contract Ready

## 4. Required Architecture-Freeze Documents

Create before mutating runtime code:

1. `docs/ARCHITECTURE_DECISIONS.md`
2. `docs/GLOSSARY.md`
3. `docs/MVP_SCOPE.md`
4. `docs/DATA_MODEL.md`
5. `docs/MATERIAL_RECORD_FORMAT.md`
6. `docs/IDENTITY_AND_REVISION_MODEL.md`
7. `docs/PROTOCOL_CORE_SPEC.md`
8. `docs/EXTENSION_BOUNDARY.md`
9. `docs/STORAGE_AND_RECOVERY.md`
10. `docs/AUTHORITY_AND_SEMANTIC_MODEL.md`
11. `docs/WORKFLOW_AND_PROJECTION_MODEL.md`
12. `docs/SECURITY_MODEL.md`
13. `docs/ERROR_REGISTRY.md`
14. `docs/TEST_MATRIX.md`
15. `docs/CODEX_BUILD_PLAN.md`
16. `docs/CURRENT_STATUS_MATRIX.md`

Architecture papers are inputs. Freeze choices in architecture decisions and regenerate the project snapshot only at gate closure.

## 5. Decisions That Must Be Frozen

`ARCHITECTURE_DECISIONS.md` must settle:

- supported Node.js, TypeScript, and Python versions;
- package manager and lockfile;
- opaque identifier library and prefix grammar;
- timestamp and path normalization;
- object, record, and tree-content digest preimages;
- lock, staging, rename, file-fsync, and directory-fsync behavior;
- operation commit point and immutable receipt semantics;
- supported filesystem profile;
- safe reflink detection and fallback;
- object retention and integrity audit;
- scanner exclusions;
- authority-source trust defaults;
- deterministic versus model-assisted hook boundaries;
- local versus remote semantic profiles;
- archive and secret handling defaults;
- schema and protocol compatibility;
- documented extension exports available to separate packages.

No unresolved choice may change material identity, transaction validity, recovery classification, tree-content digest, or restore results.

## 6. Required Machine Contracts

Retain and version the 26 supplied core schemas.

Do not add adapter-only schemas for:

- external inspection;
- composite project revisions;
- change cursors;
- adapter operation attempts or outcomes;
- adapter request normalization;
- lost-response resolution;
- capability policy.

Those belong to the separate adapter package.

Required core fixture corpus:

```text
tests/fixtures/contracts/
├── valid/
├── invalid/
├── compatibility/
├── recovery/
├── tree-digests/
└── examples/
```

The corpus must cover:

- malformed core records;
- unsafe paths;
- object integrity failure;
- stale material head;
- same-path identity override;
- explicit move continuity;
- digest similarity without identity preservation;
- interrupted core commit recovery;
- material commit with incomplete post-commit automation;
- deterministic and model-assisted projection states;
- exact tree-content digest vectors.

## 7. Core Operation and Extension Boundary

Each native mutation has:

- opaque operation ID;
- immutable operation receipt;
- material head before and after;
- automation completion state;
- evidence references.

The core does not claim a cross-system request digest, idempotency-key retention rule, external revision, incremental cursor, or lost-response resolution operation.

A documented extension host may expose schema-valid records and invoke the four native operations for separately packaged adapters.

## 8. Tree-Content Digest

The digest covers canonical immutable tree content.

Exclude:

- tree revision ID;
- parent;
- operation ID;
- creation time;
- notes.

Include:

- path selector;
- normalized and sorted entries;
- referenced node revision and content digest;
- occupancy metadata;
- sorted removed paths.

Hash canonical UTF-8 JSON bytes.

## 9. Adapter Package Deferral

The core workflow does not implement an external adapter.

Adapter development begins in a separate repository after the required core gates.

The adapter package defines and tests its own:

- inspection messages;
- revision and cursor records;
- external idempotency;
- reconciliation;
- capability policy;
- writer partition;
- observation mapping.

## 11. Root `AGENTS.md`

Create one root `AGENTS.md`, approximately 300–500 lines.

It must contain:

- product identity;
- source-of-truth order;
- locked boundaries;
- material versus semantic ownership;
- public command and extension boundaries;
- immutable storage rules;
- tree revision and extension-boundary rules;
- immutable native operation receipt semantics;
- adapter idempotency deferral rule;
- transaction and recovery order;
- authority and decision rules;
- projection and model-assisted output rules;
- security rules;
- test commands;
- phase discipline;
- completion evidence format;
- prohibited shortcuts.

Source-of-truth order:

1. `AGENTS.md`
2. `docs/ARCHITECTURE_DECISIONS.md`
3. machine-readable schemas and registries
4. `docs/MVP_SCOPE.md`
5. `docs/PROTOCOL_CORE_SPEC.md`
6. `docs/INSPECTION_AND_RECONCILIATION_SPEC.md`
7. `docs/MATERIAL_RECORD_FORMAT.md`
8. `docs/IDENTITY_AND_REVISION_MODEL.md`
9. `docs/STORAGE_AND_RECOVERY.md`
10. `docs/AUTHORITY_AND_SEMANTIC_MODEL.md`
11. `docs/WORKFLOW_AND_PROJECTION_MODEL.md`
12. `docs/TEST_MATRIX.md`
13. `docs/CODEX_BUILD_PLAN.md`
14. current architecture package

`AGENTS.md` must prohibit agents from:

- changing user-managed paths during observational sync;
- using hard links for immutable history;
- silently preserving identity from digest similarity;
- mutating historical records;
- making projections or readable manifests authoritative;
- treating model-assisted output as deterministic;
- accepting authority without an immutable decision;
- finalizing a receipt by modifying an earlier record;
- implementing adapter idempotency in the core package;
- reading undocumented `.expflow` storage from an integration;
- adding a generic database API to the ordinary command surface;
- executing source or generated content as instructions;
- claiming workflow completion from material output alone;
- entering a later phase without exit evidence.

---

## 12. Agent Skills

Create five skills under `.agents/skills/`, each with purpose, activation criteria, required reading, invariants, procedure, tests, stop conditions, and evidence.

```text
.agents/skills/
├── expflow-contracts-protocol/SKILL.md
├── expflow-material-storage-sync/SKILL.md
├── expflow-authority-semantics-workflows/SKILL.md
├── expflow-projections-reproduction/SKILL.md
└── expflow-testing-security-migration/SKILL.md
```

### `expflow-contracts-protocol`

Owns schemas, registries, canonicalization, project revisions, cursors, operation stages, envelopes, error codes, generated types, and compatibility.

### `expflow-material-storage-sync`

Owns object, node, tree, project, and head stores; scanning; identity; transactions; restore; recovery; and material integrity.

### `expflow-authority-semantics-workflows`

Owns authority registration, readable authority documents, assertions, decisions, conflicts, review, correspondence, workflow boundaries, virtual artifacts, and completion states.

### `expflow-projections-reproduction`

Owns deterministic and model-assisted projections, manifest acceptance, materialization, regeneration, equivalence, structural reuse, and status projection.

### `expflow-testing-security-migration`

Owns contract parity, crash tests, archive quarantine, prompt-injection isolation, secret handling, licensing, sandbox profiles, migration, packaging, and end-to-end evidence.

---

## 13. Reference Build Stack

Use this reference profile unless the repository already contains an intentional compatible stack:

- Node.js 20 or later;
- TypeScript 5.x in strict mode;
- npm with committed `package-lock.json`;
- JSON Schema Draft 2020-12;
- Ajv 8 and `ajv-formats`;
- generated TypeScript interfaces under `src/generated/`;
- Python 3.11 or later for hook and validation parity;
- Python `jsonschema` or generated Pydantic models from the same schemas;
- SHA-256;
- ULID identifiers with registered prefixes;
- immutable JSON records and content-addressed objects;
- local single-writer project lock;
- Vitest or Node test runner for TypeScript;
- pytest for Python;
- property-based tests for identity, transactions, digesting, cursors, and recovery;
- no required database, broker, container runtime, file watcher, or network service for the core implementation.

Python models must be generated from or validate directly against the same schemas. Do not create a second handwritten contract system.

---

## 14. Reference Repository Layout

```text
Expflow/
├── AGENTS.md
├── README.md
├── README_DEV.md
├── package.json
├── package-lock.json
├── tsconfig.json
├── pyproject.toml
├── .agents/skills/
├── docs/
│   ├── architecture/
│   ├── ARCHITECTURE_DECISIONS.md
│   ├── GLOSSARY.md
│   ├── MVP_SCOPE.md
│   ├── DATA_MODEL.md
│   ├── MATERIAL_RECORD_FORMAT.md
│   ├── IDENTITY_AND_REVISION_MODEL.md
│   ├── PROTOCOL_CORE_SPEC.md
│   ├── INSPECTION_AND_RECONCILIATION_SPEC.md
│   ├── STORAGE_AND_RECOVERY.md
│   ├── AUTHORITY_AND_SEMANTIC_MODEL.md
│   ├── WORKFLOW_AND_PROJECTION_MODEL.md
│   ├── SECURITY_MODEL.md
│   ├── ERROR_REGISTRY.md
│   ├── TEST_MATRIX.md
│   ├── CODEX_BUILD_PLAN.md
│   ├── CURRENT_STATUS_MATRIX.md
│   ├── phase_prompts/
│   └── completion_reports/
├── schemas/
├── registries/
├── examples/
├── src/
│   ├── cli/
│   ├── core/
│   ├── schemas/
│   ├── material/
│   ├── scan/
│   ├── transactions/
│   ├── revisions/
│   ├── changes/
│   ├── inspection/
│   ├── operations/
│   ├── authority/
│   ├── semantics/
│   ├── workflows/
│   ├── projections/
│   ├── hooks/
│   ├── status/
│   ├── protocol/
│   └── generated/
├── python/expflow_hooks/
├── tests/
│   ├── repository/
│   ├── contracts/
│   ├── unit/
│   ├── integration/
│   ├── crash/
│   ├── security/
│   ├── migration/
│   ├── e2e/
│   └── fixtures/
└── examples/projects/
```

---

# Ordered Phase Prompts

## 15. Phase 1 — Kickoff and Repository Contract

File:

```text
docs/phase_prompts/Expflow-Kickoff-Prompt.md
```

Deliver:

- repository inventory;
- architecture package under `docs/architecture/` without semantic edits;
- root `AGENTS.md`;
- five skill directories;
- documentation skeleton;
- schema, registry, example, and fixture structure;
- TypeScript and Python package scaffolds;
- CI for formatting, linting, type checking, schema meta-validation, and placeholder tests;
- repository-contract tests;
- source-integrity digests;
- current status and build plan skeletons.

Prohibited: material storage, sync, identity resolution, transaction, command, semantic, projection, hook, or migration runtime behavior.

Exit: clean installation and repository checks pass, source inputs are discoverable and integrity checked, and no later-phase runtime exists.

## 16. Phase 2 — Architecture Decisions and Vocabulary

Deliver:

- all architecture decisions listed in Section 5;
- glossary and MVP scope;
- locked public-versus-machine interface boundary;
- opaque tree-revision semantics;
- cursor semantics;
- operation attempt/outcome/recovery semantics;
- idempotency normalization;
- tree-content digest preimage;
- executable decision vectors.

Exit: no unresolved choice can change identity, digest, project revision ordering, idempotency, transaction validity, recovery, or protocol compatibility.

## 17. Phase 3 — Core Machine Contracts and Registries

Deliver:

- supplied core schemas reconciled with the 2.3 delta;
- core registries;
- schema index;
- versioning and compatibility policy;
- generated examples;
- documented extension-host types.

Do not add adapter inspection, revision, cursor, reconciliation, or idempotency contracts.

Exit: every persisted core record and native operation message has one versioned contract.

## 18. Phase 4 — Conformance Fixtures and Generated Types

Deliver:

- valid, invalid, compatibility, recovery, and tree-digest fixtures;
- TypeScript and Python validation parity;
- generated TypeScript interfaces;
- Python generated or derived validation models;
- golden tree-content digest vectors;
- stable validation errors.

Exit: both runtimes agree on the core fixture corpus.

### Gate A Exit

Gate A passes only when:

1. core architecture decisions are frozen;
2. the 26 core schemas and registries are complete;
3. tree-content digest semantics are fixed;
4. extension-boundary types are documented;
5. two validators agree across the core corpus;
6. hosted CI passes;
7. adapter-only contracts remain absent from core.

# Gate B — Material Core Ready

## 19. Phase 5 — Immutable Material Stores

Deliver:

- object store with mandatory SHA-256;
- safe copy or verified reflink;
- node-revision store;
- tree-revision store;
- project store;
- material-head store;
- tree-revision verification and head store;
- change store;
- integrity verification;
- restore-source reads.

Tests:

- object corruption;
- missing object;
- hard-link rejection;
- duplicate identifier;
- immutable-record overwrite attempt;
- path normalization;
- deterministic tree-content digest;
- tree-revision and head verification.

Exit: immutable material records and tree heads persist and verify without sync or commands.

## 20. Phase 6 — Sync, Scanning, and Identity

Deliver:

- nested scanner;
- mandatory `.expflow/**` exclusion;
- configured ignore policy;
- path selectors;
- change detection;
- `auto`, `preserve`, `new`, and `replace` directives;
- same-path continuity;
- explicit moves;
- digest-similarity proposals without silent identity preservation;
- complete candidate trees;
- dry-run plans;
- observational versus mutating sync classification.

Exit: candidate trees and identity decisions are deterministic, user paths are unchanged by observational sync, and digest similarity never silently preserves identity.

## 21. Phase 7 — Transactions and Core Recovery

Deliver:

- project lock;
- staging;
- built-in validation;
- Python pre-commit validation;
- atomic material commit;
- immutable native operation receipt;
- post-commit automation scheduling state;
- structured `partial_post_commit` result;
- interruption recovery for every specified core class.

Required failure points:

- before staging;
- after object staging, before commit;
- objects committed, records incomplete;
- tree committed, material head not advanced;
- material head advanced, receipt incomplete;
- receipt committed, post-commit automation incomplete.

Exit: recovery never mutates prior records, invents semantic acceptance, or reports material failure after material commit.

## 22. Phase 8 — Four Commands and Extension Host

Deliver native CLI and library operations:

```text
project.init
project.sync
project.status
revision.restore
```

Deliver a documented extension host for separate packages.

Requirements:

- one shared runtime path;
- schema validation;
- expected material-head guards;
- native operation IDs and receipts;
- no external inspection protocol;
- no composite project revision;
- no change cursor;
- no adapter idempotency or reconciliation;
- no generic raw record-store API.

Exit: ordinary commands remain simple and a separate package can use documented exports without raw storage access.

### Gate B Exit

Gate B passes only when:

1. material stores verify and remain immutable;
2. sync and identity rules pass;
3. transactions recover every core interruption class;
4. native operation receipts distinguish material and automation outcomes;
5. the extension host exposes no undocumented stores;
6. clean package and hosted CI pass.

A separate adapter may begin after Gate B, but adapter registration remains independent of core gate status.

# Gate C — Ownership and Reproduction Ready

## 23. Phase 9 — Authority Model

Deliver:

- authority-source store;
- split and unified authority documents;
- immutable source-registration decisions;
- current-source projection;
- source policies;
- acceptance, revocation, and scope-conflict behavior;
- derived status refresh for durable authority decisions.

Exit: no source becomes authoritative without an attributed immutable decision.

## 24. Phase 10 — Semantic Ownership

Deliver:

- semantic assertions;
- semantic decisions;
- conflicts;
- review requests;
- source correspondence;
- artifact clusters as projections;
- decision supersession without mutation;
- inspection and change-feed support for every record family.

Exit: proposals remain distinct from decisions and conflicts never disappear through record replacement.

## 25. Phase 11 — Workflow Boundaries

Deliver:

- input and output tree selectors;
- workflow occurrences;
- virtual artifacts;
- materialization events;
- material, completion, verification, and reuse states;
- explicit transition and attribution rules.

Exit: material output never implies accepted completion, verification, or reuse.

## 26. Phase 12 — Projection System

Deliver:

- scanner-excluded projection root;
- deterministic projectors;
- model-assisted projectors;
- manifest proposals;
- acceptance decisions;
- manifest heads;
- staleness;
- optional projection materialization;
- no projection-triggered sync;
- derived status refresh for durable accepted/proposed projection state.

Exit: projections are managed and attributable, model output is never mislabeled deterministic, and projection generation cannot self-observe.

## 27. Phase 13 — Regeneration and Equivalence Evaluation

Deliver:

- regeneration attempts;
- unknown-outcome preservation;
- reconciliation through operation resolution and change inspection;
- equivalence evaluations;
- verification decisions;
- model/tool evidence and configuration digests;
- safe retry identity.

Exit: regeneration outcomes remain explicit and equivalence is an attributed evaluation, not an inferred fact.

## 28. Phase 14 — Structural Reuse

Deliver:

- reuse-result records;
- leakage evaluation;
- new workflow occurrence creation;
- reuse acceptance decisions;
- license and authority-policy gates;
- inspection and change support.

Exit: reuse never silently transfers authority, completion, or verification from the source occurrence.

### Gate C Exit

Gate C passes only when authority, semantic, workflow, projection, regeneration, evaluation, and reuse records are immutable, revision ordered, inspectable, and reproducible from committed state.

---

# Gate D — Hardened and Proven

## 29. Phase 15 — Security and Execution Boundaries

Deliver:

- archive quarantine and bounded extraction;
- path traversal and unsafe-link rejection;
- source instruction/data separation;
- generated-code non-execution by default;
- local-only hook profile;
- restricted environment and network profile;
- time, output, and resource limits;
- secret detection and redaction;
- remote-disclosure records;
- privacy policy;
- licensing restrictions;
- optional sandbox profile;
- denial-of-service controls;
- threat model and residual risks.

Exit: all untrusted content remains data, and optional execution is explicit, bounded, and separately authorized.

## 30. Phase 16 — Legacy Migration and Packaging

Deliver:

- representative legacy-project inventory;
- explicit migration map;
- migration tool;
- preserved user paths;
- identity and ambiguity report;
- unsupported-feature report;
- rollback or retry behavior;
- clean npm package;
- Python hook package;
- install tests outside the checkout;
- migration evidence.

Exit: a representative legacy project migrates without silent identity or authority fabrication.

## 31. Phase 17 — End-to-End Proof

Automate all architecture scenarios:

1. initialize a nested project tree;
2. create a same-path node revision;
3. override continuity with `new`;
4. preserve identity through explicit move;
5. detect digest-similar move without silent preservation;
6. restore an old node or tree revision;
7. start a bounded workflow;
8. attach a later output tree;
9. register and accept a custom authority source;
10. use split and unified authority documents;
11. resolve ambiguous source correspondence;
12. create and materialize a virtual artifact;
13. propose and accept a model-assisted manifest;
14. prove projections never trigger sync;
15. materialize an accepted projection;
16. assert completion without automatically accepting it;
17. run regeneration and classify equivalence;
18. reuse an accepted workflow and evaluate leakage;
19. reject an unsafe archive;
20. migrate a legacy typed-folder project;
21. inspect exact state at an old project revision;
22. paginate incremental changes;
23. reconcile a lost response;
24. preserve material success with incomplete automation;
25. verify adapter-only idempotency is absent from core.

Exit: every scenario has automated tests, machine-readable evidence, clean-package execution, and hosted CI.

---

## 32. Final Core Checklist

Create:

```text
docs/phase_prompts/FINAL_EXPFLOW_CORE_CHECKLIST.md
```

The checklist must prove:

1. four ordinary commands remain the primary user surface;
2. inspection and reconciliation are separate machine contracts;
3. user paths remain unchanged unless an explicitly mutating operation is requested;
4. every stored object has a verified digest;
5. hard links are never used for immutable history;
6. identity overrides work;
7. digest similarity is proposal-only;
8. old node and tree revisions restore;
9. project revisions order all durable observable state;
10. incremental changes are cursor based;
11. operation attempts and outcomes are immutable;
12. native operation receipts are immutable and adapter idempotency is deferred;
13. lost responses reconcile without blind replay;
14. authority requires decisions;
15. assertions remain distinct from decisions;
16. workflow completion states remain separate;
17. projections never become material authority;
18. model-assisted output remains attributable and non-deterministic;
19. regeneration unknown outcomes remain explicit;
20. reuse does not inherit acceptance automatically;
21. security controls pass;
22. migration evidence is complete;
23. all end-to-end scenarios pass;
24. clean packages install and run;
25. documentation reflects implemented reality.

---

## 33. Complete Phase-Prompt Inventory

```text
docs/phase_prompts/
├── Expflow-Kickoff-Prompt.md
├── PHASE_02_ARCHITECTURE_DECISIONS.md
├── PHASE_03_MACHINE_CONTRACTS.md
├── PHASE_04_CONFORMANCE_FIXTURES_GENERATED_TYPES.md
├── PHASE_05_IMMUTABLE_MATERIAL_STORES.md
├── PHASE_06_SYNC_SCANNING_IDENTITY.md
├── PHASE_07_TRANSACTIONS_PROJECT_REVISIONS_RECOVERY.md
├── PHASE_08_COMMANDS_INSPECTION_RECONCILIATION.md
├── FINAL_CONTRACT_MATERIAL_CORE_CHECKLIST.md
├── PHASE_09_AUTHORITY_MODEL.md
├── PHASE_10_SEMANTIC_OWNERSHIP.md
├── PHASE_11_WORKFLOW_BOUNDARIES.md
├── PHASE_12_PROJECTION_SYSTEM.md
├── PHASE_13_REGENERATION_EQUIVALENCE.md
├── PHASE_14_STRUCTURAL_REUSE.md
├── FINAL_OWNERSHIP_REPRODUCTION_CHECKLIST.md
├── PHASE_15_SECURITY_EXECUTION_BOUNDARIES.md
├── PHASE_16_LEGACY_MIGRATION_PACKAGING.md
├── PHASE_17_END_TO_END_PROOF.md
└── FINAL_EXPFLOW_CORE_CHECKLIST.md
```

Every phase prompt must include:

1. objective;
2. permitted scope;
3. prohibited scope;
4. required sources;
5. expected files;
6. locked invariants;
7. ordered implementation tasks;
8. unit, integration, conformance, crash, and security tests as applicable;
9. documentation regeneration;
10. exact exit criteria;
11. completion-report format;
12. stop conditions.

---

## 34. Completion Report Format

Every phase completion report must include:

### Result

Use exactly one:

```text
PASS -- Phase <n> complete
PARTIAL -- unaffected work complete; blockers remain
FAIL -- exit criteria not met
```

### Delivered Artifacts

Group by source, schemas, registries, fixtures, tests, docs, packaging, and CI.

### Validation Evidence

```text
Command | Exit code | Result | Evidence path or workflow URL
```

### Exit-Criteria Matrix

```text
Criterion | Status | Evidence | Notes
```

### Invariant Audit

List all phase-relevant locked invariants.

### Scope Audit

State whether any later-phase behavior was introduced.

### Blockers and Contradictions

List or `None`.

### Git Summary

Include branch, commits, PR, changed files, generated files, and hosted CI.

### Handoff

State the exact next authorized phase and its frozen inputs.

---

## 35. Global Stop Conditions

Stop the affected phase if:

- architecture sources contradict a required identity or transaction rule;
- a machine contract is missing or ambiguous;
- TypeScript and Python validators disagree;
- a historical record would need mutation;
- a caller must read undocumented storage;
- an ordinary command must become a generic database API;
- project revision ordering becomes ambiguous;
- adapter-specific request normalization appears in core;
- recovery must invent semantic acceptance;
- material success would be reported as generic failure;
- digest similarity would silently preserve identity;
- a projection would trigger sync or become authoritative;
- a model-assisted result would be presented as deterministic;
- source content would be executed as instructions;
- migration would fabricate identity or authority;
- hosted CI is unavailable for a gate-completion claim.

Never hide a blocker behind a mock, fallback, placeholder, mutable record, or success-shaped response.

---

## 36. Adapter Handoff Boundary

A separate adapter package may begin after Gate B.

It may depend on:

- Expflow 2.3 normative schemas;
- documented core extension exports;
- the four native operation invokers;
- immutable native operation receipts.

It must define independently:

- exact inspection;
- external revision tokens;
- change cursors;
- adapter request normalization and idempotency;
- lost-response reconciliation;
- capability policy;
- writer partition;
- external observation mapping.

It may not depend on:

- raw `.expflow` paths;
- internal store classes;
- internal recovery functions;
- unversioned records.

Expflow core remains complete without any specific adapter.

## 37. Final Build Principle

The shortest credible Expflow implementation is not a file watcher, backup system, generic record database, or manifest generator.

It is:

> A schema-governed local system that automatically versions complete material trees while preserving opaque identity, immutable authority and decisions, explicit workflow boundaries, managed projections, evaluated regeneration and reuse, exact inspection, and recoverable operation outcomes through a deliberately small ordinary command surface.
