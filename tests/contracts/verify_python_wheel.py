"""External Python wheel import verification for Phase 1."""

from __future__ import annotations

import os
import shutil
import subprocess
import sys
import tempfile
import zipfile
from pathlib import Path

EXPECTED_VERSION = "0.0.0-phase.1"

REPO_ROOT = Path(__file__).resolve().parents[2]
DIST_DIR = REPO_ROOT / "dist"
PYTHON_BUILD_DIR = REPO_ROOT / "build"
PYTHON_EGG_INFO_DIR = REPO_ROOT / "python" / "expflow_hooks.egg-info"


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


def verify_wheel_contents(wheel: Path) -> None:
    names = zipfile.ZipFile(wheel).namelist()
    unexpected_tests = sorted(name for name in names if name.startswith("tests/"))
    if unexpected_tests:
        raise RuntimeError(
            "Python wheel must not package top-level tests module: "
            + ", ".join(unexpected_tests)
        )
    required = {"expflow_hooks/__init__.py", "expflow_hooks/discovery.py"}
    missing = sorted(required.difference(names))
    if missing:
        raise RuntimeError("Python wheel missing package file(s): " + ", ".join(missing))


def clean_python_build_artifacts() -> None:
    shutil.rmtree(PYTHON_BUILD_DIR, ignore_errors=True)
    shutil.rmtree(PYTHON_EGG_INFO_DIR, ignore_errors=True)
    for wheel in DIST_DIR.glob("expflow_hooks-*.whl"):
        wheel.unlink()


def main() -> int:
    clean_python_build_artifacts()
    run([sys.executable, "-m", "build", "--wheel"], REPO_ROOT)
    wheels = sorted(DIST_DIR.glob("expflow_hooks-*.whl"), key=lambda path: path.stat().st_mtime)
    if not wheels:
        raise RuntimeError(f"No expflow_hooks wheel found in {DIST_DIR}")
    wheel = wheels[-1]
    verify_wheel_contents(wheel)

    temp_dir = Path(tempfile.mkdtemp(prefix="expflow-wheel-verify-"))
    try:
        run([sys.executable, "-m", "venv", str(temp_dir)], REPO_ROOT)
        python = venv_python(temp_dir)
        run([str(python), "-m", "pip", "install", str(wheel)], temp_dir)
        result = run(
            [
                str(python),
                "-c",
                (
                    "import importlib.util;"
                    "import expflow_hooks;"
                    "from expflow_hooks.discovery import "
                    "architecture_sources_available, require_repository_architecture;"
                    "assert expflow_hooks.__version__ == '0.0.0-phase.1';"
                    "assert importlib.util.find_spec('tests') is None;"
                    "assert architecture_sources_available() is False\n"
                    "try:\n"
                    "    require_repository_architecture()\n"
                    "except FileNotFoundError as exc:\n"
                    "    assert 'editable repository checkout' in str(exc)\n"
                    "else:\n"
                    "    raise AssertionError('installed wheel unexpectedly found repository architecture')\n"
                    "print(expflow_hooks.__version__)"
                ),
            ],
            temp_dir,
        )
        version = result.stdout.strip()
        if version != EXPECTED_VERSION:
            raise RuntimeError(f"Expected {EXPECTED_VERSION}, got {version}")
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)

    print(
        "PASS - wheel imports outside checkout, excludes tests, "
        "enforces repo-only discovery, "
        f"and reports {EXPECTED_VERSION}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
