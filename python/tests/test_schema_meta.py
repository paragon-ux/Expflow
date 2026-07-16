"""Python JSON Schema meta-validation parity for Phase 1."""

from __future__ import annotations

import json
from pathlib import Path

from jsonschema.validators import Draft202012Validator, validator_for
from referencing import Registry, Resource
from referencing.jsonschema import DRAFT202012

from expflow_hooks.discovery import ARCHITECTURE_DIR, SCHEMAS_DIR

DRAFT_2020_12 = "https://json-schema.org/draft/2020-12/schema"
REPO_ROOT = ARCHITECTURE_DIR.parent.parent


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


def _schema_file_for_example(example_name: str) -> str:
    return (
        example_name.replace("-unified.example.json", ".schema.json")
        .replace("-deterministic.example.json", ".schema.json")
        .replace("-model.example.json", ".schema.json")
        .replace(".example.json", ".schema.json")
    )


def _load_schema_validators() -> dict[str, Draft202012Validator]:
    schemas: dict[str, dict] = {}
    names_by_id: dict[str, str] = {}
    for schema_path in sorted(SCHEMAS_DIR.glob("*.schema.json")):
        schema = _load_json(schema_path)
        schemas[schema_path.name] = schema
        schema_id = schema["$id"]
        names_by_id[schema_id] = schema_path.name

    registry = Registry().with_resources(
        (schema_id, Resource.from_contents(schemas[schema_name], default_specification=DRAFT202012))
        for schema_id, schema_name in names_by_id.items()
    )

    validators: dict[str, Draft202012Validator] = {}
    for schema_name in names_by_id.values():
        schema = schemas[schema_name]
        validators[schema_name] = Draft202012Validator(schema, registry=registry)
    return validators


def _load_json(path: Path):
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def test_supplied_examples_validate_with_python_jsonschema():
    """Python validation agrees that supplied examples match their schemas."""
    validators = _load_schema_validators()
    example_paths = sorted((ARCHITECTURE_DIR / "examples").glob("*.example.json"))
    assert example_paths

    for example_path in example_paths:
        schema_name = _schema_file_for_example(example_path.name)
        validator = validators[schema_name]
        errors = sorted(validator.iter_errors(_load_json(example_path)), key=lambda error: error.path)
        assert not errors, f"{example_path.name} failed {schema_name}: {errors}"


def test_contract_fixtures_validate_with_python_jsonschema():
    """Python validation agrees with the valid/invalid fixture outcomes."""
    validators = _load_schema_validators()
    fixture_root = REPO_ROOT / "tests" / "fixtures" / "contracts"

    for fixture_path in sorted((fixture_root / "valid").glob("*.valid.json")):
        schema_name = f"{fixture_path.name.removesuffix('.valid.json')}.schema.json"
        errors = sorted(
            validators[schema_name].iter_errors(_load_json(fixture_path)),
            key=lambda error: error.path,
        )
        assert not errors, f"{fixture_path.name} should be valid for {schema_name}: {errors}"

    for fixture_path in sorted((fixture_root / "invalid").glob("*.invalid.json")):
        schema_name = f"{fixture_path.name.removesuffix('.invalid.json')}.schema.json"
        errors = list(validators[schema_name].iter_errors(_load_json(fixture_path)))
        assert errors, f"{fixture_path.name} should fail {schema_name}"
