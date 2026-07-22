import { existsSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, isAbsolute, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { REPO_ROOT } from '../../src/schemas/discovery.js';
import { VERSION } from '../../src/core/version.js';

const npmCommand = 'npm';
const nodeCommand = process.execPath;

function needsWindowsShell(command: string): boolean {
  return (
    process.platform === 'win32' &&
    (command === npmCommand || command.toLowerCase().endsWith('.cmd'))
  );
}

function run(command: string, args: string[], cwd: string): string {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf-8',
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: needsWindowsShell(command),
  });

  const stdout = typeof result.stdout === 'string' ? result.stdout : '';
  const stderr = typeof result.stderr === 'string' ? result.stderr : '';

  if (result.error) {
    throw new Error(
      `Command failed to start (${command} ${args.join(' ')}): ${result.error.message}\nSTDOUT:\n${stdout}\nSTDERR:\n${stderr}`,
    );
  }

  if (result.status !== 0) {
    const status = result.status === null ? 'unknown' : String(result.status);
    throw new Error(
      `Command failed (${command} ${args.join(' ')}) with status ${status}:\nSTDOUT:\n${stdout}\nSTDERR:\n${stderr}`,
    );
  }

  return stdout.trim();
}

function assertContains(actual: string, expected: string): void {
  if (!actual.includes(expected)) {
    throw new Error(`Expected output to include ${JSON.stringify(expected)}, got:\n${actual}`);
  }
}

function resolveProvidedTarball(): string | undefined {
  const tarballIndex = process.argv.indexOf('--tarball');
  if (tarballIndex === -1) {
    return undefined;
  }
  const tarball = process.argv[tarballIndex + 1];
  if (!tarball) {
    throw new Error('Usage: package-verify.ts [--tarball <expflow tarball>]');
  }
  return isAbsolute(tarball) ? tarball : resolve(process.cwd(), tarball);
}

const tempRoot = mkdtempSync(join(tmpdir(), 'expflow-package-verify-'));
const packDir = resolve(tempRoot, 'pack');
const installDir = resolve(tempRoot, 'install');
const providedTarball = resolveProvidedTarball();

try {
  mkdirSync(packDir);
  mkdirSync(installDir);

  let packedFiles: readonly { readonly path: string }[] = [];
  if (!providedTarball) {
    run(npmCommand, ['run', 'clean'], REPO_ROOT);
    run(npmCommand, ['run', 'build'], REPO_ROOT);
    const packOutput = run(
      npmCommand,
      ['pack', '--pack-destination', packDir, '--json'],
      REPO_ROOT,
    );
    const packReport = JSON.parse(packOutput) as readonly {
      readonly files?: readonly { readonly path: string }[];
    }[];
    packedFiles = packReport[0]?.files ?? [];
  }

  const tarball = providedTarball ?? resolve(packDir, `expflow-${VERSION}.tgz`);
  if (!existsSync(tarball)) {
    throw new Error(`Expected npm tarball was not created: ${tarball}`);
  }
  if (basename(tarball) !== `expflow-${VERSION}.tgz`) {
    throw new Error(`Expected npm tarball expflow-${VERSION}.tgz, got ${basename(tarball)}`);
  }
  for (const file of packedFiles) {
    if (file.path.startsWith('apps/gui/')) {
      throw new Error(`GUI app files must remain outside the npm package: ${file.path}`);
    }
  }

  run(npmCommand, ['init', '-y'], installDir);
  run(npmCommand, ['install', tarball], installDir);

  const binName = process.platform === 'win32' ? 'expflow.cmd' : 'expflow';
  const cliPath = resolve(installDir, 'node_modules', '.bin', binName);

  const versionOutput = run(cliPath, ['--version'], installDir);
  if (versionOutput !== VERSION) {
    throw new Error(`Expected CLI version ${VERSION}, got ${versionOutput}`);
  }

  const helpOutput = run(cliPath, ['--help'], installDir);
  for (const expected of [
    'init',
    'sync',
    'status',
    'restore',
    'Run "expflow <command> --help"',
    'Gate B implements local material-core',
    'EXIT CODES',
    '0  Success, including uninitialized status queries',
    '1  Operational mutation or runtime failure',
    '2  Usage failure, unknown command, or unsupported option',
  ]) {
    assertContains(helpOutput, expected);
  }
  const statusHelp = run(cliPath, ['status', '--help'], installDir);
  for (const expected of [
    '--history',
    '--node-history <path>',
    '--history-limit <n>',
    '0  Status query completed, including uninitialized roots',
    '1  Operational runtime failure',
    '2  Usage failure or unsupported option',
  ]) {
    assertContains(statusHelp, expected);
  }
  const restoreHelp = run(cliPath, ['restore', '--help'], installDir);
  for (const expected of [
    '--dry-run',
    '--force',
    '--target-path <path>',
    '1  Operational failure, including restore conflict',
    '2  Usage failure or unsupported option',
  ]) {
    assertContains(restoreHelp, expected);
  }

  const projectDir = resolve(tempRoot, 'project');
  mkdirSync(projectDir);
  const initOutput = run(cliPath, ['init', '--root', projectDir, '--json'], installDir);
  assertContains(initOutput, '"status": "committed"');
  const statusOutput = run(cliPath, ['status', '--root', projectDir, '--json'], installDir);
  assertContains(statusOutput, '"working_tree_state": "clean"');
  const statusHumanOutput = run(cliPath, ['status', '--root', projectDir], installDir);
  assertContains(statusHumanOutput, 'Current project version');

  const importOutput = run(
    nodeCommand,
    [
      '--input-type=module',
      '--eval',
      "const { VERSION, createRuntime, createGuiBridge, createReadModelRuntime, createEvidenceRuntime, createPortablePackageRuntime } = await import('expflow'); console.log(`${VERSION}:${typeof createRuntime}:${typeof createGuiBridge}:${typeof createReadModelRuntime}:${typeof createEvidenceRuntime}:${typeof createPortablePackageRuntime}`);",
    ],
    installDir,
  );
  if (importOutput !== `${VERSION}:function:function:function:function:function`) {
    throw new Error(
      `Expected package export version/runtime/gui bridge/read models/evidence/portable package ${VERSION}:function:function:function:function:function, got ${importOutput}`,
    );
  }

  console.log(`PASS - npm package installs outside checkout and reports ${VERSION}`);
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}
