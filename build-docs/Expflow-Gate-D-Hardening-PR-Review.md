# Code Review

## Verdict

BLOCK

## Review Target

- Repository: `paragon-ux/Expflow`
- Active PR: [#7 Gate D native hardening closure](https://github.com/paragon-ux/Expflow/pull/7)
- Reviewed branch: `codex/gate-d-hardening-review-format`
- Reviewed head: `61bb5e81c3fbafcadd8708b2ea5b30ccc384ba7f`
- Baseline: `main` after merged PR #6 at `2b194f10f839aa227d151241777d7ddb1cd721e0`
- Related merged PR: [#6 Gate D hardening and proof](https://github.com/paragon-ux/Expflow/pull/6)
- Review lens: Gate D native durability closure plus Devin architecture review in `C:\Users\USER\Downloads\Expflow-Core-Architecture-v\Devin_Review_2.txt`
- Related locked architecture: `build-docs/Guerilla-Universal-Hook-Architecture-Revision-Final/Guerilla-Universal-Hook-Architecture-Revision/`

## Release Risk

The PR is architecturally sound in direction: immutable material data is written before mutable heads, restore now has a recoverable intent, stale locks are classified by liveness, and Guerilla remains an observation/profile boundary rather than core behavior. The remaining release risk is that recovery still decides the latest material head from receipt timestamp order with a random operation-id tie-break. That can repair `HEAD` backward from a newer committed tree to an older committed tree, so Gate D native durability closure is not complete until receipt/head repair is causal and the supporting durability evidence is tightened.

## Prior Finding Closure Context

This review treats the current PR #7 implementation for F1-F9 as trusted unless later evidence contradicts it. Do not reopen F1-F9 as separate work unless a new reproduction shows they remain false.

| ID | Current status | Trusted closure basis |
| --- | --- | --- |
| F1 | FIXED | Restore computes and validates the target material state, writes a `restore_working_tree` recovery intent, commits material records and receipt, then mutates the working tree. |
| F2 | FIXED WITH DCR-2 FOLLOW-UP | Immutable objects and JSON records use operation-scoped staging and final promotion. DCR-2 tightens the file-sync failure contract so this cannot degrade into silent non-durability. |
| F3 | FIXED | Recovery classifies stale, live, foreign-host, and malformed locks and refuses live or ambiguous owners. |
| F4 | FIXED WITH F10 FOLLOW-UP | Recovery repairs `HEAD` and `project.json` from committed receipts, but F10 requires the repair source to be causal instead of timestamp/random-id ordered. |
| F5 | FIXED | Init writes an `init_project` intent and publishes `project.json` only after the first material records and receipt exist. |
| F6 | FIXED WITH DCR-3 FOLLOW-UP | Fault-injection tests now cover real sync/init/restore boundaries. DCR-3 adds convergence evidence for interrupted recovery itself. |
| F7 | FIXED | Operation-scoped staging is now part of immutable-object, immutable-record, and restore replacement-byte installation. |
| F8 | FIXED WITH DCR-5 FOLLOW-UP | Gate D docs distinguish functional proof and native durability hardening. DCR-5 prevents renewed overclaiming after the final fix. |
| F9 | FIXED | Restored tree records persist restore-specific `removed_paths`, and tree verification recomputes `content_digest` from persisted entries, removed paths, and scope. |

## Candidate-Finding Ledger

| ID | Reviewer priority | Candidate defect | Evidence | Suggested direction |
| --- | --- | --- | --- | --- |
| F10 | P1 | Receipt-based head repair can move `HEAD` backward when committed receipts share the same `finished_at`. | `src/material/store.ts:412-423` sorts receipts by `finished_at`, then random `operation_id`; `src/transactions/recovery.ts:239-253` picks the last receipt from that order. A controlled review reproduction with equal receipt timestamps rewrote `HEAD` from tree sequence 3 back to sequence 2. | Derive mutable-head repair from verified material causality: tree `sequence`, parent chain, and receipt `previous_head/new_head` consistency. Do not use wall-clock receipt time or operation ID as the repair authority. Report ambiguous forks as unrepaired findings instead of silently choosing one. Add a regression with equal receipt timestamps. |

## Devin Durability Escalation

The following items are acceptance criteria for the F10 durability fix, not optional polish and not separate future-gate work. They convert Devin's architecture observations into a self-reinforcing Gate D closure contract.

| ID | Escalated requirement | Required outcome |
| --- | --- | --- |
| DCR-1 | Causal receipt/head repair | Recovery must select the repair head from verified tree causality, not receipt timestamp ordering. The selected tree must have a matching material-success receipt, a valid tree digest, a consistent parent chain, and the highest unambiguous committed material sequence reachable for the project. |
| DCR-2 | File durability failures surface | Regular file fsync/write verification failures for staged immutable objects, immutable JSON records, and restore replacement bytes must fail the operation or recovery path. Directory fsync may remain best-effort only with explicit comments/docs because OS support varies. |
| DCR-3 | Recovery convergence during recovery | Recovery does not need to be atomic, but it must be idempotent. Tests must cover interruption or repeated execution around restore recovery install, head write, project metadata update, intent removal, and staging cleanup, proving that rerunning recovery converges or reports an unrepaired finding. |
| DCR-4 | Restore intent/tree agreement | Both tree restore and node restore must prove their recovery intent agrees with the committed tree state. Recovery replay from the intent must produce the same working tree expected by the committed tree and leave status clean when repair succeeds. |
| DCR-5 | Evidence wording stays honest | Completion reports and storage/recovery docs must claim local native durability hardening and modeled interruption recovery only. They must not imply absolute power-loss durability across all filesystems while directory fsync remains best-effort. |
| DCR-6 | Guerilla boundary remains closed | The fix must not add Guerilla hook dispatch, adapter protocols, external cursors, adapter idempotency, lost-response reconciliation, network services, databases, brokers, or new ordinary commands. |

## Completion Requirements

F10 may be marked `fixed` only when all of the following are true:

- Recovery no longer uses `finished_at` plus `operation_id` as the authority for latest material head repair.
- A corrupted, missing, forked, or causally ambiguous candidate tree/receipt causes an unrepaired recovery finding, not a silent best-effort repair.
- Equal-timestamp committed receipts cannot roll `HEAD` or `project.json.head_tree_revision_id` backward.
- Regular file fsync failures in durability-critical staged file writes are surfaced as operation/recovery failures; only directory fsync is allowed to be best-effort.
- Restore recovery can be rerun after partial recovery work and still converges to the committed head or reports an unrepaired finding.
- Tree restore and node restore have tests proving intent/tree agreement and clean replay.
- Mutable docs state the exact durability maturity proved by Gate D and list any remaining production/pilot durability limits without calling them blockers.
- PR #7 body or final closure report includes final status for F1-F10 and DCR-1 through DCR-6.

Docs-only changes cannot close F10, DCR-1, DCR-2, DCR-3, or DCR-4. Code-only changes cannot close DCR-5. Any non-fixed classification must cite repository evidence and must not depend on assumption or taste.

## Handoff Scope

- Branch: continue on `codex/gate-d-hardening-review-format` or another non-protected hardening closure branch.
- Findings requiring independent triage: F10.
- Acceptance criteria requiring evidence: DCR-1, DCR-2, DCR-3, DCR-4, DCR-5, DCR-6.
- Reviewer-deferred candidate defects: none.
- Scope boundary: keep the four ordinary commands unchanged and keep Guerilla behavior outside Expflow core.

## Verification Guidance

Minimum focused verification after the fix:

```bash
npm test -- tests/unit/material-runtime.test.ts
npm test -- tests/e2e/gate-d-proof.test.ts
npm run typecheck
npm run lint
```

Broader closure verification should include the full Gate D validation set after mutation-path changes land:

```bash
npm ci
npm run format:check
npm run lint
npm run typecheck
npm test
npm run contracts:verify
npm run registries:verify
npm run schemas:meta-validate
npm run examples:index-check
npm run schemas:examples-validate
npm run fixtures:verify
npm run build
npm run package:verify
python -m pip install -e ".[dev]"
python -m pytest
python -m build --wheel
python tests/contracts/verify_python_wheel.py
git diff --check -- ':!docs/architecture/**'
```

If an aggregate validation command exceeds the operational timeout, run the component commands with calibrated timeouts and record exact exit codes.

## Triage And Implementation Prompt

```text
Work in this repository as the implementation agent.

Goal:
Independently validate, triage, and resolve the active Gate D durability finding from the review ledger, while satisfying every Devin durability completion requirement.

Branch:
Use `codex/gate-d-hardening-review-format` or another non-protected hardening closure branch. Do not edit main directly.

Rules:
- Read repository instructions and inspect repository state before editing.
- Triage finding F10 as exactly one of: fixed, not-reproducible, duplicate, intentional-behavior, or out-of-scope.
- Inspect the implementation before accepting F10 as real.
- Provide code- or test-based evidence for any non-fixed classification.
- Fix every confirmed in-scope durability defect, regardless of provisional priority.
- Satisfy DCR-1 through DCR-6 before claiming Gate D closure.
- Preserve the four-command boundary: expflow init, expflow sync, expflow status, expflow restore.
- Do not add Guerilla adapter behavior, hook dispatch, network services, databases, brokers, adapter idempotency, external cursors, or lost-response reconciliation to Expflow core.
- Preserve unrelated user changes.
- Run repository-defined verification and report exact command results.

Candidate finding:
- F10 - receipt-based head repair can move HEAD backward when committed receipts share the same finished_at; derive repair from verified material causality instead of timestamp/random-id order.

Durability completion requirements:
- DCR-1 - causal receipt/head repair.
- DCR-2 - regular file durability failures surface; directory fsync may remain best-effort only when documented.
- DCR-3 - recovery convergence is proven when recovery itself is interrupted or rerun after partial work.
- DCR-4 - tree restore and node restore intents agree with their committed tree states.
- DCR-5 - evidence wording states the exact durability maturity proved by Gate D.
- DCR-6 - Guerilla remains an external observation/profile boundary.

Completion report:
- final status and evidence for F1-F10;
- final status and evidence for DCR-1 through DCR-6;
- changed files and behavioral impact;
- verification commands and results;
- PR #7 readiness statement.
```

## Final Review Position

Gate D architecture and functional scope are accepted. Gate D native durability closure is blocked only by the active durability closure package around F10 and DCR-1 through DCR-6.

The correct fix is a coherent durability closure: causal material-head repair, surfaced regular-file durability failures, idempotent recovery proof, restore intent/tree parity, honest evidence wording, and no Guerilla/runtime scope expansion.
