# Current Status Matrix

**Status:** Gate D complete on PR #6
**Last updated:** 2026-07-17
**Current baseline:** `main` at Gate C merge commit `17fb82a083399f1228c556ff2d3b82455e42a8de`; Gate D branch `codex/gate-d-hardening`
**Workflow SSOT:** `docs/architecture/EXPFLOW_WORKFLOW_CURRENT.md`
**Evidence:** [Gate A completion report](completion_reports/GATE_A_COMPLETION_REPORT.md), [Gate B completion report](completion_reports/GATE_B_COMPLETION_REPORT.md), [Gate C completion report](completion_reports/GATE_C_COMPLETION_REPORT.md), [Gate D completion report](completion_reports/GATE_D_COMPLETION_REPORT.md), [PR #4](https://github.com/paragon-ux/Expflow/pull/4), [PR #5](https://github.com/paragon-ux/Expflow/pull/5), [PR #6](https://github.com/paragon-ux/Expflow/pull/6)

**Orientation:** Mutable pass-start controls live in [docs/orientation/](orientation/README.md) and are intentionally excluded from stable contract validation.

**Hosted CI evidence:** Phase 1 hosted checks passed in PR #1. Gate A continuation checks passed in PR #2. PR #4 hosted checks were green and PR #4 merged to `main` at `6fe8d82`. PR #5 hosted checks were green and PR #5 merged to `main` at `17fb82a`. Gate D PR #6 hosted checks are green.

**Validation status:** operational live-status artifact; intentionally excluded from repository formatting and contract validation.

---

## Current Maturity

Expflow has completed Gate A as defined by `EXPFLOW_WORKFLOW_CURRENT.md`. Gate B material core is merged into `main` through PR #4. Gate C Phases 9-14 are merged into `main` through PR #5. Gate D Phases 15-17 are complete locally on `codex/gate-d-hardening`.

| Area                             | Estimated maturity | Assessment                                                                                                                                                                      |
| -------------------------------- | -----------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Problem definition and motivation |                90% | Expflow 2.3 architecture sources define automated workflow ownership through distinct material, authority, semantic, workflow, and projection state.                             |
| Architectural boundaries          |                90% | Ordinary command boundary, core/adapter separation, source immutability, and record-family separation are documented and checked.                                                |
| Frozen contracts and schemas      |                85% | Supplied schemas/examples are preserved, registries are verified, seed fixtures exist, and TypeScript/Python validators agree on examples and seed fixtures.                     |
| Protocol design                   |                88% | Native operation surface, adapter deferral, material runtime, Gate C record-family runtimes, and Gate D security/migration proof boundaries are documented.                       |
| Implementation design             |                88% | Material core plus Gate C authority, semantic, workflow, projection, regeneration/equivalence, reuse, security, migration, and proof surfaces are implemented locally.            |
| Reference implementation          |                75% | Gate B, Gate C, and Gate D local runtimes and proof tests exist; production pilots and adapter packages remain outside core.                                                      |
| Adapter SDK and integrations      |                 0% | Adapter contracts are explicitly deferred to separately versioned adapter profiles and remain absent from core.                                                                  |
| Conformance and contract testing  |                92% | Source integrity, registries, schemas, examples, fixtures, package boundaries, material runtime, Gate C runtimes, Gate D security/migration, and e2e proof are tested locally.     |
| Empirical evaluation              |                 0% | No pilots, benchmarks, or comparative evaluation have been run.                                                                                                                 |
| Production readiness              |                15% | Core hardening proof exists locally; production release, pilots, adapter packages, and empirical evaluation remain future work.                                                  |

---

## Gate Status

| Gate | Phases | Meaning | Status | Evidence |
| --- | --- | --- | --- | --- |
| A -- Contract Ready | 1-4 | Repository governance, invariant decisions, future slots, schemas, registries, seed fixtures, generated descriptors, and validator parity | COMPLETE | Gate A completion report; local validation passed; PR #2 checks green |
| B -- Material Core Ready | 5-8 | Immutable stores, sync, identity, transactions, recovery, commands, inspection, and operation resolution | COMPLETE | Gate B completion report; PR #4 merged to `main` at `6fe8d82`; hosted checks were green |
| C -- Ownership and Reproduction Ready | 9-14 | Authority, semantics, workflow boundaries, projections, regeneration, equivalence, and reuse | COMPLETE | Gate C completion report; PR #5 merged to `main` at `17fb82a`; hosted checks green |
| D -- Hardened and Proven | 15-17 | Security, migration, packaging, and end-to-end proof | COMPLETE | Gate D completion report; PR #6 hosted checks; security/migration tests; e2e proof; package verification |

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
  - authority record validation before durable writes, including exact nested shape for subject selectors, effective intervals, and authority document sections.
- Gate C Phase 10 semantic ownership:
  - assertions, decisions, conflicts, review requests, source correspondence, artifact clusters, and change listing.
  - schema-shape validation for nested attribution and assertion claims.
- Gate C Phase 11 workflow boundaries:
  - workflow occurrences, virtual artifacts, materialization events, immutable workflow transitions, and exact workflow selector shape validation.
  - accepted completion requires an explicit completion decision reference.
- Gate C Phase 12 projection system:
  - manifest revisions, scanner-excluded projection locators, model-assisted proposal defaults, and accepted manifest-head derivation.
  - stale, superseded, rejected, and conflicted manifests remain inspectable without silently evicting accepted heads.
- Gate C Phase 13 regeneration and equivalence:
  - regeneration attempts, unknown-outcome preservation, retry identities, and equivalence evaluations.
- Gate C Phase 14 structural reuse:
  - reuse-result records, policy gates, output workflow references, and no-transfer behavior.
- Gate D Phase 15 security and execution boundaries:
  - archive quarantine manifest validation and unsafe archive rejection;
  - instruction/data separation for source content;
  - secret detection/redaction and local-only remote-disclosure policy;
  - generated-code non-execution and reuse license/restriction gates.
- Gate D Phase 16 legacy migration and packaging:
  - in-place typed-folder migration evidence;
  - user-path preservation and no authority/semantic fabrication report;
  - package version `0.0.0-gate-d` and clean package verification.
- Gate D Phase 17 end-to-end proof:
  - automated 25-scenario proof across material, authority, semantic, workflow, projection, reproduction, security, migration, old-state, partial-success, and adapter-boundary behavior.

---

## Incomplete

### Core Release

Production release hardening, pilots, empirical evaluation, and separate adapter packages remain future work.

### Adapter Packages

Adapter inspection, external revision tokens, cursors, idempotency, lost-response reconciliation, capability policy, and writer partitioning remain outside this core repository.

---

## Current Evidence Base

Current local evidence under the requested 60-second command cap:

- `npm run format`;
- `npm run format:check`;
- `npm run lint`;
- `npm run typecheck`;
- `npm test -- tests/unit/authority-runtime.test.ts tests/unit/gate-c-runtime.test.ts`;
- `npm test -- tests/unit/security-migration-runtime.test.ts`;
- `npm test -- tests/e2e/gate-d-proof.test.ts`;
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

> Post-Gate D release/pilot work.

No gate-blocking core implementation work remains after PR #6 hosted validation. Remaining work is production release hardening, pilots, empirical evaluation, and separate adapter packages.

---

## Practical Status Statement

> Expflow has completed Gate A, merged Gate B through PR #4, merged Gate C through PR #5, and completed Gate D on PR #6. Gate D adds local security controls, migration evidence, packaging hardening, and automated end-to-end proof while preserving the four-command and adapter-deferral boundaries.
