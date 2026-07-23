# System Boundaries

**Status:** External product narrative  
**Audience:** Users, evaluators, product teams, and technical decision-makers  
**Scope:** Responsibility, authority, and interaction boundaries across Reqtrace, FIMP, Guerilla, Expflow, Git, and the persistent project environment  
**Normative authority:** None. Project specifications and RFCs control implementation behavior.

## 1. Why the boundaries matter

AI-assisted development is usually presented as one continuous activity: a person describes a goal, a model edits files, tests run, and the result is committed. In practice, several different systems are making different kinds of claims:

- a requirement says what behavior is expected;
- a test demonstrates some actual behavior;
- an editing interface claims that a proposed mutation targets the intended content;
- a command runner reports that a process was launched or exited;
- a repository records material changes after they enter its tree;
- a chat or cloud platform preserves part of the artifact history;
- a user decides whether the result is acceptable.

No single one of those systems can safely stand in for all the others. The purpose of this project set is not to create a universal database that replaces them. It is to give each missing category of control a distinct owner, preserve the native authority of existing tools, and make the resulting project state understandable to humans and agents.

The four projects divide responsibility as follows:

- **Reqtrace controls why behavior is authorized and whether delivery remains bidirectionally proven.**
- **FIMP controls how one complete file mutation is localized, reviewed, and conditionally published.**
- **Guerilla records how operations across native CLI systems causally relate and what outcomes can actually be supported.**
- **Expflow controls how artifact and workflow state remains inspectable, restorable, and portable across sources and environments.**

## 2. Persistent-project mental model

The filesystem, Git repository, tests, specifications, documents, and native application stores form the persistent project data plane. They remain authoritative for the state they actually own.

Reqtrace, FIMP, and Expflow are specialized control planes and agent-computer interfaces over that durable environment. Guerilla is the causal event view over profiled CLI activity.

```text
Human / Model / CI
        |
        +--> Reqtrace: behavioral-control ACI
        +--> FIMP: conditional-mutation ACI
        +--> Expflow: workflow-version-control ACI
        |
        v
Persistent project data plane
files / Git / tests / specifications / native records
        |
        +--> Guerilla: profile-driven causal event view
```

This analogy does not mean the projects replace the operating system or filesystem. It means they make different forms of interaction with durable project state explicit, bounded, and inspectable.

### External language and internal contracts

The product interface does not expose the architecture vocabulary as its primary language. Users act on goals, choices, warnings, and outcomes; the runtime persists protocol records.

For example:

| User-facing concept                   | Possible internal representation                               |
| ------------------------------------- | -------------------------------------------------------------- |
| Expected behavior                     | Expected-requirement rows and source records                   |
| Observed behavior                     | Test-backed actual-requirement rows and coverage evidence      |
| Controlled behavior                   | Reconciled bidirectional traceability state                    |
| Change request                        | FIMP transaction and declared context                          |
| Target choices                        | Local ambiguity matrix                                         |
| Selected locations                    | Resolution record                                              |
| Reviewed change                       | Complete preview and approval decision                         |
| Change record                         | Publication receipt and resulting file identity                |
| Activity history _(Phase 9 GUI term)_ | Guerilla events, observations, outcomes, and causal edges      |
| Project version                       | Expflow material-tree revision                                 |
| Workflow                              | Expflow workflow records, boundaries, artifacts, and decisions |
| Source or approval                    | Authority, assertion, review, and decision records             |

The mapping is not necessarily one-to-one. One screen concept may summarize several internal records, and one internal record may support several views. Raw identifiers, schema names, digests, and protocol artifacts belong in an advanced technical-details view rather than the primary experience.

## 3. Primary responsibility map

| User question                                                                    | Primary owner                   | Definitive responsibility                                                                                                      |
| -------------------------------------------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Why is this behavior allowed to exist?                                           | Reqtrace                        | Connect the implementation and test backward to an accepted requirement and source authority.                                  |
| Has this accepted requirement actually been delivered?                           | Reqtrace                        | Connect the requirement forward to specification, test evidence, and implementation deliverables.                              |
| Is existing brownfield behavior controlled?                                      | Reqtrace                        | Distinguish test-backed, reconciled behavior from uncovered, unauthorized, contradictory, or undelivered behavior.             |
| Where should this intended edit apply in the current file?                       | FIMP                            | Resolve unique targets internally and present JIT local choices only where the intent is under-bound.                          |
| Can these hunks coexist as one valid result?                                     | FIMP                            | Replay the entire selected transaction sequentially from the immutable base and reject invalid partial paths.                  |
| Is the reviewed result still safe to publish?                                    | FIMP                            | Bind approval to the complete preview and publish only while strong file and validator preconditions remain current.           |
| What caused this operation to run?                                               | Guerilla                        | Record initiating intent, profiled invocation, relevant evidence, and causal predecessors.                                     |
| Did the operation actually become authoritative?                                 | Guerilla plus the native system | Reconcile available observations without treating process exit or response delivery as native truth.                           |
| What happened next because of it?                                                | Guerilla                        | Preserve causal edges across profiled systems in an append-only event view.                                                    |
| Is this export, download, renamed file, and local revision one artifact lineage? | Expflow                         | Reconcile partial artifact histories while preserving provenance, scoped authority, confidence, and unresolved correspondence. |
| Was output merely generated, or accepted, verified, and reusable?                | Expflow                         | Preserve materialization, completion, verification, equivalence, and reuse as separate states and decisions.                   |
| Can the workflow be restored or continued elsewhere?                             | Expflow                         | Preserve the material state, lineage, decisions, dependencies, and unresolved references needed for portability.               |
| What changed in this repository branch?                                          | Git                             | Preserve commits, trees, branches, merges, and repository-native history.                                                      |

## 4. Reqtrace boundary: behavioral control, not generalized project management

Reqtrace owns the behavioral authorization boundary.

It separates:

- **actual behavior**, derived from tests and the implementation those tests exercise; and
- **expected behavior**, derived from requirements, specifications, issues, ADRs, and other product sources.

Those surfaces remain independent until human-controlled reconciliation produces a resolved bidirectional traceability matrix.

Reqtrace may determine that:

- an expected requirement has no delivered evidence;
- tested behavior has no accepted expected requirement;
- implementation exists without test-backed control;
- expected and actual behavior contradict one another;
- a divergence is explicitly accepted;
- a proposed change would break forward or backward traceability.

Reqtrace does **not** own:

- the mechanics of locating and publishing a file edit;
- the repository’s branch or merge history;
- the causal history of every external command;
- artifact identity across chat, cloud, export, and local representations;
- a general issue tracker or document-authoring suite.

Its definitive utility is narrower and stronger: **within a declared project boundary, it identifies whether retained behavior is authorized and evidenced, and it blocks new work from silently expanding outside that controlled surface.**

## 5. FIMP boundary: one conditional mutation, not workflow orchestration

FIMP owns one immutable, complete mutation transaction against an existing text file. Externally, the user sees a change request, any target choices that need attention, one complete review, and a final change record. Internally, the protocol preserves a more precise lifecycle.

The model supplies local content intent rather than a universal file coordinate. The runtime:

1. captures the authoritative base state;
2. resolves unique hunks without extra model-facing context;
3. batches ambiguous hunks into one local Anchor Matrix;
4. optionally uses parser-derived ancestry as disambiguating evidence;
5. receives one provisional Resolution Map;
6. replays every hunk sequentially from the immutable base;
7. validates and discloses the complete result;
8. accepts an authenticated approval decision;
9. publishes only if strong state preconditions still hold;
10. emits a recoverable authoritative receipt.

FIMP does **not** own:

- a cross-transaction DAG;
- requirement authorization;
- project-wide workflow persistence;
- a general repository merge or rebase protocol;
- multi-tool orchestration;
- global parser or AST identity as the sole mutation authority.

Its definitive utility is: **model-facing context and clarification scale with real ambiguity rather than being multiplied across every hunk, while the authoritative file change remains complete, reviewed, state-bound, and recoverable.**

## 6. Guerilla boundary: causal event view, not state-owning adapters

Guerilla profiles native CLI systems and records the causal envelope around their operations.

A profile describes:

- how a native system or command class is detected;
- which operations may be invoked or observed;
- what evidence should be captured before and after execution;
- which native records can establish authority;
- what isolation, capability, and security boundaries apply.

Guerilla records intent, launch, observations, outcome classification, and causal edges. Externally, these appear as an activity history that answers what started, what happened, what is known, and what depended on it. It may link to a Git commit, FIMP receipt, Reqtrace row, Expflow revision, test result, or another native record without copying that record into Guerilla as the new source of truth.

Guerilla does **not** own:

- the internal state of every profiled project;
- a bespoke state-synchronizing adapter for each tool;
- the requirement matrix;
- the file mutation transaction;
- Expflow’s workflow store;
- the right to convert an exit code, timeout, or missing response into authoritative success.

Its definitive utility is: **a user can follow why an operation happened, what evidence surrounded it, what outcome is supported, what remains unknown, and which later actions depended on it—without replacing native authority.**

The former concept of making Expflow gates correlate with a Guerilla adapter milestone is no longer the current product boundary. Guerilla is profile-driven and cross-cutting; its integration follows stable native surfaces and event semantics rather than requiring Expflow to become an adapter package.

## 7. Expflow boundary: workflow version control, not a Git replacement

Expflow owns portable workflow state across material and non-material histories. Externally, users work with projects, versions, artifacts, sources, approvals, workflows, and readiness to continue elsewhere; the internal record families remain implementation detail.

Git begins from material repository objects. Expflow can also represent:

- virtual artifacts before download or repository entry;
- platform exports and direct artifact-history records;
- cloud and library representations;
- imports, renamed local files, and materialization events;
- source correspondence and artifact lineage;
- scoped authority claims;
- semantic assertions, conflicts, reviews, and decisions;
- workflow input and output boundaries;
- complete material tree revisions;
- regeneration, equivalence, verification, and reuse evidence.

No source becomes globally authoritative. A chat platform may be authoritative for its emitted metadata, a local filesystem for current bytes, Git for repository history, and a user decision for acceptance. Expflow records those scopes and reconciles the partial histories without flattening them into one unquestioned source.

Expflow does **not** own:

- Git branches and merges;
- the correctness of a FIMP mutation;
- Reqtrace’s behavioral authorization boundary;
- Guerilla’s cross-system causal DAG;
- the scheduling of every operation;
- a requirement that evidence come only from official chat exports.

Its definitive utility is: **a workflow can be inspected, restored, transferred, or resumed without becoming an anonymous pile of files, transcripts, and commits whose identities and decisions must be reconstructed manually.**

## 8. Shared records without shared ownership

The projects become more useful together because one authoritative record can serve as evidence in another system without transferring ownership.

Examples:

- Reqtrace authorizes a bounded change; FIMP references that authority in its declared context.
- FIMP publishes a result and emits a receipt; Guerilla links the invocation event to that receipt.
- Reqtrace records validation and traceability after the change; Guerilla links the downstream test and reconciliation events.
- Expflow preserves the resulting artifacts, decisions, and workflow occurrence; Guerilla links to the Expflow revision.
- Expflow includes a Reqtrace relationship or FIMP receipt as evidence while preserving their native authority and provenance.

The rule is:

> **Reference another system’s authority; do not silently absorb it.**

## 9. Independent adoption

The combined architecture is not a mandatory deployment topology.

| Project adopted alone | Immediate category improvement                                                               |
| --------------------- | -------------------------------------------------------------------------------------------- |
| Reqtrace              | Requirements traceability becomes an enforceable behavioral-control boundary.                |
| FIMP                  | Agent file editing becomes a batched, reviewed, conditional mutation protocol.               |
| Guerilla              | Native CLI automation gains a causal event history with explicit uncertainty.                |
| Expflow               | Version control expands to the artifact and workflow history surrounding repository commits. |

When combined, the projects allow a model to operate through bounded interfaces over one persistent project environment:

```text
authorize behavior
    -> perform a context-efficient mutation
    -> observe the causal execution history
    -> preserve the resulting workflow for continuation and reuse
```

## 10. Boundary test

A product decision belongs in a project only when it answers that project’s primary question:

- **Reqtrace:** Does this behavior remain authorized and proven in both directions?
- **FIMP:** Can this complete intended mutation be safely resolved and published now?
- **Guerilla:** What caused this operation, and what outcome does native evidence support?
- **Expflow:** What workflow state exists across sources, and can it be owned and moved?

When a proposed feature answers a different question, it should be represented through a stable reference or integration surface rather than moved into the wrong control plane.
