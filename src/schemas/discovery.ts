/**
 * Read-only architecture-source discovery.
 *
 * Locates immutable architecture sources for repository-contract verification.
 * No product runtime behavior exists in Phase 1.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Repository root, resolved from this module's location. */
export const REPO_ROOT = resolve(__dirname, "..", "..");

/** Path to the immutable architecture source directory. */
export const ARCHITECTURE_DIR = resolve(REPO_ROOT, "docs", "architecture");

/** Path to the source manifest. */
export const SOURCE_MANIFEST_PATH = resolve(ARCHITECTURE_DIR, "SOURCE_MANIFEST.json");

/** Path to the working schema mirror directory. */
export const SCHEMAS_DIR = resolve(REPO_ROOT, "schemas");

/** Path to the working example mirror directory. */
export const EXAMPLES_DIR = resolve(REPO_ROOT, "examples");

/** Compute SHA-256 of a file's contents. */
export function sha256File(path: string): string {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

/** Read and parse the source manifest. */
export function readSourceManifest(): Record<string, unknown> {
  if (!existsSync(SOURCE_MANIFEST_PATH)) {
    throw new Error(`Source manifest not found: ${SOURCE_MANIFEST_PATH}`);
  }
  return JSON.parse(readFileSync(SOURCE_MANIFEST_PATH, "utf-8")) as Record<string, unknown>;
}

/** List required architecture Markdown basenames. */
export function requiredArchitectureBasenames(): string[] {
  return [
    "EXPFLOW_WORKFLOW_CURRENT.md",
    "EXPFLOW_CONCEPT_PAPER_V2_3.md",
    "EXPFLOW_IMPLEMENTATION_SPEC_V2_3.md",
    "EXPFLOW_PROTOCOL_SPEC_V2_3.md",
    "EXPFLOW_PROJECT_SNAPSHOT_V2_3.md",
    "Note-On-Architecture.md",
    "V2_3_REVIEW_RESOLUTION.md",
    "V2_3_ARCHITECTURE_DELTA.md",
    "RELATED_WORK.md",
  ];
}
