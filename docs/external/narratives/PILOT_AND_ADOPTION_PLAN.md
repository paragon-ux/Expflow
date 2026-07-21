# Pilot and Adoption Plan

**Status:** External product narrative  
**Audience:** Early adopters, evaluators, product teams, and implementation partners  
**Scope:** Expflow-first pilot strategy and progressive adoption of Reqtrace, FIMP, and Guerilla  
**Normative authority:** None. Internal phase execution and current implementation status are controlled by separate engineering documents.

## 1. Strategic choice

Expflow is the first product focus because it is the least intrusive credible entry point into the project set.

That does not mean it is necessarily the most impactful component in the final architecture.

- Reqtrace can create the strongest behavioral-control boundary, but adopting it requires recovering or maintaining requirements, tests, and bidirectional evidence.
- FIMP can materially improve agent editing cost and correctness, but adopting it changes the mutation interface used by models and runtimes.
- Guerilla can provide the most complete cross-system causal view, but it sits across native invocations and therefore requires stable profiles, security boundaries, and evidence semantics.
- Expflow can begin alongside the user’s existing files, Git repository, chat tools, editors, and workflows.

The adoption proposition is:

> **Keep using the tools that already produce the work. Add Expflow to preserve the workflow those tools currently fragment.**

## 2. The product-category problem the pilot must prove

The pilot is not intended to prove that Expflow can copy files or create snapshots. Git, backup tools, cloud drives, and archive formats already do that.

It must prove that Expflow improves the workflow-version-control category by preserving state that those tools normally divide:

- artifact existence before materialization;
- correspondence across chat, export, import, cloud, local, and repository forms;
- scoped authority from multiple partial sources;
- generated, materialized, completed, verified, and reusable states as separate claims;
- complete material tree history and restoration;
- decisions and unresolved dependencies required for portability.

The definitive pilot claim is:

> **A real AI-assisted workflow can move between interfaces and environments without becoming an anonymous collection of files, transcripts, and commits whose identity, authority, and acceptance must be reconstructed manually.**

## 3. Pilot audience

The first pilot is designed for users who already experience workflow fragmentation:

- developers moving generated code between chats, editors, and repositories;
- designers and analysts working with generated documents or mixed artifact types;
- maintainers returning to an AI-assisted project after conversational context has expired;
- teams that need local ownership without adopting a hosted platform;
- advanced users who want inspectable evidence but do not want every collaborator to learn a complex CLI or raw record schema.

The pilot should not assume that users have already adopted Reqtrace, FIMP, or Guerilla.

## 4. Vocabulary policy

The external product language and the internal engineering language serve different purposes.

The GUI and external documentation should name the user’s object, question, or decision:

- **project version**, not material-tree revision;
- **workflow**, not workflow occurrence;
- **source**, not authority-source record;
- **claim** or **finding**, not semantic assertion;
- **approval** or **decision**, not decision-record family;
- **change request**, not transaction resource;
- **target choices**, not Anchor Matrix;
- **selected locations**, not Resolution Map;
- **reviewed change**, not preview representation;
- **change record**, not publication receipt;
- **activity history**, not causal DAG;
- **needs attention**, not unresolved conflict/review-request projection;
- **ready to continue elsewhere**, not portability-readiness projection.

These are translations, not renamed schemas. Several internal records may support one external concept, and the same record may appear in more than one view. Internal names, identifiers, digests, and protocol stages remain available through technical details, exports, APIs, logs, and engineering documentation.

The primary rule is:

> **Name the user’s task and outcome in the product; name the machine contract in the implementation.**

## 5. Pilot experience

The pilot should support one complete, understandable workflow. Architectural record families should be composed into user-facing concepts rather than exposed as the navigation model.

### 5.1 Begin with an existing project

The user opens a current local project rather than migrating into a new hosted workspace.

Expflow initializes its local state without taking ownership away from:

- the filesystem;
- Git;
- the editor;
- existing chat platforms;
- cloud storage;
- current build and test tools.

### 5.2 Record material state

The user records the current complete project tree and can inspect:

- the current saved project version;
- unrecorded file changes;
- prior complete project versions;
- durable records of completed operations;
- restoration targets.

This is foundational but not the final category claim.

### 5.3 Add workflow evidence

The user associates available evidence for one AI-assisted artifact or task. Sources may include:

- an official chat export;
- a chatbot-produced artifact-history record;
- a downloaded artifact and metadata;
- a manually assembled history;
- cloud-library metadata;
- local files and filesystem observations;
- Git commits;
- future profile or extension events.

Official exports are useful when available but are not required. The system preserves provenance and scope rather than treating one intake format as the product boundary.

### 5.4 Reconcile artifact lineage

Expflow proposes or records how the available representations relate:

```text
virtual artifact
    -> exported copy A
    -> exported copy B
    -> renamed local file
    -> edited local revision
    -> repository materialization
```

The user can accept, reject, or leave uncertain correspondence unresolved. Similarity or matching evidence may support a proposal but does not silently establish identity.

### 5.5 Record workflow decisions

The user distinguishes:

- generated output;
- local materialization;
- accepted completion;
- validation or verification;
- equivalence after regeneration;
- approval for reuse.

The pilot must make these distinctions visible through plain-language states and decisions. Internal schemas remain available only in technical details.

### 5.6 Restore and inspect

The user can discover prior project versions, preview the effect of restoration, and restore a selected file or complete project state without losing the history of the restore operation itself.

### 5.7 Export and reopen

The user exports the workflow state and reopens it in another clean environment or supported client.

The reopened workflow reports:

- available files and artifacts;
- lineage and source evidence;
- accepted decisions;
- unresolved correspondence;
- external dependencies;
- missing or provider-specific references;
- whether it is ready to continue elsewhere.

The pilot succeeds only if the receiving environment can understand what is complete, what remains uncertain, and what is needed to continue.

## 6. The GUI is part of the pilot, not the canonical store

The pilot cannot be CLI-only because the category problem is not merely command execution. Users need to understand where work came from, what was decided, what changed, what needs attention, and whether it can continue elsewhere without first learning the internal ontology.

The GUI should relate to Expflow the way GitHub relates to Git:

- it makes durable state navigable;
- it presents bounded decisions;
- it progressively reveals proof;
- it does not become the only place where canonical state exists.

The first GUI should center on the workflow rather than a generic dashboard.

### Current Work

Shows what the user is working on, whether the project files are current, what needs attention, and whether the workflow is ready to continue elsewhere.

### History

Shows what changed over time and why, with future room for Guerilla’s cross-tool activity history.

### Artifacts

Shows generated, downloaded, imported, local, regenerated, and related versions as one understandable history rather than a flat file list.

### Needs Attention

Shows uncertain relationships, conflicting sources, missing approvals, incomplete verification, and reuse questions that require a decision.

### Continue Elsewhere

Shows whether the workflow can move, which dependencies are included, and what will still need to be resolved after transfer.

Every GUI action must invoke the same core operations and produce the same durable state available to the CLI and library. The visible labels and navigation do not need to mirror internal schema or record-family names.

## 7. Pilot scope

### In scope

- current v1 material operations and safe user-facing improvements;
- workflow-centered local GUI;
- project-version discovery and restore preview;
- at least one evidence-ingestion path plus a manual or schema-based fallback;
- artifact-history matching and confirmation;
- clear presentation of where information came from and which decisions are trusted;
- explicit completion, verification, and reuse decisions;
- portable export/import or equivalent round-trip package;
- one representative end-to-end workflow;
- clear distinction between implemented, planned, and unresolved capability.

### Out of scope for the first pilot

- hosted multi-tenant collaboration;
- account systems and billing;
- broad cloud synchronization;
- mandatory official-platform integrations;
- complete Reqtrace implementation inside Expflow;
- replacing Git;
- replacing existing editors or coding agents;
- requiring FIMP for all edits;
- making Guerilla a state-owning adapter layer;
- a full Guerilla causal GUI before profile and event semantics stabilize;
- claiming empirical superiority without measurement.

## 8. Pilot story

The pilot should follow one real workflow from fragmented input to portable result.

A strong scenario is:

1. A user begins an artifact in an AI chat.
2. The artifact is exported or described through an available history record.
3. The user downloads, renames, and edits it locally.
4. Git records the repository change after materialization.
5. Expflow associates the virtual, export, local, and repository histories.
6. The user records which result was accepted and which evidence supports it.
7. A later local change creates a new complete material revision.
8. The user discovers and previews an older restore target.
9. The workflow is exported with lineage, decisions, and unresolved dependencies.
10. Another environment reopens the package and continues from the accepted state.

The demonstration sentence is:

> **This workflow moved between systems without losing what the artifacts were, where they came from, which result was accepted, or what is still unresolved.**

## 9. Success criteria

The pilot should be judged against category-specific outcomes rather than feature count.

### 9.1 Comprehension

A new user can explain, without reading the architecture manual:

- the difference between a saved project version and the larger workflow it belongs to;
- why two files may be representations of one artifact lineage;
- which source supports a claim;
- the difference between generated, accepted, verified, and reusable;
- whether the workflow is portable now.

### 9.2 Reconstruction reduction

A returning user can resume the workflow without manually reopening every chat, comparing download names, searching commit messages, and reconstructing acceptance from memory.

### 9.3 Portability

An exported workflow can be reopened in a clean environment with:

- material state intact;
- lineage interpretable;
- decisions preserved;
- missing dependencies explicitly reported;
- unresolved claims still unresolved rather than silently normalized.

### 9.4 Restore safety

A user can discover a restore target, understand the expected effect, and preserve the restoration as a new recorded operation rather than destroying history.

### 9.5 Progressive disclosure

A non-expert can complete the primary flow using task language, while an expert can open technical details for source evidence, internal identifiers, digests, protocol records, and native references.

### 9.6 Honest status

The interface and documentation distinguish:

- implemented and verified;
- library-only;
- exposed through the GUI;
- piloted;
- empirically evaluated;
- planned.

## 10. Adoption ladder

Expflow should provide value at every stage rather than require a complete ecosystem deployment.

### Stage 1 — Preserve material history

The user initializes, records complete material trees, inspects drift, and restores prior state.

**Immediate utility:** local complete-tree history and recoverable operations without changing the existing repository workflow.

### Stage 2 — Preserve workflow identity

The user adds evidence for virtual, exported, imported, local, and repository representations.

**Immediate utility:** artifact lineage survives renaming and movement across systems.

### Stage 3 — Preserve decisions and portability

The user records trusted sources, completion, verification, equivalence, reuse approval, and unresolved dependencies, then exports and reopens the workflow.

**Immediate utility:** continuation no longer depends on the originating interface or conversation.

### Stage 4 — Add FIMP mutation evidence

Where available, FIMP change records and reviewed-change evidence are linked to project versions and workflows.

**Immediate utility:** the workflow can show exactly how a multi-hunk mutation was resolved, approved, and published without making FIMP mandatory for unrelated work.

### Stage 5 — Add Reqtrace behavioral control

Reqtrace requirement, test, deliverable, and reconciliation records are linked to relevant workflows and artifacts.

**Immediate utility:** the user can see not only what changed, but why the behavior is authorized and whether both traceability directions remain complete.

### Stage 6 — Add Guerilla causal events

Guerilla profiles stable native CLI surfaces and links activity events to Expflow project versions, FIMP change records, Reqtrace control evidence, Git commits, and validation results.

**Immediate utility:** users gain a cross-system causal history without moving native authority into one orchestrator.

### Stage 7 — Add the Guerilla causal GUI

After profile contracts and event semantics are stable, the Expflow activity surface can incorporate or link to a dedicated Guerilla event view.

**Immediate utility:** users can traverse the project from workflow state to the exact causal operations that produced it.

## 11. Why Guerilla follows rather than defines the initial Expflow gates

The previous idea of aligning Expflow completion with a Guerilla “external-compatible adapter” gate is no longer accurate.

Guerilla is no longer framed as a set of state-owning adapters. It is a profile-driven universal hook and causal event layer over native CLI systems.

That changes the sequencing:

- Expflow first stabilizes its user-facing workflow, inspection, evidence, and portability surfaces.
- FIMP and Reqtrace provide independently authoritative records that Expflow may reference when available.
- Guerilla profiles those stable operations and records their causal relationships.
- The Guerilla GUI arrives after event semantics are mature enough that the interface is not forced to compensate for unstable contracts.

The relationship is therefore:

```text
stable native product surfaces
    -> Guerilla profiles and causal events
    -> integrated causal GUI
```

not:

```text
Expflow becomes a Guerilla adapter
    -> adapter parity gate defines Expflow completion
```

## 12. Evidence strategy

The pilot should collect evidence in four categories.

### Product evidence

- Can the user identify the workflow and its current state?
- Does the experience solve a real reconstruction or portability problem?
- Which actions are understandable without documentation?

### UX evidence

- Time to find an artifact’s lineage;
- time to identify the latest accepted state;
- success rate for discovering and previewing restore targets;
- comprehension of source, approval, readiness, and needs-attention labels;
- points where users require raw-record knowledge.

### Engineering evidence

- import and export round-trip integrity;
- restore correctness;
- behavior with missing or contradictory source evidence;
- performance on representative project trees;
- crash and recovery behavior;
- consistency of results across CLI, library, and GUI actions despite different presentation language.

### Functional evidence

- artifact-correspondence accuracy;
- preservation of unresolved states;
- detection of missing portability dependencies;
- ability to continue without the originating conversation;
- successful linkage to optional FIMP, Reqtrace, or Guerilla records.

## 13. Adoption principle

The pilot and later product should follow one rule:

> **Do not require users to surrender their existing tools in order to gain ownership of the workflow those tools produce.**

Expflow is the initial wedge because it can preserve and clarify work before the organization is ready to change its requirements discipline, editing protocol, or orchestration layer. The other projects can then be adopted where their category-level control is worth the additional integration.
