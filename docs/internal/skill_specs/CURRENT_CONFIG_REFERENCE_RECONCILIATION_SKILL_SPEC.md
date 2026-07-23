# Current Config Reference Reconciliation Skill Specification

## Status

- State: implemented and stabilized repository-local skill.
- Repository skill name: `config-reference-reconciliation`.
- Repository location: `.agents/skills/config-reference-reconciliation/SKILL.md`.
- Owning repository: Expflow.
- Repository bootstrap contract: `.config-reference-reconciliation.yaml`.
- Governing reference checker: repository-declared `check:config-references` command.
- Governing skill-contract checker: repository-declared `check:skill-contracts` command.
- Hook-manager status: no hook-manager installation is required by this skill.
- CI status: repository CI invokes repository-owned deterministic checks.
- Path model: semantic-role dependencies resolved through the repository contract.
- Normative language: **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, and **SHOULD NOT** are definitive requirements.

## Purpose

The repository-local skill governs two related repository-control workflows:

1. reconciliation of marked concrete config-document references; and
2. stability of repository skill and workflow dependencies expressed through semantic roles.

The skill is a thin operator workflow. It MUST NOT implement reference parsing, role resolution, reverse-index verification, or Git-state comparison itself. Repository-owned deterministic commands own correctness.

## Stabilized Shape

The skill SHALL use this control flow:

```text
Git repository root
        ↓
repository governance
        ↓
.config-reference-reconciliation.yaml
        ↓
semantic roles and declared surfaces
        ↓
repository-local skill workflow
        ↓
repository-owned deterministic checks
```

The skill MUST NOT depend on:

- bare document filenames;
- the current checkout's absolute path;
- a user-home skill path;
- an external harness path;
- search-based guessing as the normal discovery mechanism.

## Activation

Use this skill when a task changes any of the following:

- a marked `config-docref` reference;
- a role mapping in the repository contract;
- a required-reading role consumed by a repository skill;
- a repository skill frontmatter contract;
- a governed workflow document input;
- a mutable reverse index;
- the protected-reference sidecar;
- repository validation wiring for either governing checker.

Do not activate this skill for ordinary documentation edits that change no governed reference, role mapping, required-reading role, or checker integration.

## Discovery and Pass Start

The skill MUST:

1. locate the Git repository root;
2. read root repository governance;
3. read `docs/internal/orientation/README.md`;
4. read repository build guidance from the orientation folder;
5. discover and parse `.config-reference-reconciliation.yaml`;
6. resolve required semantic roles;
7. identify the current Git state being evaluated;
8. confirm both repository-owned checker commands exist;
9. inspect staged, unstaged, and untracked state before editing.

If the contract is missing, malformed, ambiguous, or declares an unresolved required role, the skill MUST stop. It MUST NOT infer replacement paths from filenames.

## Semantic Role Contract

Repository skills SHALL declare operational required reading by semantic role rather than duplicate concrete document paths.

A repository role declaration MUST include:

- a unique role name;
- one repository-relative target;
- a valid role class;
- a target that exists in the evaluated Git snapshot.

Supported role classes include:

- `active-authority`;
- `active-evidence`;
- `immutable-architecture`;
- `frozen-evidence`.

The repository contract MAY declare directory roles for bounded output roots such as phase reports or release archives.

Required-reading order SHALL place active authority before immutable architecture and frozen evidence.

## Required-Reading Consumer Contract

Repository skill files MUST:

- contain valid YAML frontmatter with `name` and `description`;
- declare required operational reading through role names;
- avoid bare required-reading filenames;
- avoid repeated concrete path literals when a role exists;
- avoid machine-absolute paths;
- fail clearly on unknown or ambiguous roles.

Optional explanatory links MAY remain concrete repository-relative links when they are not operational dependencies.

## Marked Reference Contract

The governed marker token is repository-declared and currently resolves to `config-docref`.

Supported governed forms are:

- an inline Markdown or comment marker bound to one local repository reference;
- a standalone marker comment bound only to the next non-empty, non-structural line;
- a JSON object with `configDocref: true` and a required `path` string.

A marker MUST fail when it binds to:

- no target;
- multiple targets;
- a URL;
- a path outside the repository;
- a malformed JSON declaration;
- a removed marker used only to bypass enforcement.

## Reverse Index Contract

Mutable targets SHALL contain exactly one managed section:

```markdown
## Config Reference Index

<!-- config-reference-index:start -->

- `path/to/source` - optional human context

<!-- config-reference-index:end -->
```

Rules:

- one entry per governed source file;
- lexicographic source-path order;
- no duplicate source entries;
- no manual edits outside the declared transaction when reconciliation changes;
- source and reverse-index changes staged together.

## Protected Target Contract

Protected target bodies MUST NOT be edited for reconciliation.

Protected target patterns and the protected sidecar path SHALL be resolved from the repository contract. The current Expflow contract classifies architecture and frozen release surfaces as protected.

A protected target reference MUST be reconciled through the declared protected sidecar.

## Repository Reference Checker

The repository reference checker SHALL:

- evaluate the complete staged transaction against `HEAD`;
- support explicit base/head commit-range validation;
- detect added, removed, renamed, deleted, and retargeted marked references;
- verify old-target removal and new-target addition for retargets;
- verify inbound sources for target rename or deletion;
- reject missing targets;
- reject malformed managed indexes;
- route protected targets through the sidecar;
- reject unknown arguments;
- fail with actionable diagnostics.

A working-tree scan is diagnostic only and MUST NOT be treated as equivalent proof.

## Repository Skill-Contract Checker

The repository skill-contract checker SHALL validate the complete declared Git snapshot, not only changed files.

Default mode SHALL validate the full Git-index snapshot across repository-declared governance, skill, and workflow surfaces.

Commit-range mode SHALL validate the complete head snapshot and report relevant contract changes between base and head.

The checker SHALL verify:

- contract parsing;
- unique role declarations;
- role resolution;
- safe repository-relative targets;
- required-reading role validity;
- authority ordering;
- frontmatter validity;
- absence of bare required-reading filenames;
- absence of known moved legacy paths;
- governed workflow input resolution;
- repository relocation portability.

Unchanged stale dependencies MUST NOT survive because their consumer files were not modified.

## Required Workflow

1. Read orientation, repository governance, the role contract, and the files being changed.
2. Record `HEAD`, staged, unstaged, and untracked state.
3. Identify affected semantic roles and marked references.
4. Update the smallest authorized source surface.
5. Reconcile mutable indexes or the protected sidecar.
6. Stage only the intended transaction when staging is safe.
7. Run the repository reference checker.
8. Run the repository skill-contract checker when skills, workflow inputs, roles, or contract mappings change.
9. Run focused tests for every previously silent failure mode.
10. Run repository build guidance checks appropriate to the changed files.
11. Stop on any required failure.
12. Record references, roles, indexes, sidecar changes, checks, and Git state in the completion report.

## External Harness Boundary

External skill-limit or outcome harnesses are optional evidence surfaces.

The repository skill:

- MUST NOT persist an external harness path;
- MUST NOT make repository validation depend on the harness;
- MAY run a harness when its location is supplied for the current task or discovered through approved optional configuration;
- MUST report timeout or unavailability separately from repository validation.

## Global Skill Boundary

The repository-owned checkers MUST NOT inspect the installed global manager skill or user-home files.

Global-manager validation SHALL be reported separately.

## Authorization Boundaries

The skill MAY:

- reconcile governed references;
- update role mappings;
- update required-reading role declarations;
- update mutable indexes and the protected sidecar;
- add focused repository tests;
- update thin CI invocation of repository-owned commands.

The skill MUST NOT:

- install a hook manager without explicit authorization;
- edit `.git/hooks`;
- use `--no-verify`;
- create a general document registry;
- create universal logical document identities;
- scan the full repository as the sole correctness mechanism;
- edit immutable architecture or frozen release bodies;
- begin unrelated runtime or Build Week implementation.

## Acceptance Criteria

The local skill is conforming only when:

- repository roles resolve without inference;
- required-reading dependencies use semantic roles;
- no bare operational required-reading filename remains;
- marked references and reverse indexes reconcile;
- protected bodies remain unchanged;
- repository checks are independent of user-home files;
- staged and commit-range validation agree for equivalent fixtures;
- relocation tests pass;
- all repository skills validate;
- checker failures cannot be bypassed by marker removal, unstaged repairs, or no-op CI mode.

## Current Limits

- Correctness covers declared roles and marked references, not every repository link.
- Optional human-navigation links remain outside deterministic enforcement unless marked.
- External harnesses remain non-authoritative.
- Repository-local role names and paths are owned by the repository contract.
- Hook installation remains a separate, explicitly authorized concern.
