#!/usr/bin/env node
import { createRuntime } from '../operations/runtime.js';
import { VERSION } from '../core/version.js';

const HELP_TEXT = `Expflow - schema-governed workflow ownership and observability

USAGE
  expflow <command> [options]

ORDINARY COMMANDS
  init       Initialize a new Expflow project
  sync       Observe and commit material changes
  status     Report integrated project status
  restore    Restore a prior revision

OPTIONS
  --root <path>     Project root (defaults to current directory)
  --json            Print machine-readable JSON
  --dry-run         For sync, print the candidate plan without committing
  --help, -h        Print this help and exit
  --version, -v     Print version and exit

Gate B implements local material-core behavior only. Adapter inspection,
change cursors, request idempotency, and reconciliation are not core commands.
`;

interface ParsedArgs {
  readonly command: string | null;
  readonly root: string | undefined;
  readonly json: boolean;
  readonly dryRun: boolean;
  readonly expectedHead: string | null | undefined;
  readonly reference: string | undefined;
  readonly changes: {
    readonly kind: 'move' | 'modify';
    readonly path: string;
    readonly from_path?: string | null;
    readonly identity_directive: 'auto' | 'preserve' | 'new' | 'replace';
  }[];
}

function takeValue(args: string[], index: number, option: string): string {
  const value = args[index + 1];
  if (value === undefined) {
    throw new Error(`${option} requires a value`);
  }
  args.splice(index, 2);
  return value;
}

function parseArgs(rawArgs: string[]): ParsedArgs {
  const args = [...rawArgs];
  let root: string | undefined;
  let json = false;
  let dryRun = false;
  let expectedHead: string | null | undefined;
  const changes: ParsedArgs['changes'] = [];

  for (let index = 0; index < args.length;) {
    const arg = args[index];
    if (arg === '--root') {
      root = takeValue(args, index, '--root');
      continue;
    }
    if (arg === '--json') {
      json = true;
      args.splice(index, 1);
      continue;
    }
    if (arg === '--dry-run') {
      dryRun = true;
      args.splice(index, 1);
      continue;
    }
    if (arg === '--expected-head') {
      expectedHead = takeValue(args, index, '--expected-head');
      continue;
    }
    if (arg === '--move') {
      const value = takeValue(args, index, '--move');
      const separator = value.indexOf(':');
      if (separator < 1) {
        throw new Error('--move expects from:to');
      }
      changes.push({
        from_path: value.slice(0, separator),
        identity_directive: 'preserve',
        kind: 'move',
        path: value.slice(separator + 1),
      });
      continue;
    }
    if (arg === '--new-node') {
      changes.push({
        identity_directive: 'new',
        kind: 'modify',
        path: takeValue(args, index, '--new-node'),
      });
      continue;
    }
    if (arg === '--replace-node') {
      changes.push({
        identity_directive: 'replace',
        kind: 'modify',
        path: takeValue(args, index, '--replace-node'),
      });
      continue;
    }
    index += 1;
  }

  return {
    changes,
    command: args[0] ?? null,
    dryRun,
    expectedHead,
    json,
    reference: args[1],
    root,
  };
}

function printResult(value: unknown, json: boolean, fallback: string): void {
  if (json) {
    process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
  } else {
    process.stdout.write(`${fallback}\n`);
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const first = args[0] ?? '';
  if (args.length === 0 || first === '--help' || first === '-h') {
    process.stdout.write(HELP_TEXT);
    process.exit(0);
  }

  if (first === '--version' || first === '-v') {
    process.stdout.write(`${VERSION}\n`);
    process.exit(0);
  }

  const parsed = parseArgs(args);
  const runtime = createRuntime();

  if (parsed.command === 'init') {
    const result = await runtime.init({ root: parsed.root });
    printResult(
      result,
      parsed.json,
      `initialized ${result.project_id} at ${result.new_head ?? 'no-head'}`,
    );
    return;
  }

  if (parsed.command === 'sync') {
    if (parsed.dryRun) {
      const plan = await runtime.planSync({
        changes: parsed.changes,
        expectedHead: parsed.expectedHead,
        root: parsed.root,
      });
      printResult(
        plan,
        parsed.json,
        `dry-run ${String(plan.new_node_revisions.length)} node revision(s)`,
      );
      return;
    }
    const result = await runtime.sync({
      changes: parsed.changes,
      expectedHead: parsed.expectedHead,
      root: parsed.root,
    });
    printResult(result, parsed.json, `${result.status} ${result.new_head ?? 'no-head'}`);
    return;
  }

  if (parsed.command === 'status') {
    const result = await runtime.status({ root: parsed.root });
    printResult(result, parsed.json, result.working_tree_state);
    return;
  }

  if (parsed.command === 'restore') {
    if (parsed.reference === undefined) {
      throw new Error('restore requires a tree:<id> or node:<id>@<revision>:<path> reference');
    }
    const result = await runtime.restore({ reference: parsed.reference, root: parsed.root });
    printResult(result, parsed.json, `${result.status} ${result.new_head ?? 'no-head'}`);
    return;
  }

  process.stderr.write(
    `expflow: unknown command '${parsed.command ?? ''}'. Use --help for usage.\n`,
  );
  process.exit(2);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`expflow: ${message}\n`);
  process.exit(1);
});
