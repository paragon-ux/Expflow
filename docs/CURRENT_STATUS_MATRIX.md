# Current Status Matrix

**Status:** Gate B review fixes local -- validation passed, PR update pending
**Last updated:** 2026-07-16
**Current baseline:** `main` at `00373ff55690d153d301057b34175c5ff8f9068f`; Gate B implementation commit `4044b32`; review-fix work on `feature/expflow-gate-b-material-core`
**Workflow SSOT:** `docs/architecture/EXPFLOW_WORKFLOW_CURRENT.md`
**Evidence:** [Gate A completion report](completion_reports/GATE_A_COMPLETION_REPORT.md), [Gate B completion report](completion_reports/GATE_B_COMPLETION_REPORT.md), [Phase 1 completion report](completion_reports/PHASE_01_COMPLETION_REPORT.md), [Phase 2 completion report](completion_reports/PHASE_02_COMPLETION_REPORT.md), [Phase 3 completion report](completion_reports/PHASE_03_COMPLETION_REPORT.md), [Phase 4 completion report](completion_reports/PHASE_04_COMPLETION_REPORT.md), [PR #1](https://github.com/paragon-ux/Expflow/pull/1), [PR #2](https://github.com/paragon-ux/Expflow/pull/2), [PR #4](https://github.com/paragon-ux/Expflow/pull/4)

**Orientation:** Mutable pass-start controls live in [docs/orientation/](orientation/README.md) and are intentionally excluded from formatting and contract validation.

**Hosted CI evidence:** Phase 1 hosted checks passed in PR #1. Gate A continuation checks passed in PR #2. PR #4 hosted checks were green before the F1-F3 review-blocker fixes; current-head hosted checks must be re-read after the review-fix push.

**Validation status:** operational live-status artifact; intentionally excluded from repository formatting and contract validation.

---

## Current Maturity

Expflow has completed Gate A as defined by `EXPFLOW_WORKFLOW_CURRENT.md`: Phases 1-4 establish repository governance, frozen Gate A invariants, future decision slots, machine contracts, registries, seed conformance fixtures, generated schema descriptors, and TypeScript/Python validator parity.

Expflow has also completed local Gate B implementation on PR #4 and is resolving review blockers on the same branch: Phases 5-8 establish local material stores, scanner, identity planning, transactions, recovery checks, command handlers, restore, status, and a narrow extension host. Authority registration, semantic decisions, workflow detection, projections, hook dispatch, adapters, databases, brokers, network behavior, and migration runtime remain absent from the core repository.

| Area | Estimated maturity | Assessment |
|---|---:|---|
| Problem definition and motivation | 90% | Expflow 2.3 architecture sources define automated workflow ownership through distinct material, authority, semantic, workflow, and projection state. |
| Architectural boundaries | 90% | Ordinary command boundary, core/adapter separation, source immutability, and no-runtime scope are documented and checked. |
| Frozen contracts and schemas | 85% | Supplied schemas/examples are preserved, registries are verified, Gate A decision slots are registered, seed fixtures exist, and TypeScript/Python validators agree on examples and seed fixtures. |
| Protocol design | 80% | Native operation surface and adapter deferral are documented; local Gate B runtime dispatch exists. |
| Implementation design | 65% | Material-core storage, identity, transactions, commands, and extension-host boundaries are implemented; later gates remain design intent. |
| Reference implementation | 35% | Gate B local material-core runtime exists; ownership/reproduction/hardening runtime remains future work. |
| Adapter SDK and integrations | 0% | Adapter contracts are explicitly deferred to separately versioned adapter profiles and remain absent from core. |
| Conformance and contract testing | 80% | Source integrity, registries, schema meta-validation, examples, seed fixtures, generated descriptors, and package boundaries are validated locally. |
| Empirical evaluation | 0% | No pilots, benchmarks, or comparative evaluation have been run. |
| Production readiness | 0% | No operational runtime exists yet; hardening belongs to later gates. |

---

## Gate Status

| Gate | Phases | Meaning | Status | Evidence |
|---|---|---|---|---|
| A -- Contract Ready | 1-4 | Repository governance, invariant decisions, future slots, schemas, registries, seed fixtures, generated descriptors, and validator parity | COMPLETE | Gate A completion report; local validation passed; PR #2 checks green |
| B -- Material Core Ready | 5-8 | Immutable stores, sync, identity, transactions, recovery, commands, inspection, and operation resolution | REVIEW FIXES LOCAL VALIDATED | Gate B completion report; F1-F3 fixes in current branch; local component validation passed; hosted checks pending current-head rerun |
| C -- Ownership and Reproduction Ready | 9-14 | Authority, semantics, workflow boundaries, projections, regeneration, equivalence, and reuse | NEXT AFTER GATE B REVIEW CLEAN | Requires Gate B review-fix validation and hosted check evidence |
| D -- Hardened and Proven | 15-17 | Security, migration, packaging, and end-to-end proof | BLOCKED | Requires Gate C closure |

---

## What Is Complete

- Phase 1 repository contract baseline.
- Phase 2 decision framework, future slots, and vocabulary.
- Phase 3 core machine contracts and registries.
- Phase 4 seed conformance fixtures and generated descriptors.
- Mutable System 1 and System 2 orientation controls for operational stalls and gate-scope friction.
- TypeScript and Python validator parity for supplied examples and seed contract fixtures.
- Mutable status matrix exclusion from stable formatting and contract validation.

---

## What Remains Incomplete

### Gate B: Material Core

Gate B is complete locally on `feature/expflow-gate-b-material-core` and open for review in PR #4. Review blockers F1-F3 have local fixes and local component validation on the same branch. Delivered work:

- immutable material stores;
- sync, scanning, and identity behavior;
- transactions and core recovery;
- the four ordinary commands and extension host.

Implemented locally on the Gate B branch at `4044b32`:

- local `.expflow/` project state, immutable objects, node revisions, tree revisions, operation receipts, validations, changes, and material head state;
- working-tree scanner with `.expflow/**` exclusion;
- path-selector roots with scoped planning that retains out-of-scope committed entries;
- deterministic tree-content digest generation;
- same-path continuity, explicit move preservation, explicit new/replace directives, and digest-similarity proposals without silent identity preservation;
- `project.init`, `project.sync`, `project.status`, and `revision.restore` runtime operations;
- tree restore reconciliation that removes files absent from the restored tree;
- recovery for committed receipt/tree/head gaps without semantic invention;
- CLI handlers for `expflow init`, `expflow sync`, `expflow status`, and `expflow restore`;
- narrow extension host for native operation invocation and read-only committed state;
- focused Gate B unit tests and installed-package CLI verification.

### Gate C: Ownership and Reproduction

Authority registration, semantic decisions, workflow boundaries, projections, regeneration, equivalence evaluation, and structural reuse remain architecture intent only until Gate C opens.

### Gate D: Hardening and Proof

Security enforcement, legacy migration, packaging hardening, and end-to-end proof remain future gate work.

---

## Current Evidence Base

Local Gate B validation passed under the requested 60-second command cap by component command:

- `npm ci`;
- `npm run format:check`;
- `npm run lint`;
- `npm run typecheck`;
- `npm test`;
- `npm run contracts:verify`;
- `npm run registries:verify`;
- `npm run schemas:meta-validate`;
- `npm run examples:index-check`;
- `npm run schemas:examples-validate`;
- `npm run fixtures:verify`;
- `npm run build`;
- `npm run package:verify`;
- `python -m pip install -e ".[dev]"`;
- `python -m pytest`;
- `python -m build --wheel`;
- `python tests/contracts/verify_python_wheel.py`;
- `git diff --check origin/main...HEAD -- ':!docs/architecture/**'`.

The aggregate `npm run validate` command exceeded the explicit 60-second cap and was stopped; it is not claimed as a pass. Hosted Gate B checks need to be re-read for the review-fix head after push.

Review-fix validation for F1-F3 also passed locally under the 60-second cap. See the Gate B completion report review-fix validation table.

---

## Current Critical Path

The credible route from the current baseline is:

> PR #4 review-fix push and hosted check rerun -> PR #4 review and merge -> Gate C ownership and reproduction runtime -> Gate D hardening and proof.

The central near-term risk is entering Gate C before the Gate B review fixes have current-head hosted evidence.

---

## Practical Status Statement

A defensible project-status statement is:

> Expflow has completed Gate A and has local Gate B material-core evidence on PR #4. Review blockers F1-F3 have local validated fixes covering restore reconciliation, receipt/head recovery, and scoped selector roots. The next milestone is pushing the review fixes, confirming current-head hosted checks, and then continuing to Gate C Phase 9 authority model after Gate B is review-clean.
