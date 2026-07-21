# Config Reference Reconciliation

Marked config-document references are governed by the repository checker:

```bash
npm run check:config-references
```

Default local mode compares staged changes against `HEAD`. Unstaged edits never satisfy it.

CI uses commit-range mode:

```bash
npm run check:config-references -- --base <base-sha> --head <head-sha>
```

Unknown arguments fail. `--ci` is not a supported alias.

## Role-Based Skill Contracts

Repository skill required-reading dependencies are declared by semantic role in the skill body and resolved through the repository contract:

```text
.config-reference-reconciliation.yaml
```

Use:

```bash
npm run check:skill-contracts
```

to validate the complete Git-index snapshot for repository-declared skills, workflows, role mappings, role target existence, dependency ordering, and skill frontmatter.

Use commit-range mode in CI:

```bash
npm run check:skill-contracts -- --base <base-sha> --head <head-sha>
```

Role resolution proves that a required semantic role exists, resolves to a repository-local target, and appears in a valid order. Config-reference reconciliation proves that a marked concrete source-target reference change is reconciled with the target index or protected sidecar. The checks are separate and composable.

Do not repeat current governance paths in repository skill required-reading blocks. Use `## Required Reading Roles` and resolve those roles through the contract. Supporting references, examples, and evidence citations may remain explicit repository-relative paths when they are not operational dependencies.

Skill frontmatter remains limited to `name` and `description`; do not add custom role metadata to YAML frontmatter.

## Governed Sources

The checker evaluates marked references in:

- `AGENTS.md` and nested `AGENTS.md` files
- `.agents/skills/**/SKILL.md`
- `docs/internal/phase_prompts/**/*.md`
- `docs/internal/**/*WORKFLOW*.md`
- marked YAML, JSON, JSONC, TOML, shell, PowerShell, batch, and command files

Unmarked references are outside ongoing enforcement.

## Marker Rules

Use `config-docref`.

Inline markers bind only to the same line:

```markdown
[Workflow](docs/internal/BUILD_WEEK_WORKFLOW_CURRENT.md) <!-- config-docref -->
```

Standalone markers bind only to the next non-empty, non-structural line:

```markdown
<!-- config-docref -->

[Workflow](docs/internal/BUILD_WEEK_WORKFLOW_CURRENT.md)
```

Structural boundaries include Markdown headings, fenced-code opening or closing boundaries, another `config-docref` marker, and end of file. A standalone marker does not bind across those boundaries.

Plain JSON must use the explicit object form:

```json
{
  "workflowDocument": {
    "path": "docs/internal/BUILD_WEEK_WORKFLOW_CURRENT.md",
    "configDocref": true
  }
}
```

Every JSON object with `configDocref: true` must contain exactly one non-empty string `path` value that resolves to a repository-local file. Missing paths, non-string paths, empty paths, URLs, paths outside the repository, and malformed JSON fail.

One marker may govern only one repository-local file reference.

## Mutable Target Index

Mutable targets record inbound marked config references in the target document:

```markdown
## Config Reference Index

<!-- config-reference-index:start -->

- `AGENTS.md` - optional human context

<!-- config-reference-index:end -->
```

Entries are one per source file and sorted lexicographically by source path. The checker verifies this section but does not rewrite it.

When a mutable target is renamed, every indexed inbound source must be updated to the new target path, and the new target's index must preserve the source entry. When a mutable target is deleted, every indexed inbound source must remove the governed reference. Stale inbound references to the old target path fail even when the source file was otherwise unchanged.

## Protected Targets

Never edit protected target bodies for reconciliation:

- `docs/architecture/`
- `docs/releases/`

Record marked inbound references to protected targets in `docs/internal/PROTECTED_CONFIG_REFERENCE_INDEX.md`.

Protected and frozen target bodies remain unchanged. Protected target moves are not repaired by editing the protected document body.

## Marker Removal

Removing `config-docref` is not a reconciliation repair when the same target path remains in the source. If a previously governed target path remains present without the marker, the checker fails with an explicit bypass message.

Marker removal is allowed only when the governed target reference itself is removed, or when a source deletion/rename remains reconciled through the affected mutable index or protected sidecar.

## CI Integration

`.github/workflows/phase-1-contract.yml` invokes the checker in verify-only commit-range mode after Node dependencies are installed:

```bash
npm run check:config-references -- --base "$BASE_SHA" --head "$HEAD_SHA"
```

Pull requests use the event's base and head commit values. Push events use the before/after range and skip only the all-zero initial-push `before` value. CI checks out enough Git history to make both commits available, performs no reconciliation edits, invokes no LLM, installs no local hooks, and embeds no checker logic in workflow YAML.

## Local Hook Status

This repository does not currently use a hook manager. The tracked wrapper at `tools/hooks/pre-commit-config-references` is provided for local installation, but the authoritative command remains:

```bash
npm run check:config-references
```

Do not edit `.git/hooks/` ad hoc during repository tasks. Do not bypass the check.

## Troubleshooting

When the check fails, update the source reference and affected target index or protected sidecar in the same staged change, then rerun:

```bash
npm run check:config-references
```

Ordinary Markdown links, examples, evidence paths, and navigation links are not governed unless they carry the marker.

## Config Reference Index

<!-- config-reference-index:start -->

- `.config-reference-reconciliation.yaml` - reconciliation policy role

<!-- config-reference-index:end -->
