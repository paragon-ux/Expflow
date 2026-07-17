# System 2 Improvements

**Status:** mutable architectural and review-orientation record  
**Scope:** Deliberate decisions used when architecture, gate ownership, maturity, or integration meaning is disputed

System 2 improvements preserve evaluated mutual understanding across passes. They do not replace the workflow or implementation specification. They tell reviewers and implementers how to classify difficult questions before expanding scope.

## ADR-S2-001 — Gate Maturity Classification

### Issue

A review can interpret "complete" as requiring every later integration, security, pilot, and release decision.

### Decision

Classify disputed work before adding scope.

| Class | Meaning | Correct response |
|---|---|---|
| Invariant | Rule every later gate must preserve | Freeze and test now |
| Decision slot | Concrete choice owned by a later gate | Name owner and constraints; do not decide early |
| Harness | Machinery that can validate future evidence | Keep small and describe honestly |
| Seed evidence | Minimal examples proving the harness works | Preserve as seeds |
| Implementation evidence | Runtime, recovery, compatibility, or security proof | Require only when the owning runtime exists |
| Historical evidence | Proof of a completed earlier phase | Preserve; annotate supersession rather than rewrite history |

### Review Response

If a finding exists only because wording overclaims maturity, correct the wording. If it exposes a missing current invariant, implement the invariant. Do not make the current gate absorb future work by default.

## ADR-S2-002 — Normalize Interaction, Not External Systems

### Issue

A universal integration layer can become an opinionated protocol every project must implement.

### Decision

Guerilla standardizes:

- discovery;
- command classification;
- pre/post observation;
- native invocation capture;
- evidence publication;
- continuity reconciliation.

It does not standardize each system's domain model or replace its ordinary commands.

### Review Response

Reject proposals that require Expflow, Reqtrace, Patch-DIFF, Git, or a future project to adopt Guerilla-specific application semantics merely to participate.

## ADR-S2-003 — The Hook Runtime Sits Above the DAG

### Issue

The existing architecture emphasizes the DAG and treats adapters as separate integration components.

### Decision

Guerilla has two cooperating planes:

```text
Universal Hook and Conformance Runtime — control and ingestion plane
Authoritative Continuity DAG           — lineage and evidence plane
```

The hook runtime brackets and observes native work. The DAG commits lineage, conflicts, decisions, and continuity.

### Review Response

Do not put native command execution semantics into the DAG kernel, and do not put continuity authority into profiles or drivers.

## ADR-S2-004 — External Systems Retain Application-State Authority

### Issue

Launching a command through Guerilla can be misread as Guerilla owning the command's result.

### Decision

Execution custody is not state authority.

The native system remains authoritative for:

- application state;
- identifiers;
- revisions;
- validation;
- commit/rollback behavior;
- native error semantics.

Guerilla remains authoritative for the causal lineage and continuity records surrounding that work.

## ADR-S2-005 — Profiles Replace Bespoke Adapters by Default

### Issue

A bespoke adapter per product creates pairwise maintenance and makes Guerilla an internal platform.

### Decision

The default integration unit is a declarative **system conformance profile**.

A profile declares:

- detection;
- command classes;
- observation commands or filesystem views;
- output extractors;
- state boundaries;
- consistency;
- redaction;
- known limitations.

It contains no independent lineage engine.

### Review Response

Approve code only after the author proves the profile language is insufficient.

## ADR-S2-006 — Provider Drivers Are a Narrow Exception

### Issue

Remote-only services cannot always be accessed through a local command or filesystem.

### Decision

A driver is permitted when no ordinary local interface exists. It is only a transport implementation under the same universal lifecycle.

It must not define provider-specific:

- graph semantics;
- idempotency authority;
- conflict authority;
- continuation policy;
- reconciliation ledger.

## ADR-S2-007 — Guerilla Owns Reconciliation

### Issue

The earlier adapter model placed uncertain-outcome reconciliation inside each adapter.

### Decision

Profiles and drivers collect normalized native evidence. Guerilla's DAG and reconciliation engine interpret that evidence against committed intent, prior observations, cross-system lineage, and current state boundaries.

### Review Response

Rename adapter methods such as `reconcile` when they actually mean `probe_native_outcome` or `collect_evidence`. Preserve one authoritative reconciliation implementation.

## ADR-S2-008 — The Native Action Is Bracketed, Not Reimplemented

### Issue

A hook can drift into a replacement orchestration engine.

### Decision

The universal lifecycle is:

```text
pre-observation
→ committed Guerilla intent
→ unchanged native invocation
→ native result capture
→ post-observation
→ Guerilla reconciliation
```

Guerilla may block launch under explicit policy or unresolved continuity conflict, but it does not emulate the system's mutation.

## ADR-S2-009 — Gate C Remains Valid but Is Reinterpreted

### Issue

Gates B and C implemented a graph kernel, synthetic adapter SDK, observe/action lifecycle, idempotency, reconciliation, projections, snapshots, and CLI. The universal-hook architecture changes the future integration model.

### Decision

Do not declare Gates B or C invalid.

Reclassify the synthetic adapter work as:

- a conformance harness;
- evidence for bounded observe/invoke/evaluate behavior;
- reusable lifecycle primitives;
- transitional terminology to be migrated.

Gate D owns the universal hook host, declarative profiles, driver exception, resynchronization, isolation, and external compatibility.

### Review Response

Preserve historical completion reports. Add supersession notes and update current normative documents; do not falsify the record of what earlier phases implemented.

## ADR-S2-010 — Resynchronization Complements Hooks

### Issue

No wrapper can guarantee that every human, agent, CI process, or external service uses it.

### Decision

Hooks provide high-fidelity before/after causality. Resynchronization detects and records changes that occurred outside managed invocation.

The architecture requires both:

```text
managed invocation for prospective continuity
resynchronization for reconstructed continuity
```

## ADR-S2-011 — One Agent Surface Is a Product Requirement

### Issue

A generic internal runtime can still expose provider-specific model tools.

### Decision

The model-facing surface should remain small and filesystem/command shaped:

- `read(path)`;
- `search(path, query)`;
- `run(system, argv, options)`;
- `status(system)`;
- `sync(system or workspace)`.

Provider-specific resources may appear as paths under a common namespace. They must not require a new tool schema for each project.

## ADR-S2-012 — Universality Requires External Proof

### Issue

Three first-party profiles can conform while sharing undocumented assumptions.

### Decision

Gate D external compatibility requires:

- the three initial project profiles;
- at least one unrelated ordinary CLI profile;
- one remote-driver fixture or documented deferral;
- proof that adding the unrelated profile changes no Guerilla core code.

## ADR-S2-013 — No Forced Compatibility

### Issue

A universal hook architecture may pressure systems to add `--guerilla` commands or callbacks.

### Decision

Prefer existing ordinary commands, machine-readable output, filesystem state, and public APIs. Request generic improvements such as stable `--json` only when useful independently of Guerilla.

A project-specific Guerilla dependency is optional, never the default conformance requirement.

## ADR-S2-014 — Orientation Is Mutable Evaluated Understanding

### Issue

Between-session summaries and inferred memory can preserve stale or probabilistic assumptions.

### Decision

System 1 and System 2 records are explicit, reviewable, mutable decision records. Each pass reads them, challenges them against current evidence, and updates them when mutual understanding changes.

They are process knowledge, not hidden runtime state and not a substitute for the authoritative DAG.

## ADR-S2-015 — Completed Phase Numbers Are Not Reassigned

### Issue

The universal-hook revision could be described as replacing Phase 15, even though Gate C and Phase 15 already completed under the internal CLI and synthetic lifecycle model.

### Decision

Do not retroactively change what a completed phase delivered.

Phase 15 remains historical internal CLI evidence. The architecture revision begins with documentation convergence and contract-delta passes, then changes Gate D Phases 16–19.

### Review Response

Reject plans that rewrite Gate C history to make the current architecture appear original. Preserve evidence and add supersession notes.

## ADR-S2-016 — Profile Extensibility Is Declarative and Bounded

### Issue

Profiles need custom observations, but arbitrary profile code would recreate bespoke adapters.

### Decision

A profile may define custom observation commands when all of the following hold:

- executable and argument templates are declarative arrays;
- no implicit shell is used;
- every command is classified read-only;
- cwd, environment, timeout, output size, and filesystem/network boundaries are declared;
- parser and extractor types come from the registered data-only set;
- conformance fixtures prove non-mutation.

If these constraints cannot express the integration, use a provider driver.

## ADR-S2-017 — Profile Identity, Coexistence, and Upgrade

### Issue

Native systems and APIs evolve, and multiple profile versions may remain necessary.

### Decision

Profile identity has four parts:

```text
profile_id
profile_version
hook_protocol_version
content_digest
```

Multiple profile versions may coexist. Each workspace pins an exact version and digest. Compatibility is declared by the profile as native-version ranges and required capabilities. Guerilla performs deterministic selection but no automatic profile upgrade or provider negotiation.

Upgrades are explicit workspace changes with conformance validation and a recorded decision.

## ADR-S2-018 — Asynchronous Driver Fallback

### Issue

Some providers expose only asynchronous jobs, and some cannot reliably reveal whether a timed-out mutation completed.

### Decision

Provider drivers may return an opaque native handle and implement bounded `probe_native_outcome`.

Required classifications are:

- `accepted_pending`;
- `confirmed_completed`;
- `confirmed_rejected`;
- `confirmed_failed`;
- `confirmed_cancelled`;
- `still_pending`;
- `unknown_probe_failed`;
- `unknown_unprobeable`.

When no reliable probe exists, Guerilla preserves `unknown_unprobeable`, permits read-only resynchronization, and requires an explicit human or policy decision before any potentially duplicating retry.

## ADR-S2-019 — Resource Discovery Uses the Generic Namespace

### Issue

Agents need to discover available systems and capabilities without provider-specific tools.

### Decision

The canonical discovery root is:

```text
guerilla://systems/
```

Reading the collection returns system-instance descriptors. Each descriptor includes:

- stable `system_instance_id`;
- selected profile identity and digest;
- native version evidence;
- state boundaries;
- command classes;
- continuity mode;
- resource roots;
- live/cached status capability;
- known limitations.

`status(system)` is a generic convenience over the same descriptor and observation model.

## ADR-S2-020 — Managed and Unmanaged Work Share Boundary Anchors

### Issue

The same native system may be invoked through Guerilla and directly between two resynchronization passes.

### Decision

Every managed invocation records:

- pre-observation boundary;
- committed intent;
- native invocation reference;
- post-observation boundary;
- observation digests.

Resynchronization starts from the latest committed native boundary, subtracts already-accounted managed effects when evidence permits, and appends only the unobserved interval.

When native evidence cannot separate managed from unmanaged effects, Guerilla records an `ambiguous_overlap` continuity conflict and does not fabricate action-level causality.

## ADR-S2-021 — Fail-Closed Mutation, Explicit Untracked Reads

### Issue

The DAG or hook runtime may be unavailable when a command is requested.

### Decision

Mutating, destructive, and administrative commands require a committed Guerilla intent and therefore fail closed when the DAG cannot commit.

Read-only and observational commands also fail closed by default. A workspace may explicitly permit `untracked_read_policy = allow`; such execution returns native output but makes no lineage claim and emits only a local diagnostic when possible.

## ADR-S2-022 — Git Is the Required Unrelated CLI Proof

### Issue

"One unrelated CLI" leaves Gate D universality evidence underspecified.

### Decision

The required fourth Gate D profile is `git.cli.v1`.

The proof must cover at least:

- repository discovery;
- read-only status and log observations;
- a bounded mutating command fixture in a disposable repository;
- native exit preservation;
- managed/unmanaged interleaving;
- resynchronization without duplicate lineage;
- zero Git-specific changes to Guerilla core.

A `gh.cli` or remote provider profile may be added, but it does not replace the Git proof.
