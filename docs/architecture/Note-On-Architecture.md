# NOTE ON ARCHITECTURE

## Why Automation Must Preserve Decisions, Not Only Files

**Version:** 2.3-draft  
**Status:** Rationale document

---

## 1. Position

The architectural objective is not to save every chat message or create a more elaborate file tracker.

The objective is to make agentic workflows easy to own.

Ownership requires:

- exact historical material state;
- explicit source authority;
- readable transfer documents;
- attributed semantic claims;
- durable acceptance decisions;
- visible uncertainty;
- concrete workflow boundaries;
- evaluated regeneration and reuse.

Automation makes those requirements affordable only when it preserves their distinctions.

---

## 2. Automation Is Necessary

Manual workflow reconstruction can succeed once.

It does not scale across:

- many workflows;
- repeated executions;
- old input versions;
- several models and tools;
- virtual outputs;
- frequent folder changes;
- cross-agent handoff;
- continuous evaluation.

The user experience should be:

```text
place or change project material
        ↓
run or trigger sync
        ↓
material history commits
        ↓
validation and assertions run
        ↓
manifests and status update
        ↓
review only material ambiguity
```

---

## 3. Automation Is Not Authority

An automated system can observe:

- bytes;
- paths;
- file changes;
- explicit moves;
- tree versions;
- command actor;
- model output.

It cannot convert every interpretation into fact merely because the interpretation was produced automatically.

A model may assert:

```text
This document is the semantic authority for architecture.
```

The system records:

- issuer;
- inputs;
- model;
- confidence;
- limitations.

Acceptance is a separate decision.

This makes automated semantics inspectable instead of invisible.

---

## 4. Why the Complete Tree Matters

Workflows consume compositions.

A source file is meaningful partly because it appears alongside other sources in a particular relative structure.

A workflow may use:

```text
authorities/**
references/workflow.md
evidence/**
```

from tree revision 12 while unrelated project files remain outside its input selector.

Versioning the full project tree preserves material history. Selecting a path scope preserves the workflow boundary.

Both are necessary.

---

## 5. Why Old Versions Matter

Old versions allow direct operational questions:

- Which policy revision was used?
- Which source change altered the model output?
- Did a successful workflow use a historical reference?
- Can the old input composition be rerun?
- Which version should become a structural reference?

Old material state is therefore an observability feature, not only backup.

---

## 6. Why Storage Identity Must Remain Opaque

A semantic type such as `spec`, `prompt`, `plan`, or `reference` is contextual.

The same document can serve different roles in different workflow occurrences.

Material identity should preserve continuity, not meaning.

Meaning belongs in:

- authority-source scope;
- assertions;
- decisions;
- workflow manifests.

This permits the same node revision to participate differently without being renamed or duplicated.

---

## 7. Identity Defaults and Overrides

Automation needs a default for same-path modifications.

The default continuity rule is useful, but it must be overridable.

```text
auto
preserve
new
replace
```

An explicit move can preserve identity.

A digest match cannot silently do so.

This preserves speed while preventing automation from becoming an unreviewed identity authority.

---

## 8. Why Command Boundaries Are Better Than Constant Watching

A low-level watcher sees events without enough intent.

An explicit sync boundary can include:

- affected paths;
- moves;
- identity directives;
- workflow hint;
- authority-source descriptors;
- invoking actor.

This groups changes into one meaningful operation receipt.

An optional integration may watch and invoke sync, but the watcher is not state authority.

---

## 9. Why Readable Authority Documents Remain Necessary

Internal records are not sufficient for transfer.

A workflow must be understandable by:

- users;
- agents;
- reviewers;
- archival tools;
- external automation.

The split and unified document profiles preserve readable, anchored authority histories without requiring everyone to inspect internal stores.

The unified profile is especially important for cross-actor transfer.

---

## 10. Why Decisions Must Be Immutable

Changing a cluster status from `proposed` to `accepted` loses context.

An immutable decision preserves:

- what was proposed;
- what evidence was considered;
- who or what accepted it;
- policy;
- rationale;
- consequences;
- supersession.

Current state can be rebuilt.

This is essential for ownership because acceptance history is part of the workflow.

---

## 11. Why Correspondence Is Separate From Inventory

The import-tree manifest says what material tree was used.

Source correspondence says which weak historical or chat record maps to which tree entry.

Combining them causes two problems:

- live workflows inherit unnecessary brownfield complexity;
- brownfield ambiguity is hidden inside a material inventory.

The correct simplification is one authoritative material tree plus optional semantic correspondence.

---

## 12. Why Projections Must Be Managed

Automatically generated manifests must not trigger new material revisions on every sync.

Managed projections therefore live outside the scanned user tree.

A projection becomes a user-tree artifact only through explicit materialization.

This separates:

- current generated view;
- accepted semantic document;
- user-owned material copy.

---

## 13. Why Model-Assisted Output Is Not Deterministic

A fixed prompt and model profile improve reproducibility of configuration.

They do not guarantee identical text.

The architecture therefore distinguishes:

- deterministic structural rendering;
- model-assisted proposed rendering.

The latter is pinned by content digest and requires acceptance under policy.

---

## 14. Why Completion Is Multi-Stage

A required file can exist while the workflow remains:

- semantically incomplete;
- unapproved;
- unverified;
- unsuitable for reuse.

The system separates:

- material outputs present;
- completion asserted;
- completion accepted;
- verification;
- reuse approval.

This improves evaluation and prevents path existence from becoming a false success signal.

---

## 15. Why Regeneration and Reuse Need Records

A claim that a workflow is reproducible is incomplete without:

- exact input tree;
- model and prompt configuration;
- attempt status;
- produced outputs;
- equivalence evaluation;
- acceptance decision.

A claim that a workflow is reusable is incomplete without:

- accepted reference manifest;
- new input tree;
- deviation analysis;
- semantic leakage evaluation;
- resulting occurrence.

These records turn broad goals into testable operations.

---

## 16. Security Is Part of Semantic Correctness

Imported documents may contain instructions aimed at models.

Archives may contain unsafe paths.

Chat exports may contain secrets or private data.

Generated code may be unsafe to execute.

A semantic hook must therefore:

- treat content as data;
- isolate control instructions;
- operate under a security profile;
- avoid code execution;
- restrict network and environment;
- redact or localize sensitive processing;
- respect source licensing.

Without these controls, automation can undermine the ownership it is meant to provide.

---

## 17. Minimal Command Surface, Rich Internal State

Four commands are enough because schemas and hooks carry the detail.

```text
init
sync
status
restore
```

A user or agent should not need separate commands for:

- registering every source;
- updating each manifest;
- recording every assertion;
- creating every workflow record.

Those operations are parameters and automatic consequences of sync.

The small interface is a usability decision, not a simplification of the ownership model.

---

## 18. Why Adapter Contracts Must Remain Separate

An external continuity or orchestration system may need:

- exact record inspection;
- an opaque composite revision;
- incremental cursors;
- lost-response reconciliation;
- strict idempotency normalization;
- capability and writer partitioning.

Those needs are real, but integration-specific.

Putting them into Expflow core would enlarge the ordinary interface and force external assumptions into native workflow storage.

The correct boundary is:

```text
Expflow core
→ four commands and immutable records

separate adapter
→ external inspection, revision, cursor, reconciliation, and authority policy
```

The adapter may use documented core exports. It must not become part of core semantics.

## 19. Live and Brownfield Continuity

Brownfield recovery and live observability use the same objects.

Brownfield mode may begin with:

- incomplete source correspondence;
- uncertain clusters;
- imported old versions;
- historical authority documents.

Live mode adds:

- explicit sync operations;
- current tree revisions;
- immediate assertions;
- automatic projections.

After acceptance, a recovered project continues under the same runtime rather than being exported into a different system.

---

## 20. Agent Handoff

A strong handoff contains:

- current project head;
- active workflow occurrence;
- exact input selector;
- current output selector;
- accepted authority sources;
- accepted manifest heads;
- open conflicts;
- failed automation;
- recommended next action.

This is more useful than a full transcript plus summary.

---

## 21. Evaluation Questions

1. Can normal use converge on one sync operation?
2. How often do identity overrides become necessary?
3. How often does automated semantic work require review?
4. Can exact tree differences explain workflow outcome differences?
5. Do unified authority documents improve transfer?
6. Are durable decisions sufficient to reconstruct accepted state?
7. Does managed projection storage eliminate self-observation?
8. Can agents resume work without reading full chat history?
9. Do regeneration evaluations distinguish useful equivalence levels?
10. Does structural reuse avoid semantic leakage?
11. Do security profiles prevent source-content instruction capture?
12. Can brownfield projects become live observed projects without migration to another model?

---

## 22. Conclusion

The architecture is intentionally concrete.

It versions bytes and relative paths. It registers sources. It records assertions. It preserves decisions. It selects workflow input and output scopes. It manages projections. It evaluates regeneration and reuse.

Automation operates across all of those layers, but it does not erase their boundaries.

That is the basis of practical workflow ownership.
