# EXPFLOW–GUERILLA ADAPTER SPECIFICATION

## Relative-Tree Adapter Profile v1

**Adapter version:** 1.0-draft  
**Compatible Expflow core:** 2.3  
**Profile:** `expflow.relative-tree.v1`  
**Status:** Contract-closure specification

---

## 1. Purpose

This package defines the Guerilla-facing adapter for Expflow.

It is separate from Expflow core.

The adapter provides:

- exact revision-bound inspection;
- incremental observation;
- opaque external project revisions;
- lost-response reconciliation;
- adapter-level idempotency;
- capability restriction;
- cross-adapter write-authority partition;
- translation from Expflow records into bounded Guerilla observations.

The adapter must not:

- add commands to the Expflow user interface;
- read undocumented `.expflow` storage;
- import Expflow internal store implementations;
- mutate Expflow records directly;
- move adapter-specific graph behavior into Expflow core;
- bypass Guerilla intent validation.

---

## 2. Compatibility Position

Expflow is the third materially heterogeneous Guerilla adapter profile.

| Adapter | Native state |
|---|---|
| Reqtrace | Transactional requirements, traceability, coverage, and RTM state |
| Patch-DIFF | Structured computer mutation and patch/application outcomes |
| Expflow | Reconstructed workspace state, immutable relative-tree revisions, semantic decisions, manifests, and workflow ownership |

The profile proves continuity across materially different identity, revision, consistency, and mutation semantics.

---

## 3. Package Boundary

```text
expflow-core
├── four native operations
├── immutable core records
├── normative core schemas
└── documented extension exports

expflow-adapter-guerilla
├── adapter profile
├── inspection protocol
├── revision and cursor model
├── idempotency and reconciliation
├── capability policy
├── writer partition
├── observation translation
└── adapter conformance tests
```

The adapter is separately versioned and publishable.

---

## 4. Adapter Profile

```yaml
profile: expflow.relative-tree.v1

continuity_mode: reconstructed

identity_model:
  material: stable_node_identity_plus_immutable_revision
  occupancy: relative_path_within_immutable_tree_revision
  semantic: assertion_plus_immutable_decision

revision_model:
  material_revision: expflow_tree_revision
  external_revision: opaque_adapter_project_revision
  incremental_cursor: opaque_adapter_change_cursor

consistency:
  material: single_writer
  semantics: asynchronously_advancing
  projections: asynchronously_advancing
  post_commit_failure: material_success_automation_incomplete

observe:
  status: true
  inspect: true
  incremental_changes: true
  operation_resolution: true

act:
  init: true
  observational_sync: true
  mutating_sync: false
  restore: false
  projection_materialization: false
  regeneration: false

evaluate:
  equivalence: true

reconcile:
  operation_lookup: true
  idempotent_replay: true
  recovery_inspection: true
  incremental_cursor: true

unknown_outcomes:
  - regeneration
  - interrupted_post_commit_automation
  - lost_operation_response
```

---

## 5. Write-Authority Partition

The initial pilot uses:

| Boundary | Primary writer | Other access |
|---|---|---|
| Requirements and RTM state | Reqtrace | Read or observe |
| Project working tree | Patch-DIFF | Expflow observes |
| `.expflow/**` internal state | Expflow | Patch-DIFF excludes |
| Expflow restore | Disabled | Requires future profile revision or explicit policy |
| Projection materialization | Disabled | Requires future profile revision or explicit policy |
| Regeneration side effects | Disabled | Outcomes may be observed |

The adapter distinguishes:

### Observational sync

Expflow records working-tree changes already made by the primary working-tree writer.

Allowed in v1.

### Mutating sync

Expflow writes, restores, or materializes files into the working tree.

Not advertised in v1.

A later capability change requires a new profile revision or explicit bounded policy accepted by Guerilla.

---

## 6. External Operations

The adapter exposes:

```text
project.inspect
project.changes
operation.resolve
project.init
project.sync
evaluation.run
```

These are adapter operations, not Expflow core commands.

### `project.inspect`

Returns exact immutable records at one adapter project revision.

### `project.changes`

Returns an ordered incremental page after one opaque cursor.

### `operation.resolve`

Reconciles a possibly lost operation response.

### `project.init`

Invokes Expflow core initialization under capability policy.

### `project.sync`

Invokes observational Expflow sync only.

### `evaluation.run`

May invoke an equivalence evaluation that does not mutate the project working tree.

---

## 7. Exact Inspection

Inspection may include:

```text
trees
nodes
operations
authority_sources
authority_decisions
assertions
semantic_decisions
conflicts
workflows
manifests
regeneration
evaluations
reuse
automation
```

Each returned record contains:

- record family;
- stable record reference;
- schema URI;
- source digest where available;
- schema-valid record;
- exact adapter revision.

The response reports each requested family as:

```text
included
omitted
unavailable
truncated
```

The adapter must never invent a record because a family is unavailable.

---

## 8. Opaque Adapter Project Revision

The external revision token is:

```text
epr_<ULID>
```

Guerilla stores the token without interpreting it.

The adapter record internally resolves to:

- Expflow material head;
- semantic sequence;
- authority sequence;
- manifest-head digest;
- automation sequence;
- trigger references;
- canonical state digest.

The adapter revision advances whenever durable externally observable state changes, including:

- material-head advancement;
- authority registration or revocation;
- semantic decision;
- conflict declaration or resolution;
- workflow transition;
- manifest-head promotion;
- regeneration or equivalence result;
- durable automation-state transition.

Transient in-process progress need not advance the revision unless published as durable adapter state.

---

## 9. Incremental Change Cursor

The cursor is opaque:

```text
egcur_<ULID>
```

A change page contains:

- ordered adapter changes;
- next cursor;
- adapter revision;
- `has_more`;
- optional expiry.

Ordering is stable by adapter change sequence.

Cursor internals are not exposed.

An expired cursor returns `cursor_expired` and the earliest available replacement point. It does not silently start from the current state.

---

## 10. Adapter Operation Records

The adapter uses immutable stages:

```text
operation-attempt
operation-outcome
operation-recovery-event
```

### Attempt

Persisted before invoking Expflow core.

Contains:

- project;
- operation family;
- idempotency key;
- request digest;
- canonicalization profile;
- expected adapter revision;
- actor;
- start time;
- later core operation reference where known.

### Outcome

Persisted when the result is known.

Contains:

- material outcome;
- automation outcome;
- adapter revision;
- core operation reference;
- evidence;
- retryability.

### Recovery event

Appended when reconciliation finds new evidence.

The adapter never mutates an attempt into an outcome.

---

## 11. Idempotency Normalization

Profile:

```text
expflow-guerilla-jcs-v1
```

Request digest:

```text
SHA-256(canonical normalized adapter request)
```

### Included in identity

- profile;
- operation;
- project reference;
- expected adapter revision;
- operation parameters;
- path scope;
- ordered changes;
- identity directives;
- authority descriptors;
- workflow hints;
- policy-affecting options;
- actor fields declared by the profile as identity-bearing.

### Excluded

- request ID;
- trace ID;
- transport timestamp;
- retry count;
- response formatting;
- logging preferences.

### Normalization

- UTF-8;
- Unicode NFC;
- `/` path separator;
- collapse `.` and redundant separators;
- reject escaping `..`;
- canonical JSON object-key ordering;
- absent optional values remain absent;
- explicit `null` remains explicit;
- set-like arrays sort and deduplicate;
- ordered changes retain order.

### Scope

```text
project + operation family + idempotency key
```

### Reuse rules

- same key and same digest → return original resolution;
- same key and different digest → `idempotency_conflict`;
- expired retained history → `idempotency_history_expired`;
- never silently execute after expiry.

The initial profile retains attempt and outcome identity indefinitely.

---

## 12. Lost-Response Reconciliation

`operation.resolve` accepts one of:

```text
attempt ID
idempotency key
request digest
```

It returns:

- matching attempts;
- outcomes;
- recovery events;
- classification;
- adapter revision;
- evidence.

Classifications:

```text
committed_complete
committed_automation_incomplete
not_committed
rejected
failed
unknown
idempotency_conflict
history_expired
```

When evidence is insufficient, the adapter returns `unknown`.

It never infers success solely from a timed-out caller.

---

## 13. `partial_post_commit`

Expflow core may report that material commit succeeded while semantic or projection automation remains incomplete.

The adapter maps this to:

```text
status: partial
material_outcome: committed
automation_outcome: incomplete
```

Guerilla observes:

- a successful material operation;
- a separate unresolved automation condition;
- a later change when automation completes or fails durably.

It must not map this state to generic operation failure.

---

## 14. Tree Revision and Digest

The adapter preserves the Expflow tree revision and its core-defined content digest.

The adapter does not redefine tree identity.

It may expose the canonical tree digest preimage for inspection, but the source of truth remains the Expflow 2.3 core tree record.

---

## 15. Capability Enforcement

Before invoking an action, the adapter checks:

1. profile capability;
2. writer partition;
3. Guerilla intent scope;
4. expected adapter revision;
5. idempotency;
6. project policy.

Unsupported actions return `capability_unsupported`.

Write-boundary conflicts return `write_authority_denied`.

The adapter does not downgrade a prohibited action to a read-only approximation without explicitly reporting that no mutation occurred.

---

## 16. Guerilla Observation Mapping

The adapter emits bounded observations for:

- material node revisions;
- tree revisions and path occupancy;
- native operation receipts;
- authority source revisions;
- registration and semantic decisions;
- conflicts and review requests;
- source correspondence;
- workflow occurrences;
- virtual artifacts;
- materializations;
- manifest revisions;
- regeneration attempts;
- equivalence evaluations;
- reuse results;
- adapter automation state.

The adapter translates Expflow records. It does not recompute their semantic meaning.

---

## 17. Intent-Before-Action

Every supported action requires a Guerilla intent established before invocation.

The intent records:

- target project;
- operation;
- expected adapter revision;
- capability;
- state boundary;
- idempotency key;
- planned effect.

The adapter refuses an action whose effect exceeds the intent.

---

## 18. Regeneration and Evaluation

### Regeneration

Observable but not invokable in v1.

The adapter may report:

- queued;
- running;
- completed;
- failed;
- unknown;
- cancelled.

### Equivalence evaluation

May be enabled because it produces an attributed evaluation record without mutating the working tree.

An evaluation decision remains owned by Expflow’s semantic-decision model.

---

## 19. Recovery and Unknown Outcomes

Unknown outcomes include:

- lost operation response;
- interrupted post-commit automation;
- regeneration provider uncertainty.

Reconciliation uses:

- adapter operation records;
- Expflow core receipts;
- current immutable records;
- change history;
- recovery evidence.

An unknown outcome remains unknown until evidence changes.

---

## 20. Security

The adapter:

- receives no direct filesystem authority beyond its extension host;
- does not expose raw internal paths;
- bounds inspection pages;
- validates all core records against their schema;
- validates all adapter messages;
- excludes secret payload bodies unless policy permits;
- preserves source handling and licensing labels;
- does not execute imported or generated code;
- uses explicit credential allowlists;
- logs capability denials and revision conflicts.

---

## 21. Separate Repository Layout

```text
expflow-adapter-guerilla/
├── README.md
├── package.json
├── src/
│   ├── profile/
│   ├── client/
│   ├── inspection/
│   ├── revisions/
│   ├── changes/
│   ├── operations/
│   ├── idempotency/
│   ├── mapping/
│   ├── capabilities/
│   └── protocol/
├── schemas/
├── examples/
├── tests/
│   ├── contracts/
│   ├── mapping/
│   ├── recovery/
│   ├── idempotency/
│   ├── capabilities/
│   └── e2e/
└── docs/
```

The package imports only documented Expflow core exports and core schemas.

---

## 22. Contract-Closure Build Order

### Phase A1 — Profile and schemas

Freeze:

- operations;
- revision;
- cursor;
- inspection;
- operation stages;
- capability policy.

### Phase A2 — Core extension client

Implement the adapter-side wrapper over documented core exports.

No raw store access.

### Phase A3 — Revision and changes

Build:

- adapter revision advancement;
- change journal;
- cursor pagination.

### Phase A4 — Inspection

Implement exact record-family reads and bounded pages.

### Phase A5 — Idempotency and reconciliation

Implement:

- canonicalization;
- attempt/outcome/recovery;
- lost-response resolution.

### Phase A6 — Capability and writer policy

Enforce the initial read/write partition.

### Phase A7 — Observation mapping

Translate every supported Expflow record family into bounded Guerilla observations.

### Phase A8 — Pilot conformance

Test:

- direct and isolated host profiles;
- stale revision;
- partial post-commit;
- lost response;
- cursor pagination;
- unsupported restore;
- prohibited materialization;
- unknown regeneration;
- no raw internal access.

---

## 23. Registration Gate

The adapter may be registered only when:

1. every adapter schema validates;
2. valid and invalid fixtures pass;
3. opaque revision advancement is deterministic;
4. cursors are stable and bounded;
5. request normalization has golden vectors;
6. lost-response reconciliation passes;
7. `partial_post_commit` maps correctly;
8. restore and materialization are denied;
9. working-tree writer partition is enforced;
10. adapter code uses no undocumented core path or store;
11. Guerilla intent precedes every action;
12. all observation mappings are bounded and schema-valid.

---

## 24. Decision

Expflow core implementation may proceed independently.

The Guerilla adapter remains a separate contract and package.

Profile registration is blocked until the adapter registration gate passes.
