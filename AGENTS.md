# AGENTS.md

## 1. Status

**Repository:** Expflow  
**Baseline:** Expflow `v1.0.1`  
**Active execution authority:** `docs/internal/BUILD_WEEK_WORKFLOW_CURRENT.md` <!-- config-docref -->  
**Current authorization:** Phase 1 only  
**Primary execution agent:** Kimi until superseded

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, and **SHOULD NOT** are definitive requirements.

This file is the root routing and invariant contract. It does not duplicate the Build Week phase plan. The active workflow owns gates, phases, phase entry and exit requirements, evidence rules, reports, and execution sequencing.

A nested `AGENTS.md` MAY impose stricter subtree rules. It MUST NOT weaken this file or the active workflow.

---

## 2. Required pass-start reading

Every implementation, review, recovery, validation, or packaging pass MUST:

1. read `docs/internal/orientation/README.md`; <!-- config-docref -->
2. read the repository build guidance resolved by the orientation contract;
3. read this file;
4. read immutable architecture and normative contracts relevant to the task;
5. read the active Build Week workflow;
6. read the active status and glossary through repository semantic roles;
7. read the machine-selected active phase prompt;
8. read the required repository-local skills;
9. inspect source, tests, and current Git state.

Agents MUST resolve operational dependencies through `.config-reference-reconciliation.yaml`.

Agents MUST NOT infer a required document from a bare filename or stale path.

---

## 3. Source-of-truth order

Use this order:

1. root and applicable nested repository governance;
2. immutable architecture, normative protocols, schemas, registries, and compatibility contracts;
3. `docs/internal/BUILD_WEEK_WORKFLOW_CURRENT.md`; <!-- config-docref -->
4. machine-readable active Build Week state and phase manifest;
5. role-resolved current status and glossary;
6. the active phase prompt;
7. repository source, tests, and deterministic validation;
8. accepted phase and gate reports backed by machine evidence;
9. review reports as findings to reproduce;
10. external overviews as explanatory, non-normative material;
11. conversation context as temporary working context.

A lower source MAY clarify a higher source. It MUST NOT override it.

Stop when controlling sources conflict materially.

---

## 4. Product boundaries

The Agentic Code project contains four distinct native systems:

- **Reqtrace:** behavioral control through bidirectional requirements traceability.
- **FIMP:** conditional mutation through immutable edit intent, preview, approval, and atomic publication.
- **Expflow:** local-first workflow version control and authority reconciliation.
- **Guerilla:** profile-driven causal events around native operations.

Native authority remains native.

- Git owns Git state.
- Expflow owns Expflow records and projections under Expflow contracts.
- Reqtrace owns its resolved traceability state.
- FIMP owns its transaction outcomes and receipts.
- Guerilla owns its event records and causal assertions, not profiled native state.

Do not collapse observation into authority, proposal into decision, output into completion, completion into verification, failure into unknown outcome, or correlation into causation.

---

## 5. Locked Expflow invariants

The active workflow and phase prompts MUST preserve:

- the ordinary command set: `init`, `sync`, `status`, `restore`;
- uninitialized `status` exit code `0`;
- operational mutation failures exit code `1`;
- unknown commands exit code `2`;
- append-only, byte-exact restore;
- explicit provisional identity where identity is not committed;
- v1 persisted-record and machine-output compatibility unless an explicit versioning decision authorizes change;
- the approved GUI name **Expflow GUI**;
- the GUI root `apps/gui/`;
- no raw undocumented `.expflow` storage access from GUI or integrations;
- Guerilla as an observer and causal event system, not an Expflow state owner.

The reported v1.0.0 post-restore collision is historical unless reproduced against the active baseline.

---

## 6. Skills and deterministic controls

Repository-local skills own domain workflows.

Use:

- `expflow-material-storage-sync`;
- `expflow-contracts-protocol`;
- `expflow-authority-semantics-workflows`;
- `expflow-projections-reproduction`;
- `expflow-testing-security-migration`;
- `config-reference-reconciliation`.

The global `config-reference-reconciliation-manager` MAY assist discovery and installation. It MUST defer to repository-local policy.

Skills are operator workflows. Repository-owned commands own verification.

The repository MUST keep separate checks for:

- marked references and reverse indexes;
- skill and semantic-role contracts;
- protected-surface immutability.

A passing reference check does not prove protected-body immutability.

---

## 7. Protected and retired surfaces

Protected bodies include repository-declared architecture and frozen release surfaces.

Protected inbound references MUST use the declared sidecar.

Agents MUST NOT edit protected bodies to reconcile references.

The following are retired as active dependencies:

- `Expflow-Test/`;
- `Expflow-Test-*`;
- nested or adjacent Build Week package directories;
- Build Week package archives;
- user-home skill paths;
- external harness paths.

Historical reports MAY mention retired locations. No active command, contract, prompt, skill, CI workflow, or activation rule may depend on them.

---

## 8. Build and Git discipline

Repository build guidance under `docs/internal/orientation/` is mandatory.

Agents MUST:

- record branch, `HEAD`, staged, unstaged, and untracked state;
- preserve unrelated work;
- use the Git index for staged validation;
- use explicit base/head revisions for commit-range validation;
- serialize commands that write shared outputs;
- classify timeouts before changing limits;
- add focused tests for changed behavior;
- run required repository checks and package verification;
- report actual exit codes.

Agents MUST NOT:

- use `--no-verify`;
- edit `.git/hooks`;
- install a hook manager without explicit authorization;
- weaken tests or contracts to pass;
- persist machine-absolute paths;
- make repository validation depend on global skills or ignored local state.

---

## 9. Phase authority

The active workflow determines:

- current gate and phase;
- permitted and prohibited scope;
- required artifacts;
- validation;
- gate transitions;
- completion-report structure;
- stop conditions.

Only the machine-selected phase is authorized.

Later-phase prompts and manifests MAY exist. Later-phase source implementation MUST NOT begin before authorization.

---

## 10. Evidence and claims

Use these status dimensions independently:

- implemented;
- internally verified;
- ordinary surface;
- pilot verified;
- empirically evaluated;
- production-supported.

Do not replace them with a single maturity percentage.

Every completion claim MUST name:

- the evaluated Git state;
- the command or procedure;
- the result;
- the produced evidence;
- remaining limitations.

Reports are evidence candidates, not authority. Reproduce findings before treating them as current implementation facts.

---

## 11. Stop conditions

Stop the affected work when:

- a required semantic role is missing or ambiguous;
- architecture and active workflow conflict;
- a protected body would require modification;
- a required checker fails;
- staged ownership is unknown;
- a change requires later-phase scope;
- compatibility would break without an explicit decision;
- a GUI or integration requires undocumented storage access;
- CI would claim enforcement from a no-op state;
- evidence does not support the intended completion claim;
- the deadline arrives before honest completion.

Record a deterministic continuation packet rather than hiding partial completion.

---

## 12. Session handoff

At session end, record:

- active gate and phase;
- baseline and current `HEAD`;
- files changed;
- staged, unstaged, and untracked state;
- checks run and results;
- evidence created;
- protected-surface result;
- unresolved blockers;
- exact next authorized action.

The repository MUST remain resumable without the original conversation.

---

## Config Reference Index

<!-- config-reference-index:start -->

- `.config-reference-reconciliation.yaml` - repository governance role

<!-- config-reference-index:end -->
