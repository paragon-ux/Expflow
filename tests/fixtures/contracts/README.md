# Contract Fixtures

Gate A fixture categories:

- `valid/` -- schema-valid core record examples;
- `invalid/` -- schema-invalid records expected to fail validation;
- `compatibility/` -- compatibility policy examples;
- `recovery/` -- recovery-classification examples as contract data only;
- `tree-digests/` -- canonical tree-content digest vectors;
- `examples/` -- fixture notes for supplied architecture examples.

These are seed fixtures for the Gate A validation harness. Later gates add behavior-specific fixtures when they implement the owning runtime behavior.

The taxonomy and seed corpus are verified by `npm run fixtures:verify` and `npm run schemas:examples-validate`.
