# Identity and Revision Model

**Status:** Gate A Phase 2 baseline

Material identity is opaque and continuity-based.

## Rules

- Same-path modifications default to the next revision of the same node.
- Explicit `new` and `replace` directives override defaults.
- Only explicit `preserve` intent preserves identity across moves.
- Digest similarity may produce semantic proposals, but it never silently preserves material identity.

## Revision Ordering

Tree revisions represent complete project-tree states. Workflow occurrences select input and output tree revisions and path selectors, separating project state from workflow scope.

## Deferred Implementation

No identity resolver, digest comparison, move detection, or revision store exists in Gate A. These rules are frozen as contracts for later material-core phases.
