# Core Capability Lab — Milestones

## MVP (v1) scope

Ship a **single full-page** Core Capability Lab app with **five Twigs tabs**, **ten backend exports** (see `08-api-contracts.md`), **`$db` execution log**, **`$file`** demo path, **`$fetch`** GET to whitelisted API, **`$schedule`** one-shot job, **`$next`** two-step chain, and **clear all** behavior. Manifest matches `server.js` exports; no platform events; no OAuth.

**Deliverables:**

- Backend: `app-backend/server.js` exporting all functions listed in `08-api-contracts`; SDK-only I/O; no SDK in `package.json`.
- Manifest: `backend_api_functions` complete; `event_listener_functions` empty; `whitelisted_domains` set; `installation_params` minimal/empty; `frontend_locations.full_page_app.url` → `index.html`.
- Frontend: `app-frontend/src/App.jsx` + components using Twigs only; `invoke` for each action.
- Data: Keys in `07-data-model.md`.
- Validation: PRD checklist passed → **READY TO BUILD APP**.

---

## Phase 1 (MVP)

| # | Milestone | Dependencies | Done when |
|---|-----------|--------------|-----------|
| M1 | Backend skeleton + log + clear | None | `getCapabilityLabState`, `clearCapabilityLabData`, shared `appendRun` helper work |
| M2 | File + Storage + Network modules | M1 | Three module functions pass manual smoke tests |
| M3 | Schedule + Chain modules | M1 | `$schedule` fires log entry; `$next` produces two-step sequence in log |
| M4 | Twigs UI + manifest alignment | M2, M3 | All tabs call correct `apiFunctionName`; `app validate` passes |

---

## Phase 2 (post-MVP)

- Optional **installation_param** for HTTP path prefix (same host).
- Export execution log as JSON download (Twigs **Button** + generated blob).
- Optional subscription to one **platform event** to demonstrate event path (would add `event_listener_functions` + PRD update).

---

## Dependencies and risks

- **Risk:** SurveySparrow API path for GET demo may return **401** without auth — mitigate by using a **documented** endpoint that returns predictable response for installed app context, or document expected “auth required” as valid demo outcome.
- **Risk:** `$file` visibility / quota — keep artifacts **small** and paths **namespaced** under `capability-lab/`.
