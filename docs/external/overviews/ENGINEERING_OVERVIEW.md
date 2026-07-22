# Engineering Overview

## Engineering proposition

The architecture improves four existing tool categories by moving correctness out of conversational convention and into durable, testable system boundaries:

- Reqtrace makes authorization and coverage properties of the project state.
- FIMP makes localization, review, concurrency, and publication properties of one immutable mutation transaction.
- Guerilla makes cross-system causality and uncertainty properties of an append-only event view.
- Expflow makes artifact identity, authority, decisions, and workflow continuity properties of a portable workflow store.

The filesystem and native systems remain the persistent data plane. Reqtrace, FIMP, and Expflow are model-facing control planes/ACIs. Guerilla is the causal event projection across profiled CLI operations.

## Architecture at a glance

```text
Human / Model / CI
        |
        +--> Reqtrace: behavioral-control ACI
        +--> FIMP: conditional-mutation ACI
        +--> Expflow: workflow version-control ACI
        |
        v
Persistent project data plane
filesystem / Git / tests / documents / native stores
        |
        +--> Guerilla: profile-driven invocation evidence
                          -> normalized event records
                          -> causal DAG / event view
                          -> native authority links
```

The CLI is the interoperability seam. Profiles and contracts describe how operations are invoked and observed; they do not make Guerilla authoritative for the state of every profiled system.

## Mechanism-to-utility map

| Project  | Category defect                                                                                                                                               | Engineering mechanism                                                                                                                                                                                                         | Resulting system property                                                                                                                        |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Reqtrace | Traceability links become stale, forward-only, or disconnected from actual behavior.                                                                          | Separate actual and expected matrices, test-backed extraction, proof asymmetry, human reconciliation, resolved bidirectional RTM, and change-control validation.                                                              | Every retained deliverable is either authorized and evidenced or explicitly classified as uncontrolled, divergent, undelivered, or unauthorized. |
| FIMP     | Models repeatedly construct fragile coordinates and context for each hunk; local success can hide transaction-wide failure.                                   | Immutable manifest, strong base identity, local census, batched Anchor Matrix, optional parser evidence, one selected replay, complete preview, validator read sets, OCC, atomic publication, and recovery receipts.          | Model-facing cost is concentrated on real ambiguity; the only visible state change is the complete approved result against the evaluated base.   |
| Guerilla | Tool logs show local events but not causal relationships or authoritative outcomes across systems.                                                            | Data-only profiles, managed CLI invocation, before/after observations, typed outcome reconciliation, append-only event nodes, causal edges, and native record references.                                                     | Cross-system history is resumable and inspectable without replacing native authority or turning missing evidence into success.                   |
| Expflow  | Repository and chat histories cannot jointly represent pre-materialized artifacts, identity across exports/imports, scoped authority, or workflow acceptance. | Immutable material trees, authority-source decisions, semantic records, workflow occurrences, virtual artifacts, materialization events, projections, regeneration/equivalence/reuse records, and portable export boundaries. | The workflow remains inspectable and transferable across tools while material state, claims, decisions, and acceptance remain distinct.          |

## Reqtrace engineering model

Reqtrace treats a requirement as the fundamental control unit, not a label attached to code after the fact.

### Actual and expected are independent

Actual behavior is derived from tests and the implementation regions they exercise. Expected behavior is derived independently from requirements, specifications, issues, ADRs, and related product sources. Neither automatically overrides the other.

### Proof asymmetry bounds brownfield recovery

Determining the original purpose of uncovered code may require extensive reasoning. Proving that the behavior is uncontrolled requires only the absence of test-backed requirement linkage. This lets the system identify a control gap without first solving full semantic reconstruction.

### Reconciliation creates the authority boundary

Human-controlled reconciliation records matches, mismatches, accepted divergences, missing evidence, splits, removals, and required edits. The resolved matrix becomes the control plane for later development. A Change Control Report evaluates proposed edits against both traceability directions.

**Engineering improvement:** traditional RTM links become enforceable invariants over the accepted behavioral surface.

## FIMP engineering model

FIMP is globally geometry-blind, not content-blind. The model knows the local content and transformation it intends, but it does not emit a universal file coordinate that must survive drift.

### Batched localization changes the cost boundary

For a transaction with many hunks, the runtime performs local candidate analysis for every hunk. Unique targets are resolved without model-facing context. Ambiguous targets are packaged together as independent local dictionaries in one Anchor Matrix. Parser-derived ancestry can compactly distinguish candidates without becoming the universal authority.

The model-facing cost is therefore closer to:

```text
manifest intent + JIT evidence for ambiguous hunks + one resolution round
```

rather than:

```text
heavy coordinate/context construction + clarification/retry for every hunk
```

This is an amortization claim, not a claim that all runtime search is logarithmic. Runtime discovery still evaluates candidates; the improvement is that broad context, coordinate payloads, and model interaction are not multiplied across hunks that do not need them.

### Complete replay preserves cross-hunk causality

Local choices are provisional. The runtime reloads the immutable base and applies every selected hunk sequentially. A later hunk that becomes absent, ambiguous, or mismatched rejects the complete transaction instead of preserving a successful prefix.

### Approval and publication are separate boundaries

Mechanical validation proves the transaction can execute. Complete preview approval decides whether the result is intended. Strong state and validator read-set checks ensure that the approved representation is the one published. Prepared-publication evidence makes lost responses recoverable.

**Engineering improvement:** agent editing becomes a conditional resource-update protocol rather than a collection of best-effort text substitutions.

## Guerilla engineering model

Guerilla is a profile-driven hook and event-view system, not a family of state-owning adapters.

### Profiles define the observation contract

A profile declares how to detect a native system, which CLI commands and operation classes are supported, what resources or paths it owns or references, which observations are required, and what security boundaries apply.

### Event records preserve the causal envelope

An event node records initiating intent, native launch, inputs or state references, observations, outcome classification, and downstream causal edges. It can reference Expflow revisions, FIMP receipts, Reqtrace rows, Git commits, validation results, and other native records without duplicating their authority.

### Outcome reconciliation prevents false certainty

Exit status, response delivery, and authoritative state are separate evidence sources. A missing response can remain unknown. An asynchronous operation can remain pending. Conflicting evidence can remain authority-inconsistent. Later probes may strengthen the classification without mutating the historical event.

**Engineering improvement:** agent observability becomes a cross-system causal journal with typed uncertainty rather than a flat command log.

## Expflow engineering model

Expflow is an authority-reconciliation workflow VCS rather than a branch-and-merge clone.

### Material history remains complete

Immutable node and complete tree revisions preserve the material project state and support sync, drift inspection, restoration, receipts, and recovery.

### Workflow history begins before materialization

Virtual artifacts, source records, export/import evidence, materialization events, and artifact correspondence let the system represent the workflow before and after a file appears in the repository.

### Authority is scoped

Chat platforms, cloud libraries, users, filesystems, repositories, and imported records may each be authoritative for different claims. Immutable registration and semantic decisions preserve scope, attribution, supersession, conflicts, and effective intervals without declaring one source globally authoritative.

### Completion and reuse are explicit decisions

Material output does not imply accepted completion. Regeneration does not imply equivalence. Equivalence does not imply verification. Accepted work does not automatically transfer its authority or acceptance into a reused workflow.

**Engineering improvement:** version control expands from material bytes and paths to the artifact, decision, and workflow state required for portability.

## Shared invariants

- Native systems retain authority over their own state.
- Historical records and decisions are immutable or append-only.
- Observation is distinct from authority.
- Proposal is distinct from acceptance.
- Material success is distinct from semantic completion.
- Unknown, partial, rejected, and inconsistent outcomes remain explicit.
- State-changing operations bind to an identified base and produce recoverable evidence.
- The GUI is a client over durable contracts, not a hidden canonical store.

## Interoperability and the revised timeline

The earlier plan aligned Expflow adapter gates with a Guerilla adapter-based external-compatibility Gate D. That plan is superseded. Guerilla is now the profile-driven universal hook and causal event layer.

The current engineering order is:

1. repair Expflow’s user-facing CLI and UX;
2. expose advanced Expflow functions through stable read models and an optional GUI;
3. implement evidence intake and portable workflow round trips;
4. dogfood and correct missing engineering and functional behavior through a real pilot;
5. stabilize Guerilla profiles and event semantics against the resulting native interfaces;
6. build the Guerilla causal GUI at the end of the timeline.

## Current engineering proof boundary

| Project  | Demonstrated or frozen                                                                                                                          | Still requiring proof                                                                                                  |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Expflow  | Public v1.1.0 CLI, immutable material runtime, advanced TypeScript record-family runtimes, packaging, recovery, and local conformance evidence. | User-facing advanced queries, broad evidence intake, portable round trip, large pilots, GUI, and empirical evaluation. |
| FIMP     | Locked architecture and normative protocol with deterministic targeting, preview, OCC, publication, and recovery semantics.                     | Reference runtime conformance, comparative benchmarks, and real multi-hunk cost measurements.                          |
| Guerilla | Profile-driven universal-hook and causal-DAG architecture direction.                                                                            | Stable profile runtime, cross-system reconciliation evidence, security validation, and final event-view GUI.           |
| Reqtrace | Detailed bidirectional recovery, reconciliation, and change-control model.                                                                      | Product implementation, repository-scale extraction quality, UX validation, and operational enforcement.               |
