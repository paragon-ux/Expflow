"""Read-only discovery of architecture schema-source directory.

Phase 1 scaffold only. No product runtime behavior exists.

Architecture sources are repository-contract inputs and are not packaged into
the Python wheel. Installed wheels can import the package and report the
contract version, while architecture discovery is explicitly available only
from an editable repository checkout.
"""

from pathlib import Path

_REPO_ROOT = Path(__file__).resolve().parent.parent.parent
ARCHITECTURE_DIR = _REPO_ROOT / "docs" / "architecture"
SCHEMAS_DIR = ARCHITECTURE_DIR / "schemas"
SOURCE_MANIFEST_PATH = ARCHITECTURE_DIR / "SOURCE_MANIFEST.json"
ARCHITECTURE_DISCOVERY_MODE = "editable-repository"


def architecture_sources_available() -> bool:
    """Return whether repository architecture sources are available."""
    return (
        ARCHITECTURE_DIR.is_dir()
        and SCHEMAS_DIR.is_dir()
        and SOURCE_MANIFEST_PATH.is_file()
    )


def require_repository_architecture() -> None:
    """Require architecture sources from an editable repository checkout."""
    if architecture_sources_available():
        return

    missing = [
        path
        for path in (ARCHITECTURE_DIR, SCHEMAS_DIR, SOURCE_MANIFEST_PATH)
        if not path.exists()
    ]
    missing_text = ", ".join(str(path) for path in missing)
    raise FileNotFoundError(
        "Expflow Phase 1 Python architecture discovery is available only from "
        "an editable repository checkout; installed wheels do not package "
        f"docs/architecture. Missing: {missing_text}"
    )


__all__ = [
    "ARCHITECTURE_DIR",
    "ARCHITECTURE_DISCOVERY_MODE",
    "SCHEMAS_DIR",
    "SOURCE_MANIFEST_PATH",
    "architecture_sources_available",
    "require_repository_architecture",
]
