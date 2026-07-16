# Workflow and Projection Model

**Status:** Gate A Phase 2 baseline

Workflow ownership requires explicit workflow state, not inference from files alone.

## Workflow Occurrences

Workflow occurrences select input and output tree revisions and path selectors. Material status, completion status, verification status, and reuse status are separate concerns.

## Projections

Deterministic projectors use accepted material records, accepted decisions, and fixed template versions. Model-assisted projectors also record model profile, prompt digest, and source limitations. Model-assisted output is proposed by default.

## Materialization

A projection becomes a user-tree artifact only through an explicit sync operation with `materialize_projection`.

## Gate A Boundary

No workflow runtime, projector, regeneration algorithm, equivalence evaluator, or reuse algorithm exists in Gate A.
