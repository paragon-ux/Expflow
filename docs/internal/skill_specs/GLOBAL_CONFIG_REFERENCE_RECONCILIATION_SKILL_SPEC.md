# Global Config Reference Reconciliation Manager Skill Specification

## Status

- State: implemented and stabilized global orchestration skill.
- Skill name: `config-reference-reconciliation-manager`.
- Installation location: resolved by the active agent platform's global skill-discovery mechanism.
- Scope: cross-project, repository-agnostic, and hook-manager-neutral.
- Repository authority: repository-local governance, contract, skills, checkers, tests, hooks, and CI.
- Path model: semantic-role discovery with no persisted project-specific or machine-absolute paths.
- Validation boundary: global-skill validation is separate from repository validation.
- Normative language: **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, and **SHOULD NOT** are definitive requirements.

## Purpose

The global manager discovers and operates repository-owned config-reference and skill-contract controls.

It MUST NOT prove repository correctness itself. It SHALL:

- locate the repository root;
- discover repository governance;
- discover the repository contract;
- discover and defer to a repository-local reconciliation skill;
- resolve semantic roles through repository policy;
- invoke repository-owned deterministic commands;
- diagnose failures without bypassing enforcement;
- bootstrap or integrate controls only with explicit authorization;
- validate its own installation separately from repository checks.

## Stabilized Discovery Model

The global manager SHALL use this sequence:

```text
Git repository root
        ↓
repository governance
        ↓
repository-declared contract
        ↓
repository-local reconciliation skill
        ↓
repository-owned checkers and infrastructure
```

Repository-local policy SHALL override global defaults.

The global manager MUST NOT embed:

- Expflow-specific document paths;
- a current checkout path;
- a user-home path;
- an external harness path;
- a validator installation path;
- a repository-specific role vocabulary as a universal default.

## Discovery Priority

1. Git repository root.
2. Root and applicable nested repository governance.
3. Repository-declared contract location.
4. Conventional root contract filename when governance does not override it.
5. Repository-local reconciliation skill.
6. Repository-local reconciliation documentation.
7. Repository-owned checker commands.
8. Existing hook-manager configuration.
9. Existing CI validation.
10. Explicit user authorization for bootstrap or integration.

If no repository policy exists, the global manager MUST stop before inventing roles, marker grammar, protected paths, source surfaces, or hook infrastructure unless the user explicitly requests bootstrap.

## Repository Contract

The repository contract is a bounded orientation and enforcement declaration.

It MAY declare:

- checker commands;
- semantic roles;
- role classes;
- governed source surfaces;
- marker token;
- protected target patterns;
- protected sidecar;
- repository skill surfaces;
- workflow surfaces;
- hook-manager metadata;
- CI validation metadata.

It MUST NOT become:

- a registry for every document;
- a generated scanner database;
- a cache;
- a broad codemod plan;
- a universal logical-ID system;
- a store for machine-absolute paths.

## Semantic Role Operation

The global manager SHALL consume repository-declared role names and MUST NOT replace them with global names.

For each required role, it SHALL verify that repository tooling can establish:

- unique declaration;
- one repository-relative target;
- valid class;
- target existence in the evaluated Git state;
- safe repository containment.

A missing or ambiguous required role is a hard stop. Search-based path guessing MUST NOT satisfy the role.

## Local Skill Precedence

When a repository-local reconciliation skill exists, the global manager MUST:

1. read it;
2. follow its workflow;
3. use repository-declared commands;
4. preserve local authorization boundaries;
5. avoid duplicating local domain logic.

The global manager MUST NOT rewrite a repository-local skill into a global template.

## Responsibility Split

The repository owns:

- role vocabulary and mappings;
- marker grammar;
- source surfaces;
- target-index format;
- protected policy;
- sidecar;
- checker implementation;
- tests;
- hook configuration;
- CI enforcement;
- repository build guidance.

The global manager owns:

- discovery;
- routing;
- authorization checks;
- operator workflow;
- optional bootstrap;
- optional hook integration;
- separate validation of the installed global skill;
- reporting exact repository and global results.

## Repository Validation Boundary

Repository-owned commands MUST evaluate repository state only.

They MUST NOT fail because:

- the global skill is absent;
- a global skill is installed under another user home;
- an optional external harness is unavailable;
- a platform validator is installed at another path.

Global-skill health SHALL be reported under a separate `global_skill_validation` result.

## Validator Discovery

The global manager MUST discover skill-validation capability through the active agent platform or installed skill-creation capability.

It MUST NOT persist the discovered validator path into repository policy.

When the external validator is unavailable:

- repository-owned frontmatter and contract validation SHALL remain authoritative for repository files;
- the fallback SHALL be reported;
- repository checks SHALL continue independently.

## External Harness Discovery

External harnesses are optional.

When requested, use this order:

1. location supplied in the current task;
2. optional local configuration or environment declaration;
3. approved adjacent workspace discovery;
4. report unavailable.

An external harness MUST NOT be installed or persisted as a repository dependency merely to satisfy the global manager.

## Operating Modes

### Use Existing Enforcement

Use when repository contracts and checkers already exist.

The manager SHALL:

- read local policy;
- route to the local skill;
- invoke repository commands;
- verify existing hook or CI adapters invoke the same commands;
- report exact results.

### Reconcile Reference

Use when a governed source reference changes.

The manager SHALL:

- identify affected old and new targets through repository tooling;
- update the source and required mutable index or protected sidecar;
- preserve staged ownership;
- run repository checks;
- stop on failure.

### Reconcile Role Mapping

Use when a semantic role target changes.

The manager SHALL:

- update the repository contract;
- treat old and new targets as a governed retarget when policy requires;
- update reverse-index evidence;
- run role and reference checks in staged and relevant commit-range modes.

### Diagnose Failure

The manager SHALL:

- preserve exact failure output;
- classify repository, global-skill, optional-harness, hook, CI, or test-runner failure;
- repair only the authorized issue;
- rerun the same governing command;
- avoid bypasses.

### Bootstrap Repository Controls

Use only with explicit authorization.

The manager SHALL:

- establish a minimal role contract;
- add repository-owned deterministic checks;
- add focused tests;
- preserve repository tooling conventions;
- leave hook integration separate unless also authorized.

### Integrate Hook Manager

Use only with explicit authorization.

The manager SHALL:

- adopt the repository's existing versioned manager;
- add a thin adapter around repository-owned commands;
- preserve existing hook behavior;
- avoid direct `.git/hooks` edits;
- avoid adding Node tooling solely for hooks in a non-Node repository.

### Full Installation

Use only when the user explicitly authorizes contract, checkers, tests, and hook integration.

## Hook Strategy

The global manager is hook-manager-neutral.

It SHALL prefer an existing versioned repository hook manager. A new manager requires explicit authorization.

Husky is an optional Node adapter only when:

- the repository is Node-based;
- no existing manager conflicts;
- the user explicitly authorizes Husky.

Hook files MUST remain thin and MUST NOT contain a second implementation of repository invariants.

## CI Strategy

CI SHALL invoke repository-owned deterministic commands in a valid read-only or commit-range mode.

CI MUST NOT:

- run an LLM;
- inspect user-home skill files;
- rely on staged changes in a clean checkout;
- duplicate checker logic in workflow YAML;
- claim enforcement from a semantic no-op.

## Authorization Matrix

| Mode                          | Create contract/checker                     | Install hook manager      |
| ----------------------------- | ------------------------------------------- | ------------------------- |
| Use existing enforcement      | No                                          | No                        |
| Reconcile reference or role   | No                                          | No                        |
| Diagnose failure              | Only explicit repair authorization          | No                        |
| Bootstrap repository controls | Yes, explicitly requested                   | No                        |
| Integrate hook manager        | No new checker unless separately authorized | Yes, explicitly requested |
| Full installation             | Yes                                         | Yes                       |

## Prohibitions

The global manager MUST NOT:

- edit `.git/hooks`;
- use `--no-verify`;
- bypass, weaken, unmark, or remove governed controls to pass;
- replace an existing hook manager without authorization;
- overwrite package-manager scripts blindly;
- hardcode project-specific paths;
- persist machine-absolute paths;
- make repository checks depend on the global installation;
- claim marked-reference correctness from an unmarked broad search;
- infer missing required roles;
- install broad infrastructure during an ordinary reference edit;
- modify protected or frozen bodies.

## Portability Tests

The global manager SHALL be forward-tested against:

- a repository with a local reconciliation skill;
- a repository with a role contract but no global installation dependency;
- a repository relocated to another checkout root;
- a global skill relocated to another skill root;
- a governed document move resolved by one role-mapping update;
- a missing role;
- an ambiguous role;
- a Node repository with an existing hook manager;
- a non-Node repository;
- a repository with no hook manager;
- an unavailable optional external harness;
- staged and commit-range equivalent fixtures.

## Acceptance Criteria

The global manager conforms only when:

- it is discovered without a persisted installation path;
- it defers to repository-local policy;
- it consumes repository-declared semantic roles;
- it does not hardcode project paths;
- it stops on missing or ambiguous roles;
- it invokes repository-owned deterministic commands;
- it keeps repository and global-skill validation separate;
- repository relocation and global-skill relocation pass;
- optional harness failure does not invalidate repository checks;
- hook and CI integration remain thin;
- every infrastructure change is explicitly authorized.
