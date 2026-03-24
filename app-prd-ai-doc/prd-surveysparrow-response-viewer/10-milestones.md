# SurveySparrow Response Viewer — Milestones

## MVP (v1) scope

- Survey list from cache with Sync; survey selection and navigation to responses.
- Paginated response viewer (10 per page) with SurveySparrow API data.
- Backup files: list and download; optional periodic backup (scheduled or manual).
- Backend: all API calls via $http; survey cache in $db; backups in $file; no SDK in package.json.
- Frontend: full-page app with Twigs only; backend invoked via `window.appnestClient.backend.invoke`.
- Security: API key only in installation_params; backend proxy only.

**Deliverables:**

- Backend: `app-backend/server.js` exporting getSurveys, syncSurveys, getResponses, listBackups, getBackupDownloadUrl, (optional) runScheduledBackup; handlers using AppNest SDK only; no SDK in package.json.
- Manifest: `backend_api_functions`, `event_listener_functions` (empty or omitted), `installation_params`, `whitelisted_domains` complete and consistent with server.js.
- Frontend: `app-frontend/src/App.jsx` and components using Twigs (`@sparrowengg/twigs-react`, `@sparrowengg/twigs-react-icons`); backend invoked via `window.appnestClient.backend.invoke`.
- Data: Survey cache and metadata in $db; backup paths and $file usage documented in 07-data-model.
- Validation: All items in `appnest-tools/appnest-prd-generator/validation-checklist.md` passed → **READY TO BUILD APP**.

---

## Phase 1 (MVP)

| # | Milestone | Dependencies | Done when |
|---|-----------|--------------|-----------|
| M1 | Backend: survey list and sync | installation_params (API key), $db, $http | getSurveys and syncSurveys implemented and in manifest; Survey List screen shows data and Sync works. |
| M2 | Backend: responses and pagination | SurveySparrow responses API | getResponses implemented; Response Viewer shows one page (10 items) and pagination works. |
| M3 | Backend: backups | $file | listBackups and getBackupDownloadUrl implemented; optional runScheduledBackup; Backup Files screen lists and downloads. |
| M4 | Frontend: all screens with Twigs | M1–M3 | Survey List, Response Viewer, Backup Files implemented with Twigs only; empty/loading/error states. |

---

## Phase 2 (post-MVP)

- Optional: response caching in $db to reduce API calls; scheduled daily backup via $schedule; export filters (date range, survey filter for backups).

---

## Dependencies and risks

- **SurveySparrow API:** Availability and rate limits; implement retry/backoff for 429. API key must be set in installation.
- **$file limits:** Document backup retention or size limits if needed.
