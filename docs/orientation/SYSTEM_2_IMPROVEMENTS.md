# System 2 Improvements

**Status:** Gate A review-control document
**Scope:** Prevent over-expansion when a gate stalls on future-gate evidence.

System 2 improvements are design and review-control ADRs. They do not add implementation scope by themselves; they clarify how a gate should reason when evidence, maturity, and future decisions are being conflated.

## Recognizing System 2 Friction

System 2 friction appears when progress stalls because the team is debating the shape of the work instead of the next owned deliverable. It usually involves unclear maturity, later-gate decisions being pulled forward, overbroad completion wording, or a review finding that is valid only because the artifact claims too much.

Add or update a System 2 ADR when the fix is a reusable classification rule, review response, or gate-scope decision that future passes should apply before expanding work.

## Adding Or Challenging A System 2 ADR

Add a new ADR with the next `ADR-S2-###` identifier when no existing ADR covers the friction. Use this shape: `Issue`, `Decision`, `Review Response`, and, when useful, a gate-specific application.

Challenge an existing ADR when it misclassifies gate ownership, contradicts the controlling workflow source, hides a future-gate decision, or creates unnecessary current-gate scope. Because this document is mutable, revise the ADR in place, preserving the useful classification rule and deleting stale scope claims. Do not add a competing ADR for the same design rule unless the old one is being split into clearer rules.

## ADR-S2-001 Gate Maturity Classification

### Issue

Use this document when review friction appears because a gate completion claim is being interpreted as requiring all later-gate implementation decisions, fixtures, tests, or generated artifacts immediately.

Typical signals:

- a review asks the current gate to finish choices owned by later gates;
- a completion report says "complete" while the evidence only proves a harness, taxonomy, or seed corpus;
- a validation command proves parseability or coverage of existing files, but the report claims exhaustive behavior coverage;
- generated descriptors are described as full generated interfaces or runtime models;
- progress stalls because the team is expanding artifacts instead of clarifying maturity.

### Decision

When a gate stalls, classify the disputed artifact before adding scope.

| Class                   | Meaning                                                                | Correct action                                                      |
| ----------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Invariant               | A rule that later gates must preserve.                                 | Freeze it now and verify it if practical.                           |
| Decision slot           | A concrete later-gate choice.                                          | Name the slot, owner gate, and constraints; do not decide it early. |
| Harness                 | Validation machinery that proves future evidence can be checked.       | Keep the harness small and truthful about what it proves.           |
| Seed evidence           | Minimal examples or fixtures that exercise the harness.                | Preserve them as seeds and assign full coverage to the owning gate. |
| Implementation evidence | Behavior, recovery, compatibility, or security proof for runtime code. | Require it only when the owning runtime exists.                     |

### Review Response

If a finding is valid only because wording overclaims maturity, fix the wording and add the missing slot or maturity label. Do not expand the artifact to satisfy future-gate work unless the current gate owns that behavior.

If a finding exposes a missing current-gate invariant, add the invariant and verify it.

If a finding exposes missing behavior evidence for a later gate, create or reference a decision slot, fixture category, or test obligation for that later gate.

### Gate A Application

Gate A closes when it has:

- immutable architecture sources and source-integrity verification;
- frozen no-runtime, command-surface, source-immutability, core/adapter, and record-family invariants;
- machine-readable schema and registry checks;
- seeded fixtures proving the fixture harness works;
- generated schema descriptors proving schema inventory coverage;
- TypeScript and Python validation parity for supplied examples and seeded fixtures;
- future decision slots for later-gate implementation choices.

Gate A does not close by exhaustively deciding material storage, identity algorithms, transaction recovery, semantic trust policy, projection behavior, hardening policy, or end-to-end runtime proof.

### Larger-Scale Check

Before marking any future gate complete, reviewers should ask:

1. Is every "complete" claim backed by evidence at the same maturity level?
2. Are later-gate choices represented as decision slots instead of hidden assumptions?
3. Are fixture and test claims scoped to implemented behavior?
4. Are generated artifacts named according to what they actually provide?
5. Did the gate add only the evidence needed for its owning behavior?

If any answer is no, the fix is to correct the claim, add a slot, or move the obligation to the owning gate. The default fix is not to expand the current gate.
