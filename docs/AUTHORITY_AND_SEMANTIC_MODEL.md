# Authority and Semantic Model

**Status:** Gate A Phase 2 baseline

Authority is extensible, but acceptance requires immutable decisions.

## Authority Sources

An authority-source descriptor is not accepted authority until a source-registration decision accepts it. Split and unified readable authority documents remain supported profiles.

## Semantic Records

- Assertions are attributed claims.
- Decisions accept, reject, modify, defer, revoke, or supersede assertions and sources.
- Conflicts and review requests remain visible after resolution.
- Source correspondence records connect imported evidence to Expflow records without making source content authoritative.

## Gate A Boundary

Gate A validates schemas and examples for these records. It does not implement source registration, decision stores, derived current semantic state, or conflict workflows.
