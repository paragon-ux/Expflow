# Task Packet

## Task

Produce an evidence-backed Phase 7 pilot packet showing how Expflow behaves while tracking a real repository-owned documentation workflow.

## Baseline Practice

Without Expflow, the repository uses Git history and human-written reports to describe evidence. Git records changed bytes and commits, but it does not provide an ordinary project-local `status`, `sync`, `restore`, or material-history workflow inside the evidence workspace.

## Planned Expflow Use

- Use `status` before initialization to confirm safe read-only guidance.
- Use `init` to create local Expflow state.
- Use `status` and `sync --dry-run` to inspect changes.
- Use `sync` to record a material revision.
- Use `status --history` and `restore --dry-run` to inspect recovery paths.
- Create a conflicting drift scenario and verify default restore refusal.

## Observations

Observations are recorded in `raw-observations.md` before metrics are interpreted.
