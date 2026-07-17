# Current Status Matrix

**Status:** Gate C review fixes validated locally for PR #5
**Last updated:** 2026-07-17
**Current baseline:** `main` at `00373ff55690d153d301057b34175c5ff8f9068f`; Gate B PR #4 review-clean at `5fe54ec67ade75b283636181b0b2fce59e498072`; Gate C review-fix implementation commit `206c2ab0ea5af68ccc734319562920d02a6e4f5f`
**Workflow SSOT:** `docs/architecture/EXPFLOW_WORKFLOW_CURRENT.md`
**Evidence:** [Gate A completion report](completion_reports/GATE_A_COMPLETION_REPORT.md), [Gate B completion report](completion_reports/GATE_B_COMPLETION_REPORT.md), [Gate C completion report](completion_reports/GATE_C_COMPLETION_REPORT.md), [PR #5 review resolution](PR_5_GATE_C_ARCHITECTURE_REVIEW.md), [PR #4](https://github.com/paragon-ux/Expflow/pull/4), [PR #5](https://github.com/paragon-ux/Expflow/pull/5)

**Orientation:** Mutable pass-start controls live in [docs/orientation/](orientation/README.md) and are intentionally excluded from stable contract validation.

**Hosted CI evidence:** Phase 1 hosted checks passed in PR #1. Gate A continuation checks passed in PR #2. PR #4 hosted checks are green at `5fe54ec` and merge state is `CLEAN`. PR #5 is stacked on PR #4 and has local validation evidence; hosted checks depend on remote branch/base configuration.

**Validation status:** operational live-status artifact; intentionally excluded from repository formatting and contract validation.

---

## Current Maturity

Expflow has completed Gate A as defined by `EXPFLOW_WORKFLOW_CURRENT.md`. Gate B material core is review-clean in PR #4. Gate C Phases 9-14 are complete locally on `feature/expflow-gate-c-authority-model`, with PR #5 review blockers F1-F6 fixed in implementation commit `206c2ab0ea5af68ccc734319562920d02a6e4f5f`.

| Area                             | Estimated maturity | Assessment                                                                                                                                                                      |
| -------------------------------- | -----------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Problem definition and motivation |                90% | Expflow 2.3 architecture sources define automated workflow ownership through distinct material, authority, semantic, workflow, and projection state.                             |
| Architectural boundaries          |                90% | Ordinary command boundary, core/adapter separation, source immutability, and record-family separation are documented and checked.                                                |
| Frozen contracts and schemas      |                85% | Supplied schemas/examples are preserved, registries are verified, seed fixtures exist, and TypeScript/Python validators agree on examples and seed fixtures.                     |
| Protocol design                   |                84% | Native operation surface, adapter deferral, material runtime, and Gate C record-family runtimes are documented.                                                                  |
| Implementation design             |                82% | Material core plus Gate C authority, semantic, workflow, projection, regeneration/equivalence, and reuse record families are implemented as local library runtimes.              |
| Reference implementation          |                60% | Gate B and Gate C local runtimes exist; Gate D security/migration/end-to-end hardening remains future work.                                                                      |
| Adapter SDK and integrations      |                 0% | Adapter contracts are explicitly deferred to separately versioned adapter profiles and remain absent from core.                                                                  |
| Conformance and contract testing  |                86% | Source integrity, registries, schemas, examples, fixtures, package boundaries, material runtime, authority runtime, and Gate C ownership/reproduction runtimes are tested locally. |
| Empirical evaluation              |                 0% | No pilots, benchmarks, or comparative evaluation have been run.                                                                                                                 |
| Production readiness              |                 0% | Hardening and end-to-end proof remain future gate work.                                                                                                                        |

---

## Gate Status

| Gate | Phases | Meaning | Status | Evidence |
| --- | --- | --- | --- | --- |
| A -- Contract Ready | 1-4 | Repository governance, invariant decisions, future slots, schemas, registries, seed fixtures, generated descriptors, and validator parity | COMPLETE | Gate A completion report; local validation passed; PR #2 checks green |
| B -- Material Core Ready | 5-8 | Immutable stores, sync, identity, transactions, recovery, commands, inspection, and operation resolution | REVIEW CLEAN | Gate B completion report; PR #4 head `5fe54ec`; hosted checks green; merge state `CLEAN` |
| C -- Ownership and Reproduction Ready | 9-14 | Authority, semantics, workflow boundaries, projections, regeneration, equivalence, and reuse | REVIEW FIXED LOCALLY | Gate C completion report; PR #5 review resolution; component validation passed under 60-second command caps |
| D -- Hardened and Proven | 15-17 | Security, migration, packaging, and end-to-end proof | BLOCKED | Requires Gate C merge |

---

## Complete

- Gate A Phases 1-4 repository contract, decisions, machine contracts, fixtures, generated descriptors, and validator parity.
- Gate B Phases 5-8 material core, including immutable stores, scanner, identity planning, transactions, recovery, commands, restore, status, and extension host.
- Gate B review fixes F1-F3: restore reconciliation, receipt/head recovery, and scoped selector roots.
- Gate C Phase 9 authority model:
  - authority-source revision store;
  - immutable source-registration decision store;
  - split and unified readable authority document records;
  - derived current-source projection with supersession and effective intervals;
  - durable source-registration decision replay order for same-timestamp decisions;
  - source-scope conflict checks;
  - authority record validation before durable writes.
- Gate C Phase 10 semantic ownership:
  - assertions, decisions, conflicts, review requests, source correspondence, artifact clusters, and change listing.
  - schema-shape validation for nested attribution and assertion claims.
- Gate C Phase 11 workflow boundaries:
  - workflow occurrences, virtual artifacts, materialization events, and immutable workflow transitions.
  - accepted completion requires an explicit completion decision reference.
- Gate C Phase 12 projection system:
  - manifest revisions, scanner-excluded projection locators, model-assisted proposal defaults, and accepted manifest-head derivation.
  - stale, superseded, rejected, and conflicted manifests remain inspectable without silently evicting accepted heads.
- Gate C Phase 13 regeneration and equivalence:
  - regeneration attempts, unknown-outcome preservation, retry identities, and equivalence evaluations.
- Gate C Phase 14 structural reuse:
  - reuse-result records, policy gates, output workflow references, and no-transfer behavior.

---

## Incomplete

### Gate D

Security enforcement, legacy migration, packaging hardening, and end-to-end proof remain future gate work.

### Adapter Packages

Adapter inspection, external revision tokens, cursors, idempotency, lost-response reconciliation, capability policy, and writer partitioning remain outside this core repository.

---

## Current Evidence Base

Current local evidence under the requested 60-second command cap:

- `npm ci`;
- `npm run format`;
- `npm run format:check`;
- `npm run lint`;
- `npm run typecheck`;
- `npm test -- tests/unit/authority-runtime.test.ts tests/unit/gate-c-runtime.test.ts`;
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

The aggregate `npm run validate` command is not claimed as a pass under the explicit 60-second cap.

---

## Current Critical Path

> PR #5 review/hosted checks -> Gate D.

The central near-term risk is reviewing the stacked PR without PR #4 merged; PR #5 currently depends on the Gate B branch base.

---

## Practical Status Statement

> Expflow has completed Gate A, has review-clean Gate B material-core evidence in PR #4, and has completed Gate C Phases 9-14 locally on `feature/expflow-gate-c-authority-model`. PR #5 review findings F1-F6 have been fixed and validated locally. The remaining remote caveat is stacked-PR hosted-check visibility while PR #5 depends on the Gate B branch base.
