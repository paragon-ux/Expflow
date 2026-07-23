#!/usr/bin/env node
import { ExpflowError, toExpflowError } from '../core/errors.js';
import { VERSION } from '../core/version.js';
import { createRuntime } from '../operations/runtime.js';
import {
  errorObject,
  formatErrorBlock,
  formatNodeHistory,
  formatReceipt,
  formatRestorePreview,
  formatRevisionHistory,
  formatStatusReport,
  formatSyncPreview,
  type NodeHistoryEntry,
  type RevisionHistoryEntry,
} from './format.js';
import type { StatusReportRecord } from '../material/types.js';

const HELP_TEXT = `Expflow - schema-governed workflow ownership and observability

USAGE
  expflow <command> [options]

ORDINARY COMMANDS
  init       Initialize a new Expflow project
  sync       Observe and commit material changes
  status     Report project state and restorable references
  restore    Preview or restore a prior project version

1.2.1 COMMANDS
  capabilities   Print capability descriptor and exit
  inspect        Inspect project state (alias for status with summary)
  history        List project version history with restore references
  workflow       Workflow operations (list, show, start, output, state)
  evidence       Evidence intake and inspection (list, add-file, add-transcript, add-manifest, add-reference, show)
  authority      Source and authority decisions (list, show, propose, accept, reject, supersede)
  conflicts      List conflicts and declare new ones (list, show, declare)
  decisions      Decisions and reviews (list, show, record, supersede)
  package        Export, validate, import workflow packages (list, export, import, validate, plan-import, inspect)

GLOBAL OPTIONS
  --root <path>     Project root (defaults to current directory)
  --json            Print machine-readable JSON
  --yes, -y         Auto-confirm all prompts
  --non-interactive  Fail if interactive input is required
  --help, -h        Print this help and exit
  --version, -v     Print version and exit

Run "expflow <command> --help" for command-specific options.

EXIT CODES
  0  Success, including uninitialized status queries
  1  Operational mutation or runtime failure
  2  Usage failure, unknown command, or unsupported option
`;

const COMMAND_HELP: Record<string, string> = {
  capabilities: `USAGE
  expflow capabilities [--json]

Prints the capability descriptor for this Expflow installation.

EXIT CODES
  0  Capabilities printed
  2  Usage failure or unsupported option
`,
  init: `USAGE
  expflow init [--root <path>] [--json]

Initializes a new Expflow project and commits the first project version.

EXIT CODES
  0  Project initialized
  1  Operational failure, including an already initialized project
  2  Usage failure or unsupported option
`,
  inspect: `USAGE
  expflow inspect [--root <path>] [--json]

Inspects current project state — project id, head revision, working-tree state.

EXIT CODES
  0  Inspection completed
  1  Operational failure
  2  Usage failure or unsupported option
`,
  history: `USAGE
  expflow history [--root <path>] [--json] [--limit <n>]

Lists project version history with restore references.

EXIT CODES
  0  History listed
  1  Operational failure
  2  Usage failure or unsupported option
`,
  restore: `USAGE
  expflow restore <tree:<tree_revision_id>|node:<node_id>@<revision>:<path>> [options]

OPTIONS
  --dry-run         Preview affected paths without changing the working tree
  --force           Overwrite conflicting unrecorded working-tree changes
  --target-path <path>
                   Restore a node reference to a different path
  --root <path>     Project root
  --json            Print machine-readable JSON

EXIT CODES
  0  Preview or restore completed
  1  Operational failure, including restore conflict or missing reference
  2  Usage failure or unsupported option
`,
  status: `USAGE
  expflow status [options]

OPTIONS
  --history              List recent project versions with restore references
  --history-limit <n>    Limit project version history, 1-100
  --node-history <path>  List node revisions for a tracked path
  --root <path>          Project root
  --json                 Print machine-readable JSON

EXIT CODES
  0  Status query completed, including uninitialized roots
  1  Operational runtime failure
  2  Usage failure or unsupported option
`,
  sync: `USAGE
  expflow sync [options]

OPTIONS
  --dry-run              Preview changes without committing
  --expected-head <id>   Refuse if the current project version differs
  --move <from:to>       Preserve identity while moving a path
  --new-node <path>      Force a new node identity for a changed path
  --replace-node <path>  Replace a node identity for a changed path
  --root <path>          Project root
  --json                 Print machine-readable JSON

EXIT CODES
  0  Preview or sync completed
  1  Operational failure, including stale expected head or lock failure
  2  Usage failure or unsupported option
`,
};

interface ChangeOption {
  readonly kind: 'move' | 'modify';
  readonly path: string;
  readonly from_path?: string | null;
  readonly identity_directive: 'auto' | 'preserve' | 'new' | 'replace';
}

interface ParsedArgs {
  readonly command:
    | 'init'
    | 'sync'
    | 'status'
    | 'restore'
    | 'inspect'
    | 'history'
    | 'capabilities'
    | 'workflow'
    | 'evidence'
    | 'authority'
    | 'conflicts'
    | 'decisions'
    | 'package';
  readonly yes: boolean;
  readonly nonInteractive: boolean;
  readonly root: string | undefined;
  readonly json: boolean;
  readonly dryRun: boolean;
  readonly expectedHead: string | null | undefined;
  readonly reference: string | undefined;
  readonly targetPath: string | undefined;
  readonly overwrite: boolean;
  readonly historyFlag: boolean;
  readonly historyLimit: number | undefined;
  readonly nodeHistoryPath: string | undefined;
  readonly changes: readonly ChangeOption[];
  readonly subcommand: string | undefined;
  readonly familyArgs: readonly string[];
}

class UsageError extends Error {
  readonly code = 'usage_error';
}

function usage(message: string): never {
  throw new UsageError(message);
}

function takeValue(args: string[], index: number, option: string): string {
  const value = args[index + 1];
  if (value === undefined || value.startsWith('--')) {
    usage(`${option} requires a value`);
  }
  args.splice(index, 2);
  return value;
}

function parsePositiveInteger(value: string, option: string): number {
  if (!/^[0-9]+$/.test(value)) {
    usage(`${option} requires a positive integer`);
  }
  return Number(value);
}

function parseMove(value: string): ChangeOption {
  const separator = value.indexOf(':');
  if (separator < 1 || separator === value.length - 1) {
    usage('--move expects from:to');
  }
  return {
    from_path: value.slice(0, separator),
    identity_directive: 'preserve',
    kind: 'move',
    path: value.slice(separator + 1),
  };
}

const CORE_COMMANDS = [
  'init',
  'sync',
  'status',
  'restore',
  'inspect',
  'history',
  'capabilities',
  'workflow',
  'evidence',
  'authority',
  'conflicts',
  'decisions',
  'package',
];

const FAMILY_WITH_SUBCOMMANDS = [
  'workflow',
  'evidence',
  'authority',
  'conflicts',
  'decisions',
  'package',
];

function parseArgs(rawArgs: string[]): ParsedArgs {
  const args = [...rawArgs];
  const rawCmd = args.shift() ?? '';
  const command = rawCmd;
  if (!CORE_COMMANDS.includes(command)) {
    usage(`unknown command '${command}'. Use --help for usage.`);
  }

  let root: string | undefined;
  let json = false;
  let yes = false;
  let nonInteractive = false;
  let dryRun = false;
  let expectedHead: string | null | undefined;
  let targetPath: string | undefined;
  let overwrite = false;
  let historyFlag = false;
  let historyLimit: number | undefined;
  let nodeHistoryPath: string | undefined;
  const changes: ChangeOption[] = [];
  const positionals: string[] = [];

  for (let index = 0; index < args.length;) {
    const arg = args[index];
    if (arg === undefined) {
      break;
    }
    if (arg === '--root') {
      root = takeValue(args, index, '--root');
      continue;
    }
    if (arg === '--json') {
      json = true;
      args.splice(index, 1);
      continue;
    }
    if (arg === '--yes' || arg === '-y') {
      yes = true;
      args.splice(index, 1);
      continue;
    }
    if (arg === '--non-interactive') {
      nonInteractive = true;
      args.splice(index, 1);
      continue;
    }
    if (arg === '--dry-run') {
      if (command !== 'sync' && command !== 'restore') {
        usage(`${command} does not support --dry-run`);
      }
      dryRun = true;
      args.splice(index, 1);
      continue;
    }
    if (arg === '--expected-head') {
      if (command !== 'sync') {
        usage(`${command} does not support --expected-head`);
      }
      expectedHead = takeValue(args, index, '--expected-head');
      continue;
    }
    if (arg === '--move') {
      if (command !== 'sync') {
        usage(`${command} does not support --move`);
      }
      changes.push(parseMove(takeValue(args, index, '--move')));
      continue;
    }
    if (arg === '--new-node') {
      if (command !== 'sync') {
        usage(`${command} does not support --new-node`);
      }
      changes.push({
        identity_directive: 'new',
        kind: 'modify',
        path: takeValue(args, index, '--new-node'),
      });
      continue;
    }
    if (arg === '--replace-node') {
      if (command !== 'sync') {
        usage(`${command} does not support --replace-node`);
      }
      changes.push({
        identity_directive: 'replace',
        kind: 'modify',
        path: takeValue(args, index, '--replace-node'),
      });
      continue;
    }
    if (arg === '--history') {
      if (command !== 'status' && command !== 'history') {
        usage(`${command} does not support --history`);
      }
      historyFlag = true;
      args.splice(index, 1);
      continue;
    }
    if (arg === '--history-limit' || arg === '--limit') {
      if (command !== 'status' && command !== 'history') {
        usage(`${command} does not support ${arg}`);
      }
      historyLimit = parsePositiveInteger(takeValue(args, index, arg), arg);
      continue;
    }
    if (arg === '--node-history') {
      if (command !== 'status') {
        usage(`${command} does not support --node-history`);
      }
      nodeHistoryPath = takeValue(args, index, '--node-history');
      continue;
    }
    if (arg === '--target-path') {
      if (command !== 'restore') {
        usage(`${command} does not support --target-path`);
      }
      targetPath = takeValue(args, index, '--target-path');
      continue;
    }
    if (arg === '--force' || arg === '--overwrite') {
      if (command !== 'restore') {
        usage(`${command} does not support ${arg}`);
      }
      overwrite = true;
      args.splice(index, 1);
      continue;
    }
    if (arg.startsWith('--')) {
      usage(`${command} does not support ${arg}`);
    }
    positionals.push(arg);
    args.splice(index, 1);
  }

  if (
    command !== 'restore' &&
    positionals.length > 0 &&
    !FAMILY_WITH_SUBCOMMANDS.includes(command)
  ) {
    usage(`${command} does not accept positional arguments: ${positionals.join(', ')}`);
  }
  if (command === 'restore' && positionals.length !== 1) {
    usage('restore requires exactly one tree:<id> or node:<id>@<revision>:<path> reference');
  }

  const hasSubcommands = FAMILY_WITH_SUBCOMMANDS.includes(command);
  const subcommand: string | undefined = hasSubcommands ? (positionals[0] ?? 'list') : undefined;
  const familyArgs = hasSubcommands
    ? positionals.slice(positionals[0] === subcommand ? 1 : 0)
    : positionals;

  return {
    changes,

    command: command as ParsedArgs['command'],
    dryRun,
    expectedHead,
    historyFlag,
    historyLimit,
    json,
    nodeHistoryPath,
    nonInteractive,
    overwrite,
    reference: positionals[0],
    root,
    targetPath,
    yes,
    subcommand,
    familyArgs,
  };
}

function printJson(value: unknown): void {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

function usageErrorObject(error: UsageError): ReturnType<typeof errorObject> {
  return errorObject(new ExpflowError(error.code, error.message, { recoverable: true }));
}

function handleUsageError(error: UsageError, json: boolean): never {
  if (json) {
    printJson(usageErrorObject(error));
  } else {
    process.stderr.write(`expflow: ${error.message}\n`);
  }
  process.exit(2);
}

function handleRuntimeError(error: unknown, json: boolean): never {
  const expflowError = toExpflowError(error);
  if (json) {
    printJson(errorObject(expflowError));
  } else {
    process.stderr.write(formatErrorBlock(expflowError));
  }
  process.exit(1);
}

function jsonRequested(args: readonly string[]): boolean {
  return args.includes('--json');
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

  if (COMMAND_HELP[first] !== undefined && (args.includes('--help') || args.includes('-h'))) {
    process.stdout.write(COMMAND_HELP[first]);
    process.exit(0);
  }

  let parsed: ParsedArgs;
  try {
    parsed = parseArgs(args);
  } catch (error) {
    if (error instanceof UsageError) {
      handleUsageError(error, jsonRequested(args));
    }
    throw error;
  }

  const runtime = createRuntime();

  try {
    // Lazy-load ApplicationService for 1.2.1 families
    const { ApplicationService } = await import('../application/service.js');
    const svc = new ApplicationService(parsed.root ?? process.cwd());
    const actor = {
      identifier: `cli-${process.env.USER ?? process.env.USERNAME ?? 'unknown'}`,
      class: 'human' as const,
      interface: 'cli' as const,
      timestamp: new Date().toISOString(),
    };

    if (parsed.nonInteractive) {
      if (parsed.command === 'restore' && !parsed.overwrite && !parsed.yes) {
        process.stderr.write('error: --non-interactive requires --force or --yes for restore\n');
        process.exit(1);
      }
    }
    // ── Capabilities ─────────────────────────────────────────
    if (parsed.command === 'capabilities') {
      const caps = svc.capabilities();
      if (parsed.json) {
        printJson(caps);
      } else {
        process.stdout.write(
          `Expflow ${caps.version}\nCommand families: ${caps.commandFamilies.join(', ')}\n`,
        );
      }
      return;
    }

    // ── Inspect (project state summary) ─────────────────────
    if (parsed.command === 'inspect') {
      const r = await svc.inspect(actor);
      if (parsed.json) {
        printJson(r);
      } else {
        const s = r.result as Record<string, unknown>;
        const hid = (s.head_tree_revision_id as string) || 'none';
        const wts = String(s.working_tree_state);
        process.stdout.write(
          `Project: ${String(s.project_id)}\nHead: ${hid}\nWorking tree: ${wts}\n`,
        );
      }
      return;
    }

    // ── History (standalone version history) ─────────────────
    if (parsed.command === 'history') {
      const r = await svc.status(actor, { history: true });
      if (parsed.json) {
        printJson(r);
      } else {
        const s = (r.result ?? {}) as unknown as StatusReportRecord;
        process.stdout.write(formatStatusReport(s));
        process.stdout.write(formatRevisionHistory(s.revision_history as RevisionHistoryEntry[]));
      }
      return;
    }

    // ── New 1.2.1 command families ──────────────────────────
    if (FAMILY_WITH_SUBCOMMANDS.includes(parsed.command)) {
      const validSubcommands: Record<string, string[]> = {
        workflow: ['list', 'show', 'start', 'output', 'state'],
        evidence: ['list', 'add-file', 'add-transcript', 'add-manifest', 'add-reference', 'show'],
        authority: ['list', 'show', 'propose', 'accept', 'reject', 'supersede'],
        conflicts: ['list', 'show', 'declare'],
        decisions: ['list', 'show', 'record', 'supersede'],
        package: ['export', 'import', 'validate', 'plan-import', 'inspect', 'list'],
      };

      const sub = parsed.subcommand ?? 'list';
      const valid = validSubcommands[parsed.command];
      if (valid && !valid.includes(sub)) {
        process.stderr.write(
          `expflow: unknown ${parsed.command} subcommand '${sub}'\nValid: ${valid.join(', ')}\n`,
        );
        process.exit(2);
      }

      const { ApplicationService } = await import('../application/service.js');
      const svc = new ApplicationService(parsed.root ?? process.cwd());
      const actor = {
        identifier: 'cli',
        class: 'human' as const,
        interface: 'cli' as const,
        timestamp: new Date().toISOString(),
      };

      const mk = (r: { result?: unknown }): Record<string, unknown> =>
        (r.result ?? {}) as Record<string, unknown>;

      const dispatch: Record<string, () => Promise<Record<string, unknown>>> = {
        // ── Workflow ────────────────────────
        'workflow:list': async () => mk(await svc.workflowList(actor)),
        'workflow:start': async () => mk(await svc.startWorkflow(actor, {})),
        'workflow:output': async () => mk(await svc.attachWorkflowOutput(actor, {})),
        'workflow:state': async () => mk(await svc.transitionWorkflowState(actor, {})),
        // ── Evidence ─────────────────────────
        'evidence:list': async () => mk(await svc.evidenceList(actor)),
        'evidence:add-file': async () =>
          mk(await svc.evidenceIntake(actor, { sourceType: 'file' })),
        'evidence:add-transcript': async () =>
          mk(await svc.evidenceIntake(actor, { sourceType: 'transcript' })),
        'evidence:add-manifest': async () =>
          mk(await svc.evidenceIntake(actor, { sourceType: 'manifest' })),
        'evidence:add-reference': async () =>
          mk(await svc.evidenceIntake(actor, { sourceType: 'reference' })),
        // ── Authority ───────────────────────
        'authority:list': async () => mk(await svc.authorityList(actor)),
        'authority:propose': async () => mk(await svc.registerAuthoritySource(actor, {})),
        'authority:accept': async () =>
          mk(await svc.recordSourceDecision(actor, { decision: 'accepted' })),
        'authority:reject': async () =>
          mk(await svc.recordSourceDecision(actor, { decision: 'rejected' })),
        'authority:supersede': async () =>
          mk(await svc.recordSourceDecision(actor, { decision: 'superseded' })),
        // ── Conflicts ────────────────────────
        'conflicts:list': async () => mk(await svc.conflicts(actor)),
        'conflicts:declare': async () => mk(await svc.declareConflict(actor, {})),
        // ── Decisions ────────────────────────
        'decisions:list': async () => mk(await svc.decisions(actor)),
        'decisions:record': async () => mk(await svc.recordDecision(actor, {})),
        'decisions:supersede': async () => mk(await svc.recordDecision(actor, { supersede: true })),
        // ── Package ──────────────────────────
        // eslint-disable-next-line @typescript-eslint/require-await
        'package:list': async () => ({
          operations: ['export', 'import', 'validate', 'plan-import', 'inspect'],
        }),
        'package:export': async () => mk(await svc.exportPackage(actor, {})),
        'package:import': async () => mk(await svc.importPackage(actor, {})),
        'package:validate': async () => mk(await svc.validatePackage(actor, {})),
        'package:plan-import': async () => mk(await svc.planImport(actor, {})),
      };

      const key = `${parsed.command}:${sub}`;
      const handler = dispatch[key];

      let result: Record<string, unknown>;
      if (handler) {
        result = await handler();
      } else {
        result = {
          family: parsed.command,
          subcommand: sub,
          status: 'recognized',
          message: `expflow ${parsed.command} ${sub} is recognized but not yet wired in this release.`,
        };
      }

      if (parsed.json) {
        printJson(result);
      } else {
        /* eslint-disable @typescript-eslint/no-base-to-string */
        const label = `${parsed.command} ${sub}`;
        const r: Record<string, unknown> = result;
        const listKey = ['workflows', 'items', 'conflicts', 'decisions'].find(
          (k) => r[k] !== undefined,
        );
        if (listKey) {
          const arr = Array.isArray(r[listKey]) ? r[listKey] : [];
          process.stdout.write(`${label}: ${String(arr.length)} ${listKey}\n`);
        } else if (r.needsAttention !== undefined) {
          process.stdout.write(`${label}: needs attention = ${String(r.needsAttention)}\n`);
        } else if (Array.isArray(r.operations)) {
          process.stdout.write(`${label}: ${(r.operations as string[]).join(', ')}\n`);
        } else if (r.status !== undefined) {
          process.stdout.write(`${label}: ${String(r.status)}\n`);
        } else if (r.projectId !== undefined || r.receiptId !== undefined) {
          process.stdout.write(`${label}: ok\n`);
        } else {
          process.stdout.write(`${label}: ok\n`);
        }
        /* eslint-enable @typescript-eslint/no-base-to-string */
      }
      return;
    }

    if (parsed.command === 'init') {
      const result = await runtime.init({ root: parsed.root });
      if (parsed.json) {
        printJson(result);
      } else {
        process.stdout.write(formatReceipt(result, 'init'));
      }
      return;
    }

    if (parsed.command === 'sync') {
      if (parsed.dryRun) {
        const plan = await runtime.planSync({
          changes: parsed.changes,
          expectedHead: parsed.expectedHead,
          root: parsed.root,
        });
        if (parsed.json) {
          printJson(plan);
        } else {
          process.stdout.write(formatSyncPreview(plan));
        }
        return;
      }
      const result = await runtime.sync({
        changes: parsed.changes,
        expectedHead: parsed.expectedHead,
        root: parsed.root,
      });
      if (parsed.json) {
        printJson(result);
      } else {
        process.stdout.write(formatReceipt(result, 'sync'));
      }
      return;
    }

    if (parsed.command === 'status') {
      const result = await runtime.status({
        history: parsed.historyFlag,
        historyLimit: parsed.historyLimit,
        nodeHistoryPath: parsed.nodeHistoryPath,
        root: parsed.root,
      });
      if (parsed.json) {
        printJson(result);
        return;
      }
      process.stdout.write(formatStatusReport(result));
      if (parsed.historyFlag) {
        process.stdout.write(
          formatRevisionHistory(result.revision_history as RevisionHistoryEntry[]),
        );
      }
      if (parsed.nodeHistoryPath !== undefined) {
        process.stdout.write(formatNodeHistory(result.node_history as NodeHistoryEntry[]));
      }
      return;
    }

    if (parsed.dryRun) {
      const plan = await runtime.planRestore({
        overwrite: parsed.overwrite,
        reference: parsed.reference ?? '',
        root: parsed.root,
        targetPath: parsed.targetPath,
      });
      if (parsed.json) {
        printJson(plan);
      } else {
        process.stdout.write(formatRestorePreview(plan));
      }
      return;
    }

    const result = await runtime.restore({
      overwrite: parsed.overwrite,
      reference: parsed.reference ?? '',
      root: parsed.root,
      targetPath: parsed.targetPath,
    });
    if (parsed.json) {
      printJson(result);
    } else {
      process.stdout.write(formatReceipt(result, 'restore'));
    }
  } catch (error) {
    handleRuntimeError(error, parsed.json);
  }
}

main().catch((error: unknown) => {
  handleRuntimeError(error, jsonRequested(process.argv.slice(2)));
});
