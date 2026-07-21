# Orientation

**Status:** pass-start orientation controls

Read this folder at the start of every implementation, review, or validation pass.

| Document                                          | Purpose                                                              |
| ------------------------------------------------- | -------------------------------------------------------------------- |
| [System 1 Improvements](SYSTEM_1_IMPROVEMENTS.md) | Small operational rules that prevent avoidable stalls and confusion. |
| [System 2 Improvements](SYSTEM_2_IMPROVEMENTS.md) | Review and gate-scope rules for larger design friction.              |

## Pass Start Checklist

1. Confirm the current branch and worktree state.
2. Confirm the controlling source for the question being answered.
3. Use command timeouts that match the expected command duration.
4. Do not run commands in parallel when they write the same output directories.
5. Keep validation claims aligned with what the command actually proves.
6. Identify affected top-level directory READMEs and update each affected README once before handoff; do not recurse into subdirectory READMEs unless explicitly requested.
7. Before proposing new state, synchronization, history, or enforcement machinery, classify whether Git already supplies the required substrate and whether the project only needs domain-specific semantics above it.
8. Escalate repository-control changes to System 2 execution when Git-state semantics, multiple enforcement surfaces, or a risk of semantically false `PASS` results make ordinary validation insufficient.

## Mutable ADR Process

These documents are mutable orientation aids. They are intentionally outside formatting and contract validation, but they still need a disciplined update path.

Recognize friction when a pass stalls, repeats the same correction, produces an avoidable false blocker, debates the controlling source, or expands scope because maturity was unclear.

Choose the target document before adding anything:

- Use System 1 when the friction is a small execution, validation, tooling, or source-orientation rule.
- Use System 2 when the friction is about review scope, gate maturity, future-gate decisions, or design-level classification.

Add an ADR when the same friction is likely to recur. Use the next `ADR-S1-###` or `ADR-S2-###` identifier, state the issue, state the rule or decision, and name what stall it prevents. Keep the ADR short enough to use at pass start.

Challenge an existing ADR when it causes confusion, contradicts a higher source of truth, adds process drag without preventing a stall, or no longer fits the project state. Because these documents are mutable, edit the ADR directly, preserve the useful reason if it still applies, and remove stale wording instead of adding a second contradictory rule.
