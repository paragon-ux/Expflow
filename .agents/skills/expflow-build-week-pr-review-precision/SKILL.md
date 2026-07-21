---
name: expflow-build-week-pr-review-precision
description: >-
  Use this skill for precision-first review of Expflow Build Week pull requests,
  branches, commits, release candidates, and phase completion changes across
  Phases 1 through 9. Admit only verified, actionable defects to the finding
  ledger; attempt to falsify every suspicion; separate unresolved questions
  from findings; preserve the familiar verdict, ledger, verification, and
  execution-handoff format; and hand confirmed remediation to the parent orchestrator.
---

# Expflow Build Week Precision PR Review

## Required Reading Roles

1. `repository_governance`
2. `active_workflow`
3. `active_status`
4. `glossary`
5. `reconciliation_policy`
6. `phase_reports`
7. `historical_workflow`
8. `concept_paper`
9. `implementation_spec`
10. `protocol_spec`
11. `project_snapshot`
12. `architecture_note`

## Outcome

Review an Expflow Build Week change with a low false-positive rate and produce a compact, evidence-backed result that the parent the parent orchestrator can execute.

The reviewer SHALL:

1. resolve the review target and assigned Build Week phase;
2. read repository authority and the controlling phase contract;
3. inspect the full affected behavior, not only changed lines;
4. generate suspicions privately;
5. try to falsify every suspicion;
6. admit only verified defects to the finding ledger;
7. keep uncertainty, questions, preferences, and future ideas out of the ledger;
8. derive verification from repository guidance;
9. provide a provider-neutral parent-parent-orchestrator remediation prompt;
10. make no repository edits.

The **verified-finding ledger** is the source of truth for remediation.

An empty ledger is a valid and desirable result when no actionable defect meets the evidence threshold.

---

## Activation boundaries

Use this skill for:

- Build Week Phase 1 through Phase 9 pull-request review;
- branch, commit-range, or release-candidate review;
- phase completion review;
- gate-closing review where code changes are part of the evidence;
- re-review after orchestrator resolves findings;
- compatibility, security, recovery, data-integrity, or user-visible regression review;
- review of tests and completion claims associated with a phase.

Do not use it for:

- implementing fixes;
- creating or switching branches;
- staging, committing, pushing, or opening a pull request;
- broad product ideation;
- purely explanatory code questions;
- style-only review unless formatting is an explicit repository contract;
- speculative architecture redesign;
- replacing repository phase or gate authority;
- treating an unverified concern as a defect.

The parent orchestrator is the execution agent. The reviewer remains read-only.

---

## Skill-in-the-loop invocation contract

This skill is not optional review guidance. It is the controlling reviewer procedure.

A reviewer subagent SHALL NOT begin substantive review until it has directly opened and read:

```text
.agents/skills/expflow-build-week-pr-review-precision/SKILL.md
```

The parent orchestrator SHALL invoke the reviewer with:

- the exact skill path;
- assigned phase and title;
- repository root;
- base revision;
- head revision;
- merge base when different;
- exact diff range;
- controlling phase prompt;
- phase completion report or candidate report;
- relevant gate when the phase closes a gate;
- known pre-existing failures;
- commands already run and their evaluated states.

The reviewer MUST independently inspect repository authority, the phase contract, the diff, affected implementation, tests, and evidence. An orchestrator summary is orientation only and MUST NOT substitute for direct inspection.

The reviewer MUST NOT rely on hidden prior conversation context to establish a finding or verdict.

### Required skill attestation

Every review and re-review output MUST begin with:

```markdown
## Skill attestation

- Skill: `expflow-build-week-pr-review-precision`
- Skill version: `1.1.0`
- Review mode: `precision-first`
- Assigned phase: `<phase number and title>`
- Review type: `phase` | `gate` | `re-review`
- Base: `<revision>`
- Head: `<revision>`
- Diff: `<base>...<head>` or exact equivalent
- Authority read: `<repository governance, workflow, phase prompt, relevant prior report>`
- Reviewer mode: `read-only`
```

The attestation is a procedural proof, not evidence that the review is correct.

### Invalid review response

The parent orchestrator MUST reject the review and request a fresh skill-compliant review when any of these are missing or wrong:

- exact skill name or version;
- assigned phase;
- base and head revisions;
- direct authority reading;
- read-only declaration;
- verified-finding ledger or explicit `No verified findings`;
- scope and contract audit;
- verification evidence;
- verdict;
- required falsification and admission threshold.

A generic â€œlooks good,â€ prose-only review, diff summary, or test summary is not a valid phase review.

The parent orchestrator MUST NOT reinterpret an invalid review as `PASS`.

---

## Reviewer context isolation

Use a compact review packet. Do not send the full implementation conversation.

The reviewer receives enough information to locate authority and the target, then reads the repository directly.

The packet SHOULD include:

- phase objective and exit criteria;
- changed-file summary;
- exact base and head;
- phase report;
- known limitations;
- validation table;
- prior finding IDs for re-review.

The packet SHOULD NOT include:

- the implementerâ€™s chain of thought;
- unsupported assurances;
- repeated full logs already preserved as artifacts;
- unrelated phase material;
- instructions to â€œfind somethingâ€;
- a required minimum finding count.

The reviewer must be free to return `No verified findings`.

---

## Authority order

Resolve authority in this order:

1. repository `AGENTS.md` and applicable nested governance;
2. immutable architecture, protocols, schemas, registries, compatibility contracts, and protected surfaces;
3. the active Build Week workflow;
4. the explicitly assigned phase prompt;
5. accepted prior-phase and gate reports relevant to continuity;
6. repository source and tests;
7. CI and repository-owned validation commands;
8. pull-request description and author claims;
9. conversation context.

A lower source may clarify a higher source. It must not override it.

The reviewer MUST NOT invent requirements from personal preference, generic best practice, or an unrelated framework when repository authority is explicit.

---

## Phase selection

Determine the review phase using:

1. the user's explicit phase assignment;
2. the pull-request title or description;
3. the changed phase report or prompt;
4. the active workflow and changed product surface.

Do not require a generated semantic phase-state graph.

If the review spans multiple phases:

- list each affected phase;
- apply each relevant phase lens;
- report scope leakage when later-phase implementation is used to conceal incomplete earlier-phase work.

If the phase remains genuinely ambiguous, state the review assumption. Do not manufacture a phase transition or block solely because no machine phase selector exists.

---

## Repository preflight

Before reviewing:

1. Read repository instructions, build guidance, active workflow, and the assigned phase prompt.
2. Record:
   - repository root;
   - current branch;
   - base revision;
   - head revision;
   - merge base;
   - staged, unstaged, and untracked state;
   - available remotes;
   - relevant runtime and package versions.
3. Determine whether the review target is:
   - working tree;
   - staged diff;
   - commit;
   - commit range;
   - branch comparison;
   - pull request;
   - release candidate.
4. Identify protected surfaces and compatibility obligations.
5. Identify repository-defined verification commands.
6. Note pre-existing failures separately from failures introduced by the reviewed change.
7. Do not alter the worktree.

Git fallbacks:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git merge-base <base> <head>
git diff --stat <base>...<head>
git diff --check <base>...<head>
```

Never use destructive commands.

---

## Precision-first review principle

The reviewer optimizes for **verified defect precision**, not candidate recall.

A suspicion is not a finding.

A line that looks risky is not a finding.

A missing test is not automatically a finding.

A generic best practice is not a finding.

A hypothetical input is not a finding unless the input is permitted or reachable.

A possible race is not a finding unless concurrent execution is possible under the actual contract.

A confusing implementation is not a finding unless it creates a material behavioral consequence.

The reviewer SHALL prefer:

- zero verified findings over weak findings;
- one fully proven defect over several plausible concerns;
- explicit uncertainty over false certainty;
- direct repository evidence over intuition;
- reproduction over speculation;
- contract-grounded impact over stylistic preference.

---

## Finding admission test

A suspected defect receives an `F` ID only when all applicable elements are established.

### Required elements

1. **Trigger**
   A concrete input, repository state, sequence, environment, or user action.

2. **Reachability**
   Evidence that the trigger can reach the reviewed behavior under supported use.

3. **Contract**
   A documented, tested, architectural, compatibility, security, or clearly implied behavioral obligation.

4. **Violation**
   A deterministic explanation of how the implementation violates that obligation.

5. **Impact**
   A material observable consequence involving correctness, security, data integrity, recovery, compatibility, user-visible behavior, phase exit, or required evidence.

6. **Guard analysis**
   Evidence that upstream validation, downstream recovery, idempotency, serialization, feature gating, type constraints, or existing tests do not already prevent the consequence.

7. **Evidence**
   At least one strong evidence mode from the evidence hierarchy.

8. **Actionability**
   A bounded correction direction that addresses the root cause.

If one required element is missing, the reviewer SHALL continue investigating, downgrade the item to a review question, or omit it.

Do not assign an `F` ID merely to preserve a suspicion for the parent orchestrator.

---

## Evidence hierarchy

Use the strongest available evidence.

### E1 â€” Executed reproduction

Preferred evidence:

- a focused failing test;
- a minimal command sequence;
- a deterministic fixture;
- a before-and-after comparison;
- a validation command whose failure is caused by the reviewed change.

Record:

- command;
- evaluated revision or worktree;
- exit code;
- relevant output;
- why the result proves the defect.

### E2 â€” Deterministic code path

Use when execution is impractical but the path is unambiguous.

Show:

- trigger;
- entry point;
- guards;
- state transition;
- failing or incorrect operation;
- observable consequence;
- file and line evidence.

### E3 â€” Contract contradiction

Use when the change directly contradicts a controlling contract.

Cite:

- the controlling requirement;
- the changed behavior;
- why no allowed interpretation reconciles them;
- the affected phase or compatibility claim.

### E4 â€” Established repository invariant

Use for invariants proven by stable tests, schema rules, protocol definitions, or immutable architecture.

Do not use assumed industry convention as an Expflow invariant.

### Insufficient evidence by itself

The following do not independently verify a finding:

- a line reference without an execution path;
- a tool warning with no behavioral consequence;
- an absent test;
- a code smell;
- a naming preference;
- a hypothetical attacker with no reachable boundary;
- a theoretical performance concern with no representative scale;
- an imagined future feature;
- a reviewer statement that something â€œcouldâ€ fail.

---

## Mandatory falsification pass

Before admitting a finding, attempt to disprove it.

For every suspicion, inspect the applicable items:

- callers and call sites;
- input validation;
- type constraints;
- schema validation;
- feature flags;
- platform branches;
- existing tests;
- compatibility adapters;
- transaction boundaries;
- retries and recovery;
- locking and serialization;
- idempotency;
- error mapping;
- documentation and accepted decisions;
- prior implementation history when available;
- package and runtime constraints;
- whether the allegedly affected surface is public, internal, or unreachable.

Answer privately:

1. What evidence would invalidate this suspicion?
2. Did I inspect that evidence?
3. Is the triggering state supported and reachable?
4. Is the contract explicit or merely preferred?
5. Does an existing guard prevent the consequence?
6. Does recovery convert the result into an intentional outcome?
7. Am I double-counting another finding?
8. Am I confusing missing proof with proof of failure?
9. Am I treating later-phase scope as a current defect?
10. Would I still report this if an empty ledger were acceptable?

A finding that survives this pass may enter the ledger.

---

## False-positive suppression rules

### Validation and types

Do not report a null, type, range, or shape defect without tracing actual runtime validation and supported call paths.

Do not assume compile-time types validate untrusted runtime input.

Do not assume runtime input is untrusted when the controlling boundary explicitly guarantees a validated internal object.

### Concurrency

Do not report a race without proving:

- concurrent execution is possible;
- shared mutable state exists;
- relevant serialization or locking is absent or insufficient;
- the consequence is observable.

### Security

Do not report injection, traversal, disclosure, or privilege defects without identifying:

- the trust boundary;
- attacker-controlled input;
- reachable sink;
- missing or bypassed defense;
- impact.

Security hardening ideas that do not meet this threshold are not findings.

### Error handling

Do not report swallowed errors when the contract intentionally maps them to a typed result, receipt, recovery state, or expected exit code.

Do report incorrect mappings when the contract and observable behavior conflict.

### Performance

Do not report performance findings without:

- representative data size or call frequency;
- a material complexity or resource consequence;
- evidence that the phase or product contract requires better behavior.

### Tests

A missing test is a finding only when:

- the phase exit criteria explicitly require it; or
- a changed material behavior lacks required regression coverage and this omission permits a plausible regression that cannot be excluded by existing tests.

Phrase the defect as the unmet verification contract, not as â€œadd more tests.â€

### Documentation

Report documentation only when it:

- gives a user materially unsafe or incorrect instructions;
- contradicts the implementation or public contract;
- creates a false completion or compatibility claim;
- is explicitly required for phase exit.

### Scope

A later-phase idea is not a defect in an earlier phase.

Unauthorized later-phase implementation is a defect when it increases scope, creates unsupported claims, violates boundaries, or hides incomplete assigned work.

### Style and maintainability

Do not report style preferences.

Report maintainability only when a concrete behavioral, verification, migration, or operational consequence is demonstrated.

---

## Complete-surface inspection

Review changed lines and the behavior they participate in.

Inspect adjacent and dependent surfaces when the change affects:

- public CLI behavior;
- machine-readable output;
- persisted records;
- storage and recovery;
- transactions and receipts;
- identity;
- concurrency;
- security;
- package exports;
- application read models;
- GUI operations;
- import/export;
- evidence provenance;
- authority reconciliation;
- causal events;
- compatibility;
- phase completion claims.

Do not expand into unrelated repository review.

---

## Build Week gate map

| Gate | Phases | Review emphasis                                                                                     |
| ---- | -----: | --------------------------------------------------------------------------------------------------- |
| BW-A |  1â€“2 | Ordinary CLI safety, compatibility, and GUI use of documented application surfaces                  |
| BW-B |  3â€“5 | Stable read models, evidence provenance and authority, portable package integrity                   |
| BW-C |  6â€“7 | Evidence-backed gap closure and authentic empirical evaluation                                      |
| BW-D |  8â€“9 | Profile-driven observation, native authority, causal-event contracts, and accurate GUI presentation |

When a phase closes a gate, review both the phase contract and aggregate gate criteria.

---

## Build Week review lifecycle

The skill applies to:

1. the Phase 1 completion candidate before Phase 2 starts;
2. every Phase 2 through Phase 9 completion candidate;
3. remediation re-review for the same phase;
4. aggregate gate review after Phases 2, 5, 7, and 9;
5. post-merge repair review when integration validation fails.

A phase remains open until a skill-compliant review returns `PASS` with no unresolved verified findings.

`CAUTION` and `BLOCK` keep the phase open.

The reviewer does not authorize branch merges. The parent orchestrator merges only after the required skill-compliant phase and gate verdicts pass.

---

# Phase review lenses

## Phase 1 â€” Ordinary UX/UI Corrections

Verify:

- the ordinary command set remains `init`, `sync`, `status`, and `restore`;
- uninitialized `status` exits `0`;
- operational failures and unknown commands retain required exit semantics;
- human status is actionable;
- sync preview is path-level, deterministic, and non-mutating;
- tree and node restore references are discoverable through approved surfaces;
- restore preview and execution share planning semantics;
- conflicting drift is refused by default;
- explicit override is bounded and tested;
- restore remains byte-exact, append-only, and forward-committing;
- provisional identity is explicit;
- machine output remains additive and compatible;
- GUI or later-phase functionality did not enter scope.

High-risk false positive to avoid:

- treating the historical v1.0.0 collision as current without reproduction on the active baseline.

## Phase 2 â€” Expflow GUI Foundation

Verify:

- implementation is rooted under the approved GUI surface;
- GUI reads documented application APIs or read models;
- GUI does not treat raw `.expflow` storage as an application contract;
- native authority remains explicit;
- initialization, drift, revision, sync, restore, receipt, recovery, loading, empty, and error states are represented;
- preview and execution do not diverge;
- technical details preserve canonical terms;
- accessibility and keyboard behavior meet declared requirements;
- GUI-only state does not become canonical product state;
- CLI and machine compatibility remain intact.

High-risk false positive to avoid:

- reporting a missing GUI feature that belongs to a later phase rather than the Phase 2 foundation.

## Phase 3 â€” Stable Read Models

Verify:

- read models are documented, versioned, deterministic, and stable;
- ordering, filtering, pagination, and identifiers are reproducible;
- proposed, accepted, rejected, superseded, conflicted, stale, partial, and unknown states remain distinct where applicable;
- application consumers do not depend on raw stores;
- model projection does not mutate native authority;
- representative performance requirements are met;
- fixtures and examples reflect real record semantics;
- compatibility and version behavior are explicit.

High-risk false positive to avoid:

- treating a deliberately lossy presentation model as defective when its contract explicitly excludes canonical use.

## Phase 4 â€” Evidence Intake and Authority Reconciliation

Verify:

- original evidence and provenance are preserved;
- normalization does not erase source identity;
- capture method and attribution are explicit;
- uncertainty and confidence are represented;
- authority registration and scope decisions are not inferred as facts;
- correspondence proposals remain proposals until accepted;
- duplicate, conflict, unresolved, and low-confidence states remain distinct;
- accept, reject, split, merge, and defer operations preserve auditability;
- untrusted content and secrets are handled safely;
- evidence intake does not silently create native authority.

High-risk false positive to avoid:

- reporting uncertainty as a defect when the contract intentionally preserves an unresolved state.

## Phase 5 â€” Portable Workflow Package

Verify:

- the manifest is versioned and deterministic;
- semantic and repository-relative addressing is relocatable;
- included and external evidence are distinguished;
- unresolved dependencies and readiness are explicit;
- export and import preserve required identity and provenance;
- collision behavior is explicit and tested;
- archives reject traversal, unsafe links, and resource abuse;
- integrity checks are deterministic;
- import is atomic or recoverable;
- clean-environment relocation and round-trip tests are meaningful;
- runtime does not require a model unless explicitly authorized.

High-risk false positive to avoid:

- treating intentionally external dependencies as missing package content when the manifest accurately declares them.

## Phase 6 â€” Engineering and Functional Gap Closure

Verify:

- every change cites a reproduced defect, failed exit criterion, pilot blocker, compatibility failure, or performance failure;
- speculative features did not enter scope;
- fixes address root causes;
- regression tests fail for the prior behavior when feasible;
- baseline and repaired behavior are distinguishable;
- compatibility remains explicit;
- phase evidence does not overstate broader maturity.

High-risk false positive to avoid:

- reporting omitted enhancements that lack a Phase 1â€“5 failure or pilot-blocking basis.

## Phase 7 â€” Pilot and Empirical Evaluation

Verify:

- the pilot involves real human or agent work;
- timestamps, duration, participants, environment, and workflow are attributable;
- successes, friction, failures, recoveries, decisions, and unknowns are recorded;
- metrics derive from preserved evidence;
- fixtures are not presented as external pilot proof;
- evaluation does not suppress negative outcomes;
- claim changes follow observed results;
- privacy, consent, and sensitive evidence handling meet declared boundaries;
- reproducibility and limitations are explicit.

High-risk false positive to avoid:

- treating an unfavorable pilot result as an implementation defect rather than valid empirical evidence.

## Phase 8 â€” Guerilla Profile and Event Contracts

Verify:

- the integration is profile-driven and data-only where required;
- Expflow remains authoritative for Expflow state;
- command classification is complete and version-bounded;
- before and after observations are correctly scoped;
- native identifiers and evidence references are preserved;
- typed outcome reconciliation distinguishes pending, unknown, failed, conflicted, and completed states;
- causal claims require appropriate evidence;
- repeated observation is idempotent or explicitly deduplicated;
- security and secret boundaries are enforced;
- conformance tests cover supported native versions.

High-risk false positive to avoid:

- treating Guerillaâ€™s lack of state-repair authority as missing functionality.

## Phase 9 â€” Guerilla Causal Event View GUI

Verify:

- the GUI presents events and causal links without replacing native authority;
- invocation, observation, result, reconciliation, and evidence remain distinguishable;
- pending, unknown, conflicted, failed, and completed states are not collapsed;
- causal edges are evidence-backed;
- native authority links resolve correctly;
- unsupported causal certainty is not invented;
- the GUI consumes stable Phase 8 contracts;
- raw-store coupling is absent;
- filtering, ordering, selection, empty, loading, and error behavior are deterministic and accessible;
- presentation does not convert correlation into causation.

High-risk false positive to avoid:

- reporting an intentionally unknown causal relationship as incomplete implementation.

---

## Review procedure

### Step 1 â€” Establish scope

Record:

- assigned phase or phases;
- base and head revisions;
- changed files;
- affected public and internal contracts;
- relevant prior phase evidence;
- claimed completion status.

### Step 2 â€” Inspect the diff

Review:

- all changed lines;
- surrounding implementation;
- direct callers and consumers;
- affected tests;
- schemas and contracts;
- error and recovery paths;
- compatibility surfaces;
- documentation and completion claims.

### Step 3 â€” Generate suspicions privately

Do not publish raw suspicions.

Group potential issues by:

- correctness;
- security;
- data integrity;
- compatibility;
- recovery;
- authority;
- user-visible behavior;
- phase scope;
- evidence quality.

### Step 4 â€” Falsify

Apply the mandatory falsification pass to every suspicion.

### Step 5 â€” Reproduce or prove

Use the strongest available evidence mode.

### Step 6 â€” Deduplicate

Merge findings with the same root cause.

Do not split one defect into separate IDs for each symptom unless each requires an independent correction.

### Step 7 â€” Assign priority

Use priority for remediation order, not for finding validity.

### Step 8 â€” Verify claims and checks

Re-run or independently inspect relevant validation.

Do not trust a PR statement that tests pass without confirming the evaluated state when tools permit.

### Step 9 â€” Produce the verified ledger

Only admitted findings receive IDs.

### Step 10 â€” Produce Parent-orchestrator handoff

Reference finding IDs. Do not repeat speculative concerns.

---

## Reviewer priorities

| Priority | Meaning                                                                                                |
| -------- | ------------------------------------------------------------------------------------------------------ |
| P0       | Verified release-blocking security, data-loss, irreversible corruption, or systemic correctness defect |
| P1       | Verified merge-blocking correctness, compatibility, recovery, authority, or required-phase-exit defect |
| P2       | Verified material defect or edge case that should be fixed before phase acceptance                     |
| P3       | Verified non-blocking defect with a concrete behavioral or verification consequence                    |

Do not use P3 for style, preference, or unsupported maintainability concerns.

---

## Verdict rules

### PASS

Use when:

- no verified findings exist;
- required verification passed or was independently established;
- completion claims are supported;
- scope and protected boundaries are respected.

Review questions may exist only when they do not materially affect merge or phase confidence.

### CAUTION

Use when:

- only P2 or P3 verified findings exist; or
- required verification could not be completed and the limitation materially reduces confidence; or
- completion evidence is incomplete without proving a P0 or P1 defect.

State precisely what remains uncertain.

### BLOCK

Use when:

- any P0 or P1 verified finding exists;
- a required phase exit criterion is demonstrably unmet;
- protected or compatibility boundaries are violated;
- the change creates an unsupported completion claim;
- the review target cannot be evaluated safely enough to support merge.

Do not use BLOCK merely because the reviewer has questions.

---

## Verified-finding ledger

Use stable IDs `F1`, `F2`, `F3`, and so on.

Each verified defect appears exactly once.

```markdown
## Verified-finding ledger

| ID  | Reviewer priority | Verified defect           | Evidence                                     | Suggested direction            |
| --- | ----------------- | ------------------------- | -------------------------------------------- | ------------------------------ |
| F1  | P1                | <concise verified defect> | <trigger, consequence, file:line or command> | <bounded root-cause direction> |
| F2  | P3                | <concise verified defect> | <trigger, consequence, file:line or command> | <bounded root-cause direction> |
```

Ledger rules:

- Findings must pass the admission and falsification tests.
- Include trigger and consequence in compact form.
- Evidence must identify the evaluated revision or worktree when commands were run.
- Do not duplicate findings in surrounding prose.
- Merge true duplicates.
- Do not include questions, preferences, or future work.
- Do not create a â€œpossible findingsâ€ section.
- An empty ledger SHALL state `No verified findings`.

---

## Review questions

Use this section only for material uncertainty that could not be resolved from available repository evidence.

A review question:

- is not a defect;
- receives a `Q` ID, not an `F` ID;
- does not enter the parent the parent orchestratorâ€™s required remediation ledger;
- does not block by itself;
- states what evidence would resolve it.

```markdown
## Review questions

| ID  | Question            | Why unresolved                     | Resolving evidence      |
| --- | ------------------- | ---------------------------------- | ----------------------- |
| Q1  | <specific question> | <missing or inaccessible evidence> | <exact evidence needed> |
```

Omit the section when there are no material questions.

Do not use review questions to smuggle weak findings into the report.

---

## Verification

Derive commands from:

1. repository governance and build guidance;
2. CI workflows;
3. package scripts and task runners;
4. phase prompt requirements;
5. language-standard commands.

Run narrow checks first, then broader required checks.

Record:

- command;
- evaluated state;
- exit code;
- result;
- relevance.

Distinguish:

- passed;
- failed because of the reviewed change;
- verified pre-existing failure;
- not run;
- unavailable.

Do not claim a pass that was not observed.

---

## parent-orchestrator remediation contract

The parent orchestrator independently validates and resolves every `F` ID.

The parent orchestrator MUST classify each finding as exactly one of:

- `fixed`;
- `not-reproducible`;
- `duplicate`;
- `intentional-behavior`;
- `out-of-scope`.

Because the ledger is precision-filtered, every non-fixed classification requires stronger repository evidence than the original finding.

A confirmed merge-blocking defect cannot be dismissed as out-of-scope merely because it crosses a convenient implementation boundary. It must be fixed, split into an explicitly tracked blocking change, or keep the verdict blocked.

The parent orchestrator MUST:

- read repository instructions before editing;
- preserve unrelated work;
- work on a non-protected branch;
- reproduce each finding;
- make the smallest coherent root-cause fix;
- add focused regression tests where feasible;
- run repository-defined validation;
- report actual commands and results;
- prepare a PR-ready finding status section;
- request independent re-review after remediation.

The reviewer MUST NOT implement the fixes.

---

## Parent-orchestrator handoff prompt

End every review containing verified findings with this provider-neutral prompt.

```text
Work in this repository as the parent orchestration and execution agent.

Goal:
Independently reproduce, triage, and resolve every verified finding from the precision review ledger.

Assigned phase:
<phase number and title>

Branch:
Create or use a non-protected remediation branch. Preserve unrelated work.

Rules:
- Read repository AGENTS.md, the active Build Week workflow, the assigned phase prompt, relevant architecture, and local skills before editing.
- Triage every verified finding ID: <F1, F2, ...>.
- Reproduce each finding before changing code.
- Classify each ID as fixed, not-reproducible, duplicate, intentional-behavior, or out-of-scope.
- Provide stronger code-, test-, contract-, or execution-based evidence for every non-fixed classification.
- Fix every confirmed in-scope defect, regardless of provisional priority.
- Do not dismiss a merge-blocking defect merely because it crosses a convenient file or workstream boundary.
- Preserve behavior not implicated by a finding.
- Add or update focused regression tests for each fixed behavior when feasible.
- Do not overwrite unrelated user changes.
- Run repository-defined focused and full verification.
- Do not advance into a later Build Week phase to hide incomplete assigned-phase work.
- Prepare a PR-ready report and request independent re-review.

Verified findings:
- F1 - <verified defect; evidence; suggested direction>
- F2 - <verified defect; evidence; suggested direction>

Completion report:
- final classification and evidence for every finding ID;
- files changed and behavioral impact;
- focused and full verification commands with results;
- remaining limitations;
- pull-request title and body or exact creation steps;
- re-review request.
```

If there are no verified findings, omit the remediation prompt unless the user explicitly asks orchestrator to perform unrelated work.

---

## Pull-request status contract

Every verified `F` ID must appear in the parent the parent the parent orchestratorâ€™s PR body or PR-ready report.

```markdown
## Summary

- <change>
- <change>

## Verified finding status

- F1: fixed / not-reproducible / duplicate / intentional-behavior / out-of-scope â€” <evidence>
- F2: fixed / not-reproducible / duplicate / intentional-behavior / out-of-scope â€” <evidence>

## Verification

- `<command>` â€” <exit code and result>
- `<command>` â€” <exit code and result>

## Re-review

- Precision reviewer requested: yes
- Review target: `<base>...<head>`
```

Review questions do not belong in the remediation status unless the parent the parent the parent orchestratorâ€™s work produced the missing evidence.

---

## Re-review procedure

On re-review:

1. Use the original finding IDs.
2. Compare the remediation head against the reviewed base and original finding evidence.
3. Verify each fix independently.
4. Check for regressions created by the fix.
5. Mark each original finding:
   - resolved;
   - unresolved;
   - disputed with sufficient evidence;
   - superseded by a more precise finding.
6. Assign new IDs only to genuinely new root causes introduced or exposed by remediation.
7. Do not reopen a resolved finding based on a stylistic preference.
8. Update verdict using the same PASS, CAUTION, and BLOCK rules.

---

## Review output template

````markdown
# Expflow Build Week Precision Review

## Skill attestation

- Skill: `expflow-build-week-pr-review-precision`
- Skill version: `1.1.0`
- Review mode: `precision-first`
- Assigned phase: <phase number and title>
- Review type: phase | gate | re-review
- Base: `<revision>`
- Head: `<revision>`
- Diff: `<base>...<head>`
- Authority read: <directly inspected controlling sources>
- Reviewer mode: `read-only`

## Verdict

PASS | CAUTION | BLOCK

## Review target

- Phase: <phase number and title>
- Base: `<revision>`
- Head: `<revision>`
- Merge base: `<revision>`
- Scope: <one sentence>

## Release or phase risk

<No more than four sentences. State only the highest material verified risk or confidence limitation.>

## Verified-finding ledger

| ID  | Reviewer priority | Verified defect | Evidence                        | Suggested direction |
| --- | ----------------- | --------------- | ------------------------------- | ------------------- |
| F1  | P1                | <defect>        | <trigger, impact, and evidence> | <direction>         |

Or:

No verified findings.

## Review questions

| ID  | Question   | Why unresolved | Resolving evidence |
| --- | ---------- | -------------- | ------------------ |
| Q1  | <question> | <reason>       | <evidence needed>  |

Omit when empty.

## Scope and contract audit

- Phase scope: pass / fail â€” <evidence>
- Compatibility: pass / fail / not applicable â€” <evidence>
- Protected surfaces: pass / fail / not evaluated â€” <evidence>
- Completion claims: supported / unsupported / partial â€” <evidence>

## Verification

| Command or procedure | Evaluated state          | Exit | Result |
| -------------------- | ------------------------ | ---: | ------ |
| `<command>`          | `<revision or worktree>` |    0 | passed |

## Parent-orchestrator handoff

- Execution agent: parent orchestrator
- Findings requiring remediation: F1, ...
- Review questions requiring remediation: none

```text
<provider-neutral parent-orchestrator remediation prompt; omit when no verified findings>
```
````

---

## Compact output option

When the user requests a concise review, preserve all required sections but shorten evidence.

Minimum acceptable concise output:

```markdown
# Expflow Build Week Precision Review

## Skill attestation

- Skill: `expflow-build-week-pr-review-precision`
- Skill version: `1.1.0`
- Review mode: `precision-first`
- Assigned phase: <phase number and title>
- Review type: phase | gate | re-review
- Base: `<revision>`
- Head: `<revision>`
- Diff: `<base>...<head>`
- Authority read: <directly inspected controlling sources>
- Reviewer mode: `read-only`

## Verdict

PASS | CAUTION | BLOCK

## Release or phase risk

<one short paragraph>

## Verified-finding ledger

<compact table or "No verified findings">

## Verification

<commands and actual results>

## Parent-orchestrator handoff

<finding IDs and compact remediation prompt, only when findings exist>
```

Precision requirements do not relax under a concise format.

---

## Gotchas

- A PR description is a claim, not evidence.
- A passing broad suite does not disprove a narrowly reachable defect.
- A failing test is not evidence until its relevance and evaluated state are established.
- A missing test is not automatically a product defect.
- A type annotation is not runtime validation.
- A caught exception is not swallowed if it is intentionally mapped to a typed outcome.
- A pending, unknown, partial, conflicted, or unresolved state may be correct behavior.
- Correlation is not causation.
- Observation is not authority.
- A GUI presentation model is not necessarily canonical state.
- An external dependency declared by a portable manifest is not necessarily missing content.
- A negative pilot result is not necessarily an implementation defect.
- A dirty worktree is not permission to alter or revert user changes.
- A low-priority verified defect is still real.
- An empty ledger is not a failed review.
- Reviewer confidence does not substitute for evidence.
- the parent orchestrator, not the reviewer, owns implementation.

---

## Final check

Before completing the review, confirm:

- repository authority and assigned phase contract were read;
- base, head, and review scope are explicit;
- the full affected behavior was inspected;
- every reported finding passed the admission test;
- every reported finding survived a falsification pass;
- trigger, reachability, contract, impact, guard analysis, evidence, and actionability are present;
- no question, style preference, or future idea entered the finding ledger;
- duplicates were merged;
- priorities reflect verified impact;
- verification results identify the evaluated state and actual result;
- pre-existing failures are distinguished;
- completion claims were audited;
- an empty ledger was allowed;
- the parent orchestrator is named as execution agent;
- the reviewer made no repository edits;
- the skill attestation names version `1.1.0`, exact phase, base, head, and direct authority reading;
- the output follows the required template;
- the parent-orchestrator handoff references only verified finding IDs.
