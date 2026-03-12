# {{product_name}} — UI Screens

Use this document when the app has a **full-page UI** (`app-frontend`). For each main screen or view, document purpose, how the user reaches it, layout, actions, and which backend APIs it calls. Screens should align with the user flows in [04-user-flows.md](04-user-flows.md) and the backend API functions in [08-api-contracts.md](08-api-contracts.md). UI is built in `app-frontend/src/App.jsx` and child components using **@sparrowengg/twigs-react** and **@sparrowengg/twigs-react-icons**.

If the app has **no full-page UI** (backend-only or events-only), write *Not applicable* and remove the screen tables below.

---

## Screens overview

| Screen ID | Screen name | Purpose (one line) | Entry (how user reaches it) |
|-----------|-------------|--------------------|-----------------------------|
| S1 | {{screen_1_name}} | {{screen_1_purpose}} | {{screen_1_entry}} |
| S2 | {{screen_2_name}} | {{screen_2_purpose}} | {{screen_2_entry}} |
| {{S3_S4}} | … | … | … |

---

## Screen 1: {{screen_1_name}}

| Field | Description |
|-------|-------------|
| **Purpose** | {{screen_1_purpose}} |
| **How user reaches it** | {{screen_1_entry}} |
| **Layout / sections** | {{screen_1_layout}} (e.g. header, filters bar, table, footer) |
| **Main UI elements** | {{screen_1_elements}} (e.g. table, form, buttons, modals — use Twigs components) |
| **User actions** | {{screen_1_actions}} For each action that calls the backend: **action** → **functionName** (from `backend_api_functions`), payload summary. |
| **Data shown** | {{screen_1_data}} (source: e.g. response of `getMappings`, or “field X from API Y”) |
| **Empty / loading / error** | {{screen_1_states}} (what the user sees when no data, loading, or error) |

---

## Screen 2: {{screen_2_name}}

| Field | Description |
|-------|-------------|
| **Purpose** | {{screen_2_purpose}} |
| **How user reaches it** | {{screen_2_entry}} |
| **Layout / sections** | {{screen_2_layout}} |
| **Main UI elements** | {{screen_2_elements}} |
| **User actions** | {{screen_2_actions}} (action → functionName, payload summary) |
| **Data shown** | {{screen_2_data}} |
| **Empty / loading / error** | {{screen_2_states}} |

---

## Additional screens

{{additional_screens}}

(For each extra screen, add a section with the same structure: Purpose, How user reaches it, Layout, Main UI elements, User actions with functionName, Data shown, Empty/loading/error.)
