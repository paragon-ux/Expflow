# Release Publishing

**Status:** v1.0.1 hotfix candidate

Expflow releases use short-lived OIDC credentials through registry Trusted Publishing. Do not add persistent npm or PyPI tokens to repository files, workflow secrets, logs, artifacts, or completion reports.

The release workflow identity is:

```text
Owner: paragon-ux
Repository: Expflow
Workflow: release.yml
Tag: v1.0.1
```

## v1.0.1 Hotfix Candidate

The v1.0.1 hotfix candidate updates package metadata, release workflow guards, and release notes for `v1.0.1`. It must not be treated as published until:

- the hotfix PR is merged to `main`;
- tag `v1.0.1` is created on the merged `main` commit;
- the release workflow verifies `expflow@1.0.1`;
- the release workflow verifies `expflow-hooks==1.0.1`;
- the GitHub Release `v1.0.1` is created from `docs/release_notes/GITHUB_RELEASE_NOTE_V1_0_1.md`.

## Prior Public v1 Publication Result

As of the local publication check on 2026-07-18:

- The previous public v1 tag exists and is protected as release history.
- The previous public v1 GitHub Release exists with registry-matching assets.
- Public npm and PyPI registry artifacts for the previous v1 release are externally verified.
- Clean external npm and Python installs for the previous v1 release report the expected package versions.
- GitHub environments API reports `release-npm` and `release-pypi` configured with required reviewer `paragon-ux`.
- GitHub Private Vulnerability Reporting API reports `enabled: true`.

The first public v1 release workflow run built, validated, uploaded, and attested release artifacts, then published PyPI successfully. The run failed after publication because npm verification rejected an ambient `NODE_AUTH_TOKEN` and PyPI verification queried the version endpoint before propagation completed. Public registry installation checks and the GitHub Release assets now verify the published release.

## npm Owner Maintenance

For future releases:

- keep account or organization ownership for the public npm package name `expflow`;
- keep npm Trusted Publishing configured for GitHub Actions:
  - owner or user: `paragon-ux`;
  - repository: `Expflow`;
  - workflow filename: `release.yml`;
  - environment: `release-npm`;
  - allowed action: `npm publish`;
- approve the protected GitHub environment `release-npm` when the release workflow pauses;
- after successful OIDC publication, restrict or disallow traditional publish tokens where appropriate;
- revoke obsolete automation tokens.

## PyPI Owner Maintenance

For future releases:

- keep project `expflow-hooks` under the expected owner;
- keep PyPI Trusted Publishing configured:
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
- protect the `v1.0.1` tag and existing public release tags, or a matching release-tag pattern where repository settings permit it;
- protect changes to `.github/workflows/release.yml` through normal branch review.

## Publication Order

The release workflow builds npm and Python artifacts once from the tag commit, verifies checksums, attests the exact artifacts, publishes those same artifacts to npm and PyPI through OIDC, verifies both registries, and only then creates or verifies the GitHub Release.

If one registry succeeds and the other fails:

- do not delete or move the tag;
- do not create the GitHub Release unless both public registry artifacts are independently verified;
- correct only the failing registry configuration;
- rerun failed jobs;
- treat an existing matching registry version for the active release tag as verified success;
- stop permanently if an existing active release registry version does not match the locally built artifact.
