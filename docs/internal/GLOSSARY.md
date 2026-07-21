# Internal Glossary

**Status:** Canonical internal terminology for the Expflow Build Week document set
**Scope:** Expflow, Guerilla, FIMP, Reqtrace, shared architecture, and external-term translation
**Rule:** Internal code, schemas, tests, workflows, and engineering documents use these terms. External documents and GUIs may use mapped task-oriented language.

---

## 1. Terminology Policy

The project set has two vocabulary layers.

### Internal vocabulary

Used in:

- schemas and registries;
- code and tests;
- internal workflows and phase prompts;
- completion reports;
- architecture and protocol documents;
- technical-detail views;
- machine-readable records.

Internal terms name exact record families, state transitions, authority boundaries, and protocol artifacts.

### External vocabulary

Used in:

- external overviews and narratives;
- onboarding and help;
- primary GUI labels;
- human-readable CLI output;
- product demonstrations.

External terms name user tasks, choices, risks, and outcomes. They may summarize multiple internal records. They must not change machine semantics.

The translation is many-to-many. A GUI label is not automatically a schema name, and a schema name is not automatically appropriate user-facing copy.

---

## 2. Shared Architecture Terms

### Agent–Computer Interface (ACI)

A bounded interface through which a model inspects or changes an external system. Reqtrace, FIMP, and Expflow expose different ACIs over persistent project state. An ACI includes the commands, context, choices, evidence, and state transitions available to the model.

### Persistent data plane

The durable native state acted upon by the project set: filesystems, Git repositories, tests, requirements documents, package stores, and each project’s native records.

### Control plane

A system that constrains, authorizes, validates, or records how actors interact with the data plane. A control plane does not necessarily own the underlying file or repository state.

### Native authority

The system or principal entitled to establish a specific fact within a declared scope. Git is native authority for Git commits; FIMP for its transaction result and receipt; Reqtrace for its resolved traceability state; Expflow for its records; the filesystem for current file bytes within its authority domain.

### Observation

Evidence about a state or operation. Observation is not automatically authority.

### Proposal

A candidate assertion, correspondence, target, projection, or decision that has not crossed its required acceptance boundary.

### Decision

An attributed immutable record that accepts, rejects, supersedes, or otherwise resolves a proposal or conflict within a declared scope.

### Evidence reference

A durable link or digest binding one record to supporting material without transferring ownership of that material.

### Unknown outcome

A state in which available evidence is insufficient to classify the authoritative result. Unknown is a first-class result, not a synonym for failure or success.

### Partial outcome

A state in which one committed boundary succeeded but a later automation, observation, or projection did not complete. Partial outcomes preserve the successful boundary rather than reporting generic failure.

---

## 3. Expflow Terms

### Material node

An opaque logical identity associated with one material path history. Path and identity are distinct; explicit operations may preserve, replace, or create identity.

### Node revision

An immutable revision of one material node, including its content reference and bound metadata.

### Tree revision

An immutable complete material-tree state. It is not a diff or Git branch. Restoring a historical tree produces a new current tree revision rather than mutating history.

### Material head

The current accepted tree revision for the project’s material state.

### Material tree

The complete set of tracked path entries and their node revisions for one tree revision.

### Object store

The content-addressed immutable storage for material bytes.

### Operation receipt

An immutable native Expflow record describing one operation outcome, including material head before and after, commit state, and post-commit automation state where applicable.

### Authority source revision

An immutable description of a potential source of claims, evidence, or records and the scope in which it may be authoritative.

### Source-registration decision

An immutable decision accepting, rejecting, revoking, or changing the effective scope of an authority source revision.

### Assertion

An attributed semantic claim that has not automatically become accepted truth.

### Semantic decision

An attributed resolution that accepts, rejects, or supersedes assertions or conflicts.

### Conflict

An explicit incompatibility among assertions, decisions, authority scopes, or source correspondences. Conflicts remain inspectable and are not erased by projection.

### Review request

A durable request for a principal to resolve a proposal, assertion, correspondence, conflict, completion claim, or other reviewable state.

### Source correspondence

An attributed proposal or decision that two source records, exports, files, or references correspond within a defined scope.

### Artifact

A logical output or input of work that may have virtual, exported, imported, cloud, or material representations.

### Virtual artifact

An artifact known to the workflow before it is represented as a user-managed local file.

### Materialization event

An immutable event linking a virtual or external artifact representation to a material path or node revision.

### Artifact cluster

A derived projection grouping records that are believed to represent one artifact lineage. A cluster is not automatically authority and may contain unresolved correspondence.

### Workflow occurrence

One bounded execution or episode of work with explicit input and output tree selectors, artifacts, transitions, decisions, and evidence.

### Workflow transition

An immutable state transition within a workflow occurrence. Material, completion, verification, equivalence, and reuse states remain distinct.

### Completion decision

An attributed decision that a workflow occurrence satisfies its completion policy. Material output alone is insufficient.

### Projection

A derived readable or materialized view produced from authoritative records. A projection is not itself authoritative unless a separate accepted contract explicitly says otherwise.

### Manifest proposal

A deterministic or model-assisted proposed projection manifest awaiting its required acceptance boundary.

### Manifest head

The currently accepted manifest revision for a projection, derived from immutable decisions.

### Staleness

A derived condition indicating that a projection or accepted manifest no longer reflects current authoritative inputs.

### Regeneration attempt

An immutable record of an attempt to reproduce or regenerate an artifact or workflow output, including configuration, inputs, observations, and outcome.

### Equivalence evaluation

An attributed evaluation of whether two outputs are equivalent under a declared policy. It is not an automatic fact.

### Verification decision

An attributed decision accepting or rejecting verification evidence under a declared policy.

### Reuse result

An immutable record describing structural reuse into a new workflow occurrence. Authority, completion, and verification do not transfer automatically.

### Portable workflow package

A planned versioned package containing or referencing the material, workflow, authority, semantic, and evidence records required to validate and resume a selected workflow occurrence in another environment.

---

## 4. FIMP Terms

### FIMP

File-Blind Interactive Manifest Patching: a conditional mutation protocol for agent-authored edits to an existing text file.

### File-blind / global-geometry blind

The model does not depend on a universal reusable file coordinate such as a line range, offset map, snapshot-wide hash map, or persistent AST node identity. FIMP is not content-blind; the model supplies local content intent.

### Intent Manifest

The complete immutable request representation for one FIMP transaction.

### Transaction

The server-side immutable resource created from one Intent Manifest. A correction creates a new transaction and may reference the rejected transaction through `supersedes`.

### Context Capsule

The immutable declared intent, constraints, authorized scope, and supplied evidence to which the transaction and approval bind.

### Declared-context binding

The guarantee that a decision binds to the same declared Context Capsule and protocol-derived evidence. It does not claim identical hidden cognitive context among principals.

### Base ETag

A strong validator identifying the authoritative file bytes and bound metadata against which the transaction was evaluated.

### Local census

The diagnostic target-discovery pass across all hunks. It identifies unique, ambiguous, absent, or non-exact candidate states without committing partial mutation.

### Anchor Matrix

One batched envelope of independent per-hunk local occurrence dictionaries. It is not a global coordinate map.

### JIT context

Local before/after, matched content, difference, parser ancestry, or other disambiguating evidence supplied only when a hunk is under-bound.

### Resolution Map

The model’s provisional matcher selections for every conflict in an Anchor Matrix.

### Provisional localization

A selected local target hypothesis. It is required for replay but does not authorize publication.

### Complete sequential replay

The authoritative replay of every selected hunk in order from the immutable base. Local success does not preserve an accepted prefix.

### Virtual Preview

The complete mechanically valid proposed result representation before publication.

### Preview Decision

An authenticated and authorized acceptance or rejection binding to the complete preview and declared context chain.

### System rejection

A transaction-level rejection because targeting, replay, validation, state, or publication preconditions fail.

### Preview rejection

A transaction-level rejection because the mechanically valid complete result is not semantically acceptable.

### Strong OCC

Optimistic concurrency control using strong current-state comparisons immediately before publication.

### Prepared publication

Durable pre-publication evidence sufficient to classify recovery as committed, not committed, or authority inconsistent.

### FIMP receipt

The authoritative immutable result representation for a committed transaction, reconstructible after a lost response when the publication profile permits it.

### Batched amortization

The reduction in model-facing context and interaction cost achieved by resolving unique hunks internally and returning JIT context for all ambiguous hunks in one Anchor Matrix and one resolution round.

---

## 5. Reqtrace Terms

### Forward traceability

The relationship from an authorized requirement through specification and expected test to implementation deliverable. It establishes whether expected behavior was delivered.

### Backward traceability

The relationship from implementation deliverable or test back to requirement and source. It establishes why behavior exists and whether it is authorized.

### Bidirectional traceability

The requirement that both forward and backward relationships exist. A forward-only matrix cannot prove every deliverable is authorized; a backward-only matrix cannot prove every expected requirement is delivered.

### Controlled behavioral surface

The set of implementation behavior represented by reconciled, test-backed, bidirectionally complete requirement relationships.

### Proof asymmetry

The rule that full intent reconstruction may be difficult, while proving that behavior is uncontrolled requires only showing the absence of test-backed requirement linkage.

### Coverage Map

The evidence map connecting discovered tests to exercised implementation regions and identifying uncovered, failing, invalid, or indeterminate areas.

### GRM-A

Guerilla Requirements Matrix: Actual. The backward-derived RTM extracted from tests and covered implementation behavior.

### GRM-E

Guerilla Requirements Matrix: Expected. The RTM extracted independently from requirements, specifications, issues, ADRs, and related expected-behavior sources.

### Asymmetry Report

The comparison among Coverage Map, GRM-A, and GRM-E that classifies matches, contradictions, missing evidence, actual-without-expected, expected-without-actual, uncovered implementation, and incomplete traceability.

### Reconciliation Record

The immutable comparison, evidence, human decision, rationale, resulting edits, and final resolution for one or more GRM-A and GRM-E rows.

### GRM-A-Resolved

The human-reconciled bidirectional RTM that defines the current controlled behavioral surface and authorizes subsequent development.

### Traceability Navigation Index

A bounded bidirectional index from requirements to linked artifacts and from artifacts back to requirements. It is a navigation output, not the control plane itself.

### Structured Edit Transaction

A bounded proposed change that records parent state, affected requirements and artifacts, rationale, expected postconditions, validation requirements, traceability effects, and acceptance state.

### Active Manifest

The canonical summary of current accepted Reqtrace session state. Only accepted transactions may change it.

### Session Ledger

The append-only machine-readable history of proposed, accepted, and rejected transactions, rationales, evidence, relationships, and state transitions.

### Validation Evidence Bundle

Normalized external or repository-native validation results bound to the relevant requirement, artifact version, and transaction.

### Baseline Checkpoint

The locked reconciled state produced before controlled coverage expansion.

### Change Control Report

The evaluation of a proposed change against GRM-A-Resolved, including broken forward or backward relationships, unauthorized deliverables, uncovered behavior, stale rationale, and missing validation.

---

## 6. Guerilla Terms

### Guerilla profile

A declarative description of how a native system or operation class is detected, invoked or observed, constrained, and linked to authoritative native records. A profile is not a state-mirroring adapter.

### Profiled operation

A native CLI or tool operation whose causal envelope is recorded according to a Guerilla profile.

### Invocation

One managed or observed attempt to execute a profiled operation.

### Before observation

Evidence captured before native execution, such as selected resources, current heads, expected state, or authority references.

### After observation

Evidence captured after execution or during reconciliation, including native records, heads, receipts, files, or status.

### Event node

An append-only record describing intent, invocation, evidence, outcome classification, and native references for one causal event.

### Causal edge

A typed relationship indicating that one event enabled, triggered, retried, validated, superseded, or otherwise caused another event.

### Causal DAG

The directed acyclic graph formed by Guerilla event nodes and causal edges. It is an event history, not a mirror of every native store.

### Event view

A projection of Guerilla event nodes and causal edges for human or agent inspection. The final Guerilla GUI is an event view.

### Native record link

A reference from a Guerilla event to an authoritative record in Expflow, FIMP, Reqtrace, Git, a validator, or another profiled system.

### Outcome classification

A typed Guerilla conclusion supported by available evidence, such as succeeded, rejected, failed, pending, unknown, partial, or authority inconsistent.

### Lost-response reconciliation

The process of examining native evidence after a response is missing or ambiguous, without blindly replaying the operation.

### Authority inconsistent

An outcome in which observations conflict with each other or with the expected native authority state and cannot be safely classified as success or failure.

---

## 7. External-to-Internal Translation

The following mappings are presentation guidance, not schema aliases.

| External or GUI term | Earliest intended surface                                     | Typical internal records or concepts                                                        |
| -------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Project              | Phase 1 material operations                                   | Expflow project record, material head, configured roots, and current workflow context       |
| Project version      | Phase 1 material operations                                   | Usually an Expflow tree revision; may be accompanied by related workflow and decision state |
| File history         | Phase 1 revision discovery; richer Phase 2 view               | Material node plus node revisions and materialization events                                |
| Workflow             | Phase 2+                                                      | Workflow occurrence, tree selectors, artifacts, transitions, decisions, and evidence        |
| Generated item       | Phase 2+                                                      | Virtual artifact or output artifact before accepted completion                              |
| Local copy           | Phase 2+                                                      | Materialization event plus material node/path                                               |
| Source               | Phase 4+                                                      | Authority source revision and source-registration decision                                  |
| Suggested match      | Phase 4+                                                      | Source correspondence proposal or artifact-cluster candidate                                |
| Accepted match       | Phase 4+                                                      | Accepted source correspondence decision                                                     |
| Approval             | Phase 2+; scope-specific                                      | Semantic, completion, verification, projection, or reuse decision depending on scope        |
| Needs review         | Phase 1 for material warnings; Phase 2+ for broader decisions | Review request, conflict, unresolved correspondence, stale projection, or pending decision  |
| Ready to move        | Phase 5+                                                      | Portable workflow package readiness with no blocking unresolved dependencies                |
| Change request       | FIMP product surface                                          | FIMP Intent Manifest / transaction                                                          |
| Target choices       | FIMP product surface                                          | FIMP Anchor Matrix                                                                          |
| Chosen targets       | FIMP product surface                                          | FIMP Resolution Map                                                                         |
| Review changes       | FIMP product surface                                          | FIMP Virtual Preview and validation evidence                                                |
| Change record        | FIMP product surface                                          | FIMP receipt                                                                                |
| Requirement coverage | Reqtrace product surface                                      | Coverage Map plus GRM-A, GRM-E, and GRM-A-Resolved status                                   |
| Controlled behavior  | Reqtrace product surface                                      | Active row in GRM-A-Resolved with complete forward and backward traceability                |
| Uncontrolled code    | Reqtrace product surface                                      | Uncovered implementation or implementation without test-backed requirement linkage          |
| Activity             | Phase 8 event contract; Phase 9 GUI                           | Guerilla event node                                                                         |
| Activity history     | Phase 9 GUI                                                   | Guerilla event view / causal DAG                                                            |
| What happened next   | Phase 9 GUI                                                   | Guerilla causal edges                                                                       |
| Still checking       | Phase 8 event contract; Phase 9 GUI                           | Pending or unknown outcome classification                                                   |
| Could not confirm    | Phase 8 event contract; Phase 9 GUI                           | Unknown or authority-inconsistent outcome                                                   |

Phase markers constrain user-facing copy; they do not imply that an internal record exists merely because its future external term is defined. Phase 1 CLI copy should use only the material-operation subset unless a later surface is explicitly authorized.

A primary UI may collapse internal detail, but an advanced view must be able to navigate back to the authoritative internal records.

---

## 8. Superseded or Prohibited Terminology

### “Guerilla adapter” as the current integration model

Superseded. Current integration uses declarative profiles, native observations, event nodes, causal edges, and native record links. Adapter language may still describe unrelated legacy designs, but not the Build Week architecture.

### “External Compatible Gate D” for the current timeline

Superseded. The active Build Week workflow uses Gates BW-A through BW-D, ending with the Guerilla causal event-view GUI.

### “Context atomicity” in FIMP

Superseded by **declared-context binding**. The runtime cannot prove identical hidden cognitive context.

### “File-blind means the model cannot see content”

Incorrect. File-blind means globally geometry-blind. The model supplies local content intent and receives JIT local context when required.

### “Anchor Matrix is a global file map”

Incorrect. It is a batched envelope of independent per-hunk local dictionaries.

### “Material output means complete”

Incorrect. Materialization, completion, verification, equivalence, and reuse are separate states and decisions.

### “Tests are requirements”

Incorrect. Tests are evidence used with covered implementation behavior to extract actual requirements for GRM-A.

### “Git history is workflow history”

Incomplete. Git is authoritative for repository history. Expflow also represents virtual artifacts, partial source histories, scoped authority, semantic decisions, workflow boundaries, and reproduction state.

### “Guerilla success equals process exit zero”

Incorrect. Outcome classification depends on native evidence and may remain pending, unknown, partial, or authority inconsistent.

---

## 9. Glossary Maintenance Rules

- Add a term when it names a stable record, protocol stage, state, or authority boundary used across more than one internal document.
- Do not add every implementation class or field name.
- Define one canonical form and list deprecated forms explicitly.
- Update the external translation table when a GUI or external document introduces a stable user-facing concept.
- A glossary edit must not silently change normative schema meaning.
- When two projects use the same everyday word differently, qualify the term by project.

---

## Config Reference Index

<!-- config-reference-index:start -->

- `.config-reference-reconciliation.yaml` - glossary role
- `AGENTS.md` - source-of-truth order

<!-- config-reference-index:end -->
