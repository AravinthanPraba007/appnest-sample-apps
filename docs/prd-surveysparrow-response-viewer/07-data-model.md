# SurveySparrow Response Viewer — Data Model

## AppNest storage

All persistent state must use the AppNest **$db** API when used. For v1, the app does **not** persist survey or response data; all data is fetched on demand from the SurveySparrow API via backend $http. No $db keys are required for MVP.

---

## Core entities

For v1 there are **no persistent core entities** stored in $db. Surveys and responses are fetched from SurveySparrow Public API on each request and passed through to the frontend.

| Entity | Purpose | Key pattern (e.g. for $db) | $db type | Notes |
|--------|---------|-----------------------------|----------|--------|
| (none for v1) | — | — | — | All data is read from SurveySparrow API on demand. |

## Storage keys

- **Key format:** N/A for v1; no $db keys.
- **Value shape:** N/A.

(If a future phase adds caching (e.g. survey list or response page cache), key patterns such as `surveys_cache_{{workspaceId}}` or `responses_{{surveyId}}_{{page}}` would be documented here.)

## Sensitive data

- **Secrets:** SurveySparrow API key is stored only via **installation_params** (secure). Never in $db or frontend.
- **PII:** Response data may contain respondent info from SurveySparrow; it is displayed only in the app UI and not persisted in AppNest $db. No PII stored in app storage.

## File storage ($file)

Not used. No file paths or operations.

---

## External system data (if any)

- **SurveySparrow:** Surveys and responses are pulled via GET /v3/surveys and GET /v3/surveys/{id}/responses. Data is not stored in $db; it is returned to the frontend for display only. No idempotency or retry keys needed for read-only usage.
