# Codex Prompt — Revise Guerilla Documentation for the Universal Hook Architecture

## Objective

Revise the existing Guerilla repository documentation so every current normative and operational document reflects this settled architecture:

> Guerilla owns one authoritative cross-system causal-lineage and continuity DAG and one universal hook/conformance runtime over existing native commands, filesystems, and public APIs. External systems retain application-state authority. Declarative profiles are the default integration unit. Provider drivers are exceptional transport modules for systems without ordinary local interfaces. Profiles and drivers return evidence; Guerilla alone owns idempotency truth, conflict authority, reconciliation, and continuation.

This is a **documentation architecture-revision pass**.

The architecture questions in the universal-hook specification are finalized. Do not preserve them as open decision slots.

Do not implement runtime behavior in this pass.

Do not regenerate the entire build package.

Preserve completed Gate A, Gate B, and Gate C evidence while revising the future Gate D path.

---

## Required Inputs

Read in this order:

1. `docs/orientation/README.md`
2. `docs/orientation/SYSTEM_1_IMPROVEMENTS.md`
3. `docs/orientation/SYSTEM_2_IMPROVEMENTS.md`
4. `docs/GUERILLA_WORKFLOW_CURRENT.md`
5. `docs/architecture/GUERILLA_UNIVERSAL_HOOK_IMPLEMENTATION_SPEC.md`
6. root `AGENTS.md`
7. root `README.md`
8. `README_DEV.md`
9. all current `docs/` architecture, rationale, control, workflow, test, status, phase-prompt, and completion-report files
10. all `.agents/skills/**/SKILL.md`
11. current schemas, registries, source code, and tests only as implementation evidence

The supplied five documents and this prompt are controlling for the revision where existing documentation conflicts.

---

## Pass Start

Before editing:

1. inspect branch and worktree;
2. inspect current commit and relevant PR state;
3. identify local-only directories and user changes;
4. inventory all Markdown files;
5. classify each file as:
   - current normative;
   - current operational;
   - mutable status;
   - phase prompt;
   - historical completion evidence;
   - explanatory/non-normative;
   - generated;
6. record the inventory in the completion report.

Do not edit runtime source, schemas, registries, fixtures, or tests in this pass.

A machine-contract contradiction must be recorded as a follow-up contract delta, not silently changed through prose.

---

## Architecture Decisions to Apply

### 1. One universal integration runtime

Replace the future model of one bespoke adapter implementation per external system with:

```text
Guerilla universal hook/conformance runtime
+ declarative system profiles
+ exceptional provider drivers
+ existing authoritative continuity DAG
```

### 2. Existing systems remain independent

Current and future integrated projects:

- keep their ordinary commands;
- keep native application-state authority;
- do not need a Guerilla SDK;
- do not need provider-specific Guerilla endpoints;
- may independently add stable machine-readable output such as `--json`.

### 3. Hook lifecycle

Use this ordering consistently:

```text
discover
→ pre-observe
→ commit Guerilla intent
→ invoke native command or provider operation
→ capture native result
→ post-observe
→ publish evidence
→ reconcile in Guerilla
→ return native result
```

### 4. Reconciliation authority

Profiles and drivers may collect or probe native evidence.

They must not own:

- idempotency truth;
- continuity state;
- conflict decisions;
- unsafe retry authorization;
- continuation decisions;
- a separate reconciliation ledger.

### 5. Resynchronization

Managed hooks do not capture every out-of-band mutation.

Document resynchronization as the required complementary path for reconstructed continuity.

### 6. Generic agent surface

Converge model-facing descriptions toward generic operations:

```text
read
search
run
status
sync
```

Provider-specific resources should be represented through common paths or profiles rather than a new model tool schema for every system.

### 7. Gate preservation

Gates A–C remain complete as historical implementation evidence.

Reinterpret Gate C synthetic adapter work as:

- lifecycle primitives;
- conformance harnesses;
- bounded synthetic systems;
- evidence supporting the universal hook runtime.

Do not rewrite historical completion reports to pretend the terminology was always different.

Add a clear supersession note where a historical report describes the old future adapter direction.

### 8. Revised Gate D

Gate D becomes **Universal External Compatibility**, Phases 16–19:

1. universal hook contract and profile schema;
2. hook host and native command runtime;
3. resynchronization, provider drivers, and isolation;
4. universal conformance proof.

Gate E remains research validation.


### 9. Finalized Gate D decisions

Apply these without reopening them:

- Phase 15 remains completed historical internal CLI evidence; do not reassign it.
- Profiles are data-only and may define bounded custom observation argv recipes.
- Profiles may use only registered declarative parsers/extractors.
- Arbitrary profile code and shell strings are prohibited.
- Workspaces pin exact profile ID, semantic version, hook-protocol version, and content digest.
- Multiple profile versions may coexist.
- Profile upgrades are explicit; no runtime auto-upgrade or provider negotiation exists.
- Unknown commands fail closed.
- Required pre-observation failure blocks mutating, destructive, and administrative commands.
- Native success remains native success when post-observation fails.
- Provider drivers are isolated exceptional transports.
- Async drivers use the finalized outcome classification, including `unknown_unprobeable`.
- `unknown_unprobeable` never authorizes automatic duplicate-risk retry.
- `read("guerilla://systems/")` is the generic discovery operation.
- System selection ambiguity is an error.
- Managed invocation stores pre/post boundary anchors.
- Resynchronization subtracts already-accounted managed effects.
- Unseparable managed/unmanaged overlap creates `ambiguous_overlap`.
- `git.cli.v1` is the required unrelated Gate D CLI profile.
- `guerilla sync` means continuity resynchronization, not a native provider mutation.

---

## Files That Must Be Reviewed

At minimum inspect and revise, where present:

- `AGENTS.md`
- `README.md`
- `README_DEV.md`
- `docs/GUERILLA_WORKFLOW_CURRENT.md`
- `docs/CODEX_BUILD_PLAN.md`
- `docs/ARCHITECTURE_DECISIONS.md`
- `docs/GLOSSARY.md`
- `docs/MVP_SCOPE.md`
- `docs/DATA_MODEL.md`
- `docs/GRAPH_RECORD_FORMAT.md`
- `docs/GLCP_CORE_SPEC.md`
- `docs/ADAPTER_CONTRACT.md`
- `docs/STATE_BOUNDARY_MODEL.md`
- `docs/TEST_MATRIX.md`
- `docs/CURRENT_STATUS_MATRIX.md`
- `docs/architecture/GUERILLA_CONCEPT_PAPER.md`
- `docs/architecture/GUERILLA_IMPLEMENTATION_SPEC.md`
- `docs/architecture/GUERILLA_PROTOCOL_SPEC.md`
- `docs/architecture/GUERILLA_SNAPSHOT.md`
- `docs/architecture/CURRENT_STATUS_MATRIX.md`
- `docs/architecture/RELATED_WORK.md`
- `docs/rationale/**`
- `.agents/skills/**/SKILL.md`
- `docs/phase_prompts/**`
- `docs/completion_reports/**`
- top-level directory READMEs

Do not assume this list is complete. Use the repository inventory.

---

## Terminology Migration Rules

Do not perform an indiscriminate search-and-replace.

Classify each use of **adapter**:

| Existing meaning | Revised term |
|---|---|
| Declarative system capability and observation description | system conformance profile |
| Process that brackets native commands | hook host or hook runtime |
| Remote transport for a service with no ordinary local interface | provider driver |
| Gate C synthetic test system | synthetic conformance system or historical synthetic adapter |
| Guerilla-side graph/continuity logic | Guerilla continuity runtime |
| External project-owned Guerilla integration | remove as default requirement |
| Historical phase evidence | preserve with supersession annotation |

Similarly:

- change adapter `reconcile` to native outcome probe/evidence collection where it does not own reconciliation;
- keep Guerilla reconciliation terminology for the authoritative DAG operation;
- distinguish execution custody from application-state authority;
- distinguish transport delivery state from continuity state.

---

## Required Documentation Changes

### Orientation

Install and link the Orientation trio.

Update root governance so every pass reads orientation first, then the owning workflow and specification sections.

### Workflow

Replace the current workflow with the supplied universal-hook workflow or reconcile it exactly without weakening its decisions.

The workflow must remain the SSOT for gate and phase ownership.

### Implementation specification

Add the supplied universal-hook specification as the controlling Gate D architecture revision.

Update the older implementation spec with a prominent supersession section and reconcile conflicting sections. Do not leave two current normative specifications claiming different adapter ownership.

### Architecture decisions

Add explicit decisions for:

- universal hook/conformance host;
- profile-first integrations;
- provider-driver exception;
- one Guerilla reconciliation engine;
- resynchronization;
- generic agent surface;
- Gate C preservation and Gate D reinterpretation.

Use the next repository decision identifiers.

### Protocol and contracts documentation

Describe the contract-delta pass without changing contracts now.

Identify which existing adapter contracts appear reusable, renameable, profile-owned, driver-owned, continuity-owned, or obsolete.

The later R2 ledger must explicitly cover:

- profile identity/version/digest;
- workspace profile locks;
- deterministic selection and ambiguity;
- command-pattern grammar;
- registered parser/extractor set;
- required/optional observation semantics;
- system-instance descriptors and `guerilla://systems/`;
- async driver outcome enums;
- resynchronization boundary anchors;
- `ambiguous_overlap`;
- outbox envelopes;
- driver IPC;
- one-version compatibility aliases for legacy adapter contracts.

### Skills

Revise skill ownership.

The current adapter/continuity skill should be split conceptually or renamed so that:

- hook/profile/driver conformance is one responsibility;
- DAG reconciliation remains a Guerilla core responsibility;
- no skill instructs projects to implement Guerilla-aware adapters.

Do not create unnecessary new skills if existing skill boundaries can be revised coherently.

### Tests and evidence docs

Add future Gate D obligations for:

- profile-only `git.cli.v1` integration;
- exact profile locking and explicit upgrade;
- multiple profile versions coexisting;
- data-only custom observation recipes;
- arbitrary profile code and shell rejection;
- unknown-command denial;
- required pre-observation blocking;
- native argv, cwd, signals, and exit preservation;
- native success with failed post-observation;
- managed/unmanaged interleaving;
- resynchronization deduplication;
- `ambiguous_overlap`;
- isolated asynchronous driver behavior;
- `unknown_unprobeable` without blind retry;
- one reconciliation engine;
- `guerilla://systems/` resource discovery;
- generic agent surface;
- no core edit for Git or another new ordinary CLI.

Do not claim these tests already exist.

### Current status

State:

- Gate C is complete;
- universal-hook architecture revision is accepted;
- documentation convergence is current;
- Gate D implementation has not yet been claimed;
- no real external compatibility proof exists until Phase 19.

### Historical reports

Preserve historical content.

Where necessary, prepend a short note:

> Historical evidence: this report records the terminology and scope used when the phase completed. The current integration architecture supersedes bespoke-adapter expansion with the universal hook/profile model; the implemented graph and lifecycle evidence remains valid.

---

## Prohibited Changes

Do not:

- edit runtime source;
- change schemas or registries;
- delete Gate C tests;
- declare Gates A–C failed;
- create project-specific adapter specs for Expflow, Reqtrace, or Patch-DIFF;
- make integrated systems depend on Guerilla;
- give profiles or drivers graph-write access;
- create provider-specific reconciliation;
- add a second graph mutation path;
- rewrite historical evidence as though it used the new terminology;
- claim Gate D implementation or external pilots are complete;
- move the universal hook runtime backward into completed Phase 15;
- leave profile versioning, resource discovery, async fallback, or resynchronization overlap as open decisions;
- add production claims;
- weaken external application-state authority.

---

## Validation

Run repository-supported documentation, formatting, link, source-integrity, and contract checks that do not require runtime changes.

Also run focused consistency searches for obsolete current claims, including variants of:

```text
one adapter per system
adapter owns reconciliation
adapter idempotency authority
external system must implement adapter
Guerilla invokes provider-specific tool
real adapter required
adapter SDK is the Gate D product boundary
```

A match is not automatically wrong. Classify historical and current uses.

Verify:

1. current normative docs agree on the hook/profile/driver model;
2. current normative docs agree that Guerilla owns reconciliation;
3. no current normative doc transfers application-state authority;
4. the workflow and status use the revised Gate D phases;
5. historical reports remain identifiable as historical;
6. the Orientation trio is linked from governance and workflow docs;
7. all affected top-level README maps are current.

---

## Completion Report

Create a documentation-revision completion report containing:

### Result

Use exactly one:

```text
PASS -- Universal hook documentation revision complete
PARTIAL -- consistent subset revised; listed blockers remain
FAIL -- current normative documents still conflict
```

### Repository State

- branch;
- starting commit;
- ending commit;
- worktree status;
- PR, if created.

### Inventory

```text
File | Classification | Revised? | Reason
```

### Architecture Convergence Matrix

```text
Decision | Current documents aligned | Historical documents annotated | Remaining conflict
```

### Terminology Ledger

```text
Old use | Classification | New term/action | Files
```

### Validation Evidence

```text
Command | Exit | What it proves
```

### Contract Follow-Ups

List contract/schema/registry changes required by the later R2 contract-delta pass. Do not implement them here.

### Orientation Updates

List any System 1 or System 2 ADR added or revised because of friction discovered during the pass.

### Handoff

The next authorized work is:

```text
R2 — Universal hook contract delta
```

or an explicitly listed documentation blocker.

---

## Final Instruction

Do not solve this revision by adding more product-specific integration documents.

Converge the repository on this principle:

> One Guerilla hook and conformance runtime brackets many native systems. Profiles describe ordinary systems. Drivers cover exceptional transports. The DAG alone owns cross-system lineage and continuity.
