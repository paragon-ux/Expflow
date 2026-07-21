# DeepSeek Rerun — Config Reference Skills and Protected-Surface Tests

## Objective

Rerun the local and global config-reference skill tests with three separate repository-owned controls:

1. `check:config-references`
   Verifies marked references, mutable reverse indexes, and protected-sidecar entries.

2. `check:skill-contracts`
   Verifies semantic roles, repository skill contracts, required-reading roles, frontmatter, and role resolution.

3. `check:protected-surfaces`
   Verifies that protected document bodies remain unchanged in staged and commit-range Git states.

Do not create another skill to protect files. Skills provide workflow instructions; deterministic repository commands provide enforcement.

---

## Step 1 — Create a fresh test repository

Create a new disposable Git repository.

The repository must contain:

```text
.config-reference-reconciliation.yaml
AGENTS.md
package.json

.agents/
└── skills/
    ├── config-reference-reconciliation/
    │   └── SKILL.md
    └── test-skill/
        └── SKILL.md

docs/
├── doc-a.md
├── doc-b.md
├── architecture/
│   └── frozen.md
└── internal/
    └── PROTECTED_CONFIG_REFERENCE_INDEX.md

scripts/
├── check-config-refs.js
├── check-skill-contracts.js
└── check-protected-surfaces.js
```

Initialize Git and create a clean baseline commit.

Record:

```text
git rev-parse HEAD
git status --short
```

---

## Step 2 — Create the repository contract

The repository contract must declare:

* the reference checker command;
* the skill-contract checker command;
* the protected-surface checker command;
* the marker token;
* semantic roles;
* governed source surfaces;
* protected target patterns;
* the protected sidecar.

Use repository-relative paths only.

Do not use machine-absolute paths.

Example shape:

```yaml
version: 1

checker:
  config_references: npm run check:config-references
  skill_contracts: npm run check:skill-contracts
  protected_surfaces: npm run check:protected-surfaces

marker:
  token: config-docref

roles:
  repository_governance:
    path: AGENTS.md
    class: active-authority

  mutable_doc_a:
    path: docs/doc-a.md
    class: active-authority

  mutable_doc_b:
    path: docs/doc-b.md
    class: active-authority

  frozen_doc:
    path: docs/architecture/frozen.md
    class: immutable-architecture

sources:
  - AGENTS.md
  - .agents/skills/**/SKILL.md

protected_targets:
  - docs/architecture/**

protected_sidecar: docs/internal/PROTECTED_CONFIG_REFERENCE_INDEX.md
```

---

## Step 3 — Create the package commands

Declare:

```json
{
  "scripts": {
    "check:config-references": "node scripts/check-config-refs.js",
    "check:skill-contracts": "node scripts/check-skill-contracts.js",
    "check:protected-surfaces": "node scripts/check-protected-surfaces.js"
  }
}
```

Each command must return:

* exit `0` on success;
* non-zero on failure;
* actionable diagnostics.

Unknown arguments must fail.

---

## Step 4 — Establish the clean baseline

Create valid initial state:

* `AGENTS.md` contains marked references to `docs/doc-a.md` and the protected document.
* `docs/doc-a.md` contains a mutable Config Reference Index listing `AGENTS.md`.
* The protected sidecar lists the inbound reference from `AGENTS.md` to the protected document.
* The protected document contains ordinary immutable content.
* `test-skill/SKILL.md` has valid frontmatter and required-reading roles.
* Every role resolves.

Run:

```text
npm run check:config-references
npm run check:skill-contracts
npm run check:protected-surfaces
```

Expected:

```text
PASS
PASS
PASS
```

Commit this state.

Record the baseline commit SHA.

---

# Reference-Reconciliation Tests

## Step 5 — Add a mutable marked reference

1. Add `docs/doc-b.md`.
2. Add a marked reference from `AGENTS.md` to `docs/doc-b.md`.
3. Add `AGENTS.md` to `docs/doc-b.md`’s reverse index.
4. Stage all affected files.
5. Run:

```text
npm run check:config-references
```

Expected:

```text
PASS
```

---

## Step 6 — Add a mutable reference without its reverse index

1. Add another marked mutable reference.
2. Do not update the target reverse index.
3. Stage only the source.
4. Run:

```text
npm run check:config-references
```

Expected:

```text
FAIL
```

The diagnostic must identify the missing reverse-index entry.

Reset the fixture afterward.

---

## Step 7 — Retarget a marked reference correctly

1. Change a marked reference from `docs/doc-a.md` to `docs/doc-b.md`.
2. Remove the source from the old target index.
3. Add the source to the new target index.
4. Stage source, old index, and new index.
5. Run the checker.

Expected:

```text
PASS
```

---

## Step 8 — Retarget without cleaning the old target

1. Change the reference target.
2. Update only the new target index.
3. Leave the old target index stale.
4. Stage the files.
5. Run the checker.

Expected:

```text
FAIL
```

The diagnostic must identify the stale old-target entry.

---

## Step 9 — Remove a marker as a bypass attempt

1. Remove `config-docref` from a governed source.
2. Leave the reverse index unchanged.
3. Stage the source.
4. Run the checker.

Expected:

```text
FAIL
```

The checker must detect the orphaned reverse-index entry.

---

# Protected-Reference Tests

## Step 10 — Add a protected reference correctly

1. Add a marked reference to `docs/architecture/frozen.md`.
2. Do not edit `frozen.md`.
3. Add the source entry to the protected sidecar.
4. Stage the source and sidecar.
5. Run:

```text
npm run check:config-references
npm run check:protected-surfaces
```

Expected:

```text
PASS
PASS
```

This proves that protected references are reconciled through the sidecar.

---

## Step 11 — Add a protected reference without sidecar evidence

1. Add a marked reference to the protected document.
2. Do not update the protected sidecar.
3. Stage only the source.
4. Run the reference checker.

Expected:

```text
FAIL
```

The diagnostic must identify the missing protected-sidecar entry.

---

## Step 12 — Edit the protected body directly

1. Modify `docs/architecture/frozen.md`.
2. Stage the protected file.
3. Do not change any references.
4. Run:

```text
npm run check:config-references
npm run check:protected-surfaces
```

Expected:

```text
check:config-references → PASS
check:protected-surfaces → FAIL
```

This is the required result.

The reference checker may pass because reference integrity did not change.

The protected-surface checker must fail because protected bytes changed.

Do not classify this as a conditional pass.

Classify it as:

```text
reference integrity: PASS
protected-body immutability: PASS because the invalid edit was rejected
```

Reset the fixture afterward.

---

## Step 13 — Edit the sidecar without editing the protected body

1. Make a valid protected-reference reconciliation.
2. Update only the source and sidecar.
3. Verify the protected body is byte-identical to baseline.
4. Run all three checks.

Expected:

```text
PASS
PASS
PASS
```

---

# Protected-Surface Checker Tests

## Step 14 — Test complete staged-snapshot enforcement

The protected checker must inspect the complete staged snapshot, not only protected files changed by the current test harness.

Test:

1. Leave a protected file modification staged.
2. Make an unrelated source edit.
3. Run the protected checker.

Expected:

```text
FAIL
```

An unchanged unrelated file must not hide an already staged protected edit.

---

## Step 15 — Test commit-range enforcement

Create two temporary commits:

* base commit: protected document unchanged;
* head commit: protected document modified.

Run:

```text
npm run check:protected-surfaces -- --base <base-sha> --head <head-sha>
```

Expected:

```text
FAIL
```

Then create a commit range containing only a source and sidecar reconciliation.

Expected:

```text
PASS
```

---

## Step 16 — Test protected file deletion

1. Delete the protected file.
2. Stage the deletion.
3. Run the protected checker.

Expected:

```text
FAIL
```

---

## Step 17 — Test protected file rename

1. Rename the protected file.
2. Stage the rename.
3. Run the protected checker.

Expected:

```text
FAIL
```

A rename is a protected-surface change unless repository policy explicitly authorizes a protected migration.

---

## Step 18 — Test unknown arguments

Run:

```text
npm run check:protected-surfaces -- --unknown
```

Expected:

```text
FAIL
```

The checker must reject unknown arguments.

---

# Skill-Contract Tests

## Step 19 — Valid role-based skill

Create a skill with:

* valid `name`;
* valid `description`;
* required-reading roles;
* no duplicated concrete required-reading paths;
* no machine-absolute paths.

Run:

```text
npm run check:skill-contracts
```

Expected:

```text
PASS
```

---

## Step 20 — Missing required role

Remove or rename one required role in the repository contract.

Run the skill-contract checker.

Expected:

```text
FAIL
```

The checker must not search for a replacement file.

---

## Step 21 — Ambiguous role

Declare the same role more than once.

Expected:

```text
FAIL
```

---

## Step 22 — Bare required-reading filename

Add a required-reading entry such as:

```text
EXPFLOW_WORKFLOW_CURRENT.md
```

without using a semantic role.

Expected:

```text
FAIL
```

---

## Step 23 — Invalid frontmatter

Test separately:

* missing `name`;
* missing `description`;
* malformed YAML.

Each must fail.

---

## Step 24 — Full-snapshot stale dependency test

1. Commit an invalid skill dependency.
2. Modify and stage only an unrelated file.
3. Run `check:skill-contracts`.

Expected:

```text
FAIL
```

The checker must validate the complete declared Git-index snapshot, not only changed skill files.

---

## Step 25 — Repository relocation

Copy or clone the test repository to another directory.

Run:

```text
npm run check:config-references
npm run check:skill-contracts
npm run check:protected-surfaces
```

Expected:

```text
PASS
PASS
PASS
```

Search repository files for the original absolute checkout path.

Expected:

```text
0 matches
```

---

# Global Manager Tests

## Step 26 — Repository-local precedence

Install or expose the global manager in the test environment.

Confirm it discovers, in order:

1. Git root;
2. repository governance;
3. repository contract;
4. repository-local reconciliation skill;
5. repository-owned commands;
6. existing hook and CI state.

Expected:

```text
PASS
```

The global manager must defer to the repository-local skill.

---

## Step 27 — Global skill relocation

Move or copy the global skill to another valid skill root.

Run global-skill validation.

Expected:

```text
PASS
```

Repository checks must produce the same results before and after relocation.

---

## Step 28 — No repository dependency on the global skill

Temporarily make the global skill unavailable.

Run all repository checks.

Expected:

```text
PASS
```

Repository validation must not depend on user-home skill files.

---

## Step 29 — Ordinary edit must not install infrastructure

Perform a normal reference reconciliation.

Verify:

* no hook manager was installed;
* `.git/hooks` was not edited;
* no CI file was created or changed;
* no package manager was added.

Expected:

```text
PASS
```

---

## Step 30 — Missing role hard stop

Break a required role target.

The global manager must stop and report the missing role.

It must not:

* search broadly and substitute a file;
* create a new document;
* invent a replacement path.

Expected:

```text
PASS
```

---

# Final Validation

## Step 31 — Run the complete repository suite

Run:

```text
npm run check:config-references
npm run check:skill-contracts
npm run check:protected-surfaces
```

Then run any focused test suite created for the three checkers.

All valid baseline fixtures must pass.

Every invalid fixture must fail for the intended reason.

---

## Step 32 — Produce the corrected report

The new report must separate:

```text
repository_validation
global_skill_validation
optional_external_harness
```

The repository section must include:

```text
config_references
skill_contracts
protected_surfaces_staged
protected_surfaces_commit_range
repository_relocation
```

Do not give a conditional pass merely because an invalid protected edit was possible to stage.

The correct evaluation question is whether the repository-owned protected-surface checker rejected it.

---

# Verdict Rules

## GO

Return `GO` only when:

* all valid reference transactions pass;
* incomplete reference transactions fail;
* protected references route through the sidecar;
* direct protected-body edits fail;
* protected deletion and rename fail;
* staged and commit-range protected checks pass;
* role errors fail deterministically;
* full-snapshot skill validation catches unchanged stale dependencies;
* relocation tests pass;
* repository checks remain independent of the global skill;
* no machine paths are persisted.

## CONDITIONAL GO

Return `CONDITIONAL GO` only when repository protection works and the remaining issue is limited to optional external evidence.

## NO-GO

Return `NO-GO` when:

* protected-body mutation passes the protected-surface checker;
* protected enforcement exists only as skill prose;
* repository checks require the global skill installation;
* missing roles trigger path guessing;
* only changed files are checked and unchanged stale dependencies survive;
* staged and commit-range modes disagree.
