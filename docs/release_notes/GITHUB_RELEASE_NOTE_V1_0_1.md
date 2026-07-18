# Expflow v1.0.1

Expflow v1.0.1 is a patch hotfix for the local material-core runtime.

## Install

```bash
npm install -g expflow
```

The npm package provides the `expflow` CLI, TypeScript library exports, schemas, and architecture assets.

```bash
pip install expflow-hooks
```

The Python package is a hook scaffold and read-only architecture schema discovery surface. It does not dispatch or execute hooks.

## Hotfix

- Fixed post-restore same-path revision allocation. After restoring an older tree revision, a later same-path edit now allocates the next durable node revision above all persisted history, preventing an `immutable_record_conflict` against an existing historical node-revision file.

## Compatibility

This release does not change the v1 compatibility promise, public command names, schema version, package identities, ordinary command boundary, storage model, or adapter deferral boundary.

## Publication

- Package build tag: `v1.0.1`
- npm package: `expflow@1.0.1`
- PyPI package: `expflow-hooks==1.0.1`

The `v1.0.0` release remains the first public v1 release. This release supersedes it for users who rely on `expflow restore` followed by ordinary same-path `expflow sync`.
