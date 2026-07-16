# Current Status Matrix

**Status:** Gate A complete -- Contract Ready
**Last updated:** 2026-07-16
**Current baseline:** `feature/expflow-gate-a-status-matrix`; exact head is recorded in Git and PR evidence
**Workflow SSOT:** `docs/architecture/EXPFLOW_WORKFLOW_CURRENT.md`
**Evidence:** [Gate A completion report](completion_reports/GATE_A_COMPLETION_REPORT.md), [Phase 1 completion report](completion_reports/PHASE_01_COMPLETION_REPORT.md), [Phase 2 completion report](completion_reports/PHASE_02_COMPLETION_REPORT.md), [Phase 3 completion report](completion_reports/PHASE_03_COMPLETION_REPORT.md), [Phase 4 completion report](completion_reports/PHASE_04_COMPLETION_REPORT.md), [PR #1](https://github.com/paragon-ux/Expflow/pull/1), [PR #2](https://github.com/paragon-ux/Expflow/pull/2)

**Orientation:** Mutable pass-start controls live in [docs/orientation/](orientation/README.md) and are intentionally excluded from formatting and contract validation.

**Hosted CI evidence:** Phase 1 hosted checks passed in PR #1. Gate A continuation checks are green in PR #2 at `6977ee7b8e5b2eb43b66811cec1f15cc4cb13cd4`.

**Validation status:** operational live-status artifact; intentionally excluded from repository formatting and contract validation.

---

## Current Maturity

Expflow has completed Gate A as defined by `EXPFLOW_WORKFLOW_CURRENT.md`: Phases 1-4 establish repository governance, frozen Gate A invariants, future decision slots, machine contracts, registries, seed conformance fixtures, generated schema descriptors, and TypeScript/Python validator parity.

The project is still pre-runtime. No material store, scanner, sync transaction, identity resolver, command handler, semantic store, projection engine, hook dispatcher, adapter package, database integration, broker, network behavior, or migration runtime exists in the core repository.

| Area | Estimated maturity | Assessment |
|---|---:|---|
| Problem definition and motivation | 90% | Expflow 2.3 architecture sources define automated workflow ownership through distinct material, authority, semantic, workflow, and projection state. |
| Architectural boundaries | 90% | Ordinary command boundary, core/adapter separation, source immutability, and no-runtime scope are documented and checked. |
| Frozen contracts and schemas | 85% | Supplied schemas/examples are preserved, registries are verified, Gate A decision slots are registered, seed fixtures exist, and TypeScript/Python validators agree on examples and seed fixtures. |
| Protocol design | 70% | Native operation surface and adapter deferral are documented; runtime dispatch remains future Gate B work. |
| Implementation design | 55% | Gate A documents storage, recovery, identity, authority, workflow, projection, security, and test boundaries without implementing them. |
| Reference implementation | 10% | Package scaffolds, generated descriptors, validation scripts, and help/version behavior exist; product runtime is absent. |
| Adapter SDK and integrations | 0% | Adapter contracts are explicitly deferred to separately versioned adapter profiles and remain absent from core. |
| Conformance and contract testing | 80% | Source integrity, registries, schema meta-validation, examples, seed fixtures, generated descriptors, and package boundaries are validated locally. |
| Empirical evaluation | 0% | No pilots, benchmarks, or comparative evaluation have been run. |
| Production readiness | 0% | No operational runtime exists yet; hardening belongs to later gates. |

---

## Gate Status

| Gate | Phases | Meaning | Status | Evidence |
|---|---|---|---|---|
| A -- Contract Ready | 1-4 | Repository governance, invariant decisions, future slots, schemas, registries, seed fixtures, generated descriptors, and validator parity | COMPLETE | Gate A completion report; local validation passed; PR #2 checks green |
| B -- Material Core Ready | 5-8 | Immutable stores, sync, identity, transactions, recovery, commands, inspection, and operation resolution | PENDING | Requires Gate A PR review and merge |
| C -- Ownership and Reproduction Ready | 9-14 | Authority, semantics, workflow boundaries, projections, regeneration, equivalence, and reuse | BLOCKED | Requires Gate B closure |
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

Gate B has not started. The next work is:

- immutable material stores;
- sync, scanning, and identity behavior;
- transactions and core recovery;
- the four ordinary commands and extension host.

### Gate C: Ownership and Reproduction

Authority registration, semantic decisions, workflow boundaries, projections, regeneration, equivalence evaluation, and structural reuse remain architecture intent only until Gate C opens.

### Gate D: Hardening and Proof

Security enforcement, legacy migration, packaging hardening, and end-to-end proof remain future gate work.

---

## Current Evidence Base

Local Gate A validation passed under the requested 60-second command cap:

- `npm ci`;
- `npm run validate`;
- `python -m pip install -e ".[dev]"`;
- `python -m pytest`;
- `python -m build --wheel`;
- `python tests/contracts/verify_python_wheel.py`;
- `git diff --check origin/main...HEAD -- ':!docs/architecture/**'`.

Hosted Gate A continuation checks are green in PR #2.

---

## Current Critical Path

The credible route from the current baseline is:

> Gate A PR review and merge -> Gate B material stores -> sync/scanning/identity -> transactions/recovery -> four ordinary commands and extension host -> Gate C ownership and reproduction runtime -> Gate D hardening and proof.

The central near-term risk is beginning Gate B runtime before the Gate A continuation branch is reviewed and merged.

---

## Practical Status Statement

A defensible project-status statement is:

> Expflow has completed Gate A locally and has green hosted checks in PR #2. The repository now has governed architecture sources, frozen Gate A invariants, registered later-gate decision slots, verified core registries, schema/example validation, a seed contract fixture harness, generated schema descriptors, TypeScript/Python validator parity, package-boundary verification, and no product runtime behavior. The next milestone is PR review and merge for the Gate A continuation branch, then Gate B material-core work after merge.
