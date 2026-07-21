# Current Status Matrix

**Status:** Current internal status control
**Last updated:** 2026-07-20
**Implementation baseline:** Expflow `v1.0.1`
**Post-baseline changes:** None claimed
**Historical workflow:** Gates A–D complete and closed
**Current workflow:** `BUILD_WEEK_WORKFLOW_CURRENT.md`
**Current phase:** Phase 1 — Ordinary UX/UI Corrections
**Phase state:** READY; evidence review complete; implementation not started

---

## 1. Practical Status Statement

> Expflow `v1.0.1` is the current implementation baseline. The v1 architecture and internal runtime gates are complete. The post-v1 evidence and disposition pass is complete, but no Phase 1 runtime change has been implemented. The ordinary CLI exposes the material core; the differentiating authority, semantic, workflow, projection, and reproduction state remains primarily library-facing. There is no Expflow GUI, portable workflow package, real external pilot, empirical evaluation, Guerilla profile, or Guerilla causal event-view GUI.

This matrix deliberately separates implementation from exposure, validation, adoption, and product proof.

---

## 2. Workflow State

### Historical v1 workflow

| Gate                                 | Scope                                                                                    | Status   | Current interpretation                                                                  |
| ------------------------------------ | ---------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------- |
| A — Contract Ready                   | Governance, decisions, schemas, registries, fixtures, validator parity                   | COMPLETE | Historical v1 evidence; not an active phase.                                            |
| B — Material Core Ready              | Immutable material stores, sync, identity, transactions, recovery, ordinary commands     | COMPLETE | Implemented and internally verified in `v1.0.1`.                                        |
| C — Ownership and Reproduction Ready | Authority, semantics, workflow boundaries, projections, regeneration, equivalence, reuse | COMPLETE | Implemented and internally verified, but not presented as one ordinary product surface. |
| D — Hardened and Proven              | Security, migration, packaging, internal e2e proof, native hardening                     | COMPLETE | Internal proof completed; not equivalent to external product validation.                |

The historical `EXPFLOW_WORKFLOW_CURRENT.md` must be retained or renamed as v1 build history. It is no longer the active workflow SSOT.

### Current Build Week workflow

| Gate                                      | Phases | State   | Blocking condition                                             |
| ----------------------------------------- | -----: | ------- | -------------------------------------------------------------- |
| BW-A — UX Control Surface Ready           |    1–2 | READY   | Phase 1 has not started.                                       |
| BW-B — Workflow Portability Surface Ready |    3–5 | BLOCKED | Requires BW-A exit.                                            |
| BW-C — Pilot Proven                       |    6–7 | BLOCKED | Requires BW-B exit.                                            |
| BW-D — Causal Integration Ready           |    8–9 | BLOCKED | Requires empirical pilot evidence and stable Expflow surfaces. |

The former plan to correlate Expflow completion with a Guerilla external-compatible adapter gate is superseded. Guerilla is now profile-driven and its GUI is a causal event view implemented at the end of this workflow.

---

## 3. Capability Status

Status vocabulary:

- **Implemented:** working source exists.
- **Internally verified:** automated or reproducible internal evidence exists.
- **Ordinary surface:** available through the primary CLI or GUI without importing internal runtimes.
- **Pilot verified:** used in a representative end-to-end workflow.
- **Empirically evaluated:** measured with users or comparative evidence.
- **Production-supported:** explicit support claim backed by operating evidence.

| Capability                                                                       | Implemented                 | Internally verified                    | Ordinary surface                                 | Pilot verified              | Empirically evaluated | Current determination                                                                                            |
| -------------------------------------------------------------------------------- | --------------------------- | -------------------------------------- | ------------------------------------------------ | --------------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Material object, node revision, tree revision, and head stores                   | Yes                         | Yes                                    | CLI + library                                    | No                          | No                    | Stable v1 substrate.                                                                                             |
| `init`, `sync`, `status`, `restore`                                              | Yes                         | Yes                                    | CLI                                              | Limited internal round trip | No                    | Functional, but UX defects remain.                                                                               |
| Material transaction, receipt, staging, and recovery                             | Yes                         | Yes                                    | Indirect through CLI                             | No external pilot           | No                    | Strong internal evidence; failure UX needs exposure.                                                             |
| Authority-source revision and registration decision stores                       | Yes                         | Yes                                    | Library only                                     | No                          | No                    | Differentiating state is not yet productized.                                                                    |
| Assertions, decisions, conflicts, review requests, and source correspondence     | Yes                         | Yes                                    | Library only                                     | No                          | No                    | Implemented record families; no coherent external review surface.                                                |
| Workflow occurrences, virtual artifacts, materialization events, and transitions | Yes                         | Yes                                    | Library only                                     | No                          | No                    | Implemented; no ordinary workflow view.                                                                          |
| Projection manifest proposals, decisions, heads, and staleness                   | Yes                         | Yes                                    | Library only                                     | No                          | No                    | Implemented; no application-facing inspection model.                                                             |
| Regeneration attempts and equivalence evaluations                                | Yes                         | Yes                                    | Library only                                     | No                          | No                    | Implemented; no real workflow evidence.                                                                          |
| Reuse-result records and policy gates                                            | Yes                         | Yes                                    | Library only                                     | No                          | No                    | Implemented; no pilot proof.                                                                                     |
| Security and migration runtimes                                                  | Yes                         | Yes                                    | Library/package workflows                        | No                          | No                    | Internally tested, not externally exercised.                                                                     |
| Extension host                                                                   | Yes                         | Yes                                    | Documented library surface                       | No                          | No                    | Available; not a Guerilla adapter boundary.                                                                      |
| `sync` identity and concurrency directives                                       | Yes                         | Verified on public `v1.0.1`            | CLI flags, absent from ordinary help             | No                          | No                    | `--move`, `--new-node`, `--replace-node`, and `--expected-head` require Phase 1 discoverability work.            |
| Provisional preview identity                                                     | Yes                         | Confirmed on public `v1.0.1`           | JSON/dry-run without explicit provisional status | No                          | No                    | Intentional provisional behavior requires human- and machine-visible labeling or equivalent safe representation. |
| Human-readable status and dry-run decision support                               | Partial                     | Grade-A multi-report reproduction      | CLI                                              | No                          | No                    | Phase 1 work.                                                                                                    |
| Revision discovery through ordinary commands                                     | No adequate surface         | Grade-A multi-report reproduction      | No                                               | No                          | No                    | Blocks usable restore.                                                                                           |
| Restore preview and drift guard                                                  | No                          | Grade-A destructive-drift reproduction | No                                               | No                          | No                    | Phase 1 work; exact restore semantics remain valid.                                                              |
| Expflow local GUI                                                                | No                          | No                                     | No                                               | No                          | No                    | Phase 2.                                                                                                         |
| Stable read models for advanced record families                                  | Partial/internal            | Unit evidence only                     | No                                               | No                          | No                    | Phase 3.                                                                                                         |
| Evidence intake from partial sources                                             | No coherent product surface | No                                     | No                                               | No                          | No                    | Phase 4.                                                                                                         |
| Artifact correspondence review workflow                                          | Internal primitives only    | Unit evidence only                     | No                                               | No                          | No                    | Phase 4.                                                                                                         |
| Portable workflow package export/import                                          | No                          | No                                     | No                                               | No                          | No                    | Phase 5.                                                                                                         |
| Real end-to-end Expflow pilot                                                    | No                          | No                                     | No                                               | No                          | No                    | Phase 7.                                                                                                         |
| Comparative or usability evaluation                                              | No                          | No                                     | No                                               | No                          | No                    | Phase 7.                                                                                                         |
| Expflow Guerilla profile                                                         | No                          | No                                     | No                                               | No                          | No                    | Phase 8.                                                                                                         |
| Guerilla event nodes and causal edges for Expflow operations                     | No                          | No                                     | No                                               | No                          | No                    | Phase 8.                                                                                                         |
| Guerilla causal event-view GUI                                                   | No                          | No                                     | No                                               | No                          | No                    | Phase 9 and final workflow phase.                                                                                |

---

## 4. Accepted Evidence and Product Decisions

The following decisions are controlling inputs to Phase 1. They describe current behavior or authorized direction; they do not claim that the Phase 1 UX has been implemented.

| ID  | Decision or finding                                                                      | Status                                                                      | Required treatment                                                                                                                                                                              |
| --- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | Uninitialized `status` is a read-only state query.                                       | **Decided:** `KEEP_EXIT_0_AND_CLARIFY_STATE`                                | Keep exit `0`; document the query-versus-mutation contract and show `expflow init` as the human next action. Mutations continue to fail closed with exit `1`; unknown commands remain exit `2`. |
| D2  | Exact restore and working-tree consent are separate correctness layers.                  | **Decided direction:** `PRESERVE_EXACT_RESTORE_ADD_CONSENT_AND_DRIFT_GUARD` | Preserve byte-exact forward-commit restore while adding preview, path effects, conflicting-drift detection, refusal by default, and explicit override.                                          |
| R1  | New-file preview identities differ across `status --json`, `sync --dry-run`, and commit. | **Confirmed on `v1.0.1`:** provisional behavior requires labeling           | Make provisional status explicit to machine and human consumers, omit the identity until commitment, or make preview allocation deterministic without silently changing identity semantics.     |
| R2  | Historical post-restore node-revision collision reported on `v1.0.0`.                    | **Not reproduced on `v1.0.1`** in four reconstructions                      | Retain as historical evidence. Do not implement it as a current Phase 1 error class unless new `v1.0.1` evidence appears.                                                                       |
| N1  | `Expflow Studio` naming.                                                                 | **Not approved**                                                            | Use **Expflow GUI** externally and `apps/gui/` internally until a product naming decision is recorded.                                                                                          |

## 5. Known Product and UX Gaps

### Critical ordinary-flow gaps

1. **Revision discovery:** `restore` requires tree or node revision references, but the ordinary surface does not provide a usable revision history.
2. **Restore safety:** restore lacks an ordinary dry-run and explicit drift guard for unrecorded working-tree changes.
3. **Human-readable status:** default output is too terse to explain drift, pending changes, recovery state, or next actions.
4. **Dry-run detail:** `sync --dry-run` reports a count rather than the planned path-level changes.
5. **Identifier comprehension:** project, tree revision, node revision, and provisional identities are not consistently labeled for users.
6. **Recovery remediation:** strong internal recovery classes are not matched by equally strong user-facing diagnosis and next steps.

### Product-surface gaps

1. Advanced record families are implemented but not unified through stable read models and a GUI.
2. There is no attributed multi-source evidence intake workflow.
3. There is no portable workflow package with validation and round-trip import.
4. There is no external proof that users understand the distinction between materialization, completion, verification, equivalence, and reuse.
5. There is no empirical evidence that Expflow reduces reconstruction effort compared with unmanaged chat, file, and Git histories.

### Integration gaps

1. No current Expflow Guerilla profile exists.
2. No causal event node or edge contracts exist for Expflow operations.
3. No Guerilla event-view GUI exists.
4. FIMP receipts and Reqtrace records may be referenced in later pilots, but their full product implementations are outside the Expflow Build Week critical path.

---

## 6. Evidence Boundary

### Proven internally

- contract and schema validation;
- immutable material history;
- sync and restore round trips;
- operation receipts and recovery paths;
- advanced record-family runtime tests;
- security and migration test surfaces;
- package publication and clean installation evidence for the v1 line.

### Not yet proven

- comprehensibility for a new user;
- safe ordinary restore decision-making;
- useful inspection of authority and workflow state;
- evidence reconciliation on real partial histories;
- portable package round trips on real work;
- reduced workflow reconstruction cost;
- external user adoption;
- Guerilla causal integration.

Internal conformance is necessary evidence. It is not a substitute for pilot or usability evidence.

---

## 7. Current Critical Path

```text
Phase 1 — Ordinary UX/UI Corrections
    -> Phase 2 — Expflow GUI Foundation
    -> Phase 3 — Stable Read Models
    -> Phase 4 — Evidence Intake and Authority Reconciliation
    -> Phase 5 — Portable Workflow Package
    -> Phase 6 — Major Engineering and Functional Gap Closure
    -> Phase 7 — Pilot and Empirical Evaluation
    -> Phase 8 — Expflow Guerilla Profile
    -> Phase 9 — Guerilla Causal Event-View GUI
```

No phase after Phase 1 is authorized until the Phase 1 completion report passes.

---

## 8. Current Phase Entry Conditions

Phase 1 may begin when:

- this matrix, the current workflow, the directory structure, and the glossary are accepted;
- the v1.0.1 baseline commit is recorded in the phase report;
- `REVIEWS_INDEX.md`, `REVIEW_DISPOSITION_MATRIX.md`, and `IMPLEMENTATION_FINDINGS.md` are available locally as evidence inputs;
- the accepted D1/D2 decisions and R1/R2 dispositions are preserved;
- compatibility and validation commands are known;
- the implementation agent agrees not to enter GUI, evidence-intake, portability, or Guerilla scope.

---

## 9. Status Update Rules

Update this matrix only when one of these occurs:

- a phase begins, passes, becomes partial, or fails;
- implemented behavior changes;
- an ordinary surface is added or removed;
- new automated evidence is accepted;
- pilot or empirical evidence is produced;
- a compatibility or production-support claim changes;
- a blocker changes the critical path.

Do not use estimated maturity percentages. Record independently whether a capability is implemented, internally verified, exposed, piloted, evaluated, and supported.

---

## Config Reference Index

<!-- config-reference-index:start -->

- `.config-reference-reconciliation.yaml` - active status role
- `AGENTS.md` - source-of-truth order

<!-- config-reference-index:end -->
