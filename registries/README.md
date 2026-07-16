# Registries

Gate A registries are machine-readable contract data. They are not runtime configuration and do not implement Expflow behavior.

| File                    | Purpose                                                                                  |
| ----------------------- | ---------------------------------------------------------------------------------------- |
| `core-contracts.json`   | Core workflow gate, schema, command, error-code, and adapter-deferral registry.          |
| `decision-vectors.json` | Executable index of frozen architecture decisions from `docs/ARCHITECTURE_DECISIONS.md`. |

Registry validation is performed by `npm run registries:verify`.
