# SurveySparrow Contact CSV Export — User Flows

## Flow 1: Browse and search contacts

**Trigger:** User opens the full-page app from the SurveySparrow app surface.  
**Actor:** Primary persona (admin / ops).  
**Screen(s):** Contacts (see `11-ui-screens.md`, Screen 1).  
**Steps:**

1. App loads; frontend invokes `listSurveySparrowContacts` with default `page` and `maxResults`.
2. Backend calls SurveySparrow `GET /v1/contacts` with `Authorization: Bearer <token>` and returns contacts plus pagination hints (`hasNextPage` / equivalent from API response).
3. User optionally types a search string or changes page size; frontend re-invokes `listSurveySparrowContacts` with updated query params.

**Outcome:** The user sees an up-to-date table of contacts for the current filters.

**AppNest note:** The frontend calls `window.appnestClientFunctions.appBackend.invoke({ apiFunctionName: 'listSurveySparrowContacts', payload })` where `apiFunctionName` is declared in `backend_api_functions`.

---

## Flow 2: Select contacts and download CSV

**Trigger:** User selects one or more table rows (checkboxes) and clicks **Export CSV**.  
**Actor:** Primary persona.  
**Screen(s):** Contacts (Screen 1).  
**Steps:**

1. User toggles checkboxes; the client keeps a map of selected contact IDs to row objects so selections survive pagination within the session.
2. User clicks **Export CSV** (enabled only when at least one row is selected).
3. The client builds a CSV string from the selected objects (header row + values), creates a `Blob`, and triggers a browser download (e.g. `contacts-export-YYYY-MM-DD.csv`). No extra backend call is required for v1.

**Outcome:** A CSV file containing only the selected contacts is downloaded.

---

## Additional flows

_None for v1. Future: “Select all matching search” (server-assisted), scheduled export, or `$file`-based export._
