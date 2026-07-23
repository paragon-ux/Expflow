# UX Overview

## UX proposition

Each project improves its tool category by converting an unbounded reconstruction problem into a bounded decision:

- Reqtrace turns “understand the whole codebase” into “review the specific gaps in behavioral control.”
- FIMP turns “reconstruct anchors for every edit” into “resolve only the hunks that are actually ambiguous.”
- Guerilla turns “read every tool log and infer causality” into “follow one event chain with explicit evidence and uncertainty.”
- Expflow turns “search chats, downloads, folders, and commits” into “inspect one portable workflow history.”

The UX must therefore expose definitive decisions and outcomes, not merely visualize internal records.

## Persistent project experience

The user experiences one persistent project environment. The filesystem and native tools remain the durable state. Reqtrace, FIMP, and Expflow are bounded control planes/ACIs through which the model operates. Guerilla is the event view over the CLI activity that crosses those planes.

| Surface                    | The user is trying to decide                                                     | What the system must remove                                                               |
| -------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Reqtrace control map       | Is this behavior authorized, delivered, and still proven?                        | Manual link chasing across issues, tests, specifications, and code.                       |
| FIMP transaction review    | Is this the intended complete edit, and can it still be safely published?        | Per-hunk rereads, universal anchors, repeated clarification, and silent fuzzy relocation. |
| Guerilla event view        | What caused this operation, what became authoritative, and what remains unknown? | Cross-tool log reconstruction and false certainty from exit codes or lost responses.      |
| Expflow workflow workspace | What happened to this artifact and can the workflow move or resume elsewhere?    | Searching disconnected chat, cloud, download, local, and repository histories.            |

## Reqtrace UX: from link browser to control map

A conventional traceability UI often shows that objects are linked. Reqtrace must show whether the behavioral surface is controlled.

The primary states are:

- **Controlled:** forward and backward relationships are complete and supported by current evidence.
- **Uncontrolled:** retained behavior has no test-backed requirement linkage.
- **Undelivered:** an accepted expected requirement has no matching actual evidence.
- **Unauthorized:** a test or implementation deliverable has no accepted expected requirement.
- **Divergent:** actual and expected behavior differ under an explicit decision or unresolved mismatch.

The user should be able to move in either direction:

```text
Requirement -> specification -> test -> implementation
Implementation -> test -> requirement -> source authority
```

A change review should not ask the user to inspect every link manually. It should say exactly which behavioral boundary will be broken, which evidence is stale, and what reconciliation decision is required.

**User utility:** a maintainer can prove why retained code exists, identify behavior that is outside control without reverse-engineering all of its intent, and prevent an agent from adding disconnected code or tests.

## FIMP UX: from patch retries to one complete edit decision

The model begins with the complete intended change, not with a requirement to construct durable file coordinates.

```text
multi-hunk intent
    -> runtime resolves unique targets
    -> one batched matrix for ambiguous hunks
    -> one resolution response
    -> complete replay and validation
    -> one complete preview
    -> conditional publication
```

The interface must show only the local evidence needed to distinguish actual occurrences. Parser-derived symbol or structural ancestry may make the choice more precise, but it must remain evidence rather than a universal anchor.

The transaction view should clearly separate:

- target choice;
- mechanical replay and validation;
- semantic preview acceptance;
- final current-state check;
- publication and receipt recovery.

**User utility:** a large multi-hunk edit does not become a large sequence of context reloads and patch failures. Unique hunks disappear from the decision surface; ambiguous hunks share one JIT clarification round; the user reviews one complete result.

## Guerilla UX: from log aggregation to causal event view

Guerilla should resemble an operating-system event viewer for the persistent project, but with causal edges and native authority links.

A row in the activity feed is not merely “command exited 0.” It is an event envelope:

```text
who/what initiated
-> which profiled CLI operation ran
-> what evidence existed before and after
-> what outcome can be supported
-> which later operation depended on it
```

The interface must preserve uncertainty:

- confirmed;
- failed;
- pending;
- unknown;
- unprobeable;
- authority inconsistent.

Each event expands to the native receipt, commit, requirement record, FIMP transaction, Expflow revision, validator result, or other authoritative record. Guerilla explains the causal path; it does not replace those records.

**User utility:** after an agent, terminal session, or automation is interrupted, the user can determine what was attempted, what actually changed, what still needs reconciliation, and where the next safe action begins.

## Expflow UX: from scattered history to workflow repository

Expflow’s GUI should relate to its CLI the way GitHub relates to Git: an approachable view over durable state, not a replacement for the underlying system.

The primary object is a workflow, not merely a folder or commit. A user should see:

- virtual artifacts generated before download;
- exports, imports, renamed files, and local revisions recognized as one lineage where evidence supports it;
- which source is authoritative for which claim;
- generated, materialized, accepted, verified, and reusable states as separate decisions;
- restore points and current drift;
- missing dependencies or unresolved references that block portability.

The workspace can organize this into five views:

1. **Workspace:** current workflow state, drift, unresolved decisions, and portability readiness.
2. **Activity:** material and semantic changes over time.
3. **Artifacts:** virtual, exported, imported, local, regenerated, and corresponding forms.
4. **Review:** authority, correspondence, completion, equivalence, and reuse decisions.
5. **Portability:** the evidence and dependencies required to reopen or continue the workflow elsewhere.

**User utility:** the user can find the artifact’s actual workflow history, restore a meaningful state, and move the work without manually rebuilding identity and context from chats, filenames, and commits.

## Four concrete utility moments

### Brownfield recovery

A maintainer finds tested behavior that is not represented in the specification. Reqtrace derives the actual requirement from the test-to-code relationship, compares it with expected behavior, and presents a bounded reconciliation decision instead of asking the user to infer the entire codebase’s original intent.

### Thirty-hunk agent edit

Twenty-four hunks are unique and require no extra context. Six are ambiguous and are returned together with compact local or parser-assisted context. FIMP eliminates heavy model-facing anchors for the unique hunks and replaces six separate clarification loops with one matrix and one resolution response.

### Lost tool response

An agent loses its connection after invoking a native command. Guerilla does not mark the operation successful or failed from the missing response. It records the attempt, probes or waits for native evidence when possible, preserves an unknown state otherwise, and shows downstream operations that must remain blocked.

### Renamed downloaded artifact

An artifact is produced in a chat, downloaded twice, renamed locally, edited, and committed. Git sees the local history after materialization. Expflow reconciles the virtual, export, import, local, and repository evidence so the user can inspect one lineage and carry the workflow forward.

## Progressive disclosure

| Layer    | User-facing answer                                          | Expandable evidence                                                              |
| -------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Summary  | What changed, what is controlled, and what needs attention? | State labels, counts, and next safe action.                                      |
| Decision | Which bounded choice must a human or model make?            | Candidate context, traceability gap, authority conflict, or acceptance decision. |
| Proof    | Why is the system allowed to make that claim?               | Native records, receipts, tests, hashes, validators, and causal links.           |

Complexity remains available in the details, but the user never needs to learn internal record names to make the immediate decision.

## State-language rules

The UX must never collapse these distinctions:

- generated is not materialized;
- materialized is not completed;
- completed is not verified;
- verified is not accepted for reuse;
- command exit is not authoritative outcome;
- similarity is not mutation permission;
- linked is not bidirectionally controlled;
- present on disk is not portable workflow ownership.

## CLI and GUI relationship

The model-facing CLI and structured interfaces remain stable plumbing. The GUI provides navigation, review, and progressive disclosure over the same records. No GUI-only action should create state that cannot be represented and inspected through the underlying contracts.

## UX acceptance criteria

The external experience is successful when a user can:

1. identify the exact behavioral-control gap without manually traversing the whole repository;
2. review a multi-hunk edit with context proportional to real ambiguity rather than hunk count;
3. follow a cross-system operation from intent to native evidence without false certainty;
4. find one artifact lineage across virtual and material representations;
5. restore or export a workflow with explicit missing dependencies and unresolved decisions;
6. understand the next safe action from the summary while retaining access to the full proof.
