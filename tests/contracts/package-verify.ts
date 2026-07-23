import { createServer } from 'node:http';
import { existsSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, isAbsolute, join, resolve } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
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
      const allowedGui = ['apps/gui/index.html', 'apps/gui/server.mjs'];
      if (
        !allowedGui.some((p) => file.path.startsWith(p)) &&
        !file.path.startsWith('apps/gui/src/') &&
        !file.path.startsWith('apps/gui/styles/')
      ) {
        throw new Error(`Unexpected GUI file in npm package: ${file.path}`);
      }
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

  const guiBinName = process.platform === 'win32' ? 'expflow-gui.cmd' : 'expflow-gui';
  const guiPath = resolve(installDir, 'node_modules', '.bin', guiBinName);
  if (!existsSync(guiPath)) {
    throw new Error(`expflow-gui binary not found at ${guiPath}`);
  }

  // Launch installed expflow-gui, make authenticated request, then terminate
  const guiPort = await (async () => {
    // Find a free port
    const srv = createServer().listen(0, '127.0.0.1');
    await new Promise<void>((resolve) => srv.on('listening', resolve));
    const p = (srv.address() as { port: number }).port;
    srv.close();
    return p;
  })();

  // Launch the installed expflow-gui binary shim
  // Windows: cmd.exe /d /s /c guiPath  (bin shims are .cmd not executable directly)
  // Unix:    spawn(guiPath, [])         (bin shims are shebang scripts/symlinks)
  const isWin = process.platform === 'win32';
  const gui = isWin
    ? spawn('cmd.exe', ['/d', '/s', '/c', guiPath], {
        cwd: installDir,
        env: { ...process.env, EXPFLOW_GUI_PORT: String(guiPort) },
        stdio: ['ignore', 'pipe', 'pipe'],
      })
    : spawn(guiPath, [], {
        cwd: installDir,
        env: { ...process.env, EXPFLOW_GUI_PORT: String(guiPort) },
        stdio: ['ignore', 'pipe', 'pipe'],
      });

  function killGui() {
    // On Windows, kill the cmd.exe process tree (handles node child)
    if (isWin && gui.pid !== undefined) {
      try {
        spawnSync('taskkill', ['/F', '/T', '/PID', String(gui.pid)], {
          stdio: 'ignore',
          timeout: 3000,
        });
      } catch {
        // Best-effort
      }
    }
    gui.kill();
  }

  let guiStdout = '';
  let guiStderr = '';
  gui.stdout.on('data', (chunk: Buffer) => {
    guiStdout += chunk.toString();
  });
  gui.stderr.on('data', (chunk: Buffer) => {
    guiStderr += chunk.toString();
  });

  // Wait for server to be ready (retry up to 10 seconds)
  let guiPortStr = '';
  let ready = false;
  for (let i = 0; i < 50 && !ready; i++) {
    await new Promise((r) => setTimeout(r, 200));
    const url = `http://127.0.0.1:${String(guiPort)}/`;
    try {
      const res = await fetch(url);
      ready = res.ok;
    } catch {
      // not ready yet
    }
  }
  if (!ready) {
    killGui();
    throw new Error(
      `expflow-gui did not start within 10 seconds.\nSTDOUT:\n${guiStdout}\nSTDERR:\n${guiStderr}`,
    );
  }
  guiPortStr = String(guiPort);
  console.log(`PASS - expflow-gui binary starts and serves on port ${guiPortStr}`);

  // Fetch page, extract token, make authenticated API request
  const htmlRes = await fetch(`http://127.0.0.1:${guiPortStr}/`);
  const html = await htmlRes.text();
  const tokenMatch = html.match(/content="([a-f0-9]{64})"/);
  if (tokenMatch === null) {
    killGui();
    throw new Error('Request token not found in served HTML');
  }
  const token = tokenMatch[1];

  const apiRes = await fetch(`http://127.0.0.1:${guiPortStr}/api/status`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-request-token': token,
    },
    body: JSON.stringify({ root: tempRoot }),
  });
  if (!apiRes.ok) {
    killGui();
    throw new Error(`Authenticated API request failed: ${String(apiRes.status)}`);
  }
  const apiBody = (await apiRes.json()) as Record<string, unknown>;
  if (typeof apiBody.root !== 'string' || apiBody.root.length === 0) {
    killGui();
    throw new Error('API response missing root');
  }
  console.log('PASS - expflow-gui authenticated API request successful');

  // Verify token not in stdout
  if (guiStdout.includes(token)) {
    console.warn('WARNING: Request token appears in server stdout');
  }

  killGui();
  // Wait for the server process to release its directory handle
  await new Promise((r) => setTimeout(r, 500));
  console.log('PASS - expflow-gui installed launch verified');

  const helpOutput = run(cliPath, ['--help'], installDir);
  for (const expected of [
    'init',
    'sync',
    'status',
    'restore',
    'Run "expflow <command> --help"',
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
  try {
    rmSync(tempRoot, { recursive: true, force: true });
  } catch {
    console.warn('WARNING: Could not clean up temp directory');
  }
}
