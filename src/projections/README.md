# projections

**Gate C implementation.** This directory owns immutable manifest revisions, projection-head derivation, projection-root validation, and model-assisted proposal defaults.

Projection metadata must reference `.expflow/projections/`, which is scanner-excluded. Model-assisted manifests default to `proposed` and require attribution plus prompt evidence before they can be accepted. Manifest heads are derived only from accepted revisions; stale, superseded, rejected, and conflicted records remain visible without evicting the accepted head.

This directory does not trigger `sync`, execute projectors, call models, dispatch hooks, or make projections authoritative material state.
