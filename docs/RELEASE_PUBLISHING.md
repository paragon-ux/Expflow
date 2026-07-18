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

As of the local preflight on 2026-07-17:

- `origin/main` is `7b91cf71c464ba2610503d3e70ecef6277503370`.
- Remote tag `v1.0.0` exists at `7b91cf71c464ba2610503d3e70ecef6277503370`.
- GitHub Release `v1.0.0` exists at <https://github.com/paragon-ux/Expflow/releases/tag/v1.0.0>.
- `npm view expflow --json` returns registry 404, so npm package ownership is not proven by package metadata.
- PyPI project `expflow-hooks` returns registry 404, so PyPI project ownership is not proven by package metadata and needs a pending Trusted Publisher.
- GitHub environments API reports zero configured environments, so `release-npm` and `release-pypi` still need owner setup.
- GitHub Private Vulnerability Reporting API reports `enabled: false`, so private vulnerability reporting still needs owner setup.

Because the GitHub Release already exists while public npm and PyPI publication are absent, release state is inconsistent with the final dual-registry sequence. Do not move or recreate `v1.0.0` without explicit owner authorization.

## npm Owner Actions

Before tagging or rerunning publication:

- verify account or organization ownership for the public npm package name `expflow`;
- configure npm Trusted Publishing for GitHub Actions:
  - owner or user: `paragon-ux`;
  - repository: `Expflow`;
  - workflow filename: `release.yml`;
  - environment: `release-npm`;
  - allowed action: `npm publish`;
- create the protected GitHub environment `release-npm` and require owner or maintainer approval;
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
- create the protected GitHub environment `release-pypi` and require owner or maintainer approval;
- do not create a long-lived PyPI API token.

## GitHub Owner Actions

Before publication:

- enable GitHub Private Vulnerability Reporting for suspected vulnerabilities;
- create protected release environments `release-npm` and `release-pypi`;
- add required reviewers to both environments;
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
