# EXPFLOW PROJECT SNAPSHOT

## Version 2.3 Lock Candidate

**Version:** 2.3-draft  
**Date:** 2026-07-15  
**Status:** Architecture and machine-contract lock candidate; implementation not started

---

## 1. Current Definition

Expflow is an automation-oriented workflow ownership and observability platform.

It combines:

- immutable material node revisions;
- immutable complete project tree revisions;
- explicit workflow input and output tree scopes;
- extensible registered authority sources;
- split or unified readable authority documents;
- attributed semantic assertions;
- immutable semantic and registration decisions;
- explicit conflicts and review requests;
- optional source correspondence;
- virtual artifacts and materialization events;
- accepted and proposed manifest revisions;
- regeneration, equivalence evaluation, and structural reuse records.

---

## 2. Current Public Interface

```text
expflow init
expflow sync
expflow status
expflow restore
```

`sync` is the normal operation.

It supports:

- changed-path hints;
- explicit move continuity;
- explicit new or replacement identity;
- path scope;
- authority-source descriptors;
- authority-document descriptors;
- workflow hints;
- projection materialization;
- dry run;
- machine-readable output.

---

## 3. Adapter Deferral

Expflow core remains adapter-neutral.

The core package does not freeze:

- exact external inspection operations;
- composite project revision tokens;
- change cursors;
- adapter idempotency normalization;
- adapter receipt reconciliation;
- cross-system capability policy;
- external write-authority partitioning.

These belong to separately packaged adapter profiles.

The core exports only documented extension points and normative record schemas. Adapters must not read undocumented internal storage.

## 4. Material Model

### Node

Opaque material continuity identity.

### Node revision

Immutable write-isolated bytes with mandatory SHA-256 digest.

### Path occupancy

Actual folder, filename, and relative path for one node revision in one tree revision.

### Tree revision

Complete immutable project state.

### Workflow tree scope

A workflow occurrence selects an input tree revision and path selector, then later an output tree revision and selector.

Project state and workflow scope are no longer conflated.

---

## 5. Identity Policy

### Same path

Default: next revision of the same node.

Override:

```text
new
replace
```

### Move

Only explicit preserve intent automatically retains node identity.

### Digest similarity

Creates a semantic proposal only. It does not silently preserve material identity.

---

## 6. Authority Model

Any schema-conforming authority source may be registered.

Registration is governed by immutable decisions.

Built-in common roles remain:

- chat actual artifact history;
- LLM artifact assertion;
- user-provided event history.

They are not the only permitted source types.

Readable authority documents support:

- split profile;
- unified cross-actor profile.

---

## 7. Semantic Ownership

Assertions and decisions are distinct.

A model or hook may automatically record an assertion.

Acceptance, rejection, modification, deferral, revocation, and supersession are durable decisions.

Clusters and current semantic state are derived views.

Conflicts remain visible after resolution.

---

## 8. Import Model

### Import-tree manifest

Required projection of the exact selected material tree and path scope.

### Source correspondence

Optional mapping from weak chat or external records to candidate tree entries.

There is no duplicate import store.

---

## 9. Projection Model

Generated files live under:

```text
.expflow/projections/
```

This location is excluded from scanning.

### Deterministic projector

May be accepted automatically under policy when all inputs are accepted.

### Model-assisted projector

Produces a proposed manifest by default.

### Materialized projection

Requires an explicit sync change and becomes a normal material node in the user tree.

---

## 10. Workflow State

Workflow state is separated into:

- material status;
- completion assertion and decision;
- verification;
- reuse eligibility and approval.

Output path presence does not prove accepted completion.

---

## 11. Regeneration and Reuse

The MVP contract includes:

- regeneration attempts;
- unknown outcome handling;
- equivalence evaluations;
- verification decisions;
- structural reuse results;
- semantic leakage evaluation references;
- reuse acceptance.

These are no longer aspirational claims outside the implementation contract.

---

## 12. Security Position

The lock candidate requires:

- archive quarantine;
- extraction bounds;
- path and symlink safety;
- source-content instruction isolation;
- no execution of imported or generated code by semantic hooks;
- secret and privacy policy;
- local-only hook profiles;
- licensing and reuse restrictions;
- bounded process resources.

---

## 13. Normative Schema Set

The stack contains 26 JSON Schema 2020-12 contracts.

Material and operation:

```text
path-selector
project
node-revision
tree-entry
tree-revision
operation-plan
validation-result
operation-receipt
hook-envelope
status-report
```

Authority and semantics:

```text
authority-source
authority-document
source-registration-decision
semantic-assertion
semantic-decision
conflict
review-request
source-correspondence
artifact-cluster
```

Workflow and reproduction:

```text
workflow-occurrence
virtual-artifact
materialization-event
manifest-revision
regeneration-attempt
equivalence-evaluation
reuse-result
```

---

## 14. Lock Resolution

The following prior blockers are resolved in 2.2:

1. extensible authority-source registration;
2. split and unified readable authority profiles;
3. immutable decisions and conflicts;
4. source correspondence separated from tree inventory;
5. scanner-excluded projection storage;
6. explicit identity overrides;
7. no digest-based silent continuity;
8. explicit workflow input/output scope;
9. proposed versus accepted manifests;
10. mandatory digests and write-isolated history;
11. regeneration, evaluation, and reuse contracts;
12. separated completion states;
13. deterministic versus model-assisted projectors;
14. expanded semantic-hook security;
15. consistent 2.2 versioning.

---

## 15. Readiness

### Architecture

```text
PASS FOR LOCK REVIEW
```

### Schemas

```text
META-VALIDATED
```

### Examples

```text
INCLUDED; cross-schema validation required in CI
```

### Implementation

```text
NOT STARTED
```

### Migration

```text
SPECIFIED, NOT EXECUTED
```

---

## 16. Remaining Configuration Choices

These do not change architecture:

- specific ULID library;
- lock implementation;
- supported reflink platforms;
- first model provider;
- first editor or Git integration;
- exact readable manifest styling;
- default trusted authority-source policy;
- default local-only versus remote semantic profile.

---

## 17. Immediate Build Order

1. Lock schemas and fixture corpus.
2. Generate TypeScript and Python types.
3. Build immutable object, node, tree, project, and head stores.
4. Build identity-aware sync.
5. Build atomic commit and recovery.
6. Expose four commands.
7. Add authority registration and readable document profiles.
8. Add decisions, conflicts, and correspondence.
9. Add workflow boundaries and virtual artifacts.
10. Add projection acceptance.
11. Add regeneration, evaluation, and reuse.
12. Add security profiles.
13. Migrate a representative legacy project.
14. Pass the end-to-end conformance scenarios.

---

## 18. Lock Statement

> Expflow 2.3 is tentatively locked as a schema-governed platform in which a small sync-oriented command surface versions material trees automatically, while extensible authority sources, attributed assertions, durable decisions, explicit workflow scopes, accepted manifests, and evaluated reuse preserve workflow ownership.
