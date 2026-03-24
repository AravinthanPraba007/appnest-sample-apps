# SurveySparrow Response Viewer — UI Screens

Full-page app: three main screens. Every screen **MUST** be implemented with **only** **@sparrowengg/twigs-react** and **@sparrowengg/twigs-react-icons**. Use **Stack** and **Box** for layout; use Twigs components (Select, Input, Button, Alert, Spinner, Table, Text, etc.). **No raw HTML** for buttons, selects, inputs, or tables. Responsive layout; polished, professional SaaS look. See `appnest-governance/04-frontend/07-Twigs-UI-Reference.md`.

---

## Screens overview

| Screen ID | Screen name | Purpose (one line) | Entry (how user reaches it) |
|-----------|-------------|---------------------|-----------------------------|
| S1 | Survey List | List surveys from cache; sync and select one to view responses | App open / default route |
| S2 | Response Viewer | View paginated survey responses (10 per page) | Click "View Responses" on Survey List |
| S3 | Backup Files | List backup files and download | Navigation link / tab from app shell |

---

## Screen 1: Survey List

| Field | Description |
|-------|-------------|
| **Purpose** | Show all available surveys (from cache); allow Sync to refresh; allow selecting a survey to view responses. |
| **How user reaches it** | Default screen when user opens the app. |
| **Layout / sections** | **Stack** (vertical): header (title "Surveys" or "Survey List"), optional **Box** for toolbar (Sync **Button**), then **Table** or card list of surveys (Survey Name, Survey ID, Created Date, **Button** "View Responses"). Footer optional. |
| **Main UI elements (Twigs only)** | **Box**, **Stack**, **Text** (title, labels), **Button** (Sync, View Responses), **Table** (or **Box** + **Text** per row for card layout), **Spinner** (loading), **Alert** (error or empty). No raw HTML for controls. |
| **User actions** | (1) **Sync** → `syncSurveys`, payload `{}`. (2) **View Responses** (per row) → store survey ID, navigate to S2, then call `getResponses({ surveyId, page: 1, per_page: 10 })`. On load: **getSurveys** → `getSurveys`, payload `{}`. |
| **Data shown** | surveys and optional lastSync from `getSurveys` response; each row: name, id, created date. |
| **Empty / loading / error** | **Spinner** while getSurveys/syncSurveys in progress; **Alert** on error; **Text** for empty list ("No surveys" or "Sync to load surveys"). |

---

## Screen 2: Response Viewer

| Field | Description |
|-------|-------------|
| **Purpose** | Display one page of survey responses (10 per page) with response ID, respondent info, submission date, Q&A pairs; pagination. |
| **How user reaches it** | From Survey List: user clicks "View Responses" on a survey. |
| **Layout / sections** | **Stack**: header (survey name / back link), **Box** for pagination (Previous **Button**, **Text** "Page X of N", Next **Button**), then list of response **Box**/cards (each: response ID, submitted at, Q&A pairs in **Text** or expandable). Use **Stack** and **Box** for spacing. |
| **Main UI elements (Twigs only)** | **Box**, **Stack**, **Text**, **Button** (Previous, Next, Back), **Spinner**, **Alert**; response cards as **Box** with **Text** (or **Table** for tabular layout). No raw HTML. |
| **User actions** | **Previous** / **Next** → `getResponses({ surveyId, page, per_page: 10 })` with updated page. **Back** → navigate to S1. Initial load: same with page 1. |
| **Data shown** | data and meta from `getResponses` (responses array, page, total); each response: id, respondent info, submitted_at, question–answer pairs. |
| **Empty / loading / error** | **Spinner** while loading; **Alert** on error; **Text** for "No responses" when data length 0. |

---

## Screen 3: Backup Files

| Field | Description |
|-------|-------------|
| **Purpose** | List available backup files and allow download. |
| **How user reaches it** | User clicks "Backups" or "Backup Files" in app navigation. |
| **Layout / sections** | **Stack**: header ("Backup Files"), **Table** or list of rows: file name (e.g. responses_2026_03_10.json), **Button** "Download". Use **Box** and **Stack**. |
| **Main UI elements (Twigs only)** | **Box**, **Stack**, **Text**, **Button** (Download per file), **Table** (or **Box** rows), **Spinner**, **Alert**. No raw HTML. |
| **User actions** | On load: **listBackups** → `listBackups`, payload `{}`. **Download** (per file) → `getBackupDownloadUrl({ path })` then open/redirect to URL or trigger download. |
| **Data shown** | files from `listBackups` (name, path, optional size). |
| **Empty / loading / error** | **Spinner** while listBackups in progress; **Alert** on error; **Text** for "No backup files yet." |

---

## Additional screens

None for v1. Navigation between S1, S2, S3 can be tabs, sidebar, or buttons in **Box**/header; use Twigs **Button** and **Text** only.
