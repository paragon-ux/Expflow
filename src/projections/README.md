# projections

**Gate C implementation.** This directory owns immutable manifest revisions, projection-head derivation, projection-root validation, and model-assisted proposal defaults.

Projection metadata must reference `.expflow/projections/`, which is scanner-excluded. Model-assisted manifests default to `proposed` and require attribution plus prompt evidence before they can be accepted.

This directory does not trigger `sync`, execute projectors, call models, dispatch hooks, or make projections authoritative material state.
