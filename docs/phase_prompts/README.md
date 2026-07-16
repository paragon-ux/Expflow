# Phase Prompts

**Status:** mutable build-prompt inventory
**Controlling workflow:** `docs/architecture/EXPFLOW_WORKFLOW_CURRENT.md`

This directory indexes phase-specific build prompts and gate checklists. These files are mutable execution controls, not immutable architecture sources.

## Inventory

| File                                        | Status                | Purpose                                                              |
| ------------------------------------------- | --------------------- | -------------------------------------------------------------------- |
| `FINAL_CONTRACT_MATERIAL_CORE_CHECKLIST.md` | Gate B local evidence | Checklist for the material-core gate before PR review and hosted CI  |
| `PHASE_09_AUTHORITY_MODEL.md`               | Gate C Phase 9        | Authority-source, registration-decision, and authority-document work |

## Notes

Add phase prompts or final checklists as phases complete. Do not use this directory to override `EXPFLOW_WORKFLOW_CURRENT.md` or immutable architecture sources.
