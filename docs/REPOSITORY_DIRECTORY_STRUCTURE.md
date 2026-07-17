# Repository Directory Structure

**Status:** authoritative mutable directory-structure control for the v1.0.0 release-candidate revision.

This document defines how tracked, untracked, generated, package, and release-facing files should be separated for the current revision. It does not override `AGENTS.md`, immutable architecture sources, package manifests, or validation contracts. It gives release-closeout agents a stable placement rule so cleanup can happen by moving, ignoring, excluding, or curating files rather than deleting useful material.

## Authority And Scope

- `AGENTS.md` remains the highest repository governance source.
- `docs/architecture/**` remains immutable architecture input and must not be edited by directory cleanup.
- This document governs repository placement and tracked/untracked separation for release preparation.
- Package inclusion is controlled by `package.json`, `pyproject.toml`, and release tooling; this document defines the intended source layout those tools should reflect.
- Existing tracked paths that conflict with this structure should be resolved during release closeout by moving or untracking with explicit approval, not by deleting files.

## Directory Classes

| Class                         | Meaning                                                                                                                                                          | Default action                            |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| Tracked release source        | Source, tests, schemas, examples, public docs, CI, and package metadata needed to build, validate, or understand the released project.                           | Keep tracked.                             |
| Tracked release evidence      | Completion reports, PR reviews, release closeout reports, and curated external-reference summaries that need to survive review.                                  | Keep tracked under `docs/`.               |
| Immutable architecture source | Source-of-truth architecture package verified by manifest.                                                                                                       | Keep tracked and do not edit.             |
| Local untracked reference     | Agent packets, source bundles, exploratory reviews, private notes, downloaded references, and bulk build inputs that are useful locally but not part of release. | Keep untracked in local-only directories. |
| Generated output              | Build output, dependency installs, caches, wheels, package archives, coverage, and temp files.                                                                   | Keep untracked and reproducible.          |

## Target Layout

```text
/
  AGENTS.md
  README.md
  README_DEV.md
  package.json
  package-lock.json
  pyproject.toml
  tsconfig*.json
  eslint.config.mjs
  vitest.config.ts
  .editorconfig
  .gitattributes
  .gitignore
  .prettierignore
  .prettierrc.json

  .github/                         tracked CI and repository automation
  .agents/                         tracked agent skills and repo-local agent controls

  docs/                            tracked documentation and release evidence
    REPOSITORY_DIRECTORY_STRUCTURE.md
    architecture/                  tracked immutable architecture source package
    completion_reports/            tracked phase, gate, and release evidence
    orientation/                   tracked mutable System 1/System 2 pass controls
    release_notes/                 tracked standalone release notes for GitHub/releases
    reviews/                       tracked curated PR/review reports when they must persist

  src/                             tracked TypeScript source
  python/                          tracked Python hook-package source and tests
  tests/                           tracked repository, runtime, package, and proof tests
  schemas/                         tracked working schema mirror
  examples/                        tracked working example mirror
  registries/                      tracked decision and contract registries

  build-docs/                      local untracked build/input/reference packets by default
    tracked/                       transitional only; avoid for new release evidence
    untracked/                     local-only source packets, drafts, and bulky references

  .reasonix/                       local untracked tool/reference state
  build/                           generated package/build output
  dist/                            generated TypeScript output
  node_modules/                    installed dependencies
  .pytest_cache/                   generated Python test cache
```

## Tracked Placement Rules

Track a file when at least one of these is true:

- It is required to build, test, package, or run the released core.
- It is part of the immutable architecture source package.
- It is public-facing product, developer, security, contribution, license, or release documentation.
- It is a mutable completion report, release report, review report, or orientation document that must survive handoff.
- It is a small curated external-reference summary needed to explain an accepted release boundary.

Tracked release evidence belongs under `docs/`, not `build-docs/`. Use:

- `docs/completion_reports/` for phase, gate, and release closeout evidence.
- `docs/orientation/` for System 1/System 2 operating decisions.
- `docs/release_notes/` for standalone GitHub or package-release notes.
- `docs/reviews/` for curated PR review reports that should remain versioned.

## Untracked Placement Rules

Keep a file untracked when it is useful locally but not part of the release source, release evidence, package, or public docs:

- Downloaded source packs.
- Agent scratch outputs.
- Exploratory architecture drafts.
- Large local reference bundles.
- Private notes.
- Intermediate build artifacts.
- Generated output that can be rebuilt from tracked sources.

Use `build-docs/` for local input/reference packets and `.reasonix/` for local tool/reference state. Prefer placing local-only build-doc material under `build-docs/untracked/` when arranging the workspace for release review.

Do not delete these files during release cleanup. Leave them untracked, ignore them, or exclude them from package/release artifacts. If a local artifact contains a small piece of evidence that must survive, curate that evidence into a tracked `docs/` file instead of tracking the whole local packet.

## Build-Docs Split Rule

For this revision, `build-docs/` is local/untracked by default. The tracked source tree should contain no `build-docs/**` paths.

If a file currently under `build-docs/` must remain tracked, move or copy its curated content to one of these tracked locations during release closeout:

- `docs/reviews/` for PR review reports.
- `docs/completion_reports/` for formal closeout evidence.
- `docs/release_notes/` for GitHub or package release notes.

After the curated tracked copy exists, the original local packet can remain under `build-docs/` as untracked local reference material. Do not delete it. Do not run `git rm --cached` on tracked `build-docs/**` files unless the release report names the exact paths, explains the tracked replacement, and the user approves untracking.

## Generated Output Rules

Generated output should remain outside the tracked source surface unless a repository contract explicitly requires otherwise.

| Directory or file            | Status                       | Rule                                                                                                                               |
| ---------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `dist/`                      | generated                    | Rebuild from TypeScript; include in npm package only through package build artifacts, not as source-of-truth docs.                 |
| `build/`                     | generated                    | Treat as disposable local build output.                                                                                            |
| `node_modules/`              | generated dependency install | Never track.                                                                                                                       |
| `.pytest_cache/`             | generated cache              | Never track.                                                                                                                       |
| Python wheel/build artifacts | generated                    | Rebuild during validation; do not track unless a release artifact publication step explicitly creates them outside source control. |

## Package And Public Release Surface

The source repository and package contents are not the same surface.

- The npm package should include only intended runtime/build output and explicitly included public schema or architecture assets.
- The Python package should include only the hook-package source and intended package metadata.
- Local reference material under `build-docs/` must not be included in package artifacts.
- Public release docs should be tracked under root docs or `docs/`; private/local reference packs should not be linked as required user documentation.

## Transition Checklist

Use this checklist during the Gate D production release closeout:

- Confirm all tracked release evidence lives under `docs/`.
- Confirm `git ls-files build-docs .reasonix` returns no paths.
- Identify any tracked `build-docs/**` paths and move curated content into `docs/` before untracking the local reference packet.
- Identify untracked local/reference files and place them under local-only directories without deletion.
- Update `.gitignore` or local exclude rules only after deciding which directories are intentionally local-only.
- Verify package manifests exclude local-only directories.
- Update top-level README files only when their directory purpose or release boundary changed.
- Run formatting and repository validation after structural edits.

## Stop Conditions

Stop and ask for explicit approval before:

- Deleting local/reference files.
- Untracking a currently tracked path.
- Moving immutable architecture sources.
- Moving package source, tests, schemas, examples, or registries in a way that changes validation contracts.
- Adding build-docs or local reference packets to package artifacts.
