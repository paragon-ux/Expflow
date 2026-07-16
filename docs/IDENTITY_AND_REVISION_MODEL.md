# Identity and Revision Model

**Status:** Gate B implemented baseline

Material identity is opaque and continuity-based.

## Rules

- Same-path modifications default to the next revision of the same node.
- Explicit `new` and `replace` directives override defaults.
- Only explicit `preserve` intent preserves identity across moves.
- Digest similarity may produce semantic proposals, but it never silently preserves material identity.

## Revision Ordering

Tree revisions represent complete project-tree states. Workflow occurrences select input and output tree revisions and path selectors, separating project state from workflow scope.

## Gate B Implementation

- Same-path changed bytes create the next revision of the same node by default.
- Explicit `preserve` move directives preserve identity and reuse an unchanged revision when bytes match.
- Explicit `new` and `replace` directives allocate a new node at the path.
- Digest-similar add/remove patterns are reported as proposals and never preserve identity without `preserve`.
- Node and tree revisions remain immutable after commit.
