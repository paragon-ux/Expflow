# Phase Prompts

**Status:** mutable build-prompt inventory
**Controlling workflow:** `docs/architecture/EXPFLOW_WORKFLOW_CURRENT.md`

This directory indexes phase-specific build prompts and gate checklists. These files are mutable execution controls, not immutable architecture sources.

## Inventory

| File                                           | Status                | Purpose                                                               |
| ---------------------------------------------- | --------------------- | --------------------------------------------------------------------- |
| `FINAL_CONTRACT_MATERIAL_CORE_CHECKLIST.md`    | Gate B local evidence | Checklist for the material-core gate before PR review and hosted CI   |
| `PHASE_09_AUTHORITY_MODEL.md`                  | Gate C complete       | Authority-source, registration-decision, and authority-document work  |
| `PHASE_10_SEMANTIC_OWNERSHIP.md`               | Gate C complete       | Semantic assertions, decisions, conflicts, review, and correspondence |
| `PHASE_11_WORKFLOW_BOUNDARIES.md`              | Gate C complete       | Workflow occurrences, virtual artifacts, and materialization events   |
| `PHASE_12_PROJECTION_SYSTEM.md`                | Gate C complete       | Manifest revisions, projection roots, and manifest heads              |
| `PHASE_13_REGENERATION_EQUIVALENCE.md`         | Gate C complete       | Regeneration attempts and equivalence evaluations                     |
| `PHASE_14_STRUCTURAL_REUSE.md`                 | Gate C complete       | Structural reuse records and policy gates                             |
| `FINAL_OWNERSHIP_REPRODUCTION_CHECKLIST.md`    | Gate C checklist      | Final Gate C ownership and reproduction checklist                     |
| `PHASE_15_SECURITY_EXECUTION_BOUNDARIES.md`    | Gate D complete       | Security and execution-boundary hardening                             |
| `PHASE_16_LEGACY_MIGRATION_PACKAGING.md`       | Gate D complete       | Legacy migration evidence and package verification                    |
| `PHASE_17_END_TO_END_PROOF.md`                 | Gate D complete       | End-to-end proof automation                                           |
| `FINAL_EXPFLOW_CORE_CHECKLIST.md`              | Gate D checklist      | Final Expflow core checklist                                          |
| `GATE_D_PRODUCTION_RELEASE_CLOSEOUT_PROMPT.md` | Release closeout      | Gate D durability closeout plus external v1 release readiness         |

## Notes

Do not use this directory to override `EXPFLOW_WORKFLOW_CURRENT.md` or immutable architecture sources.
