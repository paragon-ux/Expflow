# Current Status Matrix

**Status:** Current internal status control
**Last updated:** 2026-07-21
**Implementation baseline:** Expflow `v1.0.1`
**Post-baseline changes:** Phase 1 ordinary CLI UX accepted, merged, repaired, and post-merge validated at `4a4603435d4a61ff0776ec814dd36a1a12633a6d`
**Historical workflow:** Gates A–D complete and closed
**Current workflow:** `BUILD_WEEK_WORKFLOW_CURRENT.md`
**Current phase:** Phase 2 — Expflow GUI Foundation
**Phase state:** Phase 1 accepted, merged, and post-merge validated; Phase 2 is the next authorized phase

---

## 1. Practical Status Statement

> Expflow `v1.0.1` is the current implementation baseline. The v1 architecture and internal runtime gates are complete. The post-v1 evidence and disposition pass is complete. Phase 1 ordinary CLI UX is accepted, merged, and post-merge validated: status, sync preview, restore preview, restore drift refusal, per-command help, strict parsing, remediation-first errors, and provisional-identity labeling are implemented and covered by focused and full validation. The differentiating authority, semantic, workflow, projection, and reproduction state remains primarily library-facing. There is no Expflow GUI, portable workflow package, real external pilot, empirical evaluation, Guerilla profile, or Guerilla causal event-view GUI.

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
| BW-A — UX Control Surface Ready           |    1–2 | ACTIVE  | Phase 1 accepted and merged; Phase 2 authorized.               |
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

| Capability                                                                       | Implemented                 | Internally verified   | Ordinary surface               | Pilot verified              | Empirically evaluated | Current determination                                                                                      |
| -------------------------------------------------------------------------------- | --------------------------- | --------------------- | ------------------------------ | --------------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------- |
| Material object, node revision, tree revision, and head stores                   | Yes                         | Yes                   | CLI + library                  | No                          | No                    | Stable v1 substrate.                                                                                       |
| `init`, `sync`, `status`, `restore`                                              | Yes                         | Yes                   | CLI                            | Limited internal round trip | No                    | Phase 1 CLI UX accepted and merged; external pilot still absent.                                           |
| Material transaction, receipt, staging, and recovery                             | Yes                         | Yes                   | Indirect through CLI           | No external pilot           | No                    | Strong internal evidence; failure UX needs exposure.                                                       |
| Authority-source revision and registration decision stores                       | Yes                         | Yes                   | Library only                   | No                          | No                    | Differentiating state is not yet productized.                                                              |
| Assertions, decisions, conflicts, review requests, and source correspondence     | Yes                         | Yes                   | Library only                   | No                          | No                    | Implemented record families; no coherent external review surface.                                          |
| Workflow occurrences, virtual artifacts, materialization events, and transitions | Yes                         | Yes                   | Library only                   | No                          | No                    | Implemented; no ordinary workflow view.                                                                    |
| Projection manifest proposals, decisions, heads, and staleness                   | Yes                         | Yes                   | Library only                   | No                          | No                    | Implemented; no application-facing inspection model.                                                       |
| Regeneration attempts and equivalence evaluations                                | Yes                         | Yes                   | Library only                   | No                          | No                    | Implemented; no real workflow evidence.                                                                    |
| Reuse-result records and policy gates                                            | Yes                         | Yes                   | Library only                   | No                          | No                    | Implemented; no pilot proof.                                                                               |
| Security and migration runtimes                                                  | Yes                         | Yes                   | Library/package workflows      | No                          | No                    | Internally tested, not externally exercised.                                                               |
| Extension host                                                                   | Yes                         | Yes                   | Documented library surface     | No                          | No                    | Available; not a Guerilla adapter boundary.                                                                |
| `sync` identity and concurrency directives                                       | Yes                         | Focused Phase 1 tests | CLI flags and per-command help | No                          | No                    | `--move`, `--new-node`, `--replace-node`, and `--expected-head` are discoverable in `expflow sync --help`. |
| Provisional preview identity                                                     | Yes                         | Focused Phase 1 tests | CLI and JSON/dry-run           | No                          | No                    | Provisional status is explicit in human preview/status output and additive machine fields.                 |
| Human-readable status and dry-run decision support                               | Yes                         | Focused Phase 1 tests | CLI                            | No                          | No                    | Accepted Phase 1 surface; full and post-merge validation recorded in Phase 1 reports.                      |
| Revision discovery through ordinary commands                                     | Yes                         | Focused Phase 1 tests | CLI                            | No                          | No                    | `status --history` and `status --node-history <path>` expose restore references.                           |
| Restore preview and drift guard                                                  | Yes                         | Focused Phase 1 tests | CLI                            | No                          | No                    | `restore --dry-run` previews; default restore refuses conflicting drift; `--force` is explicit override.   |
| Expflow local GUI                                                                | No                          | No                    | No                             | No                          | No                    | Phase 2.                                                                                                   |
| Stable read models for advanced record families                                  | Partial/internal            | Unit evidence only    | No                             | No                          | No                    | Phase 3.                                                                                                   |
| Evidence intake from partial sources                                             | No coherent product surface | No                    | No                             | No                          | No                    | Phase 4.                                                                                                   |
| Artifact correspondence review workflow                                          | Internal primitives only    | Unit evidence only    | No                             | No                          | No                    | Phase 4.                                                                                                   |
| Portable workflow package export/import                                          | No                          | No                    | No                             | No                          | No                    | Phase 5.                                                                                                   |
| Real end-to-end Expflow pilot                                                    | No                          | No                    | No                             | No                          | No                    | Phase 7.                                                                                                   |
| Comparative or usability evaluation                                              | No                          | No                    | No                             | No                          | No                    | Phase 7.                                                                                                   |
| Expflow Guerilla profile                                                         | No                          | No                    | No                             | No                          | No                    | Phase 8.                                                                                                   |
| Guerilla event nodes and causal edges for Expflow operations                     | No                          | No                    | No                             | No                          | No                    | Phase 8.                                                                                                   |
| Guerilla causal event-view GUI                                                   | No                          | No                    | No                             | No                          | No                    | Phase 9 and final workflow phase.                                                                          |

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

### Phase 1 ordinary-flow accepted surface

1. **Revision discovery:** `status --history` and `status --node-history <path>` expose tree and node restore references.
2. **Restore safety:** `restore --dry-run` previews affected paths; default restore refuses conflicting unrecorded drift; `--force` is explicit.
3. **Human-readable status:** default output explains project state, current project version, pending changes, and next actions.
4. **Dry-run detail:** `sync --dry-run` reports path-level changes and provisional identities.
5. **Identifier comprehension:** project, tree revision, node revision, operation, and provisional identifiers are labeled in ordinary output.
6. **Recovery remediation:** CLI errors include the code, mutation result, recommended action, and `status` inspection guidance.

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

Phase 2 is authorized after Phase 1 acceptance, merge, and post-merge validation.

---

## 8. Current Phase Entry Conditions

Phase 2 may begin when:

- Phase 1 completion and finding reports record accepted review evidence;
- Phase 1 is merged into the rolling integration branch and post-merge repaired at `4a4603435d4a61ff0776ec814dd36a1a12633a6d`;
- post-merge validation is recorded in `docs/internal/phase_reports/PHASE_01_POST_MERGE_VALIDATION.md`;
- the integration branch is clean;
- Phase 2 prompt and relevant documented application surfaces are read before implementation.

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
