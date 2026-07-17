# Code Review

## Verdict

BLOCK

## Review Target

- Repository: `paragon-ux/Expflow`
- Reviewed baseline: `main` at merge commit `2b194f10f839aa227d151241777d7ddb1cd721e0`
- Originating PR: [#6 Gate D hardening and proof](https://github.com/paragon-ux/Expflow/pull/6)
- PR state: merged; hosted checks were green
- Review type: post-merge Gate D hardening review and closure scope
- Related locked architecture: `build-docs/Guerilla-Universal-Hook-Architecture-Revision-Final/Guerilla-Universal-Hook-Architecture-Revision/`

## Release Risk

Gate D is credible as a local functional proof of the implemented core surface, but it is not yet a durable native-recovery closure. The remaining risks are core-owned: restore can mutate user files before a recoverable commit exists, immutable records are installed directly at final paths, stale locks are not classified by recovery, and mutable head representations can diverge. The locked Guerilla universal-hook architecture does not change this boundary: Guerilla may bracket and observe Expflow, but Expflow remains authoritative for native transaction, restore, lock, and recovery semantics.

## Candidate-Finding Ledger

| ID | Reviewer priority | Candidate defect | Evidence | Suggested direction |
| --- | --- | --- | --- | --- |
| F1 | P0 | `restore` can leave a partially mutated working tree while the old material head remains committed. | Tree restore removes files and writes restored bytes before validation, receipt, `HEAD`, and project metadata are committed in `src/operations/runtime.ts:599`, `src/operations/runtime.ts:615`, and `src/operations/runtime.ts:679`; node restore writes the target before planning and committing the candidate tree in `src/operations/runtime.ts:647` and `src/operations/runtime.ts:671`. | Implement a native restore transaction model: precompute and verify the restore plan, stage replacement bytes on the same filesystem, durably record replacement/deletion intent, install paths in a resumable or rollback-safe order, then commit receipt/head/project metadata at one documented point. Add interruption tests at every restore mutation boundary. |
| F2 | P0 | Immutable objects and immutable JSON records are installed directly to final identity paths without a staged promotion and durability protocol. | Objects are copied straight to the content-addressed final path in `src/material/store.ts:171`; node, tree, receipt, validation, and change records use final-path exclusive JSON writes in `src/material/store.ts:211`, `src/material/store.ts:237`, `src/material/store.ts:255`, and `src/material/store.ts:294`; `writeJsonFileExclusive` closes the file but does not flush file or directory state in `src/core/json.ts:38`. | Write each object or immutable record under operation-scoped staging, flush and verify staged bytes, atomically promote to final path, sync containing directories where supported, verify existing final paths before reuse, and classify corrupt occupied final paths instead of treating them as immutable success. |
| F3 | P0 | A crashed writer can leave a permanent `.expflow/LOCK`, and recovery does not inspect or classify it. | `createLock` writes a lock with PID and timestamp and recommends recovery on lock conflict in `src/material/store.ts:323`; normal cleanup only unlinks in the returned release callback at `src/material/store.ts:336`; `recoverProject` cleans staging and inspects heads/receipts but has no lock branch in `src/transactions/recovery.ts:41`. | Define lock ownership and stale-lock policy: host/runtime identity, acquisition time, same-host liveness check, PID-reuse handling where possible, malformed/inaccessible lock classification, atomic takeover, and refusal when a live owner is confirmed. Recovery must never remove a lock merely because it is old. |
| F4 | P0 | `HEAD` and `project.json.head_tree_revision_id` can diverge without deterministic bidirectional repair. | Native commit writes receipt, then `HEAD`, then project metadata in `src/operations/runtime.ts:693`; recovery advances both only when the receipt `new_head` differs from current `HEAD` and `previous_head` equals current `HEAD` in `src/transactions/recovery.ts:84`; this skips the case where `HEAD` is already new but `project.json` is stale. | Make verified committed receipts and verified trees the recoverable material-head source. Recovery should read and validate both mutable representations, identify the latest reachable committed material-success receipt, reject ambiguous forks, repair stale mutable representations, report repairs, and remain idempotent. |
| F5 | P1 | `init` publishes initialized project state before material validation and commit are complete. | `init` writes `project.json` and empty `HEAD` before candidate validation and tree commit in `src/operations/runtime.ts:338`; validation and later material commit happen afterward in `src/operations/runtime.ts:352` and `src/operations/runtime.ts:378`. | Treat initialization as a native transaction: stage initial project state and material records, publish initialized state only at the commit point, or teach recovery to classify and deterministically complete or remove an interrupted initialization. |
| F6 | P1 | Recovery tests simulate selected end states rather than fault-injecting the real mutation sequence. | Current tests create an orphan staging directory manually in `tests/unit/material-runtime.test.ts:203` and manually rewind `HEAD`/project metadata in `tests/unit/material-runtime.test.ts:221`; the Gate D proof uses a `simulatePostCommitFailure` option rather than storage-boundary interruption in `tests/e2e/gate-d-proof.test.ts:375`. | Add a storage fault-injection harness with named failure points matching the actual native transaction sequence. Each case should execute the real operation path, reopen the runtime, run recovery, and verify old state, new state, or explicit blocked repair evidence. |
| F7 | P1 | `.expflow/staging/` is treated as recoverable state but is not the transaction installation path. | Store initialization creates `paths.staging` in `src/material/store.ts:67`; recovery deletes staging entries in `src/transactions/recovery.ts:45`; ordinary object and immutable-record writes bypass staging and install directly to final paths in `src/material/store.ts:171` and `src/material/store.ts:211`. | Either make staging the actual operation installation path for native mutations, or narrow all staging/recovery claims to say it is cleanup-only. The preferred resolution is to use operation-scoped staging as part of F2. |
| F8 | P2 | Gate D completion evidence overstates crash-durability maturity. | The Gate D report says `PASS -- Gate D complete locally` in `docs/completion_reports/GATE_D_COMPLETION_REPORT.md:5` and lists no blockers in `docs/completion_reports/GATE_D_COMPLETION_REPORT.md:72`, while the current tests prove functional scenarios and selected structural simulations rather than full crash-durability closure. | Keep Gate D as the final Expflow core gate, but label this follow-up as a Gate D Core Hardening Closure. Distinguish functional proof, structural recovery simulation, fault-injected crash proof, package proof, and security policy validation in mutable docs. |

## Guerilla Hook Compatibility Review

The Guerilla universal-hook architecture is locked and replaces the prior Phase 16 adapter direction. It does not create Expflow deliverables in this hardening review.

Compatibility conclusion: Expflow should be compatible through a data-only `expflow.cli.v1` profile over ordinary commands and documented read-only state surfaces, not through a bespoke adapter or Guerilla-specific callback.

Required compatibility boundaries:

- Expflow core must not implement Guerilla hook dispatch, adapter protocols, network services, databases, brokers, provider drivers, cross-system idempotency, or lost-response reconciliation.
- Guerilla `sync` means Guerilla resynchronization only; it must not silently invoke native `expflow sync`.
- Expflow native mutations must be executed through Guerilla `run(system_instance_id, argv, options)` when managed by Guerilla.
- An Expflow profile should classify `init`, `sync`, and `restore` as mutating or destructive as appropriate, classify `status` as read-only or observational, and fail closed on unknown commands.
- Observations should use `expflow status`, documented package exports, the read-only extension host, or explicitly documented stable state surfaces. A profile must not depend on undocumented `.expflow` internals unless Expflow promotes them to a stable public profile boundary.
- Guerilla can record intent, observations, native results, unknown outcomes, and resynchronization evidence. It cannot repair Expflow-native partial restores, stale locks, corrupt immutable final paths, or head/project divergence.
- The hardening closure therefore improves profile reliability without expanding Expflow into Guerilla. It makes Expflow's own receipts, immutable records, locks, material heads, and restore behavior trustworthy enough for Guerilla to observe.

Non-findings:

- No bespoke Guerilla adapter is required.
- No project-specific Guerilla SDK is required.
- No new Expflow ordinary command is required.
- No provider-specific model tool is required.
- No external inspection cursor, cross-system revision token, adapter idempotency store, or lost-response reconciliation belongs in Expflow core.

## Handoff Scope

- Branch: create or use a non-protected hardening closure branch.
- Findings requiring independent triage: F1, F2, F3, F4, F5, F6, F7, F8.
- Reviewer-deferred candidate defects: none.
- Scope boundary: keep the four ordinary commands unchanged and keep Guerilla behavior outside Expflow core.

## Verification Guidance

Minimum focused verification after fixes:

```bash
npm test -- tests/unit/material-runtime.test.ts
npm test -- tests/e2e/gate-d-proof.test.ts
npm run typecheck
npm run lint
```

Broader closure verification should include the full Gate D validation set once mutation-path changes land:

```bash
npm ci
npm run format:check
npm run lint
npm run typecheck
npm test
npm run contracts:verify
npm run schemas:meta-validate
npm run examples:index-check
npm run build
npm run package:verify
python -m pip install -e ".[dev]"
python -m pytest
python -m build --wheel
python tests/contracts/verify_python_wheel.py
```

## Triage And Implementation Prompt

```text
Work in this repository as the implementation agent.

Goal:
Independently validate, triage, and resolve every candidate finding from the Gate D hardening review ledger.

Branch:
Create or use a non-protected hardening closure branch. Do not edit main directly.

Rules:
- Read repository instructions and inspect repository state before editing.
- Triage every finding ID: F1, F2, F3, F4, F5, F6, F7, F8.
- Inspect the implementation before accepting a finding as real.
- Classify each ID as fixed, not-reproducible, duplicate, intentional-behavior, or out-of-scope.
- Provide code- or test-based evidence for every non-fixed classification.
- Fix every confirmed in-scope defect, regardless of provisional priority.
- Preserve the four-command boundary: expflow init, expflow sync, expflow status, expflow restore.
- Do not add Guerilla adapter behavior, hook dispatch, network services, databases, brokers, adapter idempotency, or lost-response reconciliation to Expflow core.
- Add fault-injection or equivalent interruption tests for native transaction, restore, lock, and recovery behavior.
- Update mutable Gate D evidence docs so labels match the maturity of the proof.
- Preserve unrelated user changes.
- Run repository-defined verification and report exact command results.

Candidate findings:
- F1 - restore can leave a partially mutated working tree before a recoverable commit exists.
- F2 - immutable objects and records are written directly to final paths without durable staged promotion.
- F3 - stale `.expflow/LOCK` recovery is absent.
- F4 - `HEAD` and `project.json.head_tree_revision_id` can diverge without complete reconciliation.
- F5 - initialization publishes partial project state before material commit completes.
- F6 - recovery tests simulate selected states instead of fault-injecting real mutation boundaries.
- F7 - staging is cleanup-only but is treated as transaction recovery state.
- F8 - Gate D evidence wording overclaims crash-durability maturity.

Completion report:
- final status and evidence for every finding ID;
- changed files and behavioral impact;
- verification commands and results;
- compatibility statement for the locked Guerilla universal-hook architecture.
```

## Final Review Position

Gate D architecture and functional scope are accepted. Gate D native durability closure requires changes.

The correct response is not to expand Expflow into a Guerilla integration system. It is to harden Expflow's own native storage, restore, lock, recovery, initialization, and evidence-labeling behavior so a future `expflow.cli.v1` Guerilla profile can observe reliable native boundaries through the locked universal-hook architecture.
