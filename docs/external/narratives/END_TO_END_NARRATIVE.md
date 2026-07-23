# End-to-End Narrative

**Status:** External product narrative  
**Audience:** Users, evaluators, designers, and engineering teams  
**Scope:** One integrated scenario showing how Reqtrace, FIMP, Guerilla, and Expflow improve their respective tool categories  
**Normative authority:** None. This narrative describes the intended product experience and does not claim that every surface is currently implemented.

## 1. The starting problem

**Proof status:** Scenario context; no implementation claim.

A team inherits an AI-assisted service with an authentication module. The repository contains code and tests, but the surrounding history is fragmented:

- a product issue says failed token verification should return `null`;
- the current test suite exercises several authentication paths;
- some implementation behavior is tested but not described in the requirements;
- an earlier model generated a replacement module in a chat;
- two copies were downloaded under different names;
- one was edited locally and committed;
- the conversation that explained the change is difficult to find;
- a later agent is asked to update logging and failure behavior across several locations.

A conventional toolchain can still edit and commit the code, but it cannot answer four critical questions as one controlled workflow:

1. **Is the behavior authorized and fully traced?**
2. **Can a multi-hunk edit be localized without repeatedly loading heavy file context?**
3. **What actually happened across the tools, especially if an invocation or response is interrupted?**
4. **Can the complete workflow be resumed elsewhere without reconstructing artifact identity and decisions manually?**

The four projects address those questions without requiring one product to own every kind of truth.

## 2. The user’s persistent project

**Proof status:** Product mental model. The native filesystem, Git, tests, and CLI tools are current; the combined control-plane experience is mixed across current, library-available, and planned surfaces.

The team continues to use its filesystem, Git repository, tests, specifications, editor, and native command-line tools. Those remain the persistent data plane.

The model operates through three bounded control planes:

- Reqtrace for behavioral authorization and evidence;
- FIMP for conditional file mutation;
- Expflow for workflow version control and portability.

Guerilla provides the event view across the native CLI operations that connect them.

```text
Persistent project
files / Git / tests / specifications / native records

Control planes used by the model
Reqtrace / FIMP / Expflow

Cross-system event view
Guerilla
```

The user does not need to understand the internal record families before beginning. The GUI and CLI use task language—what changed, what needs attention, what is approved, and whether the work can continue elsewhere. Internal schema names and identifiers appear only in technical details.

## 3. Step one: Reqtrace restores the behavioral boundary

**Proof status:** Specified/planned Reqtrace product behavior. A verified external implementation is not claimed by this package.

The team first asks a practical question:

> “Which authentication behavior is controlled, and which behavior merely happens to exist?”

Reqtrace does not assume that the requirement document or the current code is automatically correct.

It derives two independent surfaces:

### Observed behavior

Tests and their covered implementation regions demonstrate that:

- invalid signatures return `null`;
- missing tokens currently throw in one path;
- public routes bypass token verification;
- a logging branch runs for one failure class but not another.

Those observations become a test-backed view of what the system currently does, with evidence linking each behavior to tests and implementation.

### Expected behavior

The issue, specification, and related product notes state that:

- missing or invalid tokens should return `null`;
- public-route behavior must not change;
- token values must never appear in logs;
- successful verification must remain unchanged.

Those become the expected-behavior view, with each expectation linked to its source.

### Control review

Reqtrace compares actual and expected behavior. It identifies:

- a match for invalid-signature handling;
- a mismatch for the missing-token path;
- an accepted requirement protecting public routes;
- a logging constraint that lacks complete test evidence;
- one tested branch with no explicit expected requirement.

The user resolves the retained differences. The resulting controlled-behavior view states exactly which requirement authorizes each test and implementation deliverable, and which test and deliverable prove each active requirement.

The requested change is now bounded:

```text
Authorized change
- return null when tokens are absent or invalid
- add non-secret logging for the failure path

Protected behavior
- public-route bypass remains unchanged
- successful verification remains unchanged
- token values remain undisclosed
```

**Category improvement:** Reqtrace does not merely show links. It converts an incomplete brownfield traceability graph into a change-control boundary that can distinguish authorized, uncontrolled, contradictory, and undelivered behavior.

## 4. Step two: Guerilla records the initiating causal event

**Proof status:** Specified/planned Guerilla behavior. The Expflow profile and event contracts are Phase 8; the causal event-view GUI is Phase 9.

The user authorizes the bounded requirement operation. Guerilla records the causal envelope:

```text
human decision
    -> resolved Reqtrace requirement
    -> agent task creation
    -> FIMP transaction invocation
```

The event links to the authoritative Reqtrace record instead of copying its meaning into an unstructured log.

Guerilla captures:

- who or what initiated the operation;
- the declared requirement and constraints;
- which native CLI command or operation class was invoked;
- the relevant project state before execution;
- the expected evidence needed to classify the result.

At this point, Guerilla does not claim that a code change has succeeded. It records that a controlled mutation was initiated and what evidence would be required to establish the next state.

**Category improvement:** the operation begins with a durable causal predecessor rather than an isolated shell command whose purpose must later be inferred from terminal history or conversation text.

## 5. Step three: FIMP performs a batched file-blind mutation

**Proof status:** Normative FIMP architecture and protocol direction; public implementation and comparative evaluation are not claimed here.

The authentication change requires multiple hunks in the same file:

1. change the missing-token path;
2. add a safe log message;
3. preserve the public-route branch;
4. update a nearby helper return path;
5. adjust a comment that describes failure behavior;
6. leave successful verification unchanged.

A conventional agent patch interface may require the model to provide line ranges, exact replacement blocks, broad context, file-wide hash anchors, or parser coordinates for every hunk. If an earlier hunk changes geometry or a local block appears more than once, the agent may need to reread and retry each affected edit.

FIMP changes the interaction pattern.

### One change request

The model submits the complete intended change and its constraints in one request. It expresses local content intent but does not maintain a universal coordinate map for the file.

### Targets found automatically stay out of the user’s way

The runtime examines the current authoritative file. Four hunks are uniquely identifiable from their local content and require no additional model-facing context.

### Target choices are shown together

Two hunks match more than one plausible location. FIMP returns one combined set of local target choices for both hunks.

The evidence may include:

- actual candidate content;
- compact text before and after the candidate;
- parser-derived ancestry such as `AuthService -> verifyToken -> failure branch`;
- deterministic differences from the intended content.

Parser context improves precision but does not become a reusable global address. The selected candidate’s actual content is frozen as the replay precondition.

### One set of choices

The model selects the intended location for each ambiguous hunk in one response. It does not perform two separate file rereads or clarification loops.

### One complete application check

FIMP reloads the immutable base and applies every hunk sequentially. A locally plausible choice that fails after an earlier hunk changes the file rejects the complete transaction. No successful prefix becomes authoritative.

### One complete review

The runtime validates the result and presents every changed region as one complete proposed representation. The approving principal can see the total effect rather than approving isolated edits whose interaction remains hidden.

### Apply only while the reviewed state is current

Immediately before publication, FIMP verifies that the file and authoritative validator read sets still match the evaluated state. If they do, the complete approved result is published atomically and a durable change record is created. If they do not, the transaction fails without implicit rebase.

**Category improvement:** the model-facing context and interaction burden is concentrated on the two genuinely ambiguous hunks rather than multiplied across all six hunks, while cross-hunk correctness is judged on one complete result.

## 6. Step four: native validation proves the resulting behavior

**Proof status:** Native tests and validators are current project tools; automatic binding of their results into the complete integrated workflow remains specified/planned.

The project’s native tests and validators run against the published result.

They establish that:

- missing tokens now return `null`;
- invalid tokens continue to return `null`;
- public routes retain their previous behavior;
- successful verification remains unchanged;
- log output contains no token values;
- the complete edited file passes mechanical validation.

The validation tools remain authoritative for their own results. FIMP’s durable change record proves which file result was published. The test system proves which behaviors were exercised. Reqtrace determines how that evidence affects behavioral control.

## 7. Step five: Reqtrace closes both traceability directions

**Proof status:** Specified/planned Reqtrace reconciliation and enforcement.

Reqtrace evaluates the resulting state:

### Forward traceability

For each active requirement, it verifies that:

- the requirement is represented in the specification;
- an expected test proves the behavior;
- the implementation deliverable exists;
- current validation evidence applies to the resulting state.

### Backward traceability

For each changed implementation region and test, it verifies that:

- an accepted requirement authorizes it;
- the relevant source issue or specification remains traceable;
- no new implementation branch or test has appeared without an accepted behavioral purpose.

The earlier mismatch is now resolved. The logging requirement is supported by evidence. The public-route constraint remains intact. The controlled-behavior view advances to the new accepted state.

**Category improvement:** the system does not end at “tests passed.” It proves that the delivered behavior remains authorized in both directions and that no disconnected behavior was introduced as a side effect.

## 8. Step six: Guerilla reconciles the causal chain

**Proof status:** Specified/planned Guerilla reconciliation; no current Expflow Guerilla profile or causal event surface is claimed.

Guerilla now has evidence from several native systems:

```text
Reqtrace authorization
    -> FIMP transaction
    -> FIMP change record
    -> test and validator runs
    -> Reqtrace reconciliation
    -> Expflow workflow revision
```

Each event points to the native authoritative record.

If the agent connection is lost after FIMP publication but before the response arrives, Guerilla does not infer failure from the missing response. It follows the available receipt and project evidence. The event can be classified as committed when native evidence supports that conclusion.

If no authoritative evidence can yet distinguish committed from not committed, the event remains unknown or pending. Downstream operations that depend on the outcome remain visibly blocked or conditional.

**Category improvement:** the team receives a causal execution history with explicit uncertainty instead of a flat set of timestamps, exit codes, and conversational claims.

## 9. Step seven: Expflow preserves the workflow beyond the repository

**Proof status:** Mixed. Material revision, drift, receipts, exact forward-commit restore, and GUI operations exist in `v1.2.1`; advanced workflow, evidence intake, authority reconciliation, conflict resolution, decision helpers, portable workflow export/import, and security/migration runtimes are library-available through the TypeScript library. A single-operator CLI pilot was completed; broader empirical evaluation remains future work.

The material Git commit is important but incomplete. In the intended integrated flow, Expflow records the broader workflow:

- the original virtual artifact generated in a chat;
- available platform or user-provided artifact-history evidence;
- two exported copies;
- the renamed local materialization;
- the prior local revision and Git history;
- the Reqtrace authorization and reconciliation references;
- the FIMP change record;
- validation evidence;
- the accepted output tree;
- the decision that the workflow is complete;
- unresolved references or provider-specific dependencies.

Expflow does not require an official chat export. An official export, a direct schema record, cloud metadata, a user-provided history, an extension event, or local observation may all contribute evidence. Each source remains attributed and authoritative only within its declared scope.

The user can now inspect one artifact lineage rather than manually compare filenames, hashes, chat attachments, and commits.

At the planned portable-package surface, the workflow can be exported with:

- files, artifacts, and saved project-version references;
- artifact history across generated and local forms;
- source, review, and approval records;
- requirement and test evidence references;
- unresolved dependencies;
- regeneration and reuse constraints.

**Category improvement:** workflow version control begins before repository materialization and preserves the decisions needed to resume the work, rather than exporting only files or transcripts.

## 10. Step eight: the workflow resumes elsewhere

**Proof status:** Phase 2+ and Phase 5+ product experience. The Expflow GUI and portable workflow round trip do not currently exist; Guerilla activity history is a Phase 9 surface.

A later maintainer opens the workflow on another machine or through another supported interface.

The GUI presents a concise summary in user-facing language:

```text
Authentication workflow
Ready to continue: yes
Behavior coverage: complete
Project files: up to date
Artifact history: source output → two downloads → active local file
Needs attention: nothing
Latest activity: workflow package created
```

The maintainer can expand the questions behind that summary:

- **Why is this behavior here?** See the requirement, protected behavior, and tests that prove it.
- **How was this file changed?** See the locations that needed clarification, the full reviewed change, and the resulting file.
- **What led to the current state?** Follow the activity history, including uncertain and later-confirmed outcomes.
- **Where did this artifact come from?** Follow its history across generated, downloaded, local, and repository forms.

An advanced technical-details panel may expose Reqtrace, FIMP, Guerilla, and Expflow record names, identifiers, digests, and native references. Those internal names are not required to complete the user journey.

The original conversation may still be available as evidence, but it is not required as the only operational memory. The persistent project records carry the accepted control, mutation, causality, and workflow state.

## 11. What the user gains

**Proof status:** Intended category-level outcomes, with each project’s current proof boundary stated in the overview set.

Without this system set, the user has to reconstruct four different stories manually:

- the requirements story from issues, tests, and code;
- the edit story from prompts, context windows, diffs, and retries;
- the execution story from terminal logs and partial responses;
- the artifact story from chats, downloads, folders, and commits.

With the system set:

- Reqtrace makes the behavioral authorization story explicit and enforceable;
- FIMP makes the multi-hunk mutation context-efficient and transactionally reviewable;
- Guerilla makes the cross-tool causal story inspectable without fabricated certainty;
- Expflow makes the artifact and workflow story portable.

## 12. Integrated, but not mandatory

**Proof status:** Adoption principle, not a claim that the complete integrated stack is currently deployable.

This narrative shows the strongest combined experience. It does not require every user to adopt all four projects at once.

- A team may use Reqtrace to recover behavioral control without adopting FIMP.
- An agent platform may use FIMP for safer and cheaper multi-hunk edits without Reqtrace.
- A user may use Guerilla to inspect native CLI causality without moving state into Expflow.
- A project may adopt Expflow first to preserve workflow history while continuing to use its existing editing and requirements tools.

The integration principle is progressive:

> **Each project must deliver category-level utility alone. Integration should compound that utility without erasing native authority or forcing a single deployment model.**
