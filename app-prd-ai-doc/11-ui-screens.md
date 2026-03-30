# SurveySparrow Contact CSV Export — UI Screens

**UI implementation rule (Twigs only, responsive, SaaS “wow”):** Every screen **MUST** be implemented with **only** **@sparrowengg/twigs-react** and **@sparrowengg/twigs-react-icons**. Use **Stack** and **Box** for layout; use Twigs **Select**, **Input**, **Button**, **Alert**, **Spinner**, **Table**, **Text**, **Checkbox** (or Twigs table selection pattern per Twigs-UI-Reference). **No raw HTML** for buttons, selects, inputs, or tables. Responsive layout for desktop and tablet. Professional spacing and hierarchy per `appnest-governance/App-Frontend-Rules.md` and `Twigs-UI-Reference.md`; `package.json` uses `"*"` for Twigs packages.

---

## Screens overview

| Screen ID | Screen name | Purpose (one line) | Entry (how user reaches it) |
|-----------|-------------|--------------------|-----------------------------|
| S1 | Contacts | Browse, search, paginate, select, export CSV | Default route when opening the full-page app |

---

## Screen 1: Contacts

| Field | Description |
|-------|-------------|
| **Purpose** | View SurveySparrow contacts and download a CSV of the selected subset. |
| **How user reaches it** | User launches the Appnest full-page app from SurveySparrow. |
| **Layout / sections** | **Stack** vertical: header **Text** (app title); filter **Box** with **Input** (search), optional **Select** (contact `type`), **Text** (page size / pagination info); **Alert** for errors; **Table** with selection; footer **Box** with pagination **Button**s (Previous / Next) and primary **Button** (“Export CSV”). |
| **Main UI elements (Twigs only)** | **Box**, **Stack**, **Text**, **Input**, **Select**, **Button**, **Alert**, **Spinner**, **Table**, row selection via Twigs-supported **Checkbox** or table selection API, **twigs-react-icons** for icon-only affordances (e.g. export/download). |
| **User actions** | **Load / refresh list** → **apiFunctionName:** `listSurveySparrowContacts`, **payload:** `{ page, maxResults, search?, type? }`. **Export CSV** → no backend call; client builds CSV from selected row objects and triggers download. |
| **Data shown** | Rows from latest `listSurveySparrowContacts` response (`contacts` array); columns aligned to API fields (id, name, email, phone, mobile, jobTitle, active, unsubscribed, etc.). **Text** shows “Selected: N”. |
| **Empty / loading / error** | Loading: center **Spinner** with **Text**. Empty list: **Text** (“No contacts match”). Error: **Alert** variant error with message from backend. Export disabled when N = 0. |

---

## Screen 2: (not used)

_Not applicable — single-screen v1._

---

## Additional screens

_None._
