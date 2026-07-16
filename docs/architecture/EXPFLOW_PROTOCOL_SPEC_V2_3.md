# EXPFLOW PROTOCOL SPECIFICATION

## Versioned Tree, Authority, Decision, and Workflow Operations

**Version:** 2.3-draft  
**Protocol version:** 2.2  
**Status:** Lock candidate

---

## 1. Purpose

The Expflow protocol exposes a small operation surface over:

- immutable material trees;
- extensible authority sources;
- readable authority documents;
- semantic assertions and decisions;
- workflow occurrences;
- manifest projections;
- regeneration, evaluation, and reuse.

---

## 2. Public Operations

```text
project.init
project.sync
project.status
revision.restore
```

CLI names:

```text
expflow init
expflow sync
expflow status
expflow restore
```

No additional public operation is required for normal use.

---

## 3. Request Envelope

```json
{
  "protocol_version": "2.3",
  "request_id": "req_...",
  "operation": "project.sync",
  "project_root": "...",
  "expected_head": "eft_... or null",
  "idempotency_key": "... or null",
  "actor": {
    "kind": "user|agent|policy|integration|model|system",
    "name": "...",
    "version": null,
    "model": null
  },
  "params": {}
}
```

---

## 4. Response Envelope

```json
{
  "protocol_version": "2.3",
  "request_id": "req_...",
  "operation": "project.sync",
  "status": "success|no_change|requires_review|rejected|partial|failed",
  "result": {},
  "warnings": [],
  "error": null
}
```

---

## 5. `project.init`

### Request parameters

```json
{
  "project_id": null,
  "policy_profile": "default",
  "hook_profile": "default",
  "authority_document_profile": "mixed",
  "authority_source_descriptors": []
}
```

### Behavior

The runtime:

1. creates `.expflow/`;
2. scans the user tree;
3. creates immutable node revisions;
4. commits tree sequence 1;
5. stages supplied authority descriptors;
6. creates configured registration decisions;
7. runs enabled post-commit projections.

---

## 6. `project.sync`

### Request parameters

```json
{
  "scope": {
    "root": ".",
    "include": ["**/*"],
    "exclude": []
  },
  "changed_path_hints": [],
  "changes": [
    {
      "kind": "modify",
      "path": "authorities/spec.md",
      "from_path": null,
      "identity_directive": "auto",
      "node_id": null,
      "node_revision": null,
      "basis_note": null
    }
  ],
  "authority_source_refs": [],
  "authority_source_descriptors": [],
  "authority_document_descriptors": [],
  "workflow_hints": [],
  "automation": {
    "run_structural_validation": true,
    "run_semantic_assertions": true,
    "detect_workflows": true,
    "project_manifests": true,
    "semantic_refresh_on_no_change": false
  },
  "dry_run": false
}
```

### Behavior

The runtime:

1. acquires the lock;
2. checks expected head;
3. scans selected paths;
4. resolves identity directives;
5. creates immutable object and node revisions;
6. creates the candidate project tree;
7. stages authority records;
8. runs blocking validation;
9. commits material and deterministic records;
10. advances head;
11. records receipt;
12. runs post-commit automation;
13. updates derived status.

---

## 7. Identity Rules

### `auto`

- same path plus changed bytes → next revision of same node;
- new path → new node;
- no digest-based identity preservation.

### `preserve`

Caller declares continuity.

For move plus unchanged bytes, preserve revision.

For move plus changed bytes, create next revision of the same node.

### `new`

Create a new node even when the path existed previously.

### `replace`

End prior path occupancy and create a new node at the path.

### Digest similarity

May create an assertion of type `cluster_proposal` or `materialization_link`.

It does not alter material identity.

---

## 8. `project.status`

Returns `status-report.schema.json`.

A refresh may compare the working tree to head without committing.

Status includes:

- project head;
- drift;
- authority source state;
- open conflicts;
- review requests;
- workflow boundaries and states;
- accepted, proposed, stale, and conflicted manifest heads;
- pending and failed hooks;
- recommended action.

---

## 9. `revision.restore`

Supported references:

```text
tree:<tree_revision_id>
node:<node_id>@<revision>:<target_path>
```

Restore creates a new committed tree revision.

It never rewrites old history.

---

## 10. Authority Source Registration

A source descriptor conforms to `authority-source.schema.json`.

A registration decision conforms to `source-registration-decision.schema.json`.

Source state is derived:

```text
accepted
rejected
revoked
superseded
deferred
```

A descriptor without an acceptance decision is not an accepted authority source.

---

## 11. Authority Document Profiles

### Split

One readable document sidecar references one authority role section.

### Unified

One readable document sidecar references several role-separated sections with stable anchors.

The protocol treats both profiles as first-class.

---

## 12. Assertions and Decisions

Assertions conform to `semantic-assertion.schema.json`.

Decisions conform to `semantic-decision.schema.json`.

A decision may:

```text
accept
reject
modify
defer
revoke
supersede
```

Current semantic state is derived from decisions.

Mutable acceptance fields are non-authoritative.

---

## 13. Conflicts

A conflict contains:

- subjects;
- competing claim refs;
- authority scope;
- severity;
- optional review request.

A resolution is a semantic decision of kind `conflict_resolution`.

Original claims remain.

---

## 14. Source Correspondence

Source correspondence is optional and semantic.

It maps an external source record to candidate entries in a committed tree.

The selected entry becomes accepted only through a semantic decision.

The material tree does not depend on correspondence acceptance.

---

## 15. Workflow Occurrence

A workflow occurrence must pin:

- input tree revision;
- input path selector;
- start operation;
- accepted authority source revisions.

It may later attach:

- output tree revision;
- output path selector;
- completion operation;
- virtual artifacts;
- decisions.

The project tree must not be treated as the workflow import tree without an explicit selector.

---

## 16. Workflow State

### Material

```text
inputs_pinned
outputs_present
outputs_incomplete
```

### Completion

```text
none
asserted
accepted
rejected
conflicted
```

### Verification

```text
not_evaluated
passed
failed
partial
```

### Reuse

```text
not_evaluated
eligible
approved
rejected
```

Path presence may affect material state only.

---

## 17. Manifest Projection

### Storage

All generated projections are under:

```text
.expflow/projections/
```

This path is excluded from scanning.

### Deterministic projector

May produce `generated` and then `accepted` under policy when all semantic inputs are already accepted.

### Model-assisted projector

Produces `proposed` unless an acceptance decision exists.

### Current head

Only an accepted revision may become the accepted manifest head.

### Staleness

A new source decision or tree change may mark a prior accepted manifest `stale`. The readable prior content remains available.

### User-tree materialization

Requires a `materialize_projection` change in `project.sync`.

---

## 18. Virtual Artifacts

A virtual artifact may exist without bytes.

A materialization event links it to a material node revision.

The link is attributed and may be accepted or contested through semantic decisions.

---

## 19. Regeneration

A regeneration attempt pins:

- source workflow;
- exact input tree;
- target;
- model profile;
- prompt digest;
- tools;
- security profile.

Statuses:

```text
queued
running
completed
failed
unknown
cancelled
```

Unknown outcomes remain explicit until reconciled.

---

## 20. Equivalence Evaluation

Classification:

```text
exact
representation_equivalent
workflow_equivalent
divergent
incomplete
failed
```

An evaluation is attributed evidence.

A workflow verification decision may accept or reject its conclusion.

---

## 21. Structural Reuse

A reuse result references:

- accepted reference occurrence;
- accepted reference manifest;
- new input tree;
- output occurrence;
- deviation summary;
- semantic-leakage evaluation;
- acceptance decision.

Reuse must respect authority-source licensing and reuse restrictions.

---

## 22. Hook Protocol

Input is one `hook-envelope`.

Output depends on hook kind:

| Hook | Output |
|---|---|
| pre-commit validation | validation result |
| post-commit assertion | semantic assertions |
| workflow detection | assertions or workflow proposals |
| deterministic projection | manifest revision plus content |
| model-assisted projection | proposed manifest revision plus content |
| regeneration | regeneration attempt update and outputs |
| equivalence evaluation | equivalence evaluation |
| structural reuse | reuse result |

Semantic hooks cannot modify material state.

---

## 23. Projector Guarantees

### Deterministic

Same accepted inputs and projector version produce the same content digest.

### Model-assisted

Configuration is reproducibly recorded, but exact output determinism is not claimed.

The exact generated content is pinned by digest.

---

## 24. Adapter Contract Deferral

The core protocol defines only:

```text
project.init
project.sync
project.status
revision.restore
```

The following are not core protocol operations:

```text
project.inspect
project.changes
operation.resolve
```

The core protocol also does not define:

- a cross-system composite project revision;
- an adapter change cursor;
- adapter request normalization;
- external idempotency-key scope or retention;
- lost-response reconciliation;
- cross-adapter write authority;
- integrating-system capability policy.

A separately versioned adapter profile may define these contracts using documented extension exports and schema-valid immutable records.

The core assigns an opaque operation ID and writes an immutable operation receipt for each native operation. Adapter-level attempt, outcome, recovery, and replay records remain adapter-owned.

## 25. Concurrency

One material transaction holds the project lock.

Read-only status uses immutable head state.

Manifest-head promotion uses compare-and-swap.

Semantic records may be written concurrently when they have independent identifiers.

---

## 26. Recovery

Recovery classes:

```text
uncommitted_stage
objects_committed_records_incomplete
tree_committed_head_not_advanced
head_advanced_receipt_incomplete
post_commit_automation_incomplete
```

Recovery repairs structural state or reschedules hooks.

It does not invent source or semantic decisions.

---

## 27. Security Protocol

### Paths and archives

- reject traversal;
- reject unsafe links;
- quarantine archives;
- enforce extraction bounds.

### Model hooks

- treat source content as data;
- use instruction/data separation;
- do not execute generated code;
- restrict environment and network;
- enforce size and time limits.

### Privacy

- support local-only processing;
- redact configured secret patterns;
- minimize chat export fields;
- record remote disclosure.

### Licensing

- carry license and reuse restrictions;
- block reuse under policy when restricted.

---

## 28. Error Classes

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
schema_invalid
validation_failed
hook_failed
hook_timeout
hook_output_invalid
authority_source_unaccepted
authority_scope_conflict
semantic_conflict
review_required
manifest_projection_failed
manifest_acceptance_required
restore_conflict
idempotency_conflict
license_restriction
privacy_policy_violation
operation_recovery_required
internal_error
```

---

## 29. Conformance Profiles

### Core material profile

- four operations;
- immutable nodes and trees;
- mandatory digests;
- write-isolated storage;
- restore;
- recovery.

### Ownership profile

- authority sources;
- split/unified documents;
- assertions;
- decisions;
- conflicts;
- correspondence;
- workflows.

### Automation profile

- Python hooks;
- deterministic and model-assisted projections;
- integrated status;
- retries.

### Reproduction profile

- virtual artifacts;
- regeneration;
- equivalence evaluation;
- structural reuse.

A full Expflow 2.3 implementation supports all profiles.
