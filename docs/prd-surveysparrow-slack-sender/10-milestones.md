# SurveySparrow → Slack Response Sender — Milestones

## MVP (v1) scope

Full-page Twigs UI: load surveys, select survey, webhook input, send. Backend: `listSurveys`, `sendLatestResponsesToSlack` using `$http` only; manifest with installation param + whitelisted domains; error states per PRD.

**Deliverables:**

- Backend: `app-backend/server.js` exporting `listSurveys`, `sendLatestResponsesToSlack`; `$http` for SurveySparrow + Slack; no SDK in package.json.
- Manifest: `backend_api_functions`, `installation_params`, `whitelisted_domains`; empty `event_listener_functions`.
- Frontend: `App.jsx` + Twigs; `invoke` for both APIs; version `"*"` for Twigs packages.
- Data: No $db (documented in 07).
- Validation: Checklist passed → **READY TO BUILD APP**.

---

## Phase 1 (MVP)

| # | Milestone | Dependencies | Done when |
|---|-----------|--------------|-----------|
| M1 | Manifest + install param | — | Token param + domains in manifest; handlers stubbed |
| M2 | `listSurveys` + UI load | M1 | Surveys in **Select** or **Alert** on failure |
| M3 | `sendLatestResponsesToSlack` + UI | M2 | Success **Alert**; errors for empty/invalid/429 |
| M4 | Hardening | M3 | No webhook logging; button disabled while sending |

---

## Phase 2 (post-MVP)

Optional: OAuth for SurveySparrow; remember last survey in $db; scheduling via $schedule; response filters.

---

## Dependencies and risks

- **SurveySparrow API** route/version must match docs (paths may differ from illustrative `GET /surveys`).
- **Slack webhook** revocation breaks sends—user must update URL.
