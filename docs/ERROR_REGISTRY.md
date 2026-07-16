# Error Registry

**Status:** Gate A Phase 2 baseline

Core error codes are contract values. Gate A records them for schema and fixture work; no runtime emits these errors yet.

## Required Error Codes

- `project_not_initialized`
- `project_already_initialized`
- `project_locked`
- `stale_head`
- `unsafe_relative_path`
- `duplicate_path`
- `symlink_rejected`
- `archive_rejected`
- `object_integrity_failed`
- `node_revision_missing`
- `tree_revision_missing`
- `object_missing`
- `schema_invalid`
- `validation_failed`
- `hook_failed`
- `hook_timeout`
- `hook_output_invalid`
- `authority_source_unaccepted`
- `authority_scope_conflict`
- `semantic_conflict`
- `review_required`
- `projection_self_observation`
- `manifest_projection_failed`
- `manifest_acceptance_required`
- `restore_conflict`
- `idempotency_conflict`
- `license_restriction`
- `privacy_policy_violation`
- `operation_recovery_required`
- `internal_error`

Every emitted runtime error in later phases must include code, message, operation ID when available, recoverable flag, recommended action, and details.
