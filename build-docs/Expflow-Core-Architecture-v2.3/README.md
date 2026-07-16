# Expflow Core Architecture 2.3

This package is the Expflow 2.3 core lock candidate.

## Core papers

- `EXPFLOW_CONCEPT_PAPER_V2_3.md`
- `EXPFLOW_IMPLEMENTATION_SPEC_V2_3.md`
- `EXPFLOW_PROTOCOL_SPEC_V2_3.md`
- `EXPFLOW_PROJECT_SNAPSHOT_V2_3.md`
- `Note-On-Architecture.md`
- `RELATED_WORK.md`
- `V2_3_ARCHITECTURE_DELTA.md`

## Core boundary

The native operation surface remains:

```text
init
sync
status
restore
```

Adapter-specific inspection, composite revision, cursor, idempotency,
reconciliation, capability, and writer-partition contracts are intentionally
excluded from the core package and defined in separate adapter profiles.

## Machine contracts

The package retains 26 normative core schemas and conforming examples.
