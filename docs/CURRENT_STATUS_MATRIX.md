# Current Status Matrix

**Status:** v1.0.0 published
**Last updated:** 2026-07-18
**Current baseline:** `v1.0.0` is tagged at `605d249f7e09adcaecc2a102f2fb874ef460a6fa`; npm `expflow@1.0.0`, PyPI `expflow-hooks==1.0.0`, and the GitHub Release are public and externally verified
**Workflow SSOT:** `docs/architecture/EXPFLOW_WORKFLOW_CURRENT.md`
**Evidence:** [Gate A completion report](completion_reports/GATE_A_COMPLETION_REPORT.md), [Gate B completion report](completion_reports/GATE_B_COMPLETION_REPORT.md), [Gate C completion report](completion_reports/GATE_C_COMPLETION_REPORT.md), [Gate D completion report](completion_reports/GATE_D_COMPLETION_REPORT.md), [v1 release closeout report](completion_reports/V1_RELEASE_CLOSEOUT_REPORT.md), [v1 GitHub release note](release_notes/GITHUB_RELEASE_NOTE_V1_0_0.md), [v1 compatibility](V1_COMPATIBILITY.md), [release publishing checklist](RELEASE_PUBLISHING.md), [PR #4](https://github.com/paragon-ux/Expflow/pull/4), [PR #5](https://github.com/paragon-ux/Expflow/pull/5), [PR #6](https://github.com/paragon-ux/Expflow/pull/6), [PR #7](https://github.com/paragon-ux/Expflow/pull/7), [PR #10](https://github.com/paragon-ux/Expflow/pull/10), [PR #11](https://github.com/paragon-ux/Expflow/pull/11), [PR #12](https://github.com/paragon-ux/Expflow/pull/12), [PR #13](https://github.com/paragon-ux/Expflow/pull/13), [PR #14](https://github.com/paragon-ux/Expflow/pull/14)

**Orientation:** Mutable pass-start controls live in [docs/orientation/](orientation/README.md) and are intentionally excluded from stable contract validation.

**Hosted CI evidence:** Phase 1 hosted checks passed in PR #1. Gate A continuation checks passed in PR #2. PR #4 hosted checks were green and PR #4 merged to `main` at `6fe8d82`. PR #5 hosted checks were green and PR #5 merged to `main` at `17fb82a`. Gate D PR #6 hosted checks were green and PR #6 merged to `main` at `2b194f1`. Gate D native hardening closure PR #7 hosted checks were green and PR #7 merged to `main` at `69fd4aa`. PR #10 and PR #11 were merged; PR #12 hosted checks passed and merged at `4482e2e`; PR #13 hosted checks passed and merged at `c3ed676`; PR #14 hosted checks passed and merged as a status refresh; PR #16 hosted checks passed and merged at `605d249`. Hosted CI run `29633182623` passed on the final release commit.

**Validation status:** operational live-status artifact; intentionally excluded from repository formatting and contract validation.

---

## Current Maturity

Expflow has completed Gate A as defined by `EXPFLOW_WORKFLOW_CURRENT.md`. Gate B material core is merged into `main` through PR #4. Gate C Phases 9-14 are merged into `main` through PR #5. Gate D Phases 15-17 are merged into `main` through PR #6. Gate D native hardening closure is complete on PR #7 and incorporated into the v1 release-closeout branch.

| Area                             | Estimated maturity | Assessment                                                                                                                                                                      |
| -------------------------------- | -----------------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Problem definition and motivation |                90% | Expflow 2.3 architecture sources define automated workflow ownership through distinct material, authority, semantic, workflow, and projection state.                             |
| Architectural boundaries          |                90% | Ordinary command boundary, core/adapter separation, source immutability, and record-family separation are documented and checked.                                                |
| Frozen contracts and schemas      |                85% | Supplied schemas/examples are preserved, registries are verified, seed fixtures exist, and TypeScript/Python validators agree on examples and seed fixtures.                     |
| Protocol design                   |                88% | Native operation surface, adapter deferral, material runtime, Gate C record-family runtimes, and Gate D security/migration proof boundaries are documented.                       |
| Implementation design             |                88% | Material core plus Gate C authority, semantic, workflow, projection, regeneration/equivalence, reuse, security, migration, and proof surfaces are implemented locally.            |
| Reference implementation          |                78% | Gate B, Gate C, Gate D local runtimes, native hardening closure tests, and proof tests exist; production pilots and adapter packages remain outside core.                          |
| Adapter SDK and integrations      |                 0% | Adapter contracts are explicitly deferred to separately versioned adapter profiles and remain absent from core.                                                                  |
| Conformance and contract testing  |                92% | Source integrity, registries, schemas, examples, fixtures, package boundaries, material runtime, Gate C runtimes, Gate D security/migration, and e2e proof are tested locally.     |
| Empirical evaluation              |                 0% | No pilots, benchmarks, or comparative evaluation have been run.                                                                                                                 |
| Production readiness              |                88% | Core hardening proof, native transaction/recovery closure, MIT release metadata, standalone GitHub release note, package-only quickstart, public release docs, release environments, private vulnerability reporting, npm publication, PyPI publication, and the GitHub Release are complete for v1.0.0. |

---

## Gate Status

| Gate | Phases | Meaning | Status | Evidence |
| --- | --- | --- | --- | --- |
| A -- Contract Ready | 1-4 | Repository governance, invariant decisions, future slots, schemas, registries, seed fixtures, generated descriptors, and validator parity | COMPLETE | Gate A completion report; local validation passed; PR #2 checks green |
| B -- Material Core Ready | 5-8 | Immutable stores, sync, identity, transactions, recovery, commands, inspection, and operation resolution | COMPLETE | Gate B completion report; PR #4 merged to `main` at `6fe8d82`; hosted checks were green |
| C -- Ownership and Reproduction Ready | 9-14 | Authority, semantics, workflow boundaries, projections, regeneration, equivalence, and reuse | COMPLETE | Gate C completion report; PR #5 merged to `main` at `17fb82a`; hosted checks green |
| D -- Hardened and Proven | 15-17 | Security, migration, packaging, end-to-end proof, and native hardening closure | COMPLETE | Gate D completion report; PR #6 hosted checks; PR #7 hardening closure checks; security/migration tests; e2e proof; material fault-injection tests |

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
  - Gate D package verification originally closed on the `0.0.0-gate-d` package identity.
- Gate D Phase 17 end-to-end proof:
  - automated 25-scenario proof across material, authority, semantic, workflow, projection, reproduction, security, migration, old-state, partial-success, and adapter-boundary behavior.
- Gate D native hardening closure:
  - operation-scoped staging for immutable object and JSON-record promotion;
  - recoverable init and restore intents;
  - restore working-tree installation recovery after mutation-boundary interruptions;
  - stale/live/malformed lock classification based on same-host PID liveness;
  - causal tree/receipt `HEAD` and `project.json` head repair;
  - restore intent/tree agreement checks;
  - focused fault-injection and convergence tests for init, sync, and restore.

---

## Incomplete

### Core Release Follow-Up

The v1.0.0 repository code, dual-registry OIDC publication workflow, private vulnerability reporting policy, v1 compatibility promise, and package-only README quickstart are merged to `main`. Remote tag `v1.0.0` exists at `605d249f7e09adcaecc2a102f2fb874ef460a6fa`. npm `expflow@1.0.0`, PyPI `expflow-hooks==1.0.0`, and the GitHub Release are public and externally verified.

The first `v1.0.0` release workflow run published PyPI and validated the release build, but failed after publication because npm verification rejected an ambient `NODE_AUTH_TOKEN` and PyPI verification queried the version endpoint before propagation completed. The workflow has been updated for future releases; do not move or delete the `v1.0.0` tag.

### Adapter Packages

Adapter inspection, external revision tokens, cursors, idempotency, lost-response reconciliation, capability policy, and writer partitioning remain outside this core repository.

---

## Current Evidence Base

Current local release-closeout evidence uses the required validation set under the requested 60-second command cap:

- `npm ci`;
- `npm run format`;
- `npm run format:check`;
- `npm run lint`;
- `npm run typecheck`;
- `npm test -- tests/unit/material-runtime.test.ts`;
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
- `git diff --check -- ':!docs/architecture/**'`.

The aggregate `npm run validate` command is not claimed as a pass under the explicit 60-second cap. The release remediation pass adds `npm pack --dry-run`, `npm run clean` before Python distribution validation, `python -m build`, `python -m twine check dist/*`, exact tarball/wheel verification, and `.github/workflows/release.yml` static review to the required release evidence.

---

## Current Critical Path

> Keep registry ownership and tokenless Trusted Publishing configured, protect release tags where repository settings permit it, carry the release-workflow verifier fix forward, and move post-v1 work into pilots, empirical evaluation, and separate adapter/profile packages.

No Guerilla integration runtime is required in Expflow core. The hardening closure addresses the post-merge Gate D native hardening review through F10 and DCR-1 through DCR-6; remaining post-v1 work is pilots, empirical evaluation, and separate adapter/profile packages.

---

## Practical Status Statement

> Expflow has completed Gate A, merged Gate B through PR #4, merged Gate C through PR #5, merged Gate D through PR #6, and merged Gate D native hardening closure through PR #7. Expflow v1.0.0 is public on npm as `expflow`, public on PyPI as `expflow-hooks`, and published as a final GitHub Release.
