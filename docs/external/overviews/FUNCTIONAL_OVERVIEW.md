# Functional Overview

## Functional proposition

The four projects are not four ways to display the same metadata. Each supplies a distinct function missing from the comparable tool category:

- Reqtrace determines whether the active behavioral surface is authorized and proven in both directions.
- FIMP turns a complete multi-hunk content intent into one safely localized, reviewed, and conditionally published result.
- Guerilla records a causal event history across profiled CLI systems without replacing their native state.
- Expflow versions and reconciles the workflow that exists across virtual artifacts, files, sources, decisions, and material trees.

## Status vocabulary

- **Available:** demonstrated in a current supplied or public implementation.
- **Library-only:** implemented and tested but not exposed through the main user interface.
- **Specified solution:** the function and required behavior are defined; implementation is not asserted here.
- **Planned surface:** accepted product direction that depends on future implementation.

The functional promise is stated definitively even when the proof status is still “specified solution.” This separates what the product must solve from what has already been demonstrated.

## Functional utility map

| Problem the user has                                                                                                   | Function supplied                                                                                                                                                     | Definitive outcome                                                                                                 |
| ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| “I cannot prove why this code or test exists, or whether every requirement was delivered.”                             | Reqtrace builds and enforces a resolved bidirectional requirements matrix from actual and expected evidence.                                                          | Every retained behavior and deliverable is controlled, explicitly divergent, or visibly outside control.           |
| “A large agent edit requires repeated file reads, verbose anchors, retries, and manual patch conflict repair.”         | FIMP resolves unique targets internally, batches ambiguous hunks with JIT context, replays the complete transaction, and conditionally publishes the reviewed result. | Editing overhead is concentrated on real ambiguity, and no partial or stale result silently becomes authoritative. |
| “Several tools ran, but I cannot reconstruct what caused what or whether an interrupted operation actually completed.” | Guerilla profiles CLI systems and records invocation, observations, typed outcomes, native authority links, and causal edges.                                         | The operational history is resumable without inferring success from missing responses or flat logs.                |
| “My artifact history is split across chats, downloads, cloud libraries, local files, and Git.”                         | Expflow reconciles scoped artifact histories, decisions, workflow boundaries, and material revisions into a portable workflow record.                                 | The work can be inspected, restored, transferred, or reused without rebuilding its identity and context manually.  |

## Reqtrace functional surface

### Core control loop

```text
Tests + covered implementation -> actual requirements
Requirements/specifications/issues -> expected requirements
Actual <-> Expected -> human reconciliation
Resolved matrix -> change-control enforcement
```

| Function                        | What it replaces or improves                                                 | User result                                                                                                                 | Status             |
| ------------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| Coverage Map                    | Coverage percentages without requirement meaning.                            | Identify which tests prove which implementation behavior and which regions remain uncontrolled.                             | Specified solution |
| Actual-requirement extraction   | Inferring requirements directly from code or treating tests as requirements. | Represent test-backed behavior with actors, conditions, outputs, side effects, failures, and rationale.                     | Specified solution |
| Expected-requirement extraction | Treating prose as proof of delivery.                                         | Normalize expected behavior while preserving source provenance and uncertainty.                                             | Specified solution |
| Asymmetry Report                | Manual comparison of specifications, tests, and code.                        | Classify expected-without-actual, actual-without-expected, contradictions, uncovered behavior, and incomplete traceability. | Specified solution |
| Human reconciliation            | Silent preference for code, tests, or specifications.                        | Produce explicit decisions, rationale, required edits, accepted divergence, and revalidation.                               | Specified solution |
| Resolved bidirectional RTM      | Forward-only requirement linkage.                                            | Trace requirement to deliverable and every deliverable back to its authorizing requirement.                                 | Specified solution |
| Change Control Report           | PR review based mainly on changed lines and prose intent.                    | Reject unauthorized behavior, missing evidence, broken links, stale rationale, and incomplete delivery.                     | Specified solution |

**Functional guarantee sought:** within the declared boundary, no retained behavior is silently accepted without test-backed requirement control, and no accepted requirement is silently considered delivered without mapped evidence.

## FIMP functional surface

### Core mutation loop

```text
complete Intent Manifest
-> strong base capture
-> unique target resolution
-> one batched Anchor Matrix for ambiguous hunks
-> one Resolution Map
-> complete sequential replay
-> validation + complete preview
-> approval + final OCC
-> atomic publication + recoverable receipt
```

| Function                          | What it replaces or improves                                                                                    | User result                                                                                                      | Status             |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------ |
| File-blind content intent         | Line ranges, snapshot-wide hashes, persistent AST paths, or exact blocks as universal model-facing coordinates. | The model states what local content should change without maintaining a global file map.                         | Specified solution |
| Unique-target fast path           | Supplying rich anchors for every hunk.                                                                          | Hunks that are already unique require no extra model-facing localization context.                                | Specified solution |
| Batched Anchor Matrix             | One ambiguity-resolution exchange per hunk.                                                                     | Every ambiguous hunk is resolved in one transaction-level response.                                              | Specified solution |
| Parser-assisted JIT context       | Parser-only mutation authority or large textual context windows.                                                | Structural ancestry improves precision when available while text remains the portable fallback.                  | Specified solution |
| Deterministic non-exact discovery | Silent fuzzy replacement.                                                                                       | Similarity can retrieve candidates, but only frozen selected content authorizes replay.                          | Specified solution |
| Complete sequential replay        | Independent hunk commits and successful prefixes.                                                               | Cross-hunk effects are validated as one complete transaction.                                                    | Specified solution |
| Complete preview and approval     | Approving isolated hunks or hidden digest-only changes.                                                         | The approving principal can review the complete proposed result.                                                 | Specified solution |
| Strong OCC and recovery           | Implicit rebase, stale publication, or ambiguous lost responses.                                                | The reviewed result is published only against the evaluated state, with committed/aborted/inconsistent recovery. | Specified solution |

**Functional guarantee sought:** the model-facing context and interaction burden scales with ambiguous targets rather than total hunks, while the authoritative mutation remains all-or-nothing and bound to the reviewed base.

## Guerilla functional surface

### Core event loop

```text
intent
-> profiled CLI invocation
-> before/after observations
-> typed outcome reconciliation
-> immutable event node
-> causal edges and native authority links
```

| Function                  | What it replaces or improves                                         | User result                                                                                     | Status                               |
| ------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------ |
| Data-only profiles        | Bespoke, state-owning adapters for every tool.                       | Add support by declaring command classes, observations, boundaries, and security rules.         | Specified direction                  |
| Managed native invocation | Opaque agent shell calls.                                            | Record exactly which native operation was launched and under what declared context.             | Specified direction                  |
| Before/after evidence     | Exit-code-only interpretation.                                       | Compare observable native state around the operation.                                           | Specified direction                  |
| Typed uncertain outcomes  | Converting timeout or lost response into generic failure or success. | Keep pending, unknown, unprobeable, and inconsistent outcomes visible until evidence changes.   | Specified direction                  |
| Causal DAG                | Flat logs ordered only by timestamp.                                 | Follow which operation caused which downstream operation across systems.                        | Specified direction                  |
| Native authority links    | Copying another system’s state into the orchestrator as truth.       | Navigate from the event to the authoritative Expflow, FIMP, Reqtrace, Git, or validator record. | Specified direction                  |
| Causal event GUI          | Reading machine event streams and multiple native logs manually.     | Inspect one cross-system activity view with expandable evidence and uncertainty.                | Planned surface; last timeline phase |

**Functional guarantee sought:** every managed operation has an inspectable causal envelope, and absence of evidence never becomes fabricated success.

## Expflow functional surface

### Core workflow loop

```text
observe material and source state
-> record immutable revision/evidence
-> reconcile artifact identity and scoped authority
-> record workflow and decisions
-> inspect / restore / regenerate / reuse / export
```

| Function                                   | What it replaces or improves                                                                        | User result                                                                                                  | Status                                                            |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| Initialize local project                   | Mandatory hosted workspace or migration.                                                            | Begin recording an existing local project in place.                                                          | Available                                                         |
| Sync complete material tree                | File-by-file backup without project-level revision semantics.                                       | Record immutable complete tree state and an operation receipt.                                               | Available                                                         |
| Status and drift                           | Manual comparison between current files and remembered state.                                       | Identify whether the working tree differs from the recorded head.                                            | Available; UX limited                                             |
| Restore node or tree revision              | Ad hoc file copies and destructive recovery.                                                        | Restore prior material while preserving the restore as a new recorded operation.                             | Available — operational; ordinary discovery and safety incomplete |
| Authority-source records                   | Assuming one source is globally authoritative.                                                      | Register which source is authoritative for which claims and scope.                                           | Library-only                                                      |
| Assertions, conflicts, and decisions       | Flattening model proposals into truth.                                                              | Preserve attributed claims, unresolved conflict, review, acceptance, and supersession.                       | Library-only                                                      |
| Workflow occurrences and virtual artifacts | Beginning history only when a file appears locally.                                                 | Represent inputs, outputs, generated artifacts, and materialization before and after filesystem presence.    | Library-only                                                      |
| Projections and manifests                  | Unmanaged generated summaries that can become stale or self-observe.                                | Create attributable deterministic or model-assisted views with explicit acceptance and staleness.            | Library-only                                                      |
| Regeneration, equivalence, and reuse       | Treating regenerated or copied output as automatically identical and accepted.                      | Record attempts, unknown outcomes, evaluations, verification, leakage checks, and separate reuse acceptance. | Library-only                                                      |
| Evidence intake and reconciliation         | Manual reconstruction across chat exports, direct chatbot records, cloud metadata, and local files. | Associate partial histories while preserving provenance, scope, confidence, and unresolved correspondence.   | Planned surface                                                   |
| Portable workflow package                  | Exporting only files or transcripts.                                                                | Move the workflow with artifacts, decisions, evidence, dependencies, and unresolved references.              | Planned surface                                                   |
| Optional local GUI                         | Requiring users to understand raw record families and opaque identifiers.                           | Inspect lineage, decisions, restore points, and portability through an approachable workspace.               | Available in v1.2.0 npm package                                   |

### Current `v1.2.0` command contracts

The current ordinary command surface is intentionally four commands. The following behaviors are verified current contracts, not Phase 1 proposals:

| Contract              | Current behavior                                                                                                           | Phase 1 responsibility                                                                                                                                                      |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Uninitialized query   | `status` reports `uninitialized` and exits `0`; `status --json` exposes `working_tree_state` and `recommended_action`.     | Keep exit `0`; make the human output state the safe next action.                                                                                                            |
| Unavailable mutation  | `sync` and `restore` fail closed with exit `1` when the project is uninitialized or the requested mutation cannot proceed. | Improve remediation without changing the query-versus-mutation contract.                                                                                                    |
| Invalid command shape | Unknown commands use exit `2`.                                                                                             | Preserve compatibility.                                                                                                                                                     |
| Restore history       | A successful restore creates a new forward tree revision; it does not rewind or rewrite recorded history.                  | Add preview, path effects, conflicting-drift detection, refusal by default, and an explicit override while preserving exact recorded bytes.                                 |
| Preview identity      | A new file can receive different node IDs in `status --json`, `sync --dry-run`, and the eventual commit.                   | Mark preview identity as provisional in both human and machine output, omit it until commit, or make allocation deterministic without silently changing identity semantics. |

The installed `v1.2.0` `sync` command also accepts identity and concurrency directives that current help does not expose:

| Flag                              | Verified role                                                                   | Failure behavior                                                                                                                     |
| --------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `--move <from:to>`                | Explicitly preserves node identity across a path move or rename.                | Rejects invalid or inapplicable mutation state with exit `1`; a directive without a corresponding disk change may produce no change. |
| `--new-node <path>`               | Forces a fresh node identity for the selected path.                             | Fails closed with exit `1` when the requested mutation cannot be applied.                                                            |
| `--replace-node <path>`           | Declares replacement rather than same-node continuity for the selected path.    | Fails closed with exit `1` when the requested mutation cannot be applied.                                                            |
| `--expected-head <tree-revision>` | Commits only when the supplied expected material head matches the current head. | A stale expected head is rejected with exit `1`.                                                                                     |

These are flags on `sync`, not new commands. Phase 1 owns their discoverability and verified help wording; it does not expand the ordinary command boundary.

**Functional guarantee sought:** a workflow can be reopened outside its originating interface with its material state, artifact lineage, scoped authority, decisions, and unresolved dependencies intact.

## Independent and combined utility

| Adoption choice | Immediate category improvement                                                                                                              |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Reqtrace alone  | Requirements tooling becomes a behavioral authorization and change-control system.                                                          |
| FIMP alone      | Agent editing becomes a batched, reviewed, conditional mutation protocol.                                                                   |
| Guerilla alone  | CLI automation becomes an inspectable causal event history with explicit uncertainty.                                                       |
| Expflow alone   | Version control expands to the workflow around artifacts, not only repository commits.                                                      |
| Integrated set  | The model can authorize behavior, edit efficiently, expose causality, and preserve the workflow through one persistent project environment. |

## Functional proof criteria

The intended solutions should eventually be evaluated against category-specific proof, not general claims of “better context” or “more observability”:

- **Reqtrace:** percentage of retained deliverables with complete backward authorization, expected requirements with complete forward delivery, and changes correctly blocked for traceability failure.
- **FIMP:** model tokens, payload size, resolution rounds, correct-target rate, wrong-but-valid rate, stale-anchor retries, and total cost as hunk count and ambiguity rate vary.
- **Guerilla:** proportion of operations with complete causal envelopes, correct reconciliation after lost responses, unresolved outcomes preserved without false success, and native authority links that remain valid.
- **Expflow:** successful artifact correspondence, restore correctness, portable export/import round trips, unresolved dependency detection, and ability to resume without the originating conversation or platform.

## Current priority

Expflow remains the first implementation focus because it can deliver utility without requiring users to adopt the complete control stack. The next work should improve the existing UX, expose the advanced workflow model, prove evidence intake and portability, and use the resulting pilot to stabilize the interfaces that Guerilla will later observe. The Guerilla GUI follows after those event semantics are stable.
