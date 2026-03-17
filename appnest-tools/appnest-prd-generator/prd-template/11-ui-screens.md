# {{product_name}} — UI Screens

Use this document when the app has a **full-page UI** (`app-frontend`). For each main screen or view, document purpose, how the user reaches it, layout, actions, and which backend APIs it calls. Screens should align with the user flows in [04-user-flows.md](04-user-flows.md) and the backend API functions in [08-api-contracts.md](08-api-contracts.md).

**UI implementation rule (Twigs only, responsive, SaaS “wow”):** Every screen **MUST** be implemented with **only** **@sparrowengg/twigs-react** and **@sparrowengg/twigs-react-icons**. Use **Stack** and **Box** for layout and spacing; use Twigs form and feedback components (**Select**, **Input**, **Button**, **Alert**, **Spinner**, **Table**, **Text**, etc.) for forms, errors, and loading. **No raw HTML** for buttons, selects, inputs, or tables—use Twigs components only. Use **responsive** layout so the app works on desktop, tablet, and mobile. The app is **viewed inside a SaaS product** and must look and feel **polished and professional** (clear hierarchy, readable typography, coherent spacing—a “wow” experience). See `appnest-governance/02-sdk/07-Twigs-UI-Reference.md` for the mapping (e.g. dropdown → Select, error → Alert, loading → Spinner) and responsive/SaaS guidance.

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
| **Layout / sections** | {{screen_1_layout}} Use **Stack** and **Box** for layout (e.g. header, filters bar, table, footer). |
| **Main UI elements (Twigs only)** | {{screen_1_elements}} List **exact Twigs component names** (e.g. **Button**, **Box**, **Stack**, **Text**, **Select**, **Input**, **Alert**, **Table**, **Spinner**). Use **only** Twigs and twigs-react-icons—**no raw HTML** for buttons, selects, inputs, or tables. Map: dropdown → Select, error → Alert, loading → Spinner, data grid → Table. |
| **User actions** | {{screen_1_actions}} For each action that calls the backend: **action** → **functionName** (from `backend_api_functions`), payload summary. |
| **Data shown** | {{screen_1_data}} (source: e.g. response of `getMappings`, or “field X from API Y”) |
| **Empty / loading / error** | {{screen_1_states}} Use **Text**, **Spinner**, **Alert** for empty, loading, and error states—no raw HTML or custom CSS-only divs. |

---

## Screen 2: {{screen_2_name}}

| Field | Description |
|-------|-------------|
| **Purpose** | {{screen_2_purpose}} |
| **How user reaches it** | {{screen_2_entry}} |
| **Layout / sections** | {{screen_2_layout}} Use **Stack** and **Box** for layout. |
| **Main UI elements (Twigs only)** | {{screen_2_elements}} Exact Twigs components (Button, Select, Input, Alert, Table, Spinner, Stack, Box, Text, etc.). No raw HTML for controls. |
| **User actions** | {{screen_2_actions}} (action → functionName, payload summary) |
| **Data shown** | {{screen_2_data}} |
| **Empty / loading / error** | {{screen_2_states}} Use Twigs **Text**, **Spinner**, **Alert** where applicable. |

---

## Additional screens

{{additional_screens}}

(For each extra screen, add a section with the same structure. For **Main UI elements**, list exact Twigs component names; state that implementation **MUST** use only Twigs for that screen (no raw HTML).)
