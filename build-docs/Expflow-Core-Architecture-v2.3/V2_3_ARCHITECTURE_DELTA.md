# EXPFLOW 2.3 ARCHITECTURE DELTA

**Status:** Complete

## Core Decision

Expflow core retains:

```text
expflow init
expflow sync
expflow status
expflow restore
```

The core continues to own material revisions, authority sources, assertions, decisions, workflow occurrences, projections, regeneration, evaluation, and reuse records.

## Deferred to Adapter Profiles

The following are not core contracts:

- exact external inspection;
- incremental change reads;
- operation resolution after lost responses;
- composite external project revisions;
- adapter change cursors;
- adapter request canonicalization and idempotency retention;
- adapter attempt, outcome, and recovery records;
- integrating-system capability matrices;
- cross-adapter writer partitioning.

Each adapter owns and versions these contracts independently.

## Core Integrity Improvements

Version 2.3 freezes:

- the tree-content digest preimage;
- per-entry material content digests inside the tree digest input;
- native operation IDs and receipts without claiming cross-system reconciliation;
- documented extension exports for separate packages;
- no raw internal-store access by adapters.

## Schema Compatibility

The schema version advances because:

- tree entries include `node_content_digest`;
- operation plans no longer carry an adapter-facing idempotency key;
- all schema identifiers and examples advance to 2.3.
