# CSV Response Importer — Additional Flows and Future Cases

This document lists **further flows and product cases** to consider beyond the current v1 scope. Use it for prioritization and Phase 2+.

---

## 1. Re-run failed rows only

**Case:** User views a run that had partial failures and wants to retry only the failed rows (e.g. after fixing data or API issues).

**Flow:** From run detail, “Retry failed” loads the failed row indices (and optionally the original CSV or stored payload); user can re-map if needed and submit only those rows. Backend function e.g. `submitFailedRowsOnly({ runId })` or reuse submitResponses with a filtered payload.

**Considerations:** Need to store failed row data (or row indices + reference to CSV) in run record so we can re-extract and resubmit.

---

## 2. Export import history as CSV

**Case:** User wants to audit or share a list of all import runs (date, survey, totals, status) in a spreadsheet.

**Flow:** “Export history” calls backend (e.g. `exportImportHistory({ limit, format: 'csv' })`) which returns CSV content or a download URL. Frontend triggers download.

**Considerations:** Use $file to generate a one-time CSV at a temp path and return getDownloadUrl, or return CSV string in response for small lists.

---

## 3. Delete or archive old runs

**Case:** Compliance or storage limits require removing old run data and CSV files.

**Flow:** “Delete run” or “Archive run” (soft delete). Backend deletes $db run record and $file object for that runId. Optional: “Delete runs older than X days” (bulk).

**Considerations:** Define retention policy (e.g. keep last 90 days); document in 09-non-functional. Require confirmation before delete.

---

## 4. Filters and pagination on history

**Case:** Workspaces with many runs need to find a specific run by survey or date.

**Flow:** listImportRuns already supports optional `surveyId`, `limit`, `offset`. UI: dropdown “Filter by survey”, “Date range”, pagination (Next/Previous or page size). Optional: status filter (completed / partial / failed).

**Considerations:** Ensure $db key pattern supports efficient listing (e.g. import_run_list_{{workspaceId}} or secondary index by surveyId/date).

---

## 5. Duplicate run / same-file warning

**Case:** User accidentally re-imports the same CSV for the same survey, creating duplicate responses.

**Flow:** Before submit, optionally compute a hash of CSV content (or first row + row count); check if a run with same surveyId + hash exists in last N days. Warn: “A similar file was already imported on &lt;date&gt;. Continue anyway?” Or use SurveySparrow idempotency keys if API supports them.

**Considerations:** Store optional `csvHash` or `fileFingerprint` on import_run for deduplication checks.

---

## 6. Save column mapping preset per survey

**Case:** User imports into the same survey repeatedly with the same column mapping (e.g. “Email → Q1, Rating → Q2”).

**Flow:** After a successful mapping, “Save as preset” stores mapping (surveyId → list of { csvHeader, questionId }) in $db (e.g. `mapping_preset_{{workspaceId}}_{{surveyId}}`). Next time user selects that survey and uploads a CSV, “Load preset” pre-fills the mapping.

**Considerations:** Preset key pattern; allow multiple presets per survey (e.g. “Default”, “Legacy format”) with names.

---

## 7. Pre-submit validation and preview

**Case:** User wants to validate data (email format, rating 1–5, required fields) before committing the full import.

**Flow:** “Validate” or “Preview” step: frontend (or backend) validates first N rows and shows warnings (e.g. “Row 3: invalid email”, “Row 7: rating out of range”). User can fix CSV and re-upload or proceed anyway. Optional: “Download validation report” (CSV of errors).

**Considerations:** Backend function `validateCsvPayload({ surveyId, rows, mapping })` returning { valid, errors[] }; or keep validation in frontend for speed.

---

## 8. Large file / async import (batch > 10k)

**Case:** User has 50,000 rows; single request would timeout.

**Flow:** Backend accepts “async” mode: submitResponses creates run, stores CSV in $file, returns runId immediately; then **$next.run** or **$schedule** processes rows in chunks (e.g. 1,000 per invocation). Frontend polls getImportRun for status (e.g. “processing”, “completed”) and updated success/failed counts.

**Considerations:** Requires $next or $schedule; run record has status and progress fields; UI shows “Import in progress” with refresh.

---

## 9. Custom installation frontend

**Case:** App needs a branded or guided setup (e.g. “Connect your SurveySparrow account”, test API key, select default timezone).

**Flow:** Use `app-installation-frontend`; collect installation_params (and optionally write default settings to $db when workspace is created). Document in manifest and 06-technical-architecture.

---

## 10. Scheduled / recurring imports

**Case:** User wants to re-import from a fixed CSV path or “last run” every day (e.g. sync from external system that drops a CSV).

**Flow:** $schedule job runs at cron time; target function reads CSV (from $file path or external URL if whitelisted), runs same submission logic, creates run record. Requires defining “scheduled import config” (surveyId, mapping, source path or URL) in $db.

**Considerations:** Security and scope of “source path”; idempotency if same file is imported repeatedly.

---

## Summary table

| # | Case | Priority idea | Depends on |
|---|------|----------------|------------|
| 1 | Re-run failed rows only | High (reduces re-upload) | Stored run + failed row details |
| 2 | Export history CSV | Medium (audit) | listImportRuns data |
| 3 | Delete/archive runs | Medium (compliance) | Retention policy |
| 4 | Filters + pagination | Medium (UX) | listImportRuns params |
| 5 | Duplicate run warning | Medium (data quality) | csvHash or fingerprint |
| 6 | Mapping presets | High (UX) | $db preset entity |
| 7 | Pre-submit validation | Medium (quality) | Validation rules / API |
| 8 | Async large import | High (scale) | $next or $schedule |
| 9 | Custom installation | Low (branding) | app-installation-frontend |
| 10 | Scheduled imports | Low (automation) | $schedule, source config |

Use this list in backlog grooming and when extending the PRD for a future release.
