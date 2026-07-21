---
name: config-reference-reconciliation
description: Reconcile marked config-document references and their reverse indexes with the repository's deterministic checker. Use when adding, removing, retargeting, renaming, or deleting a marked config-docref reference in AGENTS.md, repository skill files, internal phase prompts, workflow documentation, CI configuration, or marked configuration and script files.
---

# Config Reference Reconciliation

## Purpose

- Defines: the workflow for changing marked config-document references and reconciling their reverse indexes.
- Boundary: this skill is a thin wrapper over the deterministic repository checker. It does not prove correctness itself.

## Required Reading

- Read `.config-reference-reconciliation.yaml` first when it exists.
- Resolve the required reading roles below through the repository contract. Contract paths override global templates.
- Confirm that `npm run check:config-references` exists before editing marked references.

## Required Reading Roles

1. `repository_governance`
2. `reconciliation_policy`

## Governing Rule

> A marked config-reference change is incomplete until `npm run check:config-references` passes against the staged snapshot.

For CI diagnosis, use the same checker in commit-range mode:

```bash
npm run check:config-references -- --base <base-sha> --head <head-sha>
```

## Procedure

1. Identify every marked config-document reference affected by the task.
2. Preserve strict marker binding: inline marker on the same line, or standalone marker for only the next non-empty, non-structural line.
3. Update the source reference and the affected target index in the same change.
4. For mutable targets, update the target document's `Config Reference Index`.
5. For `docs/architecture/` or `docs/releases/` targets, update `docs/internal/PROTECTED_CONFIG_REFERENCE_INDEX.md`; do not edit protected target bodies.
6. Stage only the relevant source, target-index, and sidecar files when staging is safe. Preserve unrelated staged changes.
7. Run `npm run check:config-references`.
8. If the command reports an incomplete retarget, stale target rename/delete, strict JSON marker failure, marker-removal bypass, or any other failure, stop and reconcile the reported source and target index. Do not report completion while it fails.
9. Include the checker result in the completion report.

## Prohibitions

- Do not implement a separate reference scanner in the skill.
- Do not infer correctness from prose inspection alone.
- Do not use working-tree content to override a staged failure.
- Do not edit `.git/hooks/` ad hoc.
- Do not use `git commit --no-verify`, bypass the hook, or weaken marker detection.
- Do not unmark a governed reference merely to make the check pass.
- Do not claim CI support from a staged no-op check; CI requires passing commit-range mode.
- Do not modify frozen release documents or immutable architecture bodies.
- Do not create logical document IDs, a registry, a codemod platform, or broad search-and-replace.

## Tests

- Required check after any marked reference change: `npm run check:config-references`.
- Required check after repository skill or workflow path-contract changes: `npm run check:skill-contracts`.
- Use focused tests or repository validation when the checker, marker rules, target indexes, sidecar, or this skill changes.

## Completion Evidence

- Report: changed marked references, target indexes updated, protected sidecar updates, checker command result, and any unresolved unmarked/stale candidates.
- Completion condition: the deterministic checker passes against the staged snapshot, or the task is reported blocked with the checker failure intact.
