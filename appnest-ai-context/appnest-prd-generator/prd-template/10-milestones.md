# {{product_name}} — Milestones

## MVP (v1) scope

{{mvp_scope}}

**Deliverables:**

- Backend: `app-backend/server.js` exporting all functions listed in 08-api-contracts; handlers implemented using AppNest SDK only; no SDK in package.json.
- Manifest: `backend_api_functions`, `event_listener_functions`, `installation_params`, `oauth_config` (if any), `whitelisted_domains` complete and consistent with server.js.
- Frontend (if applicable): `app-frontend/src/App.jsx` and components using Twigs (`@sparrowengg/twigs-react`, `@sparrowengg/twigs-react-icons`); backend invoked via `window.appnestClientFunctions.appBackend.invoke`.
- Data: All persistent state in $db with keys and types documented in 07-data-model.
- Validation: All items in `appnest-tools/appnest-prd-generator/validation-checklist.md` passed → **READY TO BUILD APP**.

---

## Phase 1 (MVP)

| # | Milestone | Dependencies | Done when |
|---|-----------|--------------|-----------|
| M1 | {{milestone_1_name}} | {{milestone_1_deps}} | {{milestone_1_done_when}} |
| M2 | {{milestone_2_name}} | {{milestone_2_deps}} | {{milestone_2_done_when}} |
| M3 | {{milestone_3_name}} | {{milestone_3_deps}} | {{milestone_3_done_when}} |

---

## Phase 2 (post-MVP)

{{phase_2_milestones}}

---

## Dependencies and risks

{{dependencies_and_risks}}
