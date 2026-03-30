# Survey Response CSV Import — Data Model

## AppNest storage

All cross-invocation state uses **`$db`**. Types: `string`, `number`, `list`, `map`, `boolean`. Reference: `appnest-ai-context/appnest-governance/appnest-functions/Backend-Appnest-Functions.md`.

---

## Core entities

| Entity | Purpose | Key pattern (example) | $db type | Notes |
|--------|---------|------------------------|----------|-------|
| `CsvIngest` | Metadata for an uploaded CSV (headers, row count, optional file path) | `csv_ingest:{ingestId}` | `map` | `ingestId` = UUID from backend; TTL or explicit delete after import |
| `ImportJob` | One user-started import run | `import_job:{jobId}` | `map` | Status, surveyId, ingestId, mapping snapshot, counters, trace id |
| `ImportJobProgress` | Fast-updating counters | `import_job_progress:{jobId}` | `map` or `string` (JSON) | Updated each batch; separate key to reduce contention if needed |
| `IdempotencyRow` | Prevent duplicate API create for same job+row | `import_idem:{jobId}:{rowFingerprint}` | `string` | Value = external response id or `1`; row fingerprint from normalized row hash |
| `FailedRows` | Append-only or list of failures | `import_failures:{jobId}` | `list` | Cap list length or paginate in $db via chunk keys if API limits apply |

**Core entities summary:** Ingest handles **what** was uploaded; ImportJob captures **how** it maps to a survey and **whether** the run finished; idempotency keys enforce **at-most-once** creates per logical row per job.

## Storage keys

- Prefix with app namespace to avoid collisions: e.g. `survey_csv_import:import_job:{jobId}`.
- **Variable parts:** `ingestId`, `jobId`, workspace/account id if multi-tenant keys are required by platform (follow AppNest conventions for scoping).

## Sensitive data

- **Secrets:** Only in installation params / platform secure store—never in `$db` as plain API key.
- **PII:** CSV content and parsed rows may contain PII. Store minimal fields in `$db` (headers, pointers). If full file in `$file`, mark **PRIVATE** if supported and restrict download URLs. Document retention in ops notes.

## File storage ($file)

| Path or pattern | Visibility | Operations used | Handler(s) | Notes |
|-----------------|------------|-------------------|------------|--------|
| `imports/{ingestId}/upload.csv` | PRIVATE (preferred) | `getUploadUrl`, `getDownloadUrl`, `delete` | `ingestCsv` | Optional if platform prefers streaming parse without persist |
| `imports/{jobId}/error-report.json` | PRIVATE | `getDownloadUrl`, optional `delete` after download | `getImportJobStatus` | Optional v1—can return errors inline instead |

- If implementation parses CSV **in-memory only** inside `ingestCsv` and returns preview without persistent file, document *$file not used* and remove table rows accordingly.

---

## External system data

- Store **SurveySparrow response / submission IDs** returned from API in idempotency records and/or per-row success list for audit.
- Store **last HTTP status** and **normalized error body** (truncated) on failure for UI display—not full response dumps if huge.
