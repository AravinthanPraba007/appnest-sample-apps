# Survey Response CSV Import — Milestones

## MVP (v1) scope

Ship a production-ready AppNest full-page app that completes: **CSV ingest → survey & question load → mapping → validated batch import → progress + errors**, using SurveySparrow’s public API and Appnest Functions throughout.

**Deliverables:**

- Backend: `app-backend/server.js` exporting all functions listed in 08-api-contracts; handlers use **Appnest Functions** only; no `@sparrowengg/appnest-app-sdk-utils` in `package.json` dependencies.
- Manifest: `backend_api_functions`, `installation_params` (API key), `whitelisted_domains` for SurveySparrow API; remove unused placeholder params/events from template manifest.
- Frontend: `app-frontend/src/App.jsx` + components using Twigs only; `invoke` for each user-triggered API.
- Data: Job/ingest/idempotency keys documented in 07-data-model.
- Validation: PRD alignment with `appnest-ai-context/appnest-prd-generator/validation-checklist.md` before **READY TO BUILD APP**.

---

## Phase 1 (MVP)

| # | Milestone | Dependencies | Done when |
|---|-----------|--------------|-----------|
| M1 | Foundations & manifest cleanup | AppNest project scaffold | Manifest matches server exports; API key param works; `$fetch` can reach whitelisted API |
| M2 | CSV ingest + preview | M1 | `ingestCsv` returns headers/preview; UI table renders; limits enforced |
| M3 | Survey + question fetch | M1 | `listSurveys`, `getSurveyQuestions` wired; loading/error states |
| M4 | Mapping UX + validation | M2, M3 | `validateMapping` passes/fails correctly; cannot start with invalid mapping |
| M5 | Import engine + progress | M4 | `startImportJob`, `processImportBatch`, `getImportJobStatus`; idempotency + 429 handling |
| M6 | Polish & hardening | M5 | Cancel (if in scope), failure list UX, empty states, accessibility spot-check |

---

## Phase 2 (post-MVP)

- Saved mapping templates per survey (`$db`).
- AI-suggested column ↔ question mapping.
- “Retry failed rows only” using persisted failure keys.
- Scheduled re-import via `$schedule` (if customer need emerges).
- OAuth-based auth if SurveySparrow product strategy requires it.

---

## Dependencies and risks

| Dependency / risk | Mitigation |
|-------------------|------------|
| SurveySparrow API payload shape differs by question type | Early spike against API docs; unit tests per question type with fixtures |
| Large CSV memory pressure | Streaming parse + batch size tuning; enforce row cap |
| Handler timeout vs batch size | Tune batch rows; rely on `$next` chaining |
| Manifest / install params mismatch in sample repo | Align `manifest.json` with this PRD during implementation |
