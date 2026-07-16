# EXPFLOW 2.3 REVIEW RESOLUTION

**Status:** Complete
**Version:** 2.3
**Result:** Core and adapter contracts separated as agreed.

---

## 1. Decision

Expflow core retains the minimal native operation surface:

```text
expflow init
expflow sync
expflow status
expflow restore
```

The core remains responsible for:

- immutable material nodes and node revisions;
- immutable project-tree revisions;
- authority-source registration;
- readable authority documents;
- assertions, decisions, conflicts, and review requests;
- workflow occurrences;
- managed projections;
- regeneration, equivalence evaluation, and structural reuse records.

---

## 2. Contracts Deferred From Core

The following contracts are intentionally excluded from Expflow core and assigned to separately versioned adapter profiles:

- exact external inspection operations;
- composite external project revisions;
- incremental change cursors;
- adapter request normalization;
- adapter idempotency keys and retention;
- adapter operation attempts, outcomes, and recovery events;
- lost-response reconciliation;
- external capability policy;
- cross-adapter write-authority partitioning;
- external observation mapping.

These contracts may use documented core extension exports and normative core schemas.

Adapters must not:

- read undocumented `.expflow` storage;
- import internal store implementations;
- mutate Expflow records directly;
- expand the core user-facing command surface.

---

## 3. Core Contract Changes

Version 2.3 makes these core changes:

1. `tree-entry` includes `node_content_digest`.
2. `tree-revision.content_digest` uses a frozen canonical preimage.
3. Adapter-facing idempotency is removed from the core operation plan.
4. Core mutations retain opaque native operation IDs and immutable receipts.
5. A documented extension boundary is added for separate packages.
6. Core schemas and examples advance to version 2.3.

---

## 4. Tree-Content Digest Resolution

The tree digest covers canonical immutable tree content.

It includes:

- schema version;
- tree path selector;
- normalized tree entries;
- node IDs and revisions;
- referenced node-content digests;
- folder and filename occupancy;
- external locators;
- occupancy status;
- sorted removed paths.

It excludes:

- tree revision ID;
- parent revision;
- operation ID;
- creation timestamp;
- notes.

Entries are sorted by normalized relative path and entry kind before canonical UTF-8 JSON encoding and SHA-256 hashing.

---

## 5. Native Operation Resolution

Expflow core guarantees:

- an opaque operation ID;
- an immutable operation receipt;
- material head before and after;
- material outcome;
- post-commit automation state;
- evidence references.

Expflow core does not guarantee:

- a cross-system request digest;
- external idempotency-key grammar;
- idempotency retention;
- lost-response lookup;
- composite external revision;
- incremental external cursor.

Those guarantees belong to the adapter profile.

---

## 6. Separate Guerilla Adapter Resolution

The Guerilla adapter is a separate package.

It owns:

- `project.inspect`;
- `project.changes`;
- `operation.resolve`;
- opaque adapter project revisions;
- change cursors;
- adapter-level request canonicalization;
- idempotent replay;
- operation attempts, outcomes, and recovery events;
- capability restrictions;
- writer partitioning;
- bounded Guerilla observation mapping.

The initial adapter profile permits:

- exact observation;
- incremental changes;
- operation resolution;
- initialization;
- observational sync;
- optional equivalence evaluation.

The initial profile disables:

- mutating sync;
- restore;
- projection materialization;
- regeneration invocation.

---

## 7. Writer-Partition Resolution

The initial integration boundary is:

| Boundary | Primary writer | Other access |
|---|---|---|
| Requirements and RTM state | Reqtrace | Read or observe |
| Project working tree | Patch-DIFF | Expflow observes |
| `.expflow/**` internal state | Expflow | Adapter uses documented extension reads |
| Expflow restore | Disabled | Requires later capability revision |
| Projection materialization | Disabled | Requires later capability revision |
| Regeneration side effects | Disabled | Outcomes may be observed |

---

## 8. Workflow-Package Alignment

The Expflow workflow package is aligned with this boundary.

The core workflow:

- builds only the four native operations;
- freezes native receipts and tree-digest behavior;
- documents the extension host;
- excludes adapter inspection, revision, cursor, idempotency, reconciliation, capability, and writer-partition contracts;
- hands adapter development to a separate package after the required core gate.

---

## 9. Final Resolution

> Expflow 2.3 is resolved as an adapter-neutral core with a minimal native command surface and a documented extension boundary. External inspection, composite revisions, cursors, idempotency, reconciliation, capabilities, and writer partitioning are owned by separately versioned adapter profiles.
