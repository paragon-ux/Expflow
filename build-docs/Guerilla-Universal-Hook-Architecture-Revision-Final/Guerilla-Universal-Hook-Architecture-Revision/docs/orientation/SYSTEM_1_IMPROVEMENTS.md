# System 1 Improvements

**Status:** mutable operational orientation record  
**Scope:** Small rules that prevent avoidable execution, integration, validation, and handoff friction

System 1 improvements are pass-start habits. They are not architectural requirements by themselves. Add or revise one when the same small mistake is likely to recur.

## ADR-S1-001 — Start With Live Repository State

**Issue:** A correct plan applied to the wrong branch, stale PR, or changed worktree becomes incorrect work.

**Rule:** Before editing, inspect branch, worktree, remotes, current commit, relevant PR state, and hosted checks.

**Prevents:** Protected-branch edits, duplicate work, stale status claims, and accidental overwrite of user changes.

## ADR-S1-002 — Read Sources by Role

**Issue:** Agents can debate which document is "highest" when the documents control different dimensions.

**Rule:** Use the current workflow for process and gate ownership, the implementation specification for required behavior, machine contracts for exact encodings, and System documents for reusable interpretation rules.

**Prevents:** Reopening settled architecture from a status report or treating an orientation note as a runtime contract.

## ADR-S1-003 — One Agent-Facing Command Surface

**Issue:** Provider-specific tools multiply schemas the model must learn and maintain.

**Rule:** Expose generic operations such as `read`, `search`, `run`, `status`, and `sync`. Route system-specific meaning through profiles and evidence extraction rather than new model-facing tools.

**Prevents:** `*_issue_view`, `*_pr_view`, `*_status`, and other unbounded tool proliferation.

## ADR-S1-004 — Preserve Native Command Semantics

**Issue:** A wrapper can accidentally become a second implementation of the wrapped system.

**Rule:** Preserve argument-array boundaries, working directory, standard input, environment policy, signals, stdout, stderr, exit status, and cancellation behavior. Return the native result unless Guerilla blocks execution before launch under an explicit policy.

**Prevents:** Hidden behavioral drift and false claims that Guerilla owns native mutation semantics.

## ADR-S1-005 — Never Reconstruct Shell Text

**Issue:** Joining model-provided tokens into a shell string creates quoting ambiguity and injection risk.

**Rule:** Execute argument arrays directly. Shell execution requires an explicit profile capability and a separately reviewed policy.

**Prevents:** Command injection, platform quoting divergence, and accidental interpretation of payload data as instructions.

## ADR-S1-006 — Bracket Every Managed Invocation

**Issue:** Capturing only the result loses intent; capturing only intent loses the actual effect.

**Rule:** Use the ordered lifecycle:

```text
discover
→ pre-observe
→ commit intent
→ invoke native command
→ capture native result
→ post-observe
→ reconcile in the DAG
→ return native result
```

**Prevents:** Missing causal boundaries and unsafe retry after an uncertain result.

## ADR-S1-007 — Add a Profile Before Code

**Issue:** A new project is often treated as requiring a new adapter implementation.

**Rule:** First attempt integration with a declarative conformance profile: detection, command classification, observations, extractors, state boundaries, and redaction. Add code only when the profile language cannot express the required ordinary interface.

**Prevents:** Pairwise integration code and internal-suite coupling.

## ADR-S1-008 — Drivers Are Exceptional Transports

**Issue:** A remote-only system may tempt implementers to create another lineage/reconciliation implementation.

**Rule:** A provider driver may perform transport-specific observe or invoke operations, but it must enter the same hook lifecycle, emit the same evidence model, and use Guerilla's one reconciliation engine.

**Prevents:** Parallel continuity ledgers and provider-specific orchestration semantics.

## ADR-S1-009 — Do Not Parallelize One Workspace's Mutations

**Issue:** Concurrent hook, graph, outbox, profile-generation, or package commands can collide on shared outputs.

**Rule:** Parallelize read-only inspection and independent workspaces. Serialize commands that mutate the same Guerilla workspace, generated-contract directory, build directory, or package output.

**Prevents:** Non-deterministic graph revisions, lock contention, and build-directory corruption.

## ADR-S1-010 — Validation Wording Must Match Evidence

**Issue:** A fixture can be reported as full interoperability proof, or a parser check as behavior proof.

**Rule:** Label evidence precisely: schema fixture, profile fixture, synthetic conformance, native command smoke test, interruption test, resynchronization test, heterogeneous pilot, or benchmark.

**Prevents:** Scope expansion driven only by overbroad completion wording.

## ADR-S1-011 — Current Status Is Mutable

**Issue:** Status matrices become stale as PRs merge, checks finish, or architecture revisions land.

**Rule:** Update current status, branch evidence, PR links, implemented surfaces, and residual risks before handoff. Do not use a live status file as immutable architecture input.

**Prevents:** Contradictory claims about completed gates and pending work.

## ADR-S1-012 — Keep Top-Level README Maps Current

**Issue:** Architecture revisions can leave repository maps describing obsolete adapter ownership.

**Rule:** Update each materially affected top-level directory README once per pass. Do not recurse through every subdirectory unless the task directly changes that area.

**Prevents:** Stale navigation and repeated review correction.

## ADR-S1-013 — Detect Wrapper Bypass Through Resynchronization

**Issue:** Native commands may run outside the hook.

**Rule:** Treat wrapper bypass as an observable continuity gap. Provide explicit or scheduled `guerilla sync`/resynchronization rather than forcing every system to depend on a Guerilla SDK.

**Prevents:** False assumptions that all mutations were intercepted and pressure to force compatibility into external systems.

## ADR-S1-014 — Prove Generality With an Unrelated CLI

**Issue:** Profiles for only Reqtrace, Patch-DIFF, and Expflow can hide internal-suite assumptions.

**Rule:** Every universal-hook conformance release must include a fourth, unrelated ordinary CLI fixture or pilot requiring no Guerilla-specific code.

**Prevents:** A nominally universal architecture that remains internal in practice.

## ADR-S1-015 — Transport State Is Not Continuity State

**Issue:** Delivery retries or acknowledgements can be mistaken for authoritative lineage.

**Rule:** A durable outbox may record publication attempts and acknowledgements, but only committed DAG records own lineage, conflicts, decisions, and continuity.

**Prevents:** A second hidden authority inside the hook host.

## ADR-S1-016 — Redact Before Persistence

**Issue:** Native stdout, stderr, environment values, and configuration can contain secrets.

**Rule:** Apply the declared redaction policy before payload persistence or graph publication. Record that redaction occurred and the policy version; do not preserve removed secrets for hashing convenience.

**Prevents:** Secret retention in otherwise immutable evidence.

## ADR-S1-017 — Profiles Are Data, Not Plugins

**Issue:** A profile that embeds arbitrary code or shell fragments recreates the adapter SDK under a different name.

**Rule:** Gate D profiles are data-only. Observation recipes use argument arrays and registered declarative parsers. When declarative behavior is insufficient, use a separately packaged, isolated provider driver.

**Prevents:** Hidden executable adapters, unsafe profile loading, and profile-specific continuity behavior.

## ADR-S1-018 — Pin Exact Profile Content

**Issue:** Resolving only by a friendly profile name can make the same command behave differently after a registry update.

**Rule:** Workspaces pin `profile_id`, semantic `profile_version`, protocol version, and content digest. Do not auto-upgrade profiles during command execution.

**Prevents:** Non-reproducible invocation classification and observation drift.

## ADR-S1-019 — Unknown Commands Fail Closed

**Issue:** Treating an unclassified command as read-only or mutating by guess can violate intent-before-action and state-boundary policy.

**Rule:** An unknown command is blocked. Add or revise the profile and its fixtures before execution. Agent-supplied one-off classification overrides are prohibited.

**Prevents:** Capability escalation and accidental native mutation outside the declared lifecycle.

## ADR-S1-020 — Required Observations Block Before Launch

**Issue:** A mutating command can begin without the pre-state needed for safe reconciliation.

**Rule:** Each observation recipe is `required` or `optional`. Failure of a required pre-observation blocks mutating, destructive, and administrative commands. Optional observation failure is recorded as degraded evidence. Post-observation failure never converts native success into native failure.

**Prevents:** Missing preconditions, false native failure reports, and ambiguous retry behavior.

## ADR-S1-021 — Resynchronization Deduplicates by Boundary

**Issue:** A managed invocation followed by resynchronization can create duplicate lineage for the same native effect.

**Rule:** Store the managed invocation's pre-boundary, post-boundary, native operation reference, and observation digests. Resynchronization compares these anchors before appending reconstructed change. Ambiguous overlap creates a continuity conflict rather than duplicate certainty.

**Prevents:** Double-counting and false causal attribution.

## ADR-S1-022 — Discovery Ambiguity Is an Error

**Issue:** Multiple compatible profiles or system instances can match the same workspace and command.

**Rule:** Resolution order is explicit system selection, workspace lock, exact compatible profile, then unique discovery match. A tie fails with a structured ambiguity result.

**Prevents:** Non-deterministic provider selection and accidental execution against the wrong system.

## ADR-S1-023 — Resource Collections Are Readable Paths

**Issue:** Adding a separate discovery tool would expand the generic agent surface.

**Rule:** `read("guerilla://systems/")` returns discoverable system-instance descriptors. Child paths expose capabilities, status, boundaries, profile identity, and resource roots. Discovery does not require a provider-specific tool.

**Prevents:** Tool proliferation and undiscoverable profile capabilities.

## ADR-S1-024 — Async Outcomes Remain Unknown Until Probed

**Issue:** An accepted asynchronous job submission can be misreported as completed work.

**Rule:** Drivers record the provider handle and return `accepted_pending`. Guerilla schedules bounded evidence probes. When no reliable probe exists, classify `unknown_unprobeable`; do not retry the mutation automatically.

**Prevents:** Transport-success-as-completion and duplicate cloud operations.
