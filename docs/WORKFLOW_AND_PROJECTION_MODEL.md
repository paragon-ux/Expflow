# Workflow and Projection Model

**Status:** Gate C implementation

Workflow ownership requires explicit workflow state, not inference from files alone.

## Workflow Occurrences

Workflow occurrences select input and output tree revisions and path selectors. Material status, completion status, verification status, and reuse status are separate fields and transition through new immutable records.

Attaching output material records `outputs_present`; it does not imply accepted completion, verification, or reuse.

## Virtual Artifacts And Materialization

Virtual artifacts are explicit records tied to workflow occurrences. Materialization events link a virtual artifact to material output by attribution. A materialization event does not mutate the virtual artifact or imply workflow acceptance.

## Projections

Manifest revisions are immutable projection records. Their readable locators must live under `.expflow/projections/`, which is excluded from working-tree scanning.

Deterministic projectors may produce generated or accepted manifests under policy. Model-assisted manifests default to `proposed` and require model/prompt evidence and acceptance attribution before accepted state is allowed.

Manifest heads are accepted-only derived views. Stale, superseded, rejected, and conflicted manifest records remain inspectable evidence but do not silently remove or replace the last accepted manifest head.

## Regeneration, Equivalence, And Reuse

Regeneration attempts preserve unknown outcomes as durable records. Equivalence is an attributed evaluation record, not an inferred fact. Structural reuse creates reuse-result records gated by license and authority-policy checks and does not transfer authority, completion, verification, or reuse status from the source workflow.

## Current Boundary

Gate C records projection and reproduction state but does not run projectors, call models, execute generated code, dispatch hooks, inspect adapters, reconcile lost responses, or add ordinary commands beyond `init`, `sync`, `status`, and `restore`.
