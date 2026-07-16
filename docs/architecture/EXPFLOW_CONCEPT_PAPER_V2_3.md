# EXPFLOW CONCEPT PAPER

## Automated Ownership and Observability for Versioned Agentic Workflows

**Version:** 2.3-draft  
**Status:** Lock candidate  
**Date:** 2026-07-15

---

## Abstract

Agentic work often survives as conversations, files, tool traces, and a current project directory without becoming an owned workflow. A user may possess all of those materials and still be unable to answer which exact source tree was used, which historical versions occupied it, which generated outputs existed only inside a chat, which semantic claims were accepted, and which concrete workflow can be resumed or reused.

Expflow addresses this gap with a versioned relative-tree runtime and an artifact-workflow observability layer. The runtime assigns opaque identities to material files, stores immutable revisions with mandatory integrity digests, records actual relative path occupancy, and commits complete tree revisions through a small explicit command surface. Expflow registers extensible scoped authority sources, supports split or unified readable authority documents, records attributed semantic assertions, preserves immutable acceptance and conflict decisions, clusters artifact records, distinguishes the workflow’s selected input tree from its resulting output tree, and versions human-readable manifests.

Automation is the default operating model. One `sync` operation captures ordinary additions, modifications, explicit moves, replacements, deletions, source registrations, and workflow hints. Deterministic validation can block unsafe material changes. Semantic hooks may propose clustering, source correspondence, workflow boundaries, completion, and manifest content, but they cannot mutate material history or silently become accepted authority. Deterministic projections may be accepted automatically when all inputs are already accepted. Model-assisted projections remain proposed until an actor or policy accepts them.

The central claim is that workflow ownership and automation reinforce one another when material facts, authority sources, semantic assertions, and durable decisions remain distinct. The result is an observability platform that supports live agentic work and brownfield recovery with the same state model: exact old and current input trees, virtual and materialized outputs, reviewable decisions, regeneration attempts, equivalence evaluations, and structurally safe reuse.

---

## 1. Problem

Many model-assisted projects retain:

- complete or partial chat history;
- source files;
- generated files;
- copied notes;
- repository history;
- model and tool traces;
- a current folder tree.

These records are evidence, but they do not automatically provide workflow ownership.

A user may not know:

- which historical file versions were supplied;
- which subset of the project tree was the workflow’s actual input;
- whether two same-path files represented continuity or replacement;
- whether a generated artifact was downloaded, copied, regenerated, or never materialized;
- which model claims were merely proposed;
- who accepted a cluster or workflow boundary;
- which manifest is current, proposed, stale, or conflicted;
- whether a workflow is materially complete, semantically accepted, verified, or reusable.

The problem becomes more serious in brownfield environments where several workflows overlap and old input versions remain relevant.

---

## 2. Core Model

Expflow observes one workflow occurrence as:

```text
registered authority-source revisions
+ readable authority document profile
+ exact input tree revision and path selector
+ chat and user event evidence
        ↓
automatic material capture and semantic proposals
        ↓
durable decisions and conflict handling
        ↓
exact output tree revision and path selector
+ virtual and materialized outputs
+ accepted workflow-time manifest
```

The project tree and workflow trees are related but not identical.

The project tree is the complete committed material state.

A workflow occurrence selects:

- one input tree revision;
- one input path selector;
- one output tree revision when available;
- one output path selector.

This prevents unrelated project files from being mislabeled as workflow inputs or outputs.

---

## 3. Material State

### 3.1 Opaque material node

A material node provides continuity for a file-like object without encoding semantic meaning.

```text
efn_<opaque identifier>
```

### 3.2 Immutable node revision

Every material state has:

- node ID;
- revision number;
- original filename;
- immutable stored object;
- SHA-256 digest;
- byte size;
- write-isolated storage method;
- creating operation;
- declared continuity basis.

Hard links to writable working-tree files are prohibited. Stored objects use copy or a safe copy-on-write reflink.

### 3.3 Path occupancy

A tree revision records where a node revision actually appeared:

```text
authorities/system-design/spec.md
→ node efn_... revision 4
```

Folder and filename history are therefore facts of the tree revision rather than semantic identity.

### 3.4 Immutable tree revision

A tree revision is one complete relative material state.

Old tree revisions remain addressable and may be intentionally selected for later workflows.

---

## 4. Identity Continuity

Automation needs useful defaults without turning them into hidden authority.

### Same path

A changed file at the same relative path is treated as the next revision of the same node by default.

The caller can override this with:

```text
identity_directive = new
identity_directive = replace
```

### Explicit move

Only an explicit move directive automatically preserves node identity.

### Digest match

A unique digest match between a removed and added path may produce a semantic continuity proposal. It does not silently preserve the old node ID.

This separates:

- material fact: a new path and stored object exist;
- semantic proposal: the new entry may continue an older material lineage.

---

## 5. Extensible Authority Sources

Expflow does not restrict authority to three built-in source types.

Any conforming source revision may be registered with:

- stable source ID and revision;
- source type;
- issuer;
- origin;
- source schema;
- subject scope;
- fact scope;
- effective interval;
- readable representation;
- limitations;
- handling labels;
- licensing and reuse restrictions.

Examples include:

- chat artifact history;
- user event history;
- model assertions;
- repository history;
- issue tracker exports;
- signed event records;
- document-service history;
- external execution traces;
- user-authored attestations.

Registration is a durable decision. A source descriptor does not become accepted authority merely because it is present.

---

## 6. Readable Authority Documents

Expflow supports two equivalent readability profiles.

### Split profile

Separate readable documents for different authority roles.

### Unified profile

One cross-actor document containing role-separated, attributed sections with stable anchors.

The readable document remains first-class. A machine sidecar may index its sections, source revisions, and anchors.

This supports transfer among users, agents, reviewers, archives, and automation without requiring internal record inspection.

---

## 7. Assertions, Decisions, and Conflicts

### Assertion

An assertion records that a user, model, hook, or external system made a claim.

Examples:

- two records appear to represent one artifact;
- a branch appears to be semantic authority;
- a virtual output appears to have been copied into a file;
- required outputs appear to exist.

### Decision

A decision records:

- decision kind;
- subject;
- proposals considered;
- evidence;
- actor or policy;
- whether it was automated;
- outcome;
- rationale;
- consequences;
- superseded decision.

Accepted workflow state is derived from immutable decisions rather than mutable assertion statuses.

### Conflict

A conflict records competing claims and their relevant authority scope.

Resolution is represented by a later decision. The original claims remain visible.

---

## 8. Import Tree and Source Correspondence

### 8.1 Import-tree manifest

The import-tree manifest is the readable projection of the exact selected material tree revision and path scope used by a workflow occurrence.

It answers:

> What relative material composition entered the workflow?

### 8.2 Optional source correspondence

Brownfield evidence may contain a weak external record such as:

```text
chat import: Workflow.md
```

The committed tree may contain several candidate node revisions.

A source-correspondence record answers:

> Which candidate tree entry corresponds to this source record?

It records:

- source record;
- candidates;
- proposed selection;
- evidence;
- unresolved alternatives;
- decision reference.

This is separate from the import tree. Expflow does not restore a second import store.

---

## 9. Virtual and Materialized Artifacts

A generated artifact may be part of the workflow without surviving bytes.

A virtual-artifact record can identify:

- generation event;
- workflow occurrence;
- display name;
- media type;
- parent references;
- availability state.

A later materialization event may link it to a node revision through:

- download;
- copy;
- conversion;
- external save;
- regeneration;
- later import.

The materialization assertion is attributed to its authority source.

---

## 10. Workflow Occurrence State

Workflow completion is not one Boolean.

Expflow distinguishes:

### Material status

```text
inputs_pinned
outputs_present
outputs_incomplete
```

### Completion status

```text
none
asserted
accepted
rejected
conflicted
```

### Verification status

```text
not_evaluated
passed
failed
partial
```

### Reuse status

```text
not_evaluated
eligible
approved
rejected
```

The presence of output paths can support a completion assertion. It cannot by itself prove accepted completion, correctness, or reuse eligibility.

---

## 11. Manifest Authority

Manifest revisions are explicit workflow objects.

Statuses include:

```text
generated
proposed
accepted
rejected
stale
superseded
conflicted
```

### Deterministic projector

A template or structural renderer may be accepted automatically when:

- all semantic inputs are already accepted;
- its projector version is allowed by policy;
- output validation passes.

### Model-assisted projector

A model-assisted projector records:

- model;
- projector profile;
- prompt digest;
- content digest;
- source records;
- source decisions.

Its output is proposed unless an actor or policy explicitly accepts it.

### Projection location

Generated projections live under:

```text
.expflow/projections/
```

This path is excluded from material scanning.

An accepted projection can be copied into the user-managed tree only through an explicit projection-materialization change handled by `sync`.

This prevents projection self-observation loops.

---

## 12. Automation Model

The public interface is deliberately small:

```text
expflow init
expflow sync
expflow status
expflow restore
```

### Sync

`sync` can:

- observe material changes;
- apply identity directives;
- create node revisions;
- create a tree revision;
- register supplied authority-source descriptors;
- run deterministic validation;
- record semantic assertions;
- create workflow proposals;
- project manifests;
- surface conflicts;
- schedule regeneration or evaluation records through integrations.

Most unambiguous material work commits automatically.

Review is reserved for material ambiguity, authority conflicts, semantic acceptance, or destructive restore policy.

---

## 13. Core and Adapter Separation

Expflow core remains deliberately small.

Its public operational surface is:

```text
expflow init
expflow sync
expflow status
expflow restore
```

The core architecture does not define a universal external inspection protocol, composite cross-system revision token, incremental adapter cursor, adapter request-normalization profile, lost-response reconciliation protocol, or cross-adapter write-authority partition.

Those contracts depend on the integrating system and belong in separately versioned adapter profiles.

A separate adapter may define:

- exact read and inspection operations;
- opaque adapter revision tokens;
- incremental change cursors;
- adapter-level canonicalization and idempotency;
- adapter operation attempts, outcomes, and recovery records;
- capability restrictions;
- external write-authority boundaries;
- reconciliation behavior.

The adapter may use documented core extension exports. It must not read undocumented `.expflow` storage or modify internal records directly.

This protects both goals:

- ordinary users and agents retain a minimal Expflow interface;
- integrating systems receive exact compatibility contracts without shaping core storage or workflow semantics.

## 14. Regeneration and Equivalence

A regeneration attempt records:

- source workflow occurrence;
- exact input tree revision;
- target artifact or workflow;
- model and tool profile;
- prompt digest;
- security profile;
- output references;
- outcome.

An equivalence evaluation classifies the result as:

```text
exact
representation_equivalent
workflow_equivalent
divergent
incomplete
failed
```

The evaluation itself is attributed. Acceptance of the evaluation may be recorded by a semantic decision.

---

## 15. Structural Reuse

A reuse result references:

- accepted reference workflow occurrence;
- accepted reference manifest;
- new input tree revision;
- resulting workflow occurrence;
- deviation summary;
- semantic-leakage evaluation;
- equivalence evaluations;
- acceptance decision.

The previous workflow is structural reference only. New-project authority sources control substantive meaning.

---

## 16. Security and Handling

Imported and generated content is data, not runtime instruction.

The implementation must support:

- source trust profiles;
- prompt-injection-resistant hook instructions;
- archive quarantine and path traversal checks;
- extraction size and file-count limits;
- no execution of imported or generated code by semantic hooks;
- secret detection and optional redaction before remote model use;
- local-only processing profiles;
- chat-export privacy controls;
- source licensing and reuse restrictions;
- bounded hook time, input, output, and environment access.

Security decisions and limitations remain visible in source descriptors and operation receipts.

---

## 17. Observability and LLM Operations

Expflow adds workflow-level signals to model telemetry:

- exact input and output tree revisions;
- path selectors;
- historical source versions;
- identity directives;
- virtual artifacts;
- materialization events;
- assertion and decision counts;
- open conflicts;
- manifest status;
- hook failures;
- regeneration outcomes;
- equivalence classification;
- reuse and leakage results;
- user correction rate.

These signals connect model behavior to durable project outcomes.

---

## 18. Brownfield and Live Use

The same architecture supports both modes.

### Brownfield

- initialize from surviving material state;
- register historical source records;
- import available old versions;
- propose source correspondence;
- recover workflow occurrences;
- record uncertainty.

### Live

- invoke `sync` after meaningful user or agent operations;
- automatically version the tree;
- project current manifests;
- monitor workflow state;
- retain exact old versions.

A recovered project becomes a live observed project after the first accepted state.

---

## 19. Ownership

Workflow ownership means an authorized actor can:

- inspect exact historical inputs;
- distinguish project and workflow scope;
- see registered authority sources;
- inspect assertions and acceptance decisions;
- restore old versions;
- identify virtual and materialized artifacts;
- inspect accepted manifests;
- compare occurrences;
- regenerate outputs;
- evaluate equivalence;
- reuse structure safely;
- hand the workflow to another person or agent.

Possession of a chat or current folder is evidence. Ownership is the ability to operate on the reviewed workflow state.

---

## 20. Conclusion

Expflow 2.3 integrates automation and ownership without collapsing material fact into semantic inference.

The material runtime records immutable bytes, old versions, and actual relative-tree occupancy. Extensible authority sources explain where evidence comes from. Assertions preserve model and user claims. Decisions preserve what was accepted. Workflow occurrences distinguish selected inputs from resulting outputs. Manifests remain versioned and reviewable. Regeneration and reuse are explicit evaluated operations.

The result is a simple command surface over a rich, inspectable workflow state suitable for agentic development, live observability, and brownfield recovery.
