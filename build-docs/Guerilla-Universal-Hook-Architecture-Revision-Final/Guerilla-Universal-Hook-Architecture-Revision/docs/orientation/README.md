# Guerilla Orientation

**Status:** pass-start shared-understanding controls  
**Architecture revision:** universal hook model finalized for Gate D  
**Applies to:** implementation, review, validation, documentation revision, and external conformance passes

Read this folder before the current workflow and implementation specification at the start of every pass.

| Document | Role |
|---|---|
| [System 1 Improvements](SYSTEM_1_IMPROVEMENTS.md) | Fast operational rules learned from repeated execution friction |
| [System 2 Improvements](SYSTEM_2_IMPROVEMENTS.md) | Deliberate architectural and review decisions learned from larger design friction |

## Why This Orientation Exists

The System 1/System 2 names use the familiar *Thinking, Fast and Slow* metaphor:

- **System 1** captures fast, reusable operating rules that should be applied automatically before a pass stalls.
- **System 2** captures slower architectural distinctions and review decisions that must be applied deliberately when scope or meaning is disputed.

These documents are not a probabilistic memory layer and are not a substitute for repository evidence. They are mutable, explicit records of evaluated mutual understanding.

Their purpose is to make the best current interpretation persist across:

- tasks;
- agents;
- review cycles;
- gates;
- repositories;
- external conformance projects.

They should be as deterministic as written language and the executing agent permit.

## Source Roles

The controlling documents have different jobs:

| Source | Controls |
|---|---|
| User task and accepted decisions | Immediate authorized objective |
| `docs/GUERILLA_WORKFLOW_CURRENT.md` | Process, phase order, gate ownership, evidence, and stop conditions |
| `docs/architecture/GUERILLA_UNIVERSAL_HOOK_IMPLEMENTATION_SPEC.md` | Required runtime behavior and architecture |
| `docs/orientation/SYSTEM_1_IMPROVEMENTS.md` | Reusable execution defaults |
| `docs/orientation/SYSTEM_2_IMPROVEMENTS.md` | Reusable architectural and review classifications |
| Machine contracts and accepted architecture decisions | Exact persisted and protocol behavior |
| Current status and completion reports | Mutable implementation evidence |

Orientation records refine how a pass uses the workflow and specification. They do not silently override them.

When an orientation ADR conflicts with a controlling source, stop the affected work, identify the conflict, and revise or remove the ADR.

## Pass Start Checklist

1. Inspect branch, worktree, current revision, open PR, and hosted-check state.
2. Read this README and both System documents.
3. Read the current workflow sections owning the task.
4. Read the implementation-spec sections governing the behavior.
5. Confirm whether the requested work changes:
   - authoritative DAG behavior;
   - hook/conformance behavior;
   - a declarative system profile;
   - an exceptional provider driver;
   - derived views only;
   - documentation or evidence only.
6. Confirm the current gate and maturity class.
7. Apply the finalized Gate D defaults:
   - data-only profiles;
   - exact profile pinning;
   - fail-closed unknown commands;
   - Guerilla-owned reconciliation;
   - resynchronization deduplication by native boundary evidence;
   - Git as the required unrelated CLI conformance profile.
8. State what evidence will prove completion.
9. Preserve native command semantics and external state authority.

## Pass End Checklist

1. Rerun focused validation after the final edit.
2. Update mutable status and completion evidence.
3. Update affected top-level README maps once.
4. Record recurring friction in the correct System document.
5. Challenge any ADR made stale by the pass.
6. Report exact delivered behavior, not intended future behavior.

## Mutable ADR Process

Add or revise an ADR when a pass:

- repeats a correction already encountered;
- stalls on a preventable operating issue;
- confuses hook behavior with DAG authority;
- creates a bespoke integration where a profile is sufficient;
- treats a driver as a separate continuity engine;
- pulls future-gate scope into the current gate;
- overstates what a fixture or test proves;
- discovers that a prior rule no longer fits the architecture.

Use the next `ADR-S1-###` or `ADR-S2-###` identifier.

Revise an existing ADR in place when it is stale or too broad. Preserve the useful reason, delete obsolete wording, and do not accumulate contradictory rules.

## Locked Orientation Principle

> The workflow drives process.  
> The specification drives implementation.  
> System 1 and System 2 improve how both are applied.  
> The Guerilla DAG preserves lineage and continuity; it does not replace external application state.
