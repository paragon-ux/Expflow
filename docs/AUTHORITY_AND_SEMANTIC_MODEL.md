# Authority and Semantic Model

**Status:** Gate C Phase 9 authority-model implementation

Authority is extensible, but acceptance requires immutable decisions.

## Authority Sources

An authority-source descriptor is not accepted authority until a source-registration decision accepts it. Split and unified readable authority documents remain supported profiles.

Gate C Phase 9 implements:

- immutable authority-source revisions;
- immutable source-registration decisions;
- split and unified readable authority document records;
- a current-source projection derived from decisions;
- default source-scope conflict checks for overlapping accepted authority sources.

## Semantic Records

- Assertions are attributed claims.
- Decisions accept, reject, modify, defer, revoke, or supersede assertions and sources.
- Conflicts and review requests remain visible after resolution.
- Source correspondence records connect imported evidence to Expflow records without making source content authoritative.

## Current Boundary

Phase 9 does not implement semantic assertion stores, semantic decision stores, conflicts, review requests, source correspondence, workflow occurrences, projections, regeneration, equivalence, or reuse.
