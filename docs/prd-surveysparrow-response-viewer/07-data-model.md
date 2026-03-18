# SurveySparrow Response Viewer — Data Model

## AppNest storage

All persistent state must use the AppNest **$db** API. Types: `string`, `number`, `list`, `map`, `boolean`. Do not use in-memory state for cross-invocation data. See `appnest-tools/appnest-governance/02-sdk/Backend-Appnest-SDK-Reference.md`.

---

## Core entities

| Entity | Purpose | Key pattern (e.g. for $db) | $db type | Notes |
|--------|---------|-----------------------------|----------|--------|
| Survey list cache | Cached list of surveys from SurveySparrow API | `surveys_list` | list | JSON array of survey objects (id, name, created_at, etc.). Updated by syncSurveys. |
| Last sync timestamp | When survey list was last synced from API | `surveys_last_sync` | string | ISO date string; optional for UI display. |
| (Optional) Response cache | Optional cache for recent response page to reduce API calls | `responses_{{surveyId}}_{{page}}` | string | JSON string of response page; TTL or invalidation per product decision. Can be omitted in v1 and always fetch from API. |

## Storage keys

- **surveys_list:** Single key; value = list of survey objects. Replaced on each sync.
- **surveys_last_sync:** Single key; value = ISO timestamp string.
- **responses_{{surveyId}}_{{page}}:** (Optional) Per survey and page; value = JSON string of API response for that page. Omit if not caching responses in v1.

Key format: strings, max 1000 chars. No sensitive data in keys; API key only in installation_params.

## Sensitive data

- **Secrets:** SurveySparrow API key only via installation_params (secure). Never stored in $db as plain text.
- **PII:** Response data from API may contain respondent info; stored only in $db or $file as needed for display/backup; handle per product compliance (no unnecessary retention in plain text if not required).

## File storage ($file)

The app uses **$file** for response backup files.

| Path or pattern | Visibility | Operations used | Handler(s) | Notes |
|-----------------|------------|------------------|------------|--------|
| `backups/responses_{{date}}.json` (e.g. responses_2026_03_10.json) | PRIVATE | write (upload), list, getDownloadUrl | runScheduledBackup (or manual backup handler), listBackups, getBackupDownloadUrl | Backup files; date in filename; list returns available files; getBackupDownloadUrl returns URL for download. |

- Paths are strings; prefix `backups/`; variable part = date or identifier.
- Visibility: PRIVATE (download only via backend-issued URL).

---

## External system data (if any)

- SurveySparrow API: surveys and responses are fetched via $http; not stored long-term except survey list cache (surveys_list) and optional response cache. Backup files in $file are copies of response data for archival; no external IDs stored in $db for idempotency (read-only API).
