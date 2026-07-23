# Product Overview

## The category-level proposition

AI-assisted development does not fail because files cannot be written. It fails because the tools surrounding the filesystem preserve different fragments of control:

- requirements tools record expected intent but usually cannot prove that every retained behavior is authorized;
- agent editing tools can generate changes but repeatedly spend context and retries rediscovering where each hunk belongs;
- orchestration and logging tools report commands but rarely preserve a causal, cross-system account of what actually became authoritative;
- version-control and chat systems preserve material commits or conversations, but not the full workflow across virtual artifacts, imports, local edits, acceptance, and reuse.

The project set supplies four distinct solutions over one persistent project environment:

- **Reqtrace converts requirements traceability into a behavioral control plane.**
- **FIMP converts agent patching into a batched conditional mutation transaction.**
- **Guerilla converts scattered command logs into a causal event view over native CLI systems.**
- **Expflow converts fragmented artifact histories into a portable workflow version-control plane.**

## Persistent project mental model

The filesystem, repository, tests, specifications, and native tool stores remain the durable project data plane. Models interact with that state through bounded control planes and agent-computer interfaces rather than by carrying the whole project in conversational memory.

```text
Human / Model / CI
        |
        +--> Reqtrace ACI: authorize and verify behavioral scope
        +--> FIMP ACI: localize and publish a complete mutation
        +--> Expflow ACI: version, inspect, restore, and move workflow state
        |
        v
Persistent project data plane
files / Git / tests / documents / native records
        |
        +--> Guerilla event view: observe CLI operations and causal effects
```

The CLI is the common operational seam, not the only user interface. GUIs can expose the same durable decisions without becoming the canonical store.

## Where existing tool categories stop short

| Tool category                                    | Structural limitation                                                                                                                                  | Definitive solution in this project set                                                                                                                                                                                |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Requirements management and RTMs                 | Forward links can show intended delivery, but brownfield code, tests, and actual behavior can remain unauthorized or disconnected.                     | Reqtrace derives test-backed actual behavior separately from expected claims, reconciles them under human control, and enforces forward and backward traceability as a change-control boundary.                        |
| Agent patching and code-edit interfaces          | Each hunk often pays again for file context, line/range/hash anchors, parser coordinates, retries, and ambiguity resolution.                           | FIMP accepts one complete multi-hunk intent, resolves unique targets internally, batches every ambiguous hunk into one JIT context exchange, then performs one complete replay, preview, state check, and publication. |
| Agent orchestration, logs, and observability     | Tool-local logs do not explain cross-system causality; exit codes and lost responses can be mistaken for authoritative outcomes.                       | Guerilla profiles native CLI systems, records invocation and before/after evidence, preserves unknown outcomes, and projects an append-only causal DAG linked back to native authority.                                |
| Git, backup, chat history, and workflow trackers | Git begins after materialization; chats, cloud libraries, downloads, and local files each preserve only partial histories and inconsistent identities. | Expflow reconciles scoped authority across virtual, exported, imported, cloud, and material artifacts; records decisions and workflow boundaries; and makes the resulting workflow portable.                           |

## Reqtrace: requirements tooling becomes behavioral control

Conventional requirements tools are good at recording what someone expected. They are weaker at proving that every active deliverable is authorized and every accepted requirement is actually delivered, especially in brownfield or AI-generated codebases.

Reqtrace solves that control problem by maintaining two independent evidence surfaces:

1. **Actual behavior** extracted from tests and the implementation those tests exercise.
2. **Expected behavior** extracted from issues, requirements, specifications, ADRs, and other product sources.

A human-controlled reconciliation produces a resolved bidirectional matrix:

```text
Issue <-> requirement <-> specification <-> test <-> implementation deliverable
```

The result is not a documentation graph. It is an authorization boundary. A proposed change can be rejected when it creates code without a requirement, a test without expected behavior, a requirement without a deliverable, or a deliverable whose evidence no longer proves the recorded behavior.

**Definitive utility:** Reqtrace makes loss of control mechanically visible and prevents new work from expanding outside the accepted behavioral surface.

## FIMP: patching becomes a batched conditional transaction

Most agent edit interfaces make the model pay for target geometry before the runtime knows whether that geometry is necessary. Line ranges, exact-match blocks, JSON anchors, file-wide hashes, or AST paths are supplied for every hunk, even when most targets are already unique.

FIMP reverses that cost structure:

1. The model submits one immutable multi-hunk Intent Manifest using local content intent.
2. The runtime examines the current authoritative file and resolves unique hunks without model interaction.
3. Only ambiguous hunks receive JIT local evidence, optionally strengthened by parser-derived ancestry.
4. Every ambiguous hunk is returned in one batched Anchor Matrix and answered by one Resolution Map.
5. The runtime replays the complete transaction from the immutable base, validates the full result, discloses one complete preview, and publishes only while strong state preconditions remain current.

Parser evidence improves precision but never becomes a universal file address. Similarity retrieves candidates but never authorizes mutation. The selected actual content becomes the exact replay precondition.

**Definitive utility:** FIMP makes context, payload, and clarification cost scale primarily with real ambiguity rather than multiplying heavyweight anchors and interaction rounds across every hunk.

## Guerilla: orchestration becomes an inspectable causal event view

Agent runtimes usually know that they launched a command. Native tools know their own state. Neither alone provides a durable cross-system account of why an operation occurred, what evidence surrounded it, whether its result became authoritative, and what operation it caused next.

Guerilla profiles native CLI systems instead of replacing them. A profile defines detection, allowed command classes, required observations, authority links, and isolation boundaries. Guerilla then records:

```text
intent -> native invocation -> before/after evidence -> reconciled outcome -> downstream effects
```

A process exit is not automatically treated as authoritative success. Lost responses, asynchronous completion, unprobeable states, and conflicting observations remain explicit until native evidence supports a stronger classification.

**Definitive utility:** Guerilla gives users and agents a resumable, cross-system causal journal while leaving each profiled tool authoritative for its own state.

## Expflow: version control expands from repositories to workflows

Git preserves material repository history extremely well. It does not preserve an artifact before it enters the repository, explain whether two exports and a renamed local file are the same workflow object, or distinguish generated output from accepted completion.

Expflow addresses the workflow history that exists around Git:

- virtual artifacts before download or materialization;
- exports, imports, renamed files, local revisions, and cloud representations;
- scoped authority claims from different sources;
- assertions, conflicts, review, and acceptance decisions;
- workflow input and output boundaries;
- regeneration, equivalence, and reuse evidence;
- complete material tree revisions and restoration.

No source is globally authoritative. Each source contributes evidence within its declared scope, and Expflow reconciles those partial histories into an inspectable workflow record.

**Definitive utility:** Expflow lets a workflow move between chats, platforms, directories, repositories, and future tools without collapsing into anonymous files and disconnected transcripts.

## Why four systems instead of one platform

The four products protect different correctness boundaries:

- Reqtrace decides whether behavior is controlled.
- FIMP decides whether one intended mutation is safely localizable and publishable.
- Guerilla decides what can be said about cross-system causality and outcome evidence.
- Expflow decides what workflow state is durably owned, restorable, and portable.

Combining those responsibilities in one runtime would force a workflow store to become an editor, a requirements system to become an orchestrator, or an event journal to become authoritative for systems it only observes. Separation makes adoption incremental and failure semantics explicit.

## Why Expflow is first

Expflow is the least intrusive credible adoption wedge. It can sit beside Git, existing editors, chat providers, and local project structures. Users can begin by recording, inspecting, and restoring workflow state without first recovering a complete RTM, replacing the editing interface, or routing every command through a universal hook.

This does not make Expflow the most impactful component in every workflow. It makes Expflow the easiest place to prove value while establishing the durable substrate that later Reqtrace, FIMP, and Guerilla evidence can enrich.

## Current product boundary

Expflow `v1.2.0` provides a complete ordinary decision surface with nine command families (project, material, workflow, evidence, authority, conflicts, decisions, package, reporting). The four-command material CLI (`init`, `sync`, `status`, `restore`) is supplemented by capability discovery (`capabilities --json`), automation flags (`--yes`, `--non-interactive`), and a local GUI as a peer client. The application command service provides a plan/apply/receipt lifecycle with actor metadata attribution. The following v1.1.0 limits were corrected in Phase 1:

- default human `status` reports a state word while the JSON surface carries the useful change and next-action detail;
- human `sync --dry-run` reports a revision count rather than the paths and change kinds that would be committed;
- users cannot reliably discover prior project or file versions after the original command output is gone;
- restore is exact for recorded history, but currently has no ordinary preview or conflicting-drift consent guard and can overwrite unrecorded working-tree changes;
- preview surfaces can expose temporary node identities in the same format as committed identities without marking them as provisional for human or machine consumers;
- identity-control flags exist on `sync`, but current help does not make them discoverable;
- authority, semantic, workflow, projection, regeneration, equivalence, reuse, security, and migration runtimes remain primarily library-facing rather than one coherent ordinary product surface.

Phase 1 does not invent Expflow's category-level utility. It makes the existing material core understandable, inspectable, and safe enough to serve as the adoption wedge described here. The Expflow GUI, broad evidence intake, portable workflow package, external pilot, Guerilla profile, and causal event-view GUI remain later-phase work.

## Utility and proof snapshot

| Project  | Definitive solution                                                                                                                                         | Current proof boundary                                                                                                                        |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Expflow  | Portable workflow VCS across material and non-material artifact histories, scoped authority, decisions, restoration, and reuse.                             | Public v1.2.0 CLI, local GUI, application command service, and tested advanced runtimes exist; broad empirical pilots remain to be completed. |
| FIMP     | Batched file-blind conditional mutation with JIT local context, complete replay, complete preview, strong concurrency control, and recoverable publication. | The architecture and normative protocol are frozen; implementation and comparative evaluation remain the conformance target.                  |
| Guerilla | Profile-driven causal event view over native CLI systems with explicit uncertain outcomes and native authority links.                                       | The current universal-hook and causal-DAG direction is defined; stable profiles, integrated runtime proof, and GUI remain future work.        |
| Reqtrace | Bidirectional behavioral control derived from actual and expected evidence, human reconciliation, and change-control enforcement.                           | The control model is well specified; a verified external product implementation is not claimed in the supplied materials.                     |

## The product promise

The set is designed to let a model interact with a persistent project without making conversational memory, opaque tool calls, or one hosted platform the source of truth:

> **Authorize the behavior. Localize the mutation. Observe the causal event. Preserve the workflow.**
