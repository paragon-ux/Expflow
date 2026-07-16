# EXPFLOW RELATIVE-TREE ADAPTER PROFILE

**Profile:** `expflow.relative-tree.v1`  
**Compatible core:** Expflow 2.3  
**Default pilot mode:** Observation-first

```yaml
profile: expflow.relative-tree.v1
continuity_mode: reconstructed

identity_model:
  material: stable_node_identity_plus_immutable_revision
  occupancy: relative_path_within_immutable_tree_revision
  semantic: assertion_plus_immutable_decision

revision_model:
  material_revision: expflow_tree_revision
  external_revision: opaque_adapter_project_revision
  incremental_cursor: opaque_adapter_change_cursor

consistency:
  material: single_writer
  semantics: asynchronously_advancing
  projections: asynchronously_advancing
  post_commit_failure: material_success_automation_incomplete

observe:
  status: true
  inspect: true
  incremental_changes: true
  operation_resolution: true

act:
  init: true
  observational_sync: true
  mutating_sync: false
  restore: false
  projection_materialization: false
  regeneration: false

evaluate:
  equivalence: true

reconcile:
  operation_lookup: true
  idempotent_replay: true
  recovery_inspection: true
  incremental_cursor: true

unknown_outcomes:
  - regeneration
  - interrupted_post_commit_automation
  - lost_operation_response
```

## Initial writer partition

| Boundary | Primary writer | Adapter access |
|---|---|---|
| Requirements and RTM state | Reqtrace | Observe |
| Project working tree | Patch-DIFF | Observe through Expflow sync |
| `.expflow/**` | Expflow | Read through documented extension only |
| Restore | Disabled | Deny |
| Projection materialization | Disabled | Deny |
| Regeneration side effects | Disabled | Observe only |
