#!/usr/bin/env node
/**
 * Expflow CLI — Phase 1 scaffold.
 *
 * Implements --help, --version, and not-implemented guard.
 * No product runtime behavior exists in Phase 1.
 */

const VERSION = '0.0.0-phase.1';

const HELP_TEXT = `Expflow — schema-governed workflow ownership and observability

USAGE
  expflow <command> [options]

ORDINARY COMMANDS (not implemented in Phase 1)
  init       Initialize a new Expflow project
  sync       Observe and commit material changes
  status     Report integrated project status
  restore    Restore a prior revision

OPTIONS
  --help, -h        Print this help and exit
  --version, -v     Print version and exit

Expflow Phase 1 — repository contract scaffold. No product runtime is implemented.
`;

function main(): void {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    process.stderr.write('expflow: no command specified. Use --help for usage.\n');
    process.exit(2);
  }

  const first = args[0] ?? '';

  // --help / -h
  if (first === '--help' || first === '-h') {
    process.stdout.write(HELP_TEXT);
    process.exit(0);
  }

  // --version / -v
  if (first === '--version' || first === '-v') {
    process.stdout.write(`${VERSION}\n`);
    process.exit(0);
  }

  // Any other argument — not implemented
  process.stderr.write(`expflow: '${first}' is not implemented in Phase 1\n`);
  process.exit(2);
}

main();
