# PR #5 Gate C Architecture Review

**Status:** RESOLVED LOCALLY
**Date:** 2026-07-17
**Review target:** PR #5, `feature/expflow-gate-c-authority-model`
**Retargeted head:** `c4890b639180f83a6f5976dfc90256319c6ed2f6`
**Resolution implementation commits:** `09a4b7d`, `311d83f`
**Base:** `main` after PR #4 merge commit `6fe8d823e9a57b21dc7474104f842a25d62b457e`

This report consolidates the initial PR review with Devin's architecture review. It is a mutable review artifact, not an immutable architecture source.

## Release Risk

The original review blocked Gate C because the implementation overclaimed AD-021 and AD-022, projection-head semantics were underspecified, and mutable evidence docs were stale. Implementation commit `09a4b7d` fixes F1, F3, F4, F5, F6, and the first F2 slice. Follow-up implementation commit `311d83f` closes the remaining F2 gap by rejecting undeclared keys in path selectors, authority effective intervals, authority document sections, and workflow selectors. PR #4 has merged, and PR #5 now targets `main` directly with clean merge state.

## Resolution Update

| ID  | Final status | Evidence                                                                                                                                                                                              | Impact                                                                                                                                                                                                        |
| --- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1  | fixed        | `src/core/record-validation.ts`, `src/authority/runtime.ts`, `src/projections/runtime.ts`, `src/reproduction/runtime.ts`, `tests/unit/authority-runtime.test.ts`, `tests/unit/gate-c-runtime.test.ts` | Required authority-document, manifest, and regeneration digests now reject missing/untyped values before immutable writes.                                                                                    |
| F2  | fixed        | `src/core/record-validation.ts`, `src/authority/runtime.ts`, `src/semantics/runtime.ts`, `tests/unit/authority-runtime.test.ts`, `tests/unit/gate-c-runtime.test.ts`                                  | Schema-owned nested objects reject extra keys before persistence, including attribution, semantic claims, path selectors, authority effective intervals, authority document sections, and workflow selectors. |
| F3  | fixed        | `src/workflows/runtime.ts`, `tests/unit/gate-c-runtime.test.ts`                                                                                                                                       | Accepted workflow completion now requires a non-null completion decision reference.                                                                                                                           |
| F4  | fixed        | `docs/CURRENT_STATUS_MATRIX.md`, `docs/completion_reports/GATE_C_COMPLETION_REPORT.md`, this review artifact                                                                                          | Mutable Gate C evidence is updated for the post-review implementation commits and retargeted PR reality.                                                                                                      |
| F5  | fixed        | `src/projections/runtime.ts`, `docs/ARCHITECTURE_DECISIONS.md`, `docs/WORKFLOW_AND_PROJECTION_MODEL.md`, `tests/unit/gate-c-runtime.test.ts`                                                          | Manifest heads are accepted-only derived views; terminal projection-status records remain visible without silently evicting accepted heads.                                                                   |
| F6  | fixed        | `src/authority/store.ts`, `tests/unit/authority-runtime.test.ts`                                                                                                                                      | Source-registration decisions replay in durable write order, so same-timestamp accept/revoke chains no longer depend on random ID order.                                                                      |

## Final F2 Follow-Up

The final Gate C review pass found F2 still open for three schema-owned authority shapes: path selectors, authority source `effective_interval`, and authority document `sections`. Commit `311d83f` fixes that follow-up by tightening `assertPathSelectorShape`, validating authority effective intervals with exact allowed keys, validating authority document sections with exact allowed keys, and adding regressions for authority and workflow selector shape drift.

## Devin Review Triage

| Devin item                                                                             | Triage                                                              | Integrated result            |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ---------------------------- |
| AD-021: validate durable records before immutable writes                               | Valid architecture decision, implementation not fully upheld        | Challenged by F1, F2, and F3 |
| AD-022: derive current authority from decisions, supersession, and effective intervals | Valid architecture decision, implementation not fully deterministic | Challenged by F6             |
| AD-023: family-specific runtimes, not generic database or command expansion            | Upheld by review                                                    | No finding                   |
| Decision register framing shift to Gate C implementation decisions                     | Acceptable mutable-register framing                                 | No finding                   |
| DS-C-SEMANTIC-TRUST partially resolved locally                                         | Acceptable as local-only scope wording                              | No finding                   |
| Manifest-head supersession deletion logic looks inverted                               | New actionable candidate                                            | Added as F5                  |
| Workflow completion guard bypass with `null`                                           | Duplicate of existing review finding                                | Covered by F3                |
| Current authority depends on wall-clock ordering with random ID tie-break              | New actionable candidate                                            | Added as F6                  |

## Candidate-Finding Ledger

| ID  | Reviewer priority | Candidate defect                                                                                                                            | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Suggested direction                                                                                                                                                                                                                                                                                                                                                |
| --- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| F1  | P1                | Required digest fields can be omitted and still reach immutable writes.                                                                     | `assertSha256Digest` accepts `undefined` in `src/core/record-validation.ts:23`; schema-required digest fields are assigned from inputs and validated through that optional helper in `src/authority/runtime.ts:128`, `src/authority/runtime.ts:199`, `src/projections/runtime.ts:52`, `src/projections/runtime.ts:86`, `src/reproduction/runtime.ts:81`, and `src/reproduction/runtime.ts:168`.                                                                                                                                | Split required and optional digest validators. Use required validation for schema-required digests, including authority document `content_digest`, manifest `content_digest`, and regeneration `prompt_digest`. Add JS-style/untyped missing-field regressions.                                                                                                    |
| F2  | P1                | Nested objects with `additionalProperties: false` are copied through without full schema-shape rejection.                                   | Semantic assertions copy `issuer` and `claims` from input in `src/semantics/runtime.ts:114` and `src/semantics/runtime.ts:118`; `assertRequestedBy` only checks `kind` and `name` in `src/core/record-validation.ts:68`; semantic assertion schema forbids extra issuer and claim keys in `schemas/semantic-assertion.schema.json:52` and `schemas/semantic-assertion.schema.json:123`.                                                                                                                                        | Validate full records with JSON Schema before immutable write, or normalize/whitelist nested objects before persistence. Add regressions for extra nested keys and missing claim `value`.                                                                                                                                                                          |
| F3  | P1                | Workflow completion can be marked `accepted` without an immutable completion decision ref.                                                  | `transitionWorkflowState` rejects only `undefined` in `src/workflows/runtime.ts:292`, while `stateTransitionRecord` preserves `null` via `input.completionDecisionRef ?? previous.completion_decision_ref` in `src/workflows/runtime.ts:132`.                                                                                                                                                                                                                                                                                  | Treat both `undefined` and `null` as missing when completion becomes `accepted`. Add a regression for `completionDecisionRef: null`.                                                                                                                                                                                                                               |
| F4  | P2                | Gate evidence docs are stale for the actual PR head and review state.                                                                       | `docs/CURRENT_STATUS_MATRIX.md:3` still says PR update pending; `docs/CURRENT_STATUS_MATRIX.md:115` still lists push/update as next; `docs/completion_reports/GATE_C_COMPLETION_REPORT.md:97` cites old commit `c44594e...`; `docs/completion_reports/GATE_C_COMPLETION_REPORT.md:98` still has the old PR title/update wording.                                                                                                                                                                                               | Update mutable status and completion report git summaries to PR #5 head `7df328d7883428942620301778a1e359346533b1`, current PR title, stacked-check reality, and current blocker state.                                                                                                                                                                            |
| F5  | P2                | Manifest-head terminal-status handling appears inverted or underspecified, so stale/superseded records may fail to retire an accepted head. | `manifestHeads` deletes the current head only when `current.manifest_revision_id === record.superseded_by` in `src/projections/runtime.ts:112`; architecture says a prior accepted manifest may be marked `stale` in `docs/architecture/EXPFLOW_PROTOCOL_SPEC_V2_3.md:410` and that stale/conflicted projections never silently replace accepted heads in `docs/architecture/EXPFLOW_IMPLEMENTATION_SPEC_V2_3.md:773`. Existing projection tests only cover accepted-head creation in `tests/unit/gate-c-runtime.test.ts:154`. | Clarify terminal-status head semantics. If terminal records retire a prior accepted head, compare against an explicit retired-head reference or otherwise derive the retired head correctly. If heads are strictly accepted-only, remove dead deletion logic and document that stale records do not evict heads. Add stale/superseded/conflicted head regressions. |
| F6  | P1                | Current-authority derivation can become order-nondeterministic when same-source decisions share the same millisecond timestamp.             | `listSourceRegistrationDecisions` sorts by `created_at` and then random `decision_id` in `src/authority/store.ts:132`; `recordSourceRegistrationDecision` stamps each decision with `new Date().toISOString()` in `src/authority/runtime.ts:407`; `currentAcceptedRefs` applies acceptance and revocation in that sorted order in `src/authority/runtime.ts:223`.                                                                                                                                                              | Add a causal ordering mechanism for decisions, such as a monotonic sequence, explicit predecessor/supersession requirement for revocation-like outcomes, or insertion-order-preserving immutable index. Add a regression with same-timestamp accept/revoke records.                                                                                                |

## ADR Impact

AD-021 is upheld after F1, F2, and F3. The runtime now distinguishes required and optional digest checks, rejects schema-owned nested shape drift for authority, semantic, and workflow records, and blocks accepted workflow completion without a decision reference.

AD-022 is upheld after F6. Source-registration decisions now replay from a durable insertion-order log before falling back to legacy timestamp ordering.

AD-023 is upheld by this review. The branch exposes family-specific runtimes and does not add a generic database, adapter cursor, or new ordinary command.

AD-024 was added to document F5's projection-head clarification: accepted manifest heads are accepted-only derived views, and stale/superseded/rejected/conflicted records do not silently evict them.

No System 1 or System 2 ADR addition is needed for this review. These findings are implementation and evidence issues against existing ADRs, not new process friction.

## Gate Readiness

Merge-ready after final validation. PR #5 targets `main`, has clean merge state, and no hosted check rollup is listed for the retargeted PR. Local validation evidence is current; no unresolved Gate C implementation blocker remains.

## Verification

Focused verification after the implementation commit:

| Command                                                                              | Exit code | Result         |
| ------------------------------------------------------------------------------------ | --------: | -------------- |
| `npm test -- tests/unit/authority-runtime.test.ts tests/unit/gate-c-runtime.test.ts` |         0 | PASS, 16 tests |
| `npm run typecheck`                                                                  |         0 | PASS           |
| `npm run lint`                                                                       |         0 | PASS           |

Broader component validation is recorded in `docs/completion_reports/GATE_C_COMPLETION_REPORT.md`.

## Triage And Implementation Prompt

```text
Work in this repository as the implementation agent.

Goal:
Independently validate, triage, and resolve every candidate finding from the review ledger.

Branch:
Use feature/expflow-gate-c-authority-model. Do not edit a protected branch.

Rules:
- Read repository instructions and inspect repository state before editing.
- Triage every finding ID: F1, F2, F3, F4, F5, F6.
- Inspect the implementation before accepting a finding as real.
- Classify each ID as fixed, not-reproducible, duplicate, intentional-behavior, or out-of-scope.
- Provide code- or test-based evidence for every non-fixed classification.
- Fix every confirmed in-scope defect, regardless of provisional priority.
- Preserve behavior not explicitly changed.
- Add or update regression tests for each fixed behavior.
- Do not overwrite unrelated user changes.
- Run repository-defined verification, using component commands when aggregate validation exceeds the agreed timeout.

Candidate findings:
- F1 - Required digest fields can be omitted before immutable writes.
- F2 - Nested objects with schema `additionalProperties: false` are not fully rejected.
- F3 - Accepted workflow completion accepts a null completion decision ref.
- F4 - Mutable Gate C status and completion evidence is stale for PR #5 head.
- F5 - Manifest-head terminal-status handling appears inverted or underspecified.
- F6 - Current-authority derivation can depend on random ID ordering for same-timestamp decisions.

Completion report:
- final status and evidence for every finding ID;
- changed files and behavioral impact;
- verification commands and results;
- PR #5 update status.
```
