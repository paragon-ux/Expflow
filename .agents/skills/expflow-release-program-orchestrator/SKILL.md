---
name: expflow-release-program-orchestrator
description: >-
  Orchestrate the Expflow 1.1.1 to 1.2.0 sequential release program.
  Phase dispatch, gate evaluation, program state management.
---

## Required Reading Roles

1. `repository_governance`
2. `active_workflow`

# Expflow Release Program Orchestrator v3.0.0

This skill governs the sequential release of Expflow 1.1.1 (GUI distribution) and 1.2.0 (actor-ambivalent workflow control).

## Every Pass Start

1. Verify `PACKAGE_MANIFEST.json` integrity and package identity
2. Read mutable phase/gate state from `run/state/program.json`; before G0, use manifest bootstrap metadata
3. Read `RELEASE_PROGRAM_WORKFLOW_CURRENT.md` and the active phase prompt
4. Reject any requested phase that is not the active phase
5. Execute the phase following the review lifecycle
6. Advance state only from an accepted PASS report
7. At gate phases, invoke aggregate gate review

## Evidence Distinction

- **Pre-release evidence** (G1, G3): local validation, CI, package verification
- **Post-release evidence** (G2, G6): registry metadata, clean installation, installed command behavior, release artifacts

## Phase Gates

- Phase 1 only after G0 activation
- Phase 2 only after G1
- Phase 3 only after G2
- Phase 4 only after G3
- Phases 5–7 only after accepted reports for the immediately preceding non-gate phase
- Phase 8 only after G4
- Phase 9 only after G5

## Review Cadence

- One comprehensive independent review per phase (precision review in `phase` mode)
- Bounded closure review only for frozen findings
- One aggregate gate review per gate (precision review in `gate` mode)
- Post-release verification for G2 and G6 (precision review in `post-release` mode)

## Implementation Discipline

1. Establish concrete requirement
2. Inspect existing implementation
3. Reproduce gap when applicable
4. Make smallest architecture-consistent change
5. Add focused tests
6. Run focused checks
7. Inspect diff
8. Checkpoint coherent work

## Prohibited Actions

- Launch recursive agent hierarchies
- Implement later-phase placeholders
- Broaden scope to consume remaining context
- Rerun unchanged expensive checks repeatedly
- Weaken tests or governance to obtain a pass
- Modify user-owned unrelated work
- Allow reviewer to implement
- Merge directly to main without user authorization

## Stop Conditions

Stop when: authority conflicts, scope ambiguous, controls missing, protected surface threatened, compatibility broken, working-tree ambiguous, validation untrustworthy, context insufficient.

## Handoff

Record exact Git state, last passing check, completed workstreams, remaining workstreams, blocker, next bounded action.
