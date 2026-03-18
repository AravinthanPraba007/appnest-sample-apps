# SurveySparrow → Slack Response Sender — Feature Requirements

## Core features (v1)

| ID | Feature | Description | Priority | Acceptance criteria |
|----|---------|-------------|----------|---------------------|
| F1 | List surveys | Backend calls SurveySparrow to list surveys; UI shows **Select** | Must have | Dropdown shows `name`; empty/error states documented |
| F2 | Fetch latest responses | On send, GET latest 5 responses for chosen `survey_id` | Must have | Parsed `respondent` + Q&A pairs as per API shape |
| F3 | Format Slack message | Build plain-text body: survey name, Response N blocks | Must have | Matches spec example structure |
| F4 | POST to Slack webhook | `$http` POST JSON `{ "text": "..." }` to user-supplied URL | Must have | Success/failure surfaced in UI; webhook never logged |
| F5 | Error handling | Survey API fail, no responses, invalid webhook, 429 | Must have | Table in PRD overview / 09 NFR |

## Configuration / settings

- **installation_params:** `surveysparrow_api_token` (secure) — SurveySparrow API bearer token for server-side calls.
- **Per action (UI only, not persisted):** Slack Incoming Webhook URL passed in `sendLatestResponsesToSlack` payload only.

## Platform events (if any)

*None.* No `event_listener_functions` for v1.

## UI surface

- **Full-page app:** **Yes** — `app-frontend/src/App.jsx`; Twigs-only UI per **11-ui-screens.md**.
- **Custom installation frontend:** **No** (v1).

## Out of scope (v1)

Long-term storage, scheduling, analytics, response filtering, OAuth for SurveySparrow (token-only install param).
