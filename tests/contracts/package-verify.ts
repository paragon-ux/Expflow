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

  if (!providedTarball) {
    run(npmCommand, ['run', 'clean'], REPO_ROOT);
    run(npmCommand, ['run', 'build'], REPO_ROOT);
    run(npmCommand, ['pack', '--pack-destination', packDir], REPO_ROOT);
  }

  const tarball = providedTarball ?? resolve(packDir, `expflow-${VERSION}.tgz`);
  if (!existsSync(tarball)) {
    throw new Error(`Expected npm tarball was not created: ${tarball}`);
  }
  if (basename(tarball) !== `expflow-${VERSION}.tgz`) {
    throw new Error(`Expected npm tarball expflow-${VERSION}.tgz, got ${basename(tarball)}`);
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
    'Gate B implements local material-core',
  ]) {
    assertContains(helpOutput, expected);
  }

  const projectDir = resolve(tempRoot, 'project');
  mkdirSync(projectDir);
  const initOutput = run(cliPath, ['init', '--root', projectDir, '--json'], installDir);
  assertContains(initOutput, '"status": "committed"');
  const statusOutput = run(cliPath, ['status', '--root', projectDir, '--json'], installDir);
  assertContains(statusOutput, '"working_tree_state": "clean"');

  const importOutput = run(
    nodeCommand,
    [
      '--input-type=module',
      '--eval',
      "const { VERSION, createRuntime } = await import('expflow'); console.log(`${VERSION}:${typeof createRuntime}`);",
    ],
    installDir,
  );
  if (importOutput !== `${VERSION}:function`) {
    throw new Error(
      `Expected package export version/runtime ${VERSION}:function, got ${importOutput}`,
    );
  }

  console.log(`PASS - npm package installs outside checkout and reports ${VERSION}`);
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}
