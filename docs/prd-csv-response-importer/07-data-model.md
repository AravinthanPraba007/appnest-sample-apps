# CSV Response Importer — Data Model

## AppNest storage

All persistent state must use the AppNest **$db** API. Types: `string`, `number`, `list`, `map`, `boolean`. Do not use in-memory state for cross-invocation data. See `appnest-tools/appnest-governance/02-sdk/05-SDK-Reference.md`.

---

## Core entities

| Entity | Purpose | Key pattern (e.g. for $db) | $db type | Notes |
|--------|---------|-----------------------------|----------|--------|
| Import run | Single import job: survey, file path, status, counts, timestamps, config, error log. | `import_run_{{workspaceId}}_{{importId}}` | map | importId is unique per run (e.g. UUID). Value: { surveyId, surveyVersion?, filePath, status, totalRows, successCount, failureCount, startedAt, completedAt, createdBy, config: { timestampSource, timezone, duplicateRule }, errorLog: [{ rowIndex, error }], failedRowIndices? }. |
| Import run list | Ordered list of import run IDs for history (per workspace). | `import_run_list_{{workspaceId}}` | list | Append importId on create; used by getImportHistory with pagination (slice). |
| Column mapping | CSV column → survey question mapping for a run (or draft). | `column_mapping_{{workspaceId}}_{{importId}}` | map | Value: { mappings: [{ csvColumn, questionId }], optional metadata }. |

## Storage keys

- **import_run_{{workspaceId}}_{{importId}}:** map. Full run record; status one of: `pending`, `processing`, `completed`, `failed`, `cancelled`.
- **import_run_list_{{workspaceId}}:** list of importId strings. New runs prepended (list.prepend) for recent-first history.
- **column_mapping_{{workspaceId}}_{{importId}}:** map. Persisted when user saves mapping (saveColumnMapping); read when resuming or retrying.

All keys use workspaceId from payload/context (e.g. from installation or request context). Value shapes are JSON-serialisable objects stored in $db.map.

## Sensitive data

- **Secrets:** API token only in installation_params; never stored in $db.
- **PII:** CSV content may contain PII (email, etc.). Stored in $file at PRIVATE paths; retention policy (e.g. 30–90 days) documented in 09-non-functional. Error rows file may contain PII—same retention and access control.

## File storage ($file)

The app uses **$file** for uploaded CSV and error-rows CSV.

| Path or pattern | Visibility | Operations used | Handler(s) | Notes |
|-----------------|------------|------------------|------------|--------|
| `csv/{{workspaceId}}/{{importId}}/upload.csv` | PRIVATE | getUploadUrl, getDownloadUrl, delete, exists | getCsvUploadUrl (returns upload URL); processImportChunk (reads via getDownloadUrl or path passed in run record) | Uploaded CSV; retention per policy. |
| `csv/{{workspaceId}}/{{importId}}/errors.csv` | PRIVATE | getUploadUrl or write via backend, getDownloadUrl, delete, exists | processImportChunk (writes failed rows); getErrorRowsDownloadUrl (getDownloadUrl) | Error rows CSV for download. |

- **Key format:** Paths are strings; workspaceId and importId from run context.
- **Visibility:** PRIVATE for both (contain response/PII data).

---

## External system data (if any)

- **SurveySparrow:** Survey IDs, question IDs, submission IDs returned by API are not stored in $db except as part of import_run (surveyId). No separate cache of SurveySparrow entities; surveys/questions fetched on demand via API. For idempotency/duplicate handling, duplicate rule is applied per submission (skip/update) using SurveySparrow API behaviour or stored submission identifiers if API supports it; otherwise skip/allow/update is implemented in processImportChunk logic (e.g. skip = do not send duplicate key again).
