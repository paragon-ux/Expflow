"""Python JSON Schema meta-validation parity for Phase 1."""

from __future__ import annotations

import json

from jsonschema.validators import Draft202012Validator, validator_for

from expflow_hooks.discovery import SCHEMAS_DIR

DRAFT_2020_12 = "https://json-schema.org/draft/2020-12/schema"


def test_supplied_schemas_meta_validate_with_python_jsonschema():
    """Every supported supplied schema passes Python jsonschema check_schema."""
    schema_paths = sorted(SCHEMAS_DIR.glob("*.schema.json"))
    assert schema_paths, f"No supplied schema files found in {SCHEMAS_DIR}"

    for schema_path in schema_paths:
        with schema_path.open("r", encoding="utf-8") as handle:
            schema = json.load(handle)

        assert schema.get("$schema") == DRAFT_2020_12, (
            f"{schema_path.name} declares unsupported dialect: "
            f"{schema.get('$schema', 'not declared')}"
        )

        validator_cls = validator_for(schema)
        assert validator_cls is Draft202012Validator
        validator_cls.check_schema(schema)
