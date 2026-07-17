# Guerilla Workflow — Universal Hook Architecture

**Version:** 2.1  
**Date:** 2026-07-17  
**Status:** Final workflow SSOT for the architecture revision and Gate D implementation  
**Historical state:** Gates A, B, and C complete under prior adapter-oriented terminology  
**Current determination:** Preserve completed core evidence; implement one Guerilla-owned universal hook/conformance runtime

---

## 1. Purpose

This workflow controls the move from the completed internal continuity MVP to universal external compatibility.

The settled architecture is:

> Guerilla provides one universal hook and conformance runtime over existing ordinary commands, filesystems, native hooks, and public APIs. External systems retain application-state authority. Data-only profiles are the default integration unit. Isolated provider drivers are the exception for interfaces that cannot be expressed declaratively. The Guerilla DAG remains the sole lineage and continuity authority.

This workflow controls process, phase ownership, evidence, and stop conditions.

`docs/architecture/GUERILLA_UNIVERSAL_HOOK_IMPLEMENTATION_SPEC.md` controls runtime behavior.

The Orientation trio controls reusable pass-start interpretation and improvement.

---

## 2. Why the Existing Package Is Revised, Not Regenerated

Gates A–C already produced valid implementation evidence:

- architecture decisions and machine contracts;
- append-only graph storage, replay, integrity, and index rebuilding;
- authority and state-boundary enforcement;
- synthetic observe/invoke/evaluate/probe surfaces;
- intent-before-action;
- graph-backed idempotency;
- uncertain-outcome reconciliation;
- conflicts, decisions, projections, snapshots, resume, and internal CLI workflows.

The universal-hook model changes the **external integration form**, not the DAG identity or completed Gate C evidence.

Therefore:

- completed phase numbers are not reassigned;
- Phase 15 remains the historical internal CLI phase;
- existing completion reports remain historical evidence;
- current normative documents receive supersession notes and revised Gate D direction;
- contract deltas are versioned rather than rewritten in place without review.

---

## 3. Controlling Source Roles

1. Explicit accepted user decisions.
2. This workflow for process and gate ownership.
3. The universal-hook implementation specification for required behavior.
4. Accepted machine contracts and architecture decisions.
5. System 1 and System 2 orientation records.
6. Current implementation and tests as evidence.
7. Current status and completion reports.
8. Historical papers and phase prompts where not superseded.

A historical completion report never overrides current normative architecture.

A System ADR never silently overrides the workflow, specification, or machine contract.

---

## 4. Locked Product Boundary

### Guerilla owns

- authoritative causal-lineage and continuity DAG;
- graph identity, revision, commit, replay, conflict, decision, and projection provenance;
- universal hook/conformance host;
- profile validation and selection;
- managed invocation lifecycle;
- before/after evidence capture;
- graph-backed idempotency;
- uncertain-outcome reconciliation;
- resynchronization;
- provider-driver isolation;
- generic agent resource and command surface.

### External systems own

- native application state;
- native commands and APIs;
- identifiers and revisions;
- validation;
- authorization within native boundaries;
- native transaction, rollback, merge, restore, and recovery semantics.

### Profiles own

Only declarative conformance facts:

- detection;
- command classification;
- observation recipes;
- registered parser/extractor selection;
- state boundaries;
- native-version compatibility;
- continuity mode;
- redaction;
- limitations.

Profiles contain no arbitrary code, shell fragments, credentials, graph writes, continuity state, retry authority, or conflict decisions.

### Provider drivers own

Only exceptional transport and native outcome probing when an ordinary command, native hook, or declarative profile cannot express the interface.

Drivers never own graph mutation or continuity decisions.

---

## 5. Canonical Interfaces

### 5.1 Agent/library surface

```text
read(path)
search(path, query)
run(system_instance_id, argv, options)
status(system_instance_id, freshness)
sync(scope)
```

### 5.2 CLI surface

```text
guerilla read <guerilla-uri>
guerilla search <guerilla-uri> --query <text>
guerilla run <system-instance-id> -- <native-args...>
guerilla status [system-instance-id] [--live|--cached]
guerilla sync [system-instance-id|--workspace]
```

`sync` means Guerilla resynchronization. It never silently invokes a native mutating sync command.

Native mutating commands are executed only through `run`.

### 5.3 Discovery root

```text
guerilla://systems/
```

Reading this collection returns registered and discovered system-instance descriptors.

---

## 6. Canonical Managed-Invocation Lifecycle

```text
resolve workspace and system instance
→ load exact pinned profile
→ classify command
→ capture required/optional pre-observations
→ commit Guerilla intent
→ record invocation start
→ invoke native interface without semantic rewriting
→ capture native result or uncertainty
→ capture post-observations
→ publish normalized evidence
→ reconcile continuity in Guerilla
→ return native result
```

### 6.1 Fail-closed rules

- Unknown commands are blocked.
- Mutating, destructive, and administrative commands require a committed intent.
- Required pre-observation failure blocks those command classes.
- DAG unavailability blocks those command classes.
- Read-only operations also fail closed by default.
- `untracked_read_policy = allow` is an explicit workspace exception and makes no lineage claim.

### 6.2 Post-operation evidence failure

A failed post-observation or graph publication does not retroactively turn native success into native failure.

It creates partial or unknown continuity evidence, drains through the non-authoritative outbox where applicable, and enters Guerilla reconciliation.

---

## 7. Finalized Cross-Cutting Decisions

| Question | Locked decision |
|---|---|
| Can profiles define custom observations? | Yes, as bounded data-only argument-array recipes using registered parsers/extractors. No profile code or shell. |
| What if declarative profiles are insufficient? | Use an isolated provider driver under the same lifecycle. |
| What if an async provider cannot prove outcome? | Preserve `unknown_unprobeable`; no automatic duplicate-risk retry. |
| Can profile versions coexist? | Yes. Workspaces pin exact profile version, hook protocol version, and content digest. |
| Does Guerilla auto-upgrade profiles? | No. Upgrade is explicit, validated, and recorded. |
| How are systems discovered? | `read("guerilla://systems/")` returns descriptors; explicit system selection and workspace pins outrank discovery. |
| What if multiple profiles match? | Structured ambiguity failure; never guess. |
| How are managed and unmanaged changes deduplicated? | Compare native revision/operation references and observation boundary digests. Ambiguous overlap becomes a conflict. |
| Which unrelated CLI proves universality? | Git through `git.cli.v1`. |
| Is Phase 15 replaced? | No. Phase 15 remains completed historical internal CLI evidence. |

---

## 8. Build Gates

| Gate | Phases | Meaning | Status |
|---|---:|---|---|
| A — Contract Ready | 1–4 | Architecture decisions, schemas, registries, fixtures | Complete |
| B — Kernel Ready | 5–8 | Append-only DAG, replay, integrity, authority, index | Complete |
| C — Continuity MVP | 9–15 | Synthetic lifecycle, intent, idempotency, reconciliation, projections, snapshots, CLI | Complete |
| D — Universal External Compatibility | 16–19 | Hook/profile contracts, host, resynchronization, drivers, isolation, universality proof | Next |
| E — Research Validated | 20–22 | Real heterogeneous pilots, evaluation, reproducible release | Blocked by Gate D |

---

# Architecture Revision Passes

## 9. R1 — Documentation Convergence

Deliver:

- Orientation trio installed and linked;
- this workflow installed as SSOT;
- universal-hook specification installed as the current Gate D architecture;
- current normative documents revised;
- historical reports annotated, not rewritten;
- adapter terminology classified as profile, hook host, provider driver, synthetic historical harness, or obsolete bespoke integration;
- current status updated;
- contradictions inventory closed.

Exit when:

1. no current normative document requires each system to expose a Guerilla adapter;
2. no current normative document gives profiles or drivers reconciliation authority;
3. Phase 15 and Gate C history remain truthful;
4. Gate D phases use the finalized decisions in Section 7.

## 10. R2 — Contract Delta

Classify every adapter-era schema, registry value, fixture, and public type:

| Classification | Action |
|---|---|
| DAG/continuity core | Retain |
| Generic hook lifecycle | Retain or version into hook protocol |
| Declarative system description | Migrate to profile schema |
| Provider transport | Migrate to driver contract |
| Native outcome evidence | Rename from reconciliation where necessary |
| Historical compatibility | Alias or deprecate for one documented compatibility window |
| Bespoke per-system authority | Remove from current contracts |

R2 must freeze:

- profile identity/version/digest;
- profile-lock format;
- deterministic selection order;
- command-pattern grammar;
- observation recipe grammar;
- registered parser/extractor set;
- resource descriptor schema;
- native result and async outcome enums;
- resynchronization boundary anchors;
- outbox envelope;
- driver IPC contract;
- compatibility and deprecation rules.

Exit only when TypeScript/Python or equivalent validators agree on all new fixtures and historical Gate C records remain readable.

---

# Gate D — Universal External Compatibility

## 11. Phase 16 — Hook Protocol, Profile Schema, and Git Proof Harness

### Objective

Freeze the universal protocol before implementing external execution.

### Deliver

- `guerilla.command-hook.v1`;
- exact profile identity and lock contracts;
- data-only profile schema;
- deterministic command-pattern grammar;
- required/optional observation recipes;
- registered declarative parsers/extractors;
- system-instance descriptor and `guerilla://systems/` collection contracts;
- native result and async outcome enums;
- resynchronization boundary-anchor contracts;
- driver descriptor and evidence-only IPC contract;
- fixtures for:
  - Expflow;
  - Reqtrace;
  - Patch-DIFF;
  - `git.cli.v1`;
  - one synthetic asynchronous provider driver.

### Prohibited

- arbitrary code in profiles;
- implicit shell commands;
- provider-specific agent tools;
- profile/driver graph writes;
- provider-specific reconciliation;
- automatic profile upgrades;
- project-specific Guerilla SDK requirements.

### Exit

All four CLI profiles validate through one schema; Git requires no Guerilla core change; the async driver fixture can return `unknown_unprobeable` without unsafe retry.

## 12. Phase 17 — Hook Host and Generic Runtime Surface

### Objective

Implement the one managed native-invocation path.

### Deliver

- workspace and system-instance resolver;
- exact profile-lock loading;
- deterministic profile selection;
- discovery ambiguity failures;
- command classifier with unknown-command deny;
- argument-array executor;
- cwd, stdin, environment, signal, cancellation, timeout, stdout, stderr, and exit capture;
- required/optional observation engine;
- intent and invocation integration;
- evidence normalization;
- one graph publisher;
- bounded non-authoritative outbox;
- recursion protection;
- generic `read`, `search`, `run`, `status`, and `sync` surfaces.

### Exit

Expflow, Reqtrace, Patch-DIFF, and Git execute through the same host with preserved native results and no system-specific host branches.

## 13. Phase 18 — Resynchronization, Driver Isolation, and Failure Semantics

### Objective

Cover unmanaged work and exceptional transports safely.

### Deliver

- live/cached observation policy;
- managed invocation boundary anchors;
- resynchronization checkpoints;
- managed/unmanaged deduplication;
- `ambiguous_overlap` continuity conflict;
- missing managed-invocation detection;
- isolated driver subprocess;
- schema-only IPC;
- no graph filesystem access for drivers;
- injected credentials and endpoint allowlists;
- resource/time/output limits;
- async native-handle polling;
- all finalized outcome classifications;
- outbox crash recovery;
- explicit untracked-read policy.

### Exit

Managed and unmanaged work can interleave without duplicate certainty, and an unprobeable async mutation remains unknown until explicit resolution.

## 14. Phase 19 — Universal Conformance Proof

### Required systems

1. Expflow profile;
2. Reqtrace profile;
3. Patch-DIFF profile;
4. Git profile.

### Required proof

- profile-only Git integration;
- one generic agent surface;
- exact profile pinning and coexistence;
- ambiguous profile selection failure;
- custom declarative observation command;
- arbitrary profile code rejection;
- unknown-command rejection;
- required pre-observation failure before native launch;
- native argv/exit/signal preservation;
- native success with failed post-observation preserved correctly;
- managed and unmanaged Git changes across one resynchronization window;
- no duplicate lineage for the managed portion;
- `ambiguous_overlap` when attribution cannot be proven;
- isolated synthetic async driver;
- `unknown_unprobeable` with no blind retry;
- one authoritative Guerilla reconciliation result;
- clean package installation and hosted CI.

### Gate D Exit

Adding an ordinary CLI must require:

```text
profile
+ profile lock entry
+ fixtures
+ optional documentation
```

It must not require:

```text
Guerilla core edits
+ provider-specific model tools
+ a provider reconciliation engine
+ changes to the external project
```

---

# Gate E — Research Validation

## 15. Phase 20 — Heterogeneous Pilots

Use real workflows across distinct state models. At least one pilot must be outside the original four-project suite.

## 16. Phase 21 — Evaluation

Measure:

- integration effort;
- profile size and complexity;
- profile-version upgrade behavior;
- percentage requiring driver code;
- continuity gaps detected;
- unknown outcomes reconciled;
- ambiguous-overlap rate;
- false conflict rate;
- agent tool-selection burden;
- runtime overhead;
- recovery behavior.

## 17. Phase 22 — Reproducible Release

Publish versioned contracts, conformance kit, profile authoring guide, reference profiles, raw evaluation evidence, reproducible packages, residual risks, and non-claims.

---

## 18. Every-Pass Workflow

```text
read Orientation trio
→ inspect live repository and PR state
→ locate owning workflow phase
→ read governing spec sections
→ classify maturity and ownership
→ make the smallest coherent change
→ run focused evidence
→ run shared-contract validation when needed
→ update status and top-level README maps
→ revise System ADRs when understanding changes
→ hand off the exact next authorized work
```

---

## 19. Stop Conditions

Stop the affected mutation when:

- a profile requires executable arbitrary code;
- a profile or driver would write graph state directly;
- an unknown command would be guessed rather than blocked;
- a mutating command would launch before intent commit;
- required pre-observation is unavailable;
- a driver cannot prove outcome and an automatic retry is proposed;
- profile selection is ambiguous;
- a profile upgrade would occur automatically;
- resource discovery requires a provider-specific model tool;
- resynchronization would duplicate or fabricate action causality;
- a project must adopt a Guerilla SDK to expose an existing ordinary interface;
- historical Gate C evidence would need falsification;
- machine contracts disagree on record identity or graph validity.

---

## 20. Final Build Principle

> One Guerilla hook and conformance runtime brackets many native systems.

> Profiles are pinned, declarative descriptions of ordinary interfaces. Drivers are isolated transport exceptions. External systems own their state. The Guerilla DAG alone owns cross-system lineage, reconciliation, and continuity.
