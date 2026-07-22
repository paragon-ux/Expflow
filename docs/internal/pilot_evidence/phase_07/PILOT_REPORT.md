# Phase 7 Pilot Report

**Pilot:** repository-owned documentation evidence workflow
**Gate:** BW-C - Pilot Proven
**Branch:** `feat/build-week-phase-07-pilot-evaluation`
**Entry base:** `bbdb28375d42c1317ddd1b3e3c6b4ca113e3d0c5`
**Participant:** Codex as repository execution agent
**Data policy:** no private data, no secrets, no external participant material

## Outcome

The pilot completed one real repository-owned documentation workflow using Expflow ordinary CLI commands. It produced durable observations for initialization, status, sync preview, sync commit, history, restore preview, restore refusal, and post-fix relocation status.

The pilot found one product defect: initialized project metadata persisted a machine-absolute `root_path`. That defect was fixed during the phase by storing `root_path` as `.` for new project records. A focused regression and post-fix pilot scan verified the correction.

## Workflow Evidence

- `status` before initialization exited `0` and gave initialization guidance.
- `init` created a project and initial material tree.
- `status` reported clean and drifted states distinctly.
- `sync --dry-run` previewed changes without committing.
- `sync` committed real changes to `raw-observations.md`.
- `status --history` listed restorable tree revisions.
- `restore --dry-run` previewed affected paths.
- default `restore` refused conflicting unrecorded drift with exit `1`.
- post-fix initialized metadata no longer persisted a local absolute `root_path`.
- copied post-fix project state reported clean status from a relocated temporary directory.

## Claims Supported

- Expflow ordinary CLI can track a small repository-owned documentation workflow with understandable status, preview, sync, history, and restore-safety behavior.
- Default restore refusal prevents silent overwrite of conflicting unrecorded drift in this workflow.
- New project metadata no longer stores a machine-absolute root path after the Phase 7 fix.

## Claims Not Supported

- This pilot does not prove broad adoption.
- This pilot does not prove GUI usability.
- This pilot does not prove multi-user empirical outcomes.
- This pilot does not provide production support evidence.

## Follow-Up

- A later pilot should include at least one external human participant or independent operator.
- GUI tasks should receive separate usability evidence before any GUI adoption claim.
- Portable workflow package usability should be tested with richer advanced workflow records.
