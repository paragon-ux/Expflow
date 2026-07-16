"""External Python wheel import verification for Phase 1."""

from __future__ import annotations

import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

EXPECTED_VERSION = "0.0.0-phase.1"

REPO_ROOT = Path(__file__).resolve().parents[2]
DIST_DIR = REPO_ROOT / "dist"


def run(args: list[str], cwd: Path) -> subprocess.CompletedProcess[str]:
    result = subprocess.run(
        args,
        cwd=cwd,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
    )
    if result.returncode != 0:
        raise RuntimeError(
            "Command failed: "
            + " ".join(args)
            + "\nSTDOUT:\n"
            + result.stdout
            + "\nSTDERR:\n"
            + result.stderr
        )
    return result


def venv_python(venv_dir: Path) -> Path:
    if os.name == "nt":
        return venv_dir / "Scripts" / "python.exe"
    return venv_dir / "bin" / "python"


def main() -> int:
    run([sys.executable, "-m", "build", "--wheel"], REPO_ROOT)
    wheels = sorted(DIST_DIR.glob("expflow_hooks-*.whl"), key=lambda path: path.stat().st_mtime)
    if not wheels:
        raise RuntimeError(f"No expflow_hooks wheel found in {DIST_DIR}")
    wheel = wheels[-1]

    temp_dir = Path(tempfile.mkdtemp(prefix="expflow-wheel-verify-"))
    try:
        run([sys.executable, "-m", "venv", str(temp_dir)], REPO_ROOT)
        python = venv_python(temp_dir)
        run([str(python), "-m", "pip", "install", str(wheel)], REPO_ROOT)
        result = run(
            [
                str(python),
                "-c",
                "import expflow_hooks; print(expflow_hooks.__version__)",
            ],
            REPO_ROOT,
        )
        version = result.stdout.strip()
        if version != EXPECTED_VERSION:
            raise RuntimeError(f"Expected {EXPECTED_VERSION}, got {version}")
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)

    print(f"PASS - wheel imports outside checkout and reports {EXPECTED_VERSION}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
