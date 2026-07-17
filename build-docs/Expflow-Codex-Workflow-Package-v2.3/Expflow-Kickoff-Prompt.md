# Expflow Phase 1 Kickoff — DeepSeek Execution Contract

## 0. Execution Identity

You are the implementation agent responsible for completing **Expflow Phase 1 only**.

Treat this document as an execution contract, not as a design discussion. Perform the repository work, run the required validations, and create the required completion report. Do not begin Phase 2 and do not implement any Expflow product runtime behavior.

| Field                     | Required value                                                                                                        |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Phase                     | `1 — Kickoff and Repository Contract`                                                                                 |
| Gate                      | `A — Contract Ready`                                                                                                  |
| Target branch             | `feature/expflow-phase-1-kickoff`                                                                                     |
| Product runtime allowed   | `No`                                                                                                                  |
| Default remote actions    | Do not commit, push, or open a PR unless the invoking environment separately and explicitly authorizes those actions. |
| Final repository artifact | `docs/completion_reports/PHASE_01_COMPLETION_REPORT.md`                                                               |

The intended final state is a clean, governed, installable, testable repository that preserves the Expflow 2.3 architecture package and makes later work discoverable without implementing material, semantic, workflow, projection, hook, adapter, migration, or integration runtime behavior.

---

## 1. Instruction Precedence

Apply instructions in the following order, from highest to lowest priority:

1. Repository safety and preservation of existing intentional work.
2. Byte-for-byte preservation of supplied architecture-source files.
3. The explicit Phase 1 scope, prohibitions, stop conditions, and exit criteria in this document.
4. `EXPFLOW_WORKFLOW_CURRENT.md`.
5. The remaining required architecture sources in the exact order listed in Section 6.
6. Existing repository conventions, but only when they do not conflict with items 1–5.
7. Reasonable implementation choices needed solely to produce harmless scaffolding and repository-contract checks.

When two instructions at the same precedence level conflict:

* do not guess;
* do not silently choose one;
* record the conflict in `docs/completion_reports/PHASE_01_COMPLETION_REPORT.md`;
* complete only work that is unaffected by the conflict;
* assign the final result according to Section 20.

`RELATED_WORK.md` is positioning material only. It cannot override the workflow, implementation specification, protocol specification, review resolution, or this Phase 1 execution contract.

---

## 2. Mandatory Operating Rules

Follow all rules below throughout execution:

1. Use exact file names and exact casing from this contract.
2. Do not fabricate command output, test results, file existence, commits, pull requests, or hosted-CI status.
3. Do not claim a validation passed unless the command was actually executed successfully in the current environment.
4. Do not overwrite or delete unrelated existing work.
5. Do not use destructive Git or filesystem commands, including:

   * `git reset --hard`;
   * `git clean -fd` or stronger variants;
   * force checkout that discards changes;
   * bulk deletion of existing directories;
   * automatic stashing that is not restored during the same execution.
6. Do not modify any supplied architecture source semantically or cosmetically.
7. Do not normalize line endings, reorder keys, reformat JSON, repair Markdown, or rename supplied source files unless a source file is copied to a separate working location and the immutable source copy remains byte-for-byte unchanged.
8. Do not add product runtime dependencies.
9. Do not implement “temporary” runtime behavior, mock domain behavior, or placeholder functions that silently behave as real implementations.
10. When a requirement cannot be completed safely, record the exact blocker and continue only with unaffected work.
11. Do not ask a design question that belongs to Phase 2. Record it as deferred instead.
12. Stop all Phase 1 implementation after the completion report is created and updated with final evidence.

---

## 3. Definitions

Use the following definitions exactly.

### 3.1 Architecture source

An **architecture source** is any file supplied as part of the Expflow 2.3 architecture package, including required Markdown papers, schemas, examples, review-resolution material, workflow material, notes, and positioning material.

### 3.2 Verbatim or byte-for-byte preserved

A file is **verbatim** only when its bytes are identical to the supplied source. A visually identical file with changed line endings, whitespace, encoding, key order, or final newline is not verbatim.

### 3.3 Product runtime behavior

**Product runtime behavior** is any Expflow behavior that performs or simulates domain work, including:

* reading, writing, mutating, persisting, restoring, reconciling, or synchronizing Expflow project state;
* material scanning, storage, history, revision, identity, authority, semantic, workflow, projection, hook, adapter, migration, recovery, or integration behavior;
* implementation of ordinary commands such as `init`, `sync`, `status`, or `restore`;
* implementation of adapter-specific operations;
* domain algorithms, even if they use only in-memory data;
* mock behavior that presents itself as a working implementation.

Product runtime behavior is prohibited in Phase 1.

### 3.4 Repository-contract tooling

**Repository-contract tooling** is non-product tooling that may:

* locate architecture-source files;
* read files without modifying them;
* calculate byte size and SHA-256;
* parse supplied JSON;
* meta-validate supplied schemas;
* verify required paths and documentation skeletons;
* verify that prohibited runtime entry points do not exist;
* build, lint, format-check, package, install, and test harmless scaffolding.

Repository-contract tooling is allowed. It must not implement Expflow domain behavior.

### 3.5 Scaffold

A **scaffold** is a compilable or importable module containing only one or more of the following:

* package metadata or version export;
* documentation comments explaining that implementation belongs to a later phase;
* path constants used for contract-source discovery;
* type-only declarations that do not encode unresolved domain decisions;
* CLI help/version handling as defined in Section 13.

A scaffold must not mutate project state, persist data, execute hooks, call external services, or return fabricated domain results.

### 3.6 Existing intentional work

**Existing intentional work** means tracked files, untracked files, configuration, build systems, or repository structure present before this task that appear deliberate rather than generated debris. Preserve it unless this contract explicitly requires a safe reconciliation.

### 3.7 Unaffected work

**Unaffected work** is a deliverable that can be completed without resolving a blocker, altering an immutable source, discarding existing work, or deciding a later-phase architecture question.

---

## 4. Phase 1 Scope

Phase 1 establishes only:

* repository structure;
* architecture-source preservation and integrity verification;
* agent governance;
* focused agent skills as control documents;
* package and test scaffolding;
* documentation skeletons;
* source and contract discovery;
* CI and repository-contract checks;
* phase boundaries and completion evidence.

Phase 1 does not implement Expflow product behavior.

---

## 5. Locked Product Boundaries

The repository governance created in Phase 1 must preserve these statements without expanding them into runtime implementations:

* Expflow is schema governed.
* Expflow is local first.
* Expflow versions complete trees.
* Expflow is identity aware.
* Expflow preserves immutable history.
* Expflow preserves authority and decisions.
* Expflow has a bounded ordinary command surface.
* Expflow manages projections.
* Expflow constrains hooks.

The documented ordinary command names remain exactly:

```text
expflow init
expflow sync
expflow status
expflow restore
```

In Phase 1 these names may appear only in documentation and CLI help text. They must not have command handlers or operational behavior.

Adapter-specific inspection, revision, cursor, pagination, idempotency, and reconciliation contracts are outside the core repository boundary for this phase. Do not create an adapter API or add `expflow-adapter-guerilla` code.

---

## 6. Required Source Set and Reading Order

Locate and read the following exact files in this exact order:

1. `EXPFLOW_WORKFLOW_CURRENT.md`
2. `EXPFLOW_CONCEPT_PAPER_V2_3.md`
3. `EXPFLOW_IMPLEMENTATION_SPEC_V2_3.md`
4. `EXPFLOW_PROTOCOL_SPEC_V2_3.md`
5. `EXPFLOW_PROJECT_SNAPSHOT_V2_3.md`
6. `Note-On-Architecture.md`
7. `V2_3_ARCHITECTURE_DELTA.md`
8. `RELATED_WORK.md`
9. every supplied schema file
10. every supplied example file

### 6.1 Source discovery rules

Use these rules when locating the source set:

1. Search the repository for each required exact basename.
2. Treat matching as case-sensitive.
3. If exactly one file matches a required basename, use it as the supplied source.
4. If multiple files match and all copies have identical SHA-256 digests, use the copy nearest to the other architecture-package files and record all duplicate paths in the completion report.
5. If multiple files match and their digests differ, record a source conflict. Do not select one silently.
6. Determine the supplied schema and example sets from the architecture package that contains the required Markdown sources.
7. Do not classify repository-generated schemas or examples as supplied architecture inputs unless they were present before Phase 1 and are clearly part of the supplied package.
8. If a required Markdown source is missing or unreadable, record a blocker and apply the stop/result rules in Sections 19 and 20.
9. If a supplied file appears corrupt, do not repair it. Preserve the bytes when safe, report the problem, and do not claim source integrity passed.

### 6.2 Source authority rules

* The workflow file controls process and phase sequencing.
* The concept paper controls product intent.
* The implementation specification controls intended implementation boundaries.
* The protocol specification controls protocol language and core/extension separation.
* The project snapshot controls known project state at the package version.
* `Note-On-Architecture.md` and `V2_3_REVIEW_RESOLUTION.md` clarify architecture and resolved review issues.
* `RELATED_WORK.md` provides positioning only.
* Supplied schemas and examples are architecture inputs in Phase 1, not proof of full validator parity or full schema/example conformance.

---

## 7. Preflight and Branch Safety

Before modifying files, run and preserve the output of:

```bash
git status --short
git branch --show-current
git remote -v
git log -8 --oneline
find . -maxdepth 3 -type f | sort | sed -n '1,260p'
```

Also run:

```bash
git rev-parse --show-toplevel
git diff --stat
git diff --cached --stat
```

### 7.1 Preflight interpretation

* If the directory is not a Git repository, record a blocker and do not initialize a new repository unless the invoking environment explicitly authorizes repository initialization.
* If the working tree contains changes, preserve them.
* Reconcile required files with existing files instead of replacing unrelated content.
* Do not assume an untracked file is disposable.
* Do not change the default branch or release branches.

### 7.2 Branch procedure

The required working branch is:

```text
feature/expflow-phase-1-kickoff
```

Use this deterministic procedure:

1. If the current branch already has the required name, remain on it.
2. Otherwise, if the branch exists locally, run `git switch feature/expflow-phase-1-kickoff`.
3. Otherwise, run `git switch -c feature/expflow-phase-1-kickoff`.
4. If switching would overwrite or discard local work, do not force the switch and do not stash automatically. Record the blocker and stop repository mutations.
5. Never commit Phase 1 work directly to `main`, `master`, a branch whose name starts with `release/`, or another branch identified by the repository as protected.

By default, this task modifies the working tree only. Do not commit, push, or open a pull request unless separate instructions outside this prompt explicitly authorize those actions. The completion report must state the actual commit, push, PR, and CI status without inventing values.

---

## 8. Required Execution Order

Complete work in this order:

1. Run preflight and establish branch safety.
2. Locate, inventory, and inspect the required source set.
3. Create the immutable architecture-source copy and source manifest.
4. Reconcile root repository tooling and package configuration.
5. Create root `AGENTS.md`.
6. Create the five focused skills.
7. Create documentation skeletons.
8. Create source/contract working directories and byte-preserved mirrors.
9. Create the TypeScript scaffold.
10. Create the Python scaffold.
11. Create repository-contract tests.
12. Create hosted CI configuration.
13. Run all validation commands.
14. Verify clean installation outside the repository checkout.
15. Audit for prohibited work.
16. Create and finalize the Phase 1 completion report.
17. Stop. Do not begin Phase 2.

Do not skip an earlier step merely because a later step appears easier. When an earlier step is blocked, continue only with later steps that are genuinely unaffected.

---

## 9. Exact Architecture-Source Layout

Preserve the architecture package under this exact directory:

```text
docs/architecture/
```

Required generated control files:

```text
docs/architecture/SCHEMA_INDEX.md
docs/architecture/EXAMPLE_INDEX.md
docs/architecture/SOURCE_MANIFEST.json
```

Required source placement:

* required architecture Markdown files go directly under `docs/architecture/` using their original basenames;
* supplied schemas go under `docs/architecture/schemas/`, preserving their relative paths within the supplied schema set;
* supplied examples go under `docs/architecture/examples/`, preserving their relative paths within the supplied example set;
* any additional supplied architecture-package files go under `docs/architecture/` in a path that preserves their package-relative organization.

Do not use an alternative architecture-source directory.

### 9.1 Immutable-source copy rules

* Copy source files in binary mode.
* Do not alter encoding or line endings.
* If the correct destination already exists and has the same SHA-256 digest, leave it unchanged.
* If the destination exists with different bytes and is clearly an intentional existing architecture source, do not overwrite it. Record a conflict.
* If the destination exists with different bytes and is clearly a generated Phase 1 artifact from the current execution, replace only that generated artifact.
* Add a root `.gitattributes` entry that disables text normalization for immutable source files:

```gitattributes
docs/architecture/** -text
```

Do not apply `-text` globally.

### 9.2 Schema index

`docs/architecture/SCHEMA_INDEX.md` is generated Phase 1 control documentation, not an architecture source. It must:

* identify every supplied schema by repository-relative path;
* state its declared `$schema` URI when present, otherwise `not declared`;
* state its declared `$id` when present, otherwise `not declared`;
* state its byte size and SHA-256;
* sort entries by repository-relative path;
* contain no interpretation of schema semantics.

### 9.3 Example index

`docs/architecture/EXAMPLE_INDEX.md` is generated Phase 1 control documentation. It must:

* identify every supplied example by repository-relative path;
* state file type or extension;
* state byte size and SHA-256;
* sort entries by repository-relative path;
* contain no claim that an example conforms to a schema unless a later phase proves that claim;
* explicitly state `No supplied examples were discovered` when the supplied example set is empty.

### 9.4 Source manifest format

Create `docs/architecture/SOURCE_MANIFEST.json` with this exact top-level shape:

```json
{
  "algorithm": "sha256",
  "generated_by": "Expflow Phase 1 repository-contract tooling",
  "entries": []
}
```

Each entry must have exactly these fields:

```json
{
  "path": "docs/architecture/<relative-path>",
  "bytes": 0,
  "sha256": "<64 lowercase hexadecimal characters>"
}
```

Manifest rules:

1. Include every immutable supplied source copied under `docs/architecture/`.
2. Exclude `SOURCE_MANIFEST.json`, `SCHEMA_INDEX.md`, and `EXAMPLE_INDEX.md` because they are generated controls.
3. Use repository-relative paths with `/` separators on every operating system.
4. Sort entries lexicographically by `path`.
5. Serialize as UTF-8 JSON with two-space indentation and one trailing newline.
6. Repository tests must recalculate every listed file size and digest.
7. Repository tests must fail when an unlisted immutable source appears under the architecture-source schema/example/source set.
8. The completion report must include the SHA-256 of the completed `SOURCE_MANIFEST.json` file itself.

Generated documentation must never overwrite an immutable architecture source.

---

## 10. Root Repository Files and Tooling

Create or safely reconcile these exact root files:

```text
AGENTS.md
README.md
README_DEV.md
package.json
package-lock.json
tsconfig.json
pyproject.toml
.gitignore
.gitattributes
.editorconfig
.prettierrc.json
eslint.config.mjs
```

Use these fixed package choices unless they conflict with an existing intentional build system:

### 10.1 Node and TypeScript

* minimum Node.js version: `20`;
* package manager: npm only;
* lockfile: npm `package-lock.json`;
* TypeScript strict mode: enabled;
* module system: ESM;
* TypeScript compiler output directory: `dist/`;
* TypeScript source root: `src/`;
* test runner: Vitest;
* formatter: Prettier;
* linter: ESLint flat configuration;
* schema contract dependencies: Ajv 8 and `ajv-formats`;
* all Node packages added in Phase 1 must be `devDependencies`;
* `package.json` must have no product runtime dependencies. The `dependencies` field must be absent or an empty object.

Use a package version that clearly denotes non-runtime scaffolding:

```text
0.0.0-phase.1
```

`package.json` must be private:

```json
"private": true
```

Required npm scripts:

```text
build
clean
format
format:check
lint
typecheck
test
contracts:verify
schemas:meta-validate
examples:index-check
package:verify
validate
```

`npm run validate` must execute all repository checks needed for Phase 1, excluding only the Python commands that are separately run with Python.

### 10.2 Python

* minimum Python version: `3.11`;
* build backend: `setuptools.build_meta`;
* package source: `python/expflow_hooks/`;
* Python test root: `python/tests/`;
* test runner: `pytest`;
* schema parity/meta-validation dependency: `jsonschema`;
* package-build verification dependency: `build`;
* Python development dependencies belong in the `dev` optional dependency group;
* the installed package must not depend on databases, brokers, network clients, watchers, containers, model providers, or integration SDKs.

The required install command must work exactly:

```bash
python -m pip install -e ".[dev]"
```

### 10.3 Existing build-system conflicts

If the repository already has an intentional package manager, TypeScript configuration, Python build backend, formatter, linter, or test runner that conflicts with the fixed choices above:

* do not delete or replace it blindly;
* determine whether the existing system can satisfy every explicit Phase 1 contract;
* reconcile only when the result remains understandable and non-destructive;
* when coexistence is unsafe or ambiguous, record a blocker rather than creating two competing build systems;
* do not claim PASS when a required command cannot run.

---

## 11. Root Governance File: `AGENTS.md`

Create root `AGENTS.md` with **300–500 physical lines inclusive**, measured by `wc -l AGENTS.md` or an equivalent platform command.

The file must be substantive, not padded with repetitive filler. It must include clear headings and executable rules covering all of the following:

1. Expflow product identity.
2. The exact source-of-truth order.
3. Phase and gate discipline.
4. The ordinary command boundary.
5. The documented core extension boundary.
6. Architecture-source immutability.
7. Immutable material-record intent without implementation.
8. Immutable semantic-record intent without implementation.
9. Complete-tree revision intent.
10. Adapter deferral and exclusion from the core repository.
11. Immutable core operation-receipt intent without implementation.
12. Identity intent and prohibition on premature identity algorithms.
13. Transaction and recovery discipline without implementation.
14. Authority and decision discipline without implementation.
15. Separation of material, semantic, workflow, and projection state.
16. Separation of deterministic and model-assisted projections.
17. Hook constraints and prohibition on Phase 1 hook execution.
18. Source-content security and untrusted-input rules.
19. Repository-contract test expectations.
20. Required validation commands.
21. Completion evidence requirements.
22. Stop conditions.
23. Prohibited shortcuts.
24. An explicit statement that Phase 1 contains no Expflow product runtime implementation.

The file must not invent unresolved identifier formats, digest canonicalization rules, persistence layout, transaction protocol, authority policy, semantic-record schema, workflow-state algorithm, projection equivalence rule, adapter operation set, or migration strategy.

---

## 12. Focused Agent Skills

Create exactly these skill files:

```text
.agents/skills/expflow-contracts-protocol/SKILL.md
.agents/skills/expflow-material-storage-sync/SKILL.md
.agents/skills/expflow-authority-semantics-workflows/SKILL.md
.agents/skills/expflow-projections-reproduction/SKILL.md
.agents/skills/expflow-testing-security-migration/SKILL.md
```

Each skill must use these exact top-level headings in this order:

```text
# <Skill title>
## Purpose
## Activation Criteria
## Required Reading
## Invariants
## Procedure
## Tests
## Stop Conditions
## Completion Evidence
## Phase 1 Status
```

Requirements for every skill:

* explain when the skill should and should not be activated;
* list relevant controlling sources in authority order;
* state invariants without creating runtime behavior;
* provide a later-phase work procedure as governance, not implementation;
* identify expected tests for the later phase;
* define stop conditions;
* define evidence required before claiming completion;
* end with an explicit statement that the skill is a Phase 1 control document and contains no product runtime implementation.

Do not create additional Expflow skill directories in Phase 1.

---

## 13. Documentation Skeletons

Create exactly these files:

```text
docs/ARCHITECTURE_DECISIONS.md
docs/GLOSSARY.md
docs/MVP_SCOPE.md
docs/DATA_MODEL.md
docs/MATERIAL_RECORD_FORMAT.md
docs/IDENTITY_AND_REVISION_MODEL.md
docs/PROTOCOL_CORE_SPEC.md
docs/EXTENSION_BOUNDARY.md
docs/STORAGE_AND_RECOVERY.md
docs/AUTHORITY_AND_SEMANTIC_MODEL.md
docs/WORKFLOW_AND_PROJECTION_MODEL.md
docs/SECURITY_MODEL.md
docs/ERROR_REGISTRY.md
docs/TEST_MATRIX.md
docs/CODEX_BUILD_PLAN.md
docs/CURRENT_STATUS_MATRIX.md
docs/phase_prompts/README.md
docs/completion_reports/README.md
```

Each skeleton must begin with a title and this exact metadata block, with values filled in:

```text
- Owner phase: <value>
- Current status: SKELETON — NO SUBSTANTIVE CONTENT
- Controlling sources: <ordered source list>
- Regeneration trigger: <explicit trigger>
```

Owner-phase rules:

* use `Phase 1` for `docs/phase_prompts/README.md` and `docs/completion_reports/README.md`;
* for every other skeleton, use `Phase 2 or later — exact owner intentionally unassigned in Phase 1` unless a controlling source explicitly assigns an owner phase;
* do not invent an owner phase.

Every skeleton must contain this exact statement:

```text
Substantive content is intentionally deferred to the owning later phase. This Phase 1 file is a discoverability and governance skeleton only and does not freeze unresolved architecture decisions.
```

Each skeleton may include later-phase section headings and `TODO` markers, but must not:

* define final schemas;
* define final identifiers;
* define canonicalization or digest rules;
* select a storage engine;
* define command behavior;
* define adapter operations;
* define transaction mechanics;
* define authority algorithms;
* define semantic-record behavior;
* define workflow occurrence behavior;
* define projector behavior;
* define migration behavior;
* claim a Phase 2 decision is final.

---

## 14. Source and Contract Working Directories

Create or safely reconcile:

```text
schemas/
registries/
examples/
tests/fixtures/contracts/
```

### 14.1 Working schema mirror

* Copy every supplied schema from `docs/architecture/schemas/` to `schemas/`, preserving relative paths and bytes.
* The immutable architecture copy remains the source-integrity reference.
* Add `schemas/README.md` explaining that Phase 1 contains byte-preserved working mirrors and no newly invented final schemas.
* Add a repository test that verifies each Phase 1 working schema mirror matches its immutable architecture copy byte-for-byte.
* If an existing intentional schema at the required destination differs, do not overwrite it; record a blocker and preserve both source evidence and existing work.

### 14.2 Working example mirror

* Copy every supplied example from `docs/architecture/examples/` to `examples/`, preserving relative paths and bytes.
* Add `examples/README.md` explaining that discoverability does not imply conformance.
* Add a repository test that verifies each Phase 1 working example mirror matches its immutable architecture copy byte-for-byte.
* If an existing intentional example at the required destination differs, do not overwrite it; record a blocker.

### 14.3 Registries and future deltas

* Add `registries/README.md` stating that runtime registries and final registry formats are deferred.
* Add `tests/fixtures/contracts/README.md` stating that later contract fixtures belong to later phases.
* Do not invent production registry entries, error codes, schema deltas, or migration fixtures.

---

## 15. TypeScript Scaffold

Create these exact directories:

```text
src/cli/
src/core/
src/schemas/
src/material/
src/scan/
src/transactions/
src/operations/
src/extensions/
src/authority/
src/semantics/
src/workflows/
src/projections/
src/hooks/
src/status/
src/protocol/
src/generated/
```

Every directory must be tracked by at least one harmless file. Use `README.md`, `index.ts`, or both as appropriate.

### 15.1 Allowed TypeScript behavior

The TypeScript package may implement only:

* export of package version `0.0.0-phase.1`;
* architecture-source and manifest path discovery;
* read-only repository-contract verification used by tests or scripts;
* CLI `--help`, `-h`, `--version`, and `-v` handling;
* static documentation that later modules are intentionally unimplemented.

### 15.2 CLI contract

The CLI must follow this exact behavior:

* `expflow --help` and `expflow -h` print help and exit `0`;
* `expflow --version` and `expflow -v` print `0.0.0-phase.1` and exit `0`;
* help text lists `init`, `sync`, `status`, and `restore` as the ordinary command names and labels every one as `not implemented in Phase 1`;
* any other argument, including any ordinary command invocation, prints a clear `not implemented in Phase 1` message to standard error and exits with code `2`;
* no CLI path may create, change, delete, scan, sync, inspect, restore, or persist project data;
* do not create command handler modules for `init`, `sync`, `status`, or `restore`.

### 15.3 Prohibited TypeScript behavior

Under `src/`, do not implement or import product-runtime behavior. In particular, do not:

* call filesystem write, rename, delete, or directory-creation APIs;
* open sockets or make HTTP requests;
* start watchers;
* invoke child processes for product behavior;
* load databases or brokers;
* execute Python hooks;
* implement domain hashing or canonicalization;
* implement identity, revision, transaction, authority, semantic, workflow, projection, adapter, recovery, or migration logic.

Contract scripts outside `src/` may create generated Phase 1 control files only when those files are explicitly named in this contract. Verification commands must be read-only.

---

## 16. Python Scaffold

Create:

```text
python/expflow_hooks/
python/tests/
```

Required harmless package behavior:

* package import succeeds;
* `__version__` reports `0.0.0-phase.1`;
* a read-only helper may discover the architecture schema-source directory;
* no hook execution exists;
* no semantic, projection, workflow, storage, migration, adapter, or model-provider behavior exists.

Under `python/expflow_hooks/`, do not:

* write files;
* execute subprocesses;
* make network requests;
* import integration SDKs;
* implement hook registration or dispatch;
* implement domain validation beyond locating schema sources;
* implement any later-phase behavior.

---

## 17. Repository-Contract Tests

Create automated tests that prove every item below.

### 17.1 Source integrity

* every required architecture Markdown file exists in `docs/architecture/`;
* every manifest entry exists;
* every manifest byte count matches;
* every manifest SHA-256 matches;
* every supplied immutable schema and example is listed;
* generated control files are not listed as immutable sources;
* schema and example working mirrors match immutable copies byte-for-byte.

### 17.2 JSON and schema checks

* every supplied `.json` file under immutable architecture schemas/examples parses as JSON;
* every supplied JSON Schema meta-validates according to its declared dialect when supported by Ajv 8;
* Python `jsonschema` identifies an applicable validator and successfully runs `check_schema` for every supported supplied schema;
* an absent or unsupported `$schema` dialect produces a clear test failure or documented blocker, not a silent success;
* Phase 1 tests do not claim that every example conforms to a schema;
* Phase 1 tests do not claim JavaScript/Python validator parity.

### 17.3 Discoverability and governance

* `SCHEMA_INDEX.md` accounts for every supplied schema;
* `EXAMPLE_INDEX.md` accounts for every supplied example;
* every documentation skeleton exists;
* every documentation skeleton contains the required metadata and deferral statement;
* all five skill files exist with all required headings;
* `AGENTS.md` exists, contains the explicit no-runtime statement, and has 300–500 physical lines inclusive.

### 17.4 Product-runtime absence

Add static repository-contract checks that fail when any of the following appear under `src/` or `python/expflow_hooks/`:

* command handler files named for `init`, `sync`, `status`, or `restore`;
* exported product operations for scanning, persistence, sync, restoration, reconciliation, authority, semantics, workflows, projections, hooks, adapters, recovery, or migration;
* filesystem mutation calls;
* network-client imports;
* database, broker, watcher, container, model-provider, or integration-SDK imports;
* Python hook execution or registration;
* later-phase runtime entry points.

The static checks must be narrow enough to allow documentation text that names prohibited concepts while still rejecting executable implementations.

### 17.5 Build and install

* TypeScript typecheck succeeds;
* TypeScript build succeeds;
* Node tests succeed;
* Python package imports after editable installation;
* Python tests succeed;
* npm package verification outside the checkout succeeds;
* Python wheel installation outside the checkout succeeds.

Use harmless repository tests only. Do not create mock domain implementations to make tests pass.

---

## 18. Hosted CI

If the repository already has an intentional hosted-CI provider, extend it without creating a competing provider. If no hosted CI exists and the repository is hosted on GitHub or contains a GitHub remote, create:

```text
.github/workflows/ci.yml
```

Use these triggers:

```yaml
on:
  push:
  pull_request:
```

Use an explicit compatibility matrix with these four combinations:

| Operating system | Node.js | Python |
| ---------------- | ------: | -----: |
| `ubuntu-latest`  |    `20` | `3.11` |
| `ubuntu-latest`  |    `22` | `3.12` |
| `windows-latest` |    `20` | `3.11` |
| `macos-latest`   |    `20` | `3.11` |

Every matrix job must run, in order:

```text
npm ci
npm run format:check
npm run lint
npm run typecheck
npm test
npm run contracts:verify
npm run schemas:meta-validate
npm run examples:index-check
npm run build
python -m pip install --upgrade pip
python -m pip install -e ".[dev]"
python -m pytest
```

At least the Ubuntu Node 20/Python 3.11 job must also run:

```text
npm run package:verify
python -m build
```

If hosted CI cannot be configured because the repository provider is unknown, unsupported, or intentionally uses another system that cannot be safely reconciled, record the blocker. Do not fabricate a successful hosted run.

---

## 19. Required Local Validation

Run every command below from the repository root after implementation:

```bash
npm ci
npm run format:check
npm run lint
npm run typecheck
npm test
npm run contracts:verify
npm run schemas:meta-validate
npm run examples:index-check
npm run build
python -m pip install -e ".[dev]"
python -m pytest
```

Also run:

```bash
git diff --check
git status --short
```

### 19.1 External npm package verification

The `npm run package:verify` script must:

1. create an npm tarball with `npm pack`;
2. create a temporary directory outside the repository checkout;
3. initialize a temporary npm project;
4. install the tarball into that temporary project;
5. execute the installed CLI with `--version` and `--help`;
6. verify the expected exit codes and output;
7. remove the temporary directory when complete;
8. avoid publishing the package.

Run:

```bash
npm run package:verify
```

### 19.2 External Python package verification

Run this procedure:

1. build a wheel with `python -m build --wheel`;
2. create a temporary virtual environment outside the repository checkout;
3. install the built wheel into that environment;
4. import `expflow_hooks`;
5. verify `expflow_hooks.__version__ == "0.0.0-phase.1"`;
6. remove the temporary environment when complete.

Document the exact commands in `README_DEV.md` and record the actual result in the completion report.

### 19.3 Validation truthfulness

For every command:

* record the exact command;
* record `PASS`, `FAIL`, or `BLOCKED`;
* record the exit code when the command ran;
* record a concise factual note;
* do not mark a command `PASS` when it was skipped;
* do not hide failures by removing tests or weakening contract checks.

---

## 20. Stop Conditions and Result Mapping

### 20.1 Stop conditions

Stop affected work when any of the following is true:

* a required architecture file is missing, unreadable, or corrupt;
* differing duplicate architecture sources create unresolved authority ambiguity;
* branch switching would discard or overwrite existing work;
* the repository has an intentional conflicting build system that cannot be safely reconciled;
* preserving a source would require semantic alteration;
* a required scaffold would require product runtime behavior;
* npm and Python package boundaries cannot coexist cleanly;
* hosted CI cannot execute the repository contract;
* completing a deliverable requires deciding a Phase 2 architecture issue;
* a required validation fails and cannot be corrected without violating this contract.

When a stop condition affects only part of the task, complete unaffected work and document the boundary. Do not create placeholders that falsely claim the blocked requirement is complete.

### 20.2 Final result selection

The completion report must use exactly one of these result lines:

```text
PASS -- Phase 1 complete
PARTIAL -- unaffected Phase 1 work complete; blockers remain
FAIL -- Phase 1 exit criteria not met
```

Apply them as follows:

#### PASS

Use `PASS -- Phase 1 complete` only when:

* every Phase 1 deliverable is complete;
* every required validation ran and passed;
* source integrity passed;
* no prohibited runtime behavior exists;
* hosted CI configuration exists and is valid;
* no unresolved blocker remains;
* every exit criterion in Section 21 is satisfied.

A hosted CI workflow that has been created but cannot be remotely observed may still support PASS only when the environment has no remote-execution capability, the workflow is locally validated as far as possible, and the completion report clearly states `Hosted run not observable in this environment`. Do not claim the hosted run itself passed.

#### PARTIAL

Use `PARTIAL -- unaffected Phase 1 work complete; blockers remain` when:

* one or more requirements are blocked by missing inputs, repository-state conflicts, unavailable hosted infrastructure, or another external constraint;
* all work not affected by those blockers is complete and validated;
* no completed artifact violates the contract;
* no prohibited runtime behavior exists;
* the report names each blocker and the exact work it prevents.

#### FAIL

Use `FAIL -- Phase 1 exit criteria not met` when:

* completed work violates the Phase 1 boundary;
* source bytes were altered or source provenance cannot be trusted;
* required tests fail because of implementation defects;
* prohibited runtime behavior exists;
* existing intentional work was lost or overwritten;
* the repository is left in an unsafe or internally contradictory state;
* no meaningful unaffected work could be completed safely.

Do not use PARTIAL to hide implementation defects.

---

## 21. Phase 1 Exit Criteria

Phase 1 passes only when all ten criteria below are true:

1. Architecture sources are preserved byte-for-byte and verified by the source manifest.
2. Root governance exists and records the source-of-truth order.
3. All five focused skills exist and are control documents only.
4. Every required documentation skeleton exists and defers substantive decisions.
5. TypeScript and Python scaffolds install, import, typecheck, test, and build cleanly.
6. Hosted CI configuration runs every required repository-contract command.
7. Repository-contract tests reject later-phase runtime entry points.
8. No unresolved Phase 2 decision is falsely described as frozen.
9. No product runtime mutation or domain behavior exists.
10. The completion report links every claim to a file path, digest, command result, Git fact, or hosted-CI fact.

---

## 22. Completion Report

Create exactly:

```text
docs/completion_reports/PHASE_01_COMPLETION_REPORT.md
```

Use this exact top-level section order:

```text
# Phase 1 Completion Report
## Result
## Executive Summary
## Delivered Artifacts
## Architecture Source Inventory
## Source-Integrity Evidence
## Validation Command Table
## Exit-Criteria Matrix
## Invariant Audit
## Prohibited-Scope Audit
## Blockers and Contradictions
## Git and Repository Evidence
## Hosted CI Evidence
## Changed Files
## Phase 2 Handoff
```

### 22.1 Result section

The first non-heading line under `## Result` must be exactly one result line from Section 20.2.

### 22.2 Delivered artifacts

For each required artifact group, record:

* status: `PASS`, `FAIL`, or `BLOCKED`;
* repository-relative paths;
* concise evidence;
* any relevant blocker.

### 22.3 Source-integrity evidence

Include:

* count of immutable source files;
* count of supplied schemas;
* count of supplied examples;
* path to `docs/architecture/SOURCE_MANIFEST.json`;
* SHA-256 of `SOURCE_MANIFEST.json`;
* source verification command and result;
* any duplicates or conflicts discovered.

### 22.4 Validation command table

Use columns:

```text
Command | Status | Exit code | Evidence or note
```

Include every command from Section 19, even when blocked. Use `not run` for exit code only when status is `BLOCKED`.

### 22.5 Exit-criteria matrix

Use columns:

```text
Criterion | Status | Evidence
```

Include all ten criteria from Section 21.

### 22.6 Invariant audit

Explicitly audit:

* source immutability;
* source authority order;
* no runtime implementation;
* no adapter surface;
* no premature Phase 2 decisions;
* harmless TypeScript scaffold;
* harmless Python scaffold;
* documentation deferral;
* contract-test coverage;
* clean-install verification.

### 22.7 Prohibited-scope audit

List every prohibited area from Section 23 and mark each `ABSENT`, `PRESENT`, or `NOT AUDITED`. PASS requires every item to be `ABSENT`.

### 22.8 Git and repository evidence

Record actual values for:

* repository root;
* branch;
* initial working-tree status;
* final working-tree status;
* commits created by this task;
* push status;
* pull-request status;
* remote URLs with credentials or tokens redacted;
* `git diff --stat` summary.

When no commit, push, or PR was authorized, write:

```text
Not created — remote Git actions were not authorized by the invoking environment.
```

### 22.9 Changed files

List all files created, modified, or deleted by this task. Do not include files that were merely read.

### 22.10 Phase 2 handoff

The handoff must:

* state that Phase 1 is complete, partial, or failed according to the result;
* identify unresolved blockers and deferred decisions;
* identify prerequisites for Phase 2;
* contain no Phase 2 implementation;
* end with this exact sentence:

```text
No Phase 2 work was performed as part of this execution.
```

---

## 23. Prohibited Work

Do not implement any item in this section, even as a prototype, mock, stub with behavior, hidden helper, or test-only domain implementation.

1. Identifier generation, normalization, or semantics.
2. Canonicalization rules or domain digest semantics.
3. Object, node, tree, project, head, revision, or change stores.
4. Material storage or immutable-history runtime.
5. Scanner or ignore behavior.
6. Synchronization behavior.
7. Identity resolution.
8. Locks, staging, commit, transaction, rollback, or recovery behavior.
9. Operation attempt/outcome runtime or operation receipts.
10. CLI command handlers beyond help/version handling.
11. Adapter protocol operations.
12. External inspection.
13. Change or revision pagination.
14. Adapter cursor behavior.
15. Adapter idempotency.
16. Reconciliation behavior.
17. Authority stores or authority algorithms.
18. Decision persistence.
19. Semantic records or semantic-record runtime.
20. Workflow occurrence or workflow state behavior.
21. Deterministic projectors.
22. Model-assisted projectors.
23. Projection management.
24. Python hook registration, dispatch, or execution.
25. Regeneration or equivalence logic.
26. Structural reuse.
27. Archive extraction.
28. Source-content security execution beyond static governance and tests.
29. Migration tools or migration behavior.
30. End-to-end product scenarios.
31. Integration-specific code.
32. Database, broker, watcher, container, network-service, or model-provider integration.
33. `expflow-adapter-guerilla` code in the core repository.

Placeholder documentation may name these concepts solely to state that they are deferred or prohibited. Executable behavior is not allowed.

---

## 24. README Requirements

### 24.1 `README.md`

The root README must state:

* what Expflow is at a high level, grounded in the architecture sources;
* that the repository is currently at Phase 1 / Gate A;
* that no product runtime is implemented;
* the ordinary future command names, clearly marked unimplemented;
* supported minimum tool versions;
* how to install development dependencies;
* how to run the full Phase 1 validation suite;
* where immutable architecture sources live;
* where the completion report lives.

Do not present the package as production-ready or feature-complete.

### 24.2 `README_DEV.md`

The developer README must document exact commands for:

* prerequisites;
* clean npm installation;
* editable Python installation;
* formatting;
* linting;
* typechecking;
* Node tests;
* Python tests;
* source-integrity verification;
* schema meta-validation;
* example index verification;
* TypeScript build;
* external npm package verification;
* external Python wheel verification;
* the full local validation sequence;
* the Phase 1 no-runtime boundary.

Commands documented in `README_DEV.md` must match actual package scripts and test paths.

---

## 25. Final Self-Audit Before Reporting

Before finalizing the completion report, perform all checks below:

1. Confirm the active branch name.
2. Confirm no unrelated file was deleted.
3. Confirm immutable source digests match.
4. Confirm generated indexes are excluded from the immutable-source manifest.
5. Confirm root `package.json` has no runtime dependencies.
6. Confirm Python package metadata has no prohibited runtime dependencies.
7. Confirm CLI accepts only help/version behavior.
8. Confirm all four ordinary command invocations exit `2` without side effects.
9. Confirm no command handler modules exist.
10. Confirm TypeScript and Python product directories contain no mutation or integration behavior.
11. Confirm all five skills exist.
12. Confirm every documentation skeleton includes required metadata and deferral text.
13. Confirm all required validation commands are represented truthfully in the report.
14. Confirm the report result matches Section 20.2.
15. Confirm the final handoff sentence is exact.
16. Run `git diff --check`.
17. Run `git status --short`.
18. Update the changed-files list and Git evidence after the final report edit.

Do not weaken a check merely to obtain PASS.

---

## 26. Final Response Behavior

After the repository work is complete:

1. Ensure `docs/completion_reports/PHASE_01_COMPLETION_REPORT.md` contains final, truthful evidence.
2. Do not begin Phase 2.
3. Do not provide speculative future implementation details.
4. In the final response, state only:

   * the Phase 1 result;
   * the completion-report path;
   * the validation summary;
   * any blockers;
   * whether commits, push, PR, and hosted-CI execution were actually performed.
5. Stop.

The correct outcome is a governed, installable repository contract with preserved architecture inputs and no Expflow product runtime behavior.
