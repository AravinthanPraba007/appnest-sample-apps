# SurveySparrow Response Viewer — UI Screens

Use this document for the **full-page UI** in `app-frontend`. Every screen **MUST** be implemented with **only** **@sparrowengg/twigs-react** and **@sparrowengg/twigs-react-icons**. Use **Stack** and **Box** for layout; use Twigs components (**Button**, **Select**, **Input**, **Alert**, **Spinner**, **Table**, **Text**, etc.). **No raw HTML** for buttons, selects, inputs, or tables. Responsive layout; polished, professional SaaS look. See `appnest-governance/02-sdk/07-Twigs-UI-Reference.md`.

---

## Screens overview

| Screen ID | Screen name | Purpose (one line) | Entry (how user reaches it) |
|-----------|-------------|--------------------|-----------------------------|
| S1 | Survey List | List all surveys and allow opening responses. | User opens the app (default view). |
| S2 | Response Viewer | Show paginated survey responses (ID, date, Q/A). | User clicks “View Responses” on a survey from S1. |

---

## Screen 1: Survey List

| Field | Description |
|-------|-------------|
| **Purpose** | Display all surveys from SurveySparrow and let the user select one to view responses. |
| **How user reaches it** | App load (root view). |
| **Layout / sections** | **Stack** (vertical): header with title “SurveySparrow Response Viewer” (**Text**); main content **Box** with list of surveys (cards or **Table**); each row/card: survey name, survey ID, created date, **Button** “View Responses”. Use **Stack** and **Box** for spacing. |
| **Main UI elements (Twigs only)** | **Box**, **Stack**, **Text**, **Button**, **Table** (or **Box**-based cards). No raw HTML for buttons or tables. Use **Spinner** while loading; **Alert** for errors. |
| **User actions** | On load → call **getSurveys** (no payload). “View Responses” → store survey ID, navigate to S2, call **getSurveyResponses** with `{ surveyId, page: 1, perPage: 10 }`. |
| **Data shown** | Survey name, survey ID, created date (from getSurveys response). |
| **Empty / loading / error** | **Spinner** while loading; **Alert** for API error (e.g. Unauthorized, timeout) with retry; **Text** for “No surveys found” when list is empty. |

---

## Screen 2: Response Viewer

| Field | Description |
|-------|-------------|
| **Purpose** | Show one page of survey responses with response ID, submission date, and Q/A pairs; support pagination. |
| **How user reaches it** | User clicked “View Responses” on S1. |
| **Layout / sections** | **Stack**: header with survey name and back link/button to S1; **Box** for response cards (each response: **Box** or card with **Text** for Response ID, Submitted At, and list of Q/A); footer **Stack** with **Button** “Previous”, **Text** “Page X of N”, **Button** “Next”. |
| **Main UI elements (Twigs only)** | **Box**, **Stack**, **Text**, **Button** (Previous, Next, Back). Response content: **Text** for labels and values. **Spinner** while loading; **Alert** for errors. No raw HTML for buttons or layout. |
| **User actions** | “Back” → return to S1. “Previous” / “Next” → call **getSurveyResponses** with `{ surveyId, page: page - 1 | page + 1, perPage: 10 }`. |
| **Data shown** | For each response: response ID, submitted at (date), questions and answers (Q1: … A: …). From getSurveyResponses response. |
| **Empty / loading / error** | **Spinner** while loading; **Alert** for API error (timeout, unauthorized) with retry; **Text** “No responses found” when the page has zero responses. Disable Previous on page 1, Next on last page. |

---

## Additional screens

None for v1. Both main flows are covered by S1 and S2.
