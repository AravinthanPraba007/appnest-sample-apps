# SurveySparrow Contact Export — UI Screens

**UI implementation rule (Twigs only, responsive, SaaS “wow”):** Every screen **MUST** use **only** **@sparrowengg/twigs-react** and **@sparrowengg/twigs-react-icons**. Use **Stack** and **Box** for layout; **Table** (or structured list), **Input**, **Select**, **Button**, **Alert**, **Spinner**, **Text**, **Checkbox** (or Twigs selection pattern for rows) as provided by Twigs. **No raw HTML** for buttons, inputs, selects, or tables. Responsive layout for desktop and tablet. See `appnest-ai-context/appnest-governance/App-Frontend-Rules.md` and `Twigs-UI-Reference.md`.

---

## Screens overview

| Screen ID | Screen name | Purpose (one line) | Entry (how user reaches it) |
|-----------|-------------|--------------------|-----------------------------|
| S1 | **Contacts** | Browse, search, filter, select, export contacts. | Default **full-page app** load (`index.html` / `App.jsx`). |

---

## Screen 1: Contacts

| Field | Description |
|-------|-------------|
| **Purpose** | Primary workspace: paginated contact list with search/filters, multi-select, and CSV export. |
| **How user reaches it** | Opening the Appnest full-page app entry. |
| **Layout / sections** | **Stack** vertical: header row (title + export actions), **Toolbar** row (search **Input**, filter **Select**s, optional clear), main **Box** with **Table** / data grid, footer **Stack** (pagination controls + selected count). |
| **Main UI elements (Twigs only)** | **Box**, **Stack**, **Text** (title, counts, empty state), **Input** (search), **Select** (filters), **Button** (Export CSV, optional Refresh), **Table** (or Twigs data table pattern), row selection via Twigs **Checkbox** or row selection API, **Spinner** (loading), **Alert** (errors), icons from **twigs-react-icons** (e.g. download, search). |
| **User actions** | **Load / change page** → **`getContacts`**: `{ page, limit, search, ...filters }`. **Load contact lists** (if implemented) → **`getContactLists`**: `{}` or pagination payload. **Export CSV** → *client-side only* (no `apiFunctionName`); build file from selected row objects. |
| **Data shown** | Fields returned by **`getContacts`** normalized for table (e.g. name, email, phone, list, status, created_at—exact fields per API response mapping). |
| **Empty / loading / error** | **Spinner** while fetching; **Text** for “No contacts match your filters”; **Alert** variant for API/auth/rate-limit errors with short remediation text. |

---

## Additional screens

*None for v1.* Settings are limited to **installation-time** API key (no in-app settings screen required).
