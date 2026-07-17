"""Repository-contract tests for the Expflow Python scaffold."""

from pathlib import Path
import json
import sys

import expflow_hooks
from expflow_hooks.discovery import (
    ARCHITECTURE_DISCOVERY_MODE,
    ARCHITECTURE_DIR,
    SCHEMAS_DIR,
    SOURCE_MANIFEST_PATH,
    architecture_sources_available,
    require_repository_architecture,
)


def test_package_version():
    """The Python package reports the v1 release version."""
    assert expflow_hooks.__version__ == "1.0.0"


def test_package_imports():
    """The package imports without side effects."""
    assert expflow_hooks.__version__ is not None


def test_discovery_paths_exist():
    """Architecture discovery paths point to real directories and files."""
    assert ARCHITECTURE_DISCOVERY_MODE == "editable-repository"
    assert architecture_sources_available()
    require_repository_architecture()
    assert ARCHITECTURE_DIR.is_dir(), f"Architecture dir missing: {ARCHITECTURE_DIR}"
    assert SCHEMAS_DIR.is_dir(), f"Schemas dir missing: {SCHEMAS_DIR}"
    assert SOURCE_MANIFEST_PATH.is_file(), f"Source manifest missing: {SOURCE_MANIFEST_PATH}"


def test_source_manifest_parses():
    """The source manifest is valid JSON with required fields."""
    with open(SOURCE_MANIFEST_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    assert data["algorithm"] == "sha256"
    assert data["generated_by"] == "Expflow Phase 1 repository-contract tooling"
    assert isinstance(data["entries"], list)
    assert len(data["entries"]) > 0
    for entry in data["entries"]:
        assert set(entry) == {"path", "bytes", "sha256"}
        assert isinstance(entry["path"], str)
        assert isinstance(entry["bytes"], int)
        assert isinstance(entry["sha256"], str)


def test_no_runtime_modules():
    """The scaffold contains no product runtime modules."""
    disallowed = [
        "runner",
        "hook",
        "model",
        "storage",
        "mutation",
        "sync",
        "init",
        "status",
        "restore",
    ]
    root = Path(expflow_hooks.__file__).parent
    py_files = list(root.rglob("*.py"))
    for py_file in py_files:
        if py_file.name == "__init__.py":
            continue
        content = py_file.read_text().lower()
        for keyword in disallowed:
            # Only flag functional implementations, not docstring mentions
            if f"def {keyword}" in content or f"class {keyword}" in content:
                raise AssertionError(
                    f"Prohibited runtime keyword '{keyword}' found in {py_file.relative_to(root)}"
                )


def test_no_network_imports():
    """The scaffold imports no networking libraries."""
    disallowed_imports = [
        "requests",
        "httpx",
        "aiohttp",
        "urllib3",
        "socket",
        "http.client",
        "asyncio",
    ]
    root = Path(expflow_hooks.__file__).parent
    for py_file in root.rglob("*.py"):
        content = py_file.read_text()
        for imp in disallowed_imports:
            if f"import {imp}" in content or f"from {imp}" in content:
                raise AssertionError(
                    f"Prohibited import '{imp}' in {py_file.relative_to(root)}"
                )
