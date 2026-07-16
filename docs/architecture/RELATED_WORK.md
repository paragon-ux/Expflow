# RELATED WORK AND COMPARATIVE POSITIONING

## Concrete System Categories for Automated Workflow Ownership

**Version:** 2.3-draft  
**Status:** Rationale document

---

## 1. Comparison Method

Expflow is best positioned through concrete operational questions:

- Are old file versions retained?
- Is the complete relative tree versioned?
- Can a workflow select a subset of that tree?
- Are authority sources registered and scoped?
- Are model claims separated from accepted decisions?
- Are virtual generated artifacts represented?
- Are readable manifests versioned and accepted?
- Can regeneration and reuse be evaluated?
- Can the same system support live work and brownfield recovery?

---

## 2. Version Control

Version-control systems preserve historical file trees and grouped changes.

They provide:

- commits;
- branches;
- diffs;
- restoration;
- exact old states.

They generally do not provide:

- chat artifact events;
- extensible workflow authority registration;
- virtual outputs;
- source correspondence;
- attributed semantic decisions;
- workflow input and output selectors as first-class occurrence state;
- accepted workflow-time manifests;
- regeneration equivalence;
- structural reuse evaluation.

Expflow can operate beside or on top of a repository, but its workflow state is distinct from commit history.

---

## 3. Backup and File Synchronization

Backup and sync systems provide:

- automated capture;
- old versions;
- recovery;
- path-based state.

They generally observe low-level changes without workflow intent.

Expflow groups material changes at an explicit command boundary and connects them to:

- invoking actor;
- identity directive;
- authority updates;
- workflow occurrence;
- semantic automation.

---

## 4. Document Management

Document-management systems offer:

- versioning;
- review;
- permissions;
- retention;
- approval.

Many require predefined document classes and repository metadata.

Expflow keeps material identity opaque and permits roles to vary by workflow occurrence.

It also represents virtual chat outputs and model-assisted semantic proposals.

---

## 5. Workflow Automation

Workflow engines execute predefined task sequences.

They provide:

- task state;
- retries;
- scheduling;
- integration;
- human approval points.

They usually assume the workflow is already defined.

Expflow may extract a workflow from brownfield evidence and can observe a run without becoming its scheduler.

Its main durable objects are artifact trees, authority records, decisions, and manifests.

---

## 6. Durable Execution

Durable execution systems persist long-running operation state.

They contribute:

- idempotency;
- retry;
- resumability;
- timeouts;
- unknown outcome handling.

Expflow adopts these operational patterns for hooks, regeneration attempts, and commits.

It additionally preserves the exact material and semantic workflow state so a result remains inspectable outside the executor.

---

## 7. Process Mining

Process-mining systems discover recurring activity sequences from historical event data.

They support:

- workflow-family discovery;
- variant comparison;
- bottleneck analysis;
- conformance checking.

Expflow differs by retaining:

- exact input and output tree revisions;
- old material versions;
- virtual generated artifacts;
- source authority;
- accepted semantic decisions;
- reusable document-tree realization.

Its output is intended for direct workflow ownership and reapplication, not only analysis.

---

## 8. LLM Tracing and Observability

LLM observability systems commonly record:

- prompts;
- models;
- tokens;
- latency;
- tool calls;
- failures;
- evaluator scores.

They may show that a model call succeeded without showing:

- which historical input tree it used;
- whether generated outputs entered the project;
- whether workflow completion was accepted;
- which manifest is current;
- whether reuse imported old semantics.

Expflow adds artifact- and workflow-level signals.

---

## 9. Chat Archives

Chat exports preserve:

- messages;
- timestamps;
- actor order;
- attachments;
- some generated artifact metadata.

They are valuable authority sources.

They usually do not identify:

- exact old local import versions;
- selected project-tree scope;
- external materializations;
- accepted clustering decisions;
- reusable workflow structure.

Expflow converts chat evidence into operational workflow state without replacing the archive.

---

## 10. Agent Memory

Agent memory systems preserve:

- facts;
- summaries;
- embeddings;
- prior actions;
- retrieved context.

Memory is optimized for helping the model act.

Expflow is optimized for helping authorized actors inspect and own the workflow.

A useful memory may still omit exact old versions, path occupancy, conflicts, and acceptance decisions.

---

## 11. Experiment and Model Versioning

Experiment systems associate runs with:

- datasets;
- code;
- parameters;
- models;
- metrics.

They provide a strong pattern for comparing input versions and outcomes.

Expflow generalizes the input boundary to arbitrary relative artifact trees containing documents, prompts, plans, evidence, images, and references.

It also records chat and user authority histories and virtual artifacts.

---

## 12. Computational Notebooks

Notebooks combine:

- narrative;
- code;
- outputs;
- execution order.

They are useful for reproducible analysis but remain bound to notebook cells and execution state.

Expflow covers artifacts spread across:

- chats;
- project folders;
- repositories;
- document tools;
- external materializations.

---

## 13. Personal Knowledge Systems

Knowledge tools preserve:

- folders;
- notes;
- links;
- revisions;
- user organization.

They frequently become the materialization surface for generated outputs.

They do not normally distinguish:

- original virtual artifact;
- copied materialization;
- workflow occurrence;
- exact source tree;
- accepted semantic correspondence.

Expflow can observe those relationships without requiring the knowledge tool to adopt its internal model.

---

## 14. Research and Project Packaging

Project packages collect:

- sources;
- outputs;
- documentation;
- environment information.

They are useful for transfer and archival use.

They are often assembled at the end.

Expflow versions the tree during work, preserves old versions, records virtual artifacts, and supports several workflow occurrences in one project.

---

## 15. Digital Forensics and Audit Systems

Audit systems preserve:

- events;
- actors;
- timestamps;
- integrity evidence;
- historical reconstruction.

Expflow adopts immutable records and explicit limitations.

Its additional goal is operational:

- resume;
- regenerate;
- compare;
- reuse;
- transfer.

Evidence becomes part of an owned workflow rather than remaining only a historical record.

---

## 16. Programming by Demonstration

Systems that learn from examples can infer reusable procedures.

They offer:

- reduced manual workflow specification;
- repeated pattern discovery;
- automatic replay.

Expflow treats inferred structure as an attributed proposal.

It retains the source tree, decisions, deviations, and semantic leakage evaluation before approving reuse.

---

## 17. Configuration Management

Configuration systems compare observed state with desired state.

They contribute:

- declarative state;
- validation;
- drift detection;
- idempotent change;
- automation.

Expflow does not attempt to converge all artifacts to one desired state.

It preserves historical and competing workflow states, including unresolved semantics and virtual outputs.

---

## 18. Records and Case Management

Case-oriented systems group documents, events, actors, and decisions around one matter.

They resemble workflow occurrences in several ways.

Expflow differs by emphasizing:

- exact versioned relative trees;
- agentic generation events;
- virtual artifacts;
- model assertions;
- structural reuse across new input trees.

---

## 19. Comparative Matrix

| Category | Old versions | Complete tree versions | Workflow path scope | Extensible authority | Durable semantic decisions | Virtual outputs | Accepted manifests | Regeneration/reuse evaluation |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Version control | Yes | Yes | Manual | No | No | No | No | No |
| Backup/sync | Often | Sometimes | No | No | No | No | No | No |
| Document management | Yes | Partial | Case-specific | Limited | Approval only | No | Limited | No |
| Workflow automation | Task state | No | Task payload | Connector-based | Approval state | Limited | No | No |
| Durable execution | Operation state | No | No | No | No | Limited | No | No |
| Process mining | Event history | No | Inferred | Event source | Inferred results | No | Process view | No |
| LLM observability | Call history | No | No | Trace source | Evaluations | Sometimes | No | Partial |
| Chat archive | Attachments | No | No | Platform record | No | Sometimes | No | No |
| Experiment versioning | Yes | Run inputs | Run scope | Run metadata | Evaluations | No | Reports | Partial |
| Expflow 2.3 | Yes | Yes | Explicit | Yes | Yes | Yes | Yes | Yes |

---

## 20. Adapter Profiles

Integration adapters translate native records into another system’s observation and action contract.

Expflow treats this as a separate package boundary.

The core does not assume:

- one external revision model;
- one cursor model;
- one reconciliation protocol;
- one write-authority partition;
- one capability vocabulary.

A profile may define those requirements without changing Expflow’s native four-command interface or immutable record model.

## 21. Distinctive Contributions

### Versioned path occupancy

Actual historical folder and filename placement remains inspectable.

### Workflow scope over project history

A workflow selects exact input and output tree regions.

### Extensible authority registration

Any conforming source can become accepted under a durable registration decision.

### Readable cross-actor authority profiles

Split and unified documents support transfer.

### Decision-governed semantics

Assertions do not become accepted merely by changing status.

### Source correspondence without duplicate imports

Brownfield mapping is preserved separately from material inventory.

### Managed projections

Automatic manifests do not observe themselves.

### Evaluated reproduction and reuse

Regeneration and structural reuse produce explicit records and decisions.

### Small operational interface

The user and agent surface remains four commands.

---

## 22. Engineering Gap

Existing systems commonly solve one or more of:

- file history;
- task execution;
- model tracing;
- conversation retention;
- document approval;
- workflow discovery;
- project packaging.

The remaining gap is a low-friction platform that connects exact versioned artifact trees to conversational and agentic workflow evidence while keeping assertions, decisions, and authority visible.

Expflow 2.3 targets that gap.

---

## 23. Conclusion

Expflow is positioned as an artifact-workflow ownership and observability platform.

Its architecture is concrete:

- immutable bytes;
- versioned relative trees;
- explicit workflow scopes;
- registered sources;
- attributed assertions;
- durable decisions;
- managed manifestations;
- evaluated regeneration and reuse.

That combination is not supplied by file versioning, workflow execution, or LLM tracing alone.
