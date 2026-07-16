# EXPFLOW IMPLEMENTATION SPECIFICATION

## Schema-First Agentic Build Specification

**Version:** 2.3-draft  
**Status:** Lock candidate  
**Runtime:** TypeScript core with schema-conforming Python hooks  
**Execution profile:** Local-first, one material transaction per project at a time

---

## 1. Purpose

This document is the normative implementation specification for Expflow 2.3.

It defines:

- repository structure;
- schemas;
- immutable stores;
- command algorithms;
- identity rules;
- authority registration;
- durable decisions;
- projection acceptance;
- Python hook contracts;
- security controls;
- regeneration, evaluation, and reuse records;
- migration;
- test phases and acceptance criteria.

Implementation agents must treat the JSON Schemas in `schemas/` as normative. Prose explains required behavior but does not replace machine contracts.

---

## 2. Locked Boundaries

### Material core owns

```text
project configuration
immutable stored objects
opaque node identities
immutable node revisions
actual relative path occupancy
immutable project tree revisions
operation plans and receipts
deterministic validation
head pointers
restoration
```

### Expflow semantic layer owns

```text
authority source revisions
authority source registration decisions
readable authority documents
semantic assertions
semantic decisions
conflicts and review requests
source correspondence
virtual artifacts
materialization events
derived artifact clusters
workflow occurrences
manifest revisions
regeneration attempts
equivalence evaluations
reuse results
```

Semantic hooks cannot modify committed material records.

---

## 3. Normative Schemas

Required files:

```text
schemas/
├── path-selector.schema.json
├── project.schema.json
├── node-revision.schema.json
├── tree-entry.schema.json
├── tree-revision.schema.json
├── operation-plan.schema.json
├── validation-result.schema.json
├── operation-receipt.schema.json
├── authority-source.schema.json
├── authority-document.schema.json
├── source-registration-decision.schema.json
├── semantic-assertion.schema.json
├── semantic-decision.schema.json
├── conflict.schema.json
├── review-request.schema.json
├── source-correspondence.schema.json
├── virtual-artifact.schema.json
├── materialization-event.schema.json
├── artifact-cluster.schema.json
├── workflow-occurrence.schema.json
├── manifest-revision.schema.json
├── regeneration-attempt.schema.json
├── equivalence-evaluation.schema.json
├── reuse-result.schema.json
├── hook-envelope.schema.json
└── status-report.schema.json
```

### TypeScript

Use:

- Ajv 8;
- `ajv-formats`;
- generated interfaces under `src/generated/`;
- schema validation at every persistence boundary.

### Python

Use:

- `jsonschema`, or generated Pydantic models;
- the same fixtures as TypeScript;
- no independent handwritten contract model.

### CI contract checks

CI must:

1. meta-validate all schemas;
2. validate all examples;
3. generate TypeScript types;
4. validate TypeScript-emitted fixtures;
5. validate Python-emitted fixtures;
6. compare positive and negative outcomes across runtimes;
7. reject incompatible schema changes without a version change.

---

## 4. Repository Layout

```text
src/
├── cli/
│   ├── index.ts
│   ├── init-command.ts
│   ├── sync-command.ts
│   ├── status-command.ts
│   └── restore-command.ts
├── core/
│   ├── ids.ts
│   ├── paths.ts
│   ├── digest.ts
│   ├── clock.ts
│   ├── errors.ts
│   ├── locks.ts
│   └── atomic-write.ts
├── schemas/
│   ├── registry.ts
│   ├── validate.ts
│   └── generated.ts
├── material/
│   ├── object-store.ts
│   ├── node-store.ts
│   ├── tree-store.ts
│   ├── project-store.ts
│   ├── head-store.ts
│   └── materialize.ts
├── scan/
│   ├── working-tree.ts
│   ├── ignore-policy.ts
│   ├── change-detector.ts
│   └── identity-resolver.ts
├── transactions/
│   ├── plan-builder.ts
│   ├── built-in-validation.ts
│   ├── staging.ts
│   ├── commit.ts
│   └── recovery.ts
├── authority/
│   ├── source-store.ts
│   ├── document-store.ts
│   ├── registration-decisions.ts
│   └── source-policy.ts
├── semantics/
│   ├── assertion-store.ts
│   ├── decision-store.ts
│   ├── conflict-store.ts
│   ├── review-store.ts
│   ├── correspondence-store.ts
│   └── cluster-projector.ts
├── workflows/
│   ├── occurrence-store.ts
│   ├── boundary-policy.ts
│   ├── virtual-artifacts.ts
│   ├── materializations.ts
│   ├── regeneration-store.ts
│   ├── evaluation-store.ts
│   └── reuse-store.ts
├── projections/
│   ├── deterministic-projector.ts
│   ├── model-projector.ts
│   ├── manifest-store.ts
│   ├── manifest-heads.ts
│   └── materialize-projection.ts
├── hooks/
│   ├── runner.ts
│   ├── python-process.ts
│   ├── registry.ts
│   ├── security.ts
│   └── retry-store.ts
├── status/
│   └── projector.ts
├── protocol/
│   ├── library-api.ts
│   └── command-binding.ts
├── extensions/
│   ├── host.ts
│   ├── record-reader.ts
│   └── operation-invoker.ts
└── generated/
    └── schema-types.ts

python/
├── expflow_hooks/
│   ├── runner.py
│   ├── structural_validation.py
│   ├── semantic_assertion.py
│   ├── workflow_detection.py
│   ├── deterministic_projection.py
│   ├── model_projection.py
│   ├── regeneration.py
│   ├── equivalence.py
│   └── structural_reuse.py
└── tests/

schemas/
examples/
tests/
```

---

## 5. On-Disk Project Layout

```text
project-root/
├── <user-managed project tree>
└── .expflow/
    ├── project.json
    ├── head.json
    ├── objects/
    ├── nodes/
    ├── trees/
    ├── operations/
    ├── validations/
    ├── authority-sources/
    ├── authority-documents/
    ├── source-registration-decisions/
    ├── assertions/
    ├── semantic-decisions/
    ├── conflicts/
    ├── review-requests/
    ├── correspondences/
    ├── virtual-artifacts/
    ├── materializations/
    ├── clusters/
    ├── workflows/
    ├── manifests/
    ├── regeneration/
    ├── evaluations/
    ├── reuse/
    ├── projections/
    ├── attempts/
    ├── locks/
    ├── staging/
    └── cache/
```

`.expflow/**` is a mandatory scanner exclusion.

Readable manifest projections live under:

```text
.expflow/projections/
```

An approved projection is copied into the user tree only through an explicit `materialize_projection` change in `sync`.

---

## 6. Immutable Object Storage

### Required digest

Every stored file object receives:

```text
SHA-256 over exact stored bytes
```

The digest is mandatory in `node-revision`.

It supports integrity and duplicate transfer optimization. It does not define logical identity.

### Allowed storage methods

```text
copy
safe reflink
```

### Prohibited storage method

Writable hard links are prohibited.

The implementation must prove that a reflink produces write-isolated copy-on-write behavior on the target platform. Otherwise it falls back to copy.

### Object verification

On read, restore, and optional background audit:

1. read stored bytes;
2. recompute digest;
3. compare with node revision;
4. fail with `object_integrity_failed` on mismatch.

Historical bytes are never modified in place.

---

### Tree-content digest preimage

`tree-revision.content_digest` covers immutable tree content, not the event that created it.

The canonical preimage contains:

```json
{
  "schema_version": "2.3",
  "scope": {
    "root": ".",
    "include": [],
    "exclude": []
  },
  "entries": [
    {
      "relative_path": "...",
      "entry_kind": "file",
      "node_id": "efn_...",
      "node_revision": 2,
      "node_content_digest": "sha256:...",
      "external_locator": null,
      "folder_name": "...",
      "filename": "...",
      "occupancy_status": "present"
    }
  ],
  "removed_paths": []
}
```

Rules:

1. normalize paths using the locked path policy;
2. sort entries by normalized relative path, then entry kind;
3. sort removed paths;
4. preserve selector array order;
5. omit tree revision ID, parent, operation ID, timestamp, and notes;
6. encode canonical UTF-8 JSON;
7. compute SHA-256.

## 7. Public Command Surface

```text
expflow init
expflow sync
expflow status
expflow restore
```

### `expflow init [root]`

Creates state, commits the initial project tree, and optionally registers supplied authority descriptors.

### `expflow sync [root]`

Handles ordinary work.

Options may include:

```text
--changed <path...>
--move <from:to...>
--new-node <path...>
--replace-node <path...>
--scope <selector-file>
--authority-source <descriptor...>
--authority-document <descriptor...>
--workflow-hint <json-or-file>
--materialize-projection <manifest-revision:path>
--no-semantic
--no-projections
--dry-run
--json
```

These are parameters of one command, not separate domain commands.

### `expflow status [root]`

Returns integrated material, authority, semantic, workflow, projection, and automation status.

### `expflow restore <reference>`

Restores an old tree revision or node revision as a new committed tree.

---

### Native operation identity

Each core mutation has an opaque operation ID and immutable receipt.

The core does not promise a cross-system idempotency-key grammar, canonical external request digest, retention interval, composite revision, change cursor, or lost-response lookup operation. Those guarantees belong to separately packaged adapter profiles.

## 8. Library API

```ts
export interface ExpflowRuntime {
  init(input: InitInput): Promise<OperationReceipt>;
  sync(input: SyncInput): Promise<OperationReceipt>;
  status(input: StatusInput): Promise<StatusReport>;
  restore(input: RestoreInput): Promise<OperationReceipt>;
}
```

External integrations use this API or the protocol binding. They do not write internal state directly.

---

## 9. Core Extension Boundary and Deferred Adapter Contracts

Expflow core exports a narrow extension host for separately packaged integrations.

The host may provide implementation-level access to:

- schema-valid immutable records;
- invocation of the four native operations;
- operation receipts;
- read-only project state needed by an installed extension.

The extension host is not a public Expflow protocol and does not define:

- `project.inspect`;
- `project.changes`;
- `operation.resolve`;
- a composite external project revision;
- an incremental change cursor;
- cross-system request canonicalization;
- adapter idempotency retention;
- external writer partitioning;
- integrating-system capability names.

Adapter packages must:

- depend only on documented core exports and normative record schemas;
- remain separately versioned and publishable;
- avoid raw `.expflow` path access;
- avoid importing internal store implementations;
- enforce their own external capability and authority policy.

Adapter-level attempts, outcomes, recovery events, lost-response lookup, replay semantics, and external revisions remain adapter-owned.

## 10. Sync Transaction

### 9.1 Acquire project lock

One material transaction at a time.

A stale lock may be recovered only through the lock lease and recovery rules.

### 9.2 Load head and expected state

Reject with `stale_head` when the expected head differs.

### 9.3 Scan the working tree

Exclude:

- `.expflow/**`;
- configured ignored paths;
- temporary editor files;
- quarantined extraction directories.

Record:

- relative path;
- entry kind;
- folder name;
- filename;
- byte size;
- digest when new or changed;
- symlink status;
- archive status.

### 9.4 Apply path scope

A sync may limit discovery to selected paths, but final candidate-tree validation must ensure that untouched head entries remain resolvable.

### 9.5 Resolve identity

Order:

1. explicit `preserve` directive;
2. explicit `new` directive;
3. explicit `replace` directive;
4. same-path default;
5. otherwise allocate a new node.

A digest match may emit a continuity assertion after commit. It never preserves node identity unless accompanied by an explicit preserve directive.

### 9.6 Build immutable node revisions

For each new revision:

1. copy or safely reflink bytes into staging;
2. compute SHA-256;
3. verify staged bytes;
4. create schema-valid record;
5. assign continuity basis;
6. retain original filename.

### 9.7 Build candidate tree

Create a complete immutable mapping of relative paths.

The project tree includes all selected and retained project entries. It does not itself declare workflow input or output scope.

### 9.8 Ingest authority descriptors

Schema-valid descriptors supplied to `sync` are staged as immutable authority-source or authority-document records.

They remain proposed until a source-registration decision accepts them.

Configured policy may auto-accept trusted local source types. The decision record must still be created.

### 9.9 Built-in validation

Blocking checks:

- schema validity;
- path confinement;
- symlink policy;
- duplicate path occupancy;
- referenced object existence;
- mandatory digest;
- storage method;
- expected head;
- projection-root exclusion;
- archive quarantine;
- restore source integrity;
- license or handling policy where configured.

### 9.10 Python pre-commit validation

Runs schema-conforming hooks.

A blocking failure rejects the material transaction.

### 9.11 Stage all records

One staging directory contains:

- stored objects;
- node revisions;
- tree revision;
- authority descriptors;
- source-registration decisions generated by deterministic policy;
- validation results;
- provisional receipt.

Validate every document again before commit.

### 9.12 Atomic commit

Commit order:

1. immutable objects;
2. node revisions;
3. tree revision;
4. authority records and deterministic registration decisions;
5. validation results;
6. operation receipt;
7. atomic head replacement;
8. receipt finalization.

Recovery must repair interrupted states without inventing semantic acceptance.

### 9.13 Post-commit automation

Invoke:

1. semantic assertions;
2. source correspondence proposals;
3. workflow detection;
4. conflict detection;
5. deterministic projections;
6. model-assisted projections when enabled;
7. status refresh.

A post-commit failure produces `partial_post_commit`. Material history remains committed.

### 9.14 Release lock

Always release in `finally`.

---

## 11. Authority Registration

### Source record

An authority source is immutable per source revision.

### Registration decision

Acceptance, rejection, revocation, or supersession is represented by an immutable source-registration decision.

### Current source state

Derived from:

- source revisions;
- registration decisions;
- supersession chain;
- effective interval;
- policy.

No mutable `accepted` field is authoritative.

### Split and unified documents

Authority document sidecars index stable Markdown anchors.

A split document has one authority role section.

A unified document may contain several role sections and source references.

---

## 12. Semantic Decisions

Assertions are immutable proposals or declarations.

Semantic decisions may accept, reject, modify, defer, revoke, or supersede them.

Current cluster, workflow, manifest, completion, and reuse states are derived from decisions.

Automated decisions must record:

- policy profile;
- actor kind `policy`;
- evidence;
- consequences;
- whether a user review was bypassed under policy.

---

## 13. Conflict and Review

A conflict contains competing claim references and authority scope.

A review request may be:

- blocking;
- advisory.

Resolution creates a semantic decision.

The conflict record is not deleted after resolution.

Status derives open conflicts by checking whether an applicable resolution decision exists.

---

## 14. Source Correspondence

Source correspondence is optional.

It is generated when an external or chat import record cannot be linked directly to one tree entry.

The proposal records:

- source record;
- candidates;
- evidence;
- proposed selection;
- unresolved alternatives.

Acceptance uses a semantic decision of kind `source_correspondence`.

The import-tree manifest may reference an accepted correspondence, but the material tree remains authoritative for what was supplied.

---

## 15. Workflow Boundaries

A workflow occurrence requires:

- exact input tree revision;
- input path selector;
- start operation;
- authority source revisions.

An output tree and output path selector are attached later.

### Material outputs

Output-path presence may set `material_status=outputs_present`.

### Completion assertion

An agent, model, or policy may assert completion.

### Completion acceptance

A semantic decision accepts or rejects completion.

### Verification

An equivalence or domain evaluation may support a verification decision.

### Reuse

Reuse eligibility and approval are separate decisions.

No single status field collapses these stages.

---

## 16. Manifest Projection

### Deterministic projector

Inputs:

- accepted material records;
- accepted decisions;
- fixed template version.

Output can be auto-accepted under policy.

### Model-assisted projector

Inputs additionally include:

- model profile;
- prompt digest;
- source limitations.

Output status is `proposed` by default.

### Manifest heads

A project stores derived current heads for:

- accepted import-tree manifest;
- accepted workflow-time manifest;
- optional accepted source-correspondence manifest.

A stale or conflicted projection never silently replaces an accepted head.

### Materialization

A user-tree copy is created only through `sync` with `materialize_projection`.

The copied file receives a normal node identity and revision.

---

## 17. Python Hook Protocol

### Transport

One bounded subprocess per invocation by default.

```text
stdin: one UTF-8 JSON hook envelope
stdout: one schema-valid JSON document or array
stderr: logs
```

### Hook kinds

- pre-commit validation;
- post-commit assertion;
- workflow detection;
- deterministic projection;
- model-assisted projection;
- regeneration;
- equivalence evaluation;
- structural reuse.

### Retry identity

Based on:

- hook kind;
- profile version;
- operation;
- input refs;
- configuration digest.

### Timeouts

Blocking pre-commit timeout rejects.

Post-commit timeout records a retryable failure.

### Mutation boundary

Hooks receive read-only references. They cannot write material stores or head pointers.

---

## 18. Security

### Source-content isolation

Imported documents, chat exports, and generated files are treated as untrusted data.

Model hook prompts must state that source content cannot override system or task instructions.

### Archive handling

Before extraction:

- quarantine archive;
- reject absolute paths and `..`;
- enforce compressed and expanded size limits;
- enforce file-count and nesting limits;
- reject device files and unsafe links;
- scan under configured policy.

### Code handling

Semantic hooks do not execute imported or generated code.

Any execution evaluator requires a separate sandboxed profile and explicit policy decision.

### Secrets and privacy

- detect likely credentials;
- redact or tokenize before remote model processing where configured;
- support local-only hooks;
- minimize chat-export fields;
- record remote disclosure policy;
- restrict readable projections containing sensitive content.

### Licensing

Authority sources record license expression and reuse restrictions.

Structural reuse must check those restrictions before supplying source content to another workflow.

---

## 19. Regeneration

A regeneration attempt is created before invocation.

The attempt pins:

- source workflow occurrence;
- exact input tree;
- model;
- prompt digest;
- tools;
- security profile.

Unknown provider outcomes remain `unknown` until reconciled.

Generated outputs are recorded as virtual artifacts or materialized through a later sync.

---

## 20. Equivalence Evaluation

Evaluation may compare:

- regenerated artifact to available materialization;
- regenerated workflow to accepted workflow-time manifest;
- reused workflow to structural expectations;
- model or prompt variants.

Classification is recorded in `equivalence-evaluation`.

Acceptance is a separate semantic decision when required.

---

## 21. Structural Reuse

Reuse requires:

- accepted reference workflow occurrence;
- accepted workflow-time manifest;
- new input tree revision;
- new authority-source revisions;
- structural-reference prompt.

A reuse result records:

- new occurrence;
- deviations;
- semantic-leakage evaluation;
- equivalence evaluations;
- acceptance decision.

Reference semantics must not become new-project authority.

---

## 22. Status Projection

`status` returns:

- material head;
- drift;
- authority registrations;
- open conflicts;
- review requests;
- active workflow occurrences;
- input/output tree boundaries;
- completion and verification states;
- manifest heads and freshness;
- pending and failed hooks;
- regeneration and reuse operations;
- recommended next action.

The status report is derived and rebuildable.

---

## 23. Error Codes

Required typed codes include:

```text
project_not_initialized
project_already_initialized
project_locked
stale_head
unsafe_relative_path
duplicate_path
symlink_rejected
archive_rejected
object_integrity_failed
node_revision_missing
tree_revision_missing
object_missing
schema_invalid
validation_failed
hook_failed
hook_timeout
hook_output_invalid
authority_source_unaccepted
authority_scope_conflict
semantic_conflict
review_required
projection_self_observation
manifest_projection_failed
manifest_acceptance_required
restore_conflict
idempotency_conflict
license_restriction
privacy_policy_violation
operation_recovery_required
internal_error
```

Every error contains:

- code;
- message;
- operation ID when available;
- recoverable;
- recommended action;
- details.

---

## 24. Migration from the Legacy Typed-Folder Runtime

The source repository is a code and fixture foundation, not the target architecture.

Migration must:

1. remove closed artifact-type constants;
2. remove purpose-bearing identity;
3. remove required watcher mode;
4. create `.expflow/`;
5. allocate opaque node identities;
6. convert current and archived files into immutable revisions;
7. compute mandatory SHA-256 digests;
8. preserve available old folder and filename evidence;
9. create the initial project tree revision;
10. translate event history into migration evidence;
11. generate a limitations report;
12. retain the original source until migration acceptance.

Ambiguous old-version ordering remains explicit.

Old tests continue to protect reusable filesystem and error behavior but do not establish 2.2 conformance.

---

## 25. Agentic Build Phases

### Phase 1 — Schema lock

Deliver:

- 26 normative schemas;
- valid and invalid fixtures;
- TypeScript and Python validation parity;
- generated language types.

### Phase 2 — Material stores

Deliver:

- write-isolated object store;
- mandatory digest;
- node store;
- tree store;
- project and head store;
- integrity verification.

### Phase 3 — Sync and identity

Deliver:

- nested scanner;
- mandatory exclusions;
- identity directives;
- path scopes;
- candidate tree;
- dry run.

### Phase 4 — Transactions and recovery

Deliver:

- lock;
- staging;
- deterministic validation;
- atomic commit;
- receipts;
- interruption recovery.

### Phase 5 — Four commands

Deliver only:

- init;
- sync;
- status;
- restore.

### Phase 6 — Authority model

Deliver:

- authority source store;
- split and unified authority documents;
- registration decisions;
- source policies.

### Phase 7 — Semantic ownership

Deliver:

- assertions;
- decisions;
- conflicts;
- review requests;
- correspondence;
- cluster projection.

### Phase 8 — Workflow boundaries

Deliver:

- input/output tree selectors;
- virtual artifacts;
- materialization events;
- separated completion states.

### Phase 9 — Projection system

Deliver:

- excluded projection root;
- deterministic projector;
- model-assisted projector;
- proposal and acceptance flow;
- projection materialization.

### Phase 10 — Regeneration and evaluation

Deliver:

- attempt records;
- unknown outcome reconciliation;
- equivalence evaluation;
- verification decisions.

### Phase 11 — Structural reuse

Deliver:

- reuse result;
- leakage evaluation;
- new occurrence;
- acceptance.

### Phase 12 — Security

Deliver:

- archive quarantine;
- prompt-injection isolation;
- secret policy;
- local-only hooks;
- licensing restrictions;
- sandbox profile for optional execution.

### Phase 13 — Migration

Deliver migration and limitations report for a representative legacy project.

### Phase 14 — End-to-end proof

Pass all scenarios in Section 26.

---

## 26. Required End-to-End Scenarios

1. Initialize a nested project tree.
2. Modify a same-path file and create the next node revision.
3. Override same-path continuity with `new`.
4. Preserve identity through an explicit move.
5. Detect a digest-similar move without silently preserving identity.
6. Restore an old node revision.
7. Start a workflow with an input path selector.
8. Attach a later output tree and selector.
9. Register a custom authority source and accept it by policy decision.
10. Use both split and unified authority documents.
11. Produce an ambiguous source-correspondence proposal and resolve it.
12. Record a virtual artifact and later materialize it.
13. Produce a model-assisted manifest proposal and accept it.
14. Verify that projections never trigger sync.
15. Materialize an accepted projection into the user tree.
16. Assert completion without automatically accepting it.
17. Run regeneration and classify workflow equivalence.
18. Reuse an accepted workflow on a new input tree and evaluate leakage.
19. Reject an unsafe archive.
20. Migrate a legacy typed-folder project.

---

## 27. Acceptance Criteria

The 2.2 implementation passes when:

1. no closed material artifact ontology exists;
2. no required watcher exists;
3. user paths remain unchanged;
4. all stored file objects have mandatory SHA-256 digests;
5. hard links are not used for immutable history;
6. old node and tree revisions remain restorable;
7. identity overrides are supported;
8. digest similarity never silently preserves identity;
9. authority sources are extensible and decision-governed;
10. split and unified readable authority profiles work;
11. semantic decisions and conflicts are immutable;
12. source correspondence is separate from tree inventory;
13. workflow input and output boundaries are explicit;
14. generated projections are scanner-excluded;
15. model-assisted manifests require acceptance;
16. deterministic and model-assisted projectors are distinguished;
17. completion, verification, and reuse are separate;
18. regeneration, equivalence, and reuse contracts pass;
19. security controls pass;
20. normal users and agents operate through four commands;
21. adapter inspection, revision, cursor, idempotency, reconciliation, capability, and writer-partition contracts remain outside the core package.
