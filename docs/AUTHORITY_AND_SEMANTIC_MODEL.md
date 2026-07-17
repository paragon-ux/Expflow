# Authority and Semantic Model

**Status:** Gate C implementation

Authority, assertions, decisions, conflicts, and source correspondence are separate record families. Durable records are validated before immutable writes.

## Authority Sources

An authority-source descriptor is not accepted authority until a source-registration decision accepts it. Split and unified readable authority documents remain supported profiles and do not grant authority by themselves.

Gate C implements:

- immutable authority-source revisions;
- immutable source-registration decisions;
- split and unified readable authority document records;
- current-source projection derived from durable decision replay order, source supersession, and effective intervals;
- default source-scope conflict checks for overlapping accepted authority sources.

## Semantic Records

Gate C implements:

- semantic assertions as attributed proposals or claims;
- semantic decisions as immutable accept/reject/modify/defer/revoke/supersede records;
- conflicts that remain visible after resolution decisions;
- review requests;
- source correspondence records;
- artifact clusters as derived projection records;
- semantic change listing across the semantic record families.

Assertions and decisions remain distinct. Decisions supersede by reference without mutating earlier decisions.

Runtime validation rejects schema-shape drift before immutable writes, including extra attribution keys and malformed assertion claims supplied by untyped callers.

## Current Boundary

Gate C does not implement hook dispatch, external adapter inspection, change cursors, databases, brokers, network services, or source-content execution. Remote trust profiles and production hardening remain Gate D or adapter-package work.
