# Expflow Codex Workflow Package

This package contains:

- `EXPFLOW_WORKFLOW_CURRENT.md` — the complete gated Expflow core build workflow;
- `Expflow-Kickoff-Prompt.md` — the executable Codex prompt for Phase 1 only.

The separate `Expflow-Guerilla-Adapter-Profile-Prompt.md` is intentionally not part of the core package because the adapter is a separately publishable package and must not shape Expflow internal storage.

The workflow accepts the counter-proposal’s core separation:

- four ordinary Expflow commands;
- documented core extension exports;
- adapter-specific inspection, revisions, cursors, reconciliation, and idempotency deferred to separate packages;
- separate adapter implementation.
