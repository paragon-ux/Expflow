"""
Read-only discovery of architecture schema-source directory.

Phase 1 scaffold only. No product runtime behavior exists.
"""

from pathlib import Path

_REPO_ROOT = Path(__file__).resolve().parent.parent.parent
ARCHITECTURE_DIR = _REPO_ROOT / "docs" / "architecture"
SCHEMAS_DIR = ARCHITECTURE_DIR / "schemas"
SOURCE_MANIFEST_PATH = ARCHITECTURE_DIR / "SOURCE_MANIFEST.json"

__all__ = ["ARCHITECTURE_DIR", "SCHEMAS_DIR", "SOURCE_MANIFEST_PATH"]
