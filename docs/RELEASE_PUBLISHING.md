# Release Publishing

**Status:** owner-action checklist for v1.0.0 registry publication

Expflow v1.0.0 publication uses short-lived OIDC credentials through registry Trusted Publishing. Do not add persistent npm or PyPI tokens to repository files, workflow secrets, logs, artifacts, or completion reports.

The release workflow identity is:

```text
Owner: paragon-ux
Repository: Expflow
Workflow: release.yml
Tag: v1.0.0
```

## Current Preflight Result

As of the local preflight on 2026-07-18:

- `origin/main` includes the merged dual-registry release workflow, package-only quickstart, and release-status refreshes.
- The latest validated package-readiness commit is `c3ed67613ac951f5199081ac1f64fff546c06165`; later status-only documentation refreshes do not change packaged npm or PyPI artifact bytes.
- Hosted CI run `29623452896` passed on `c3ed67613ac951f5199081ac1f64fff546c06165`.
- Remote tag `v1.0.0` is absent after stale-tag cleanup.
- GitHub Release `v1.0.0` is absent.
- `npm view expflow --json` returns registry 404, so npm package ownership is not proven by package metadata.
- `npm whoami` returns `ENEEDAUTH`, so this machine cannot verify npm owner-side Trusted Publishing state.
- PyPI project `expflow-hooks` returns registry 404, so PyPI project ownership is not proven by package metadata and needs a pending Trusted Publisher.
- GitHub environments API reports `release-npm` and `release-pypi` configured with required reviewer `paragon-ux`.
- GitHub Private Vulnerability Reporting API reports `enabled: true`.

The stale tag/release conflict is cleared. Do not create `v1.0.0` until npm/PyPI Trusted Publisher setup has been verified and hosted CI is green on the exact intended tag commit.

## npm Owner Actions

Before tagging or rerunning publication:

- verify account or organization ownership for the public npm package name `expflow`;
- configure npm Trusted Publishing for GitHub Actions:
  - owner or user: `paragon-ux`;
  - repository: `Expflow`;
  - workflow filename: `release.yml`;
  - environment: `release-npm`;
  - allowed action: `npm publish`;
- approve the protected GitHub environment `release-npm` when the release workflow pauses;
- after successful OIDC publication, restrict or disallow traditional publish tokens where appropriate;
- revoke obsolete automation tokens.

If npm cannot establish Trusted Publishing for an unpublished `expflow` package, stop for an owner decision. Do not rename the package or add token fallback logic in `release.yml`.

Acceptable owner-controlled bootstrap choices are:

- establish the package through an npm-supported trusted or staged first-publication path; or
- perform a one-time separately authorized bootstrap publication, immediately configure Trusted Publishing, restrict token access, and revoke any bootstrap credential.

## PyPI Owner Actions

Before tagging or rerunning publication:

- create or verify project `expflow-hooks`;
- for a new project, create a pending PyPI Trusted Publisher:
  - project: `expflow-hooks`;
  - owner: `paragon-ux`;
  - repository: `Expflow`;
  - workflow: `release.yml`;
  - environment: `release-pypi`;
- approve the protected GitHub environment `release-pypi` when the release workflow pauses;
- do not create a long-lived PyPI API token.

## GitHub Owner Actions

Before publication:

- verify GitHub Private Vulnerability Reporting remains enabled for suspected vulnerabilities;
- verify protected release environments `release-npm` and `release-pypi` remain configured with required reviewer `paragon-ux`;
- protect the `v1.0.0` tag or a matching release-tag pattern where repository settings permit it;
- protect changes to `.github/workflows/release.yml` through normal branch review.

## Publication Order

The release workflow builds npm and Python artifacts once from the tag commit, verifies checksums, attests the exact artifacts, publishes those same artifacts to npm and PyPI through OIDC, verifies both registries, and only then creates or verifies the GitHub Release.

If one registry succeeds and the other fails:

- do not delete or move the tag;
- do not create the GitHub Release yet;
- correct only the failing registry configuration;
- rerun failed jobs;
- treat an existing matching `1.0.0` registry version as verified success;
- stop permanently if an existing `1.0.0` registry version does not match the locally built artifact.
