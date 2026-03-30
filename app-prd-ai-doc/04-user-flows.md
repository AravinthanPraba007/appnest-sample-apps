# SurveySparrow Contact Export — User Flows

## Flow 1: Browse and paginate contacts

**Trigger:** User opens the full-page app from the Appnest entry point.  
**Actor:** Admin / ops user.  
**Screen(s):** Contacts list (main) — see `11-ui-screens.md`.  
**Steps:**

1. App loads; frontend calls backend **`getContacts`** with default page (e.g. `page: 1`, `limit: 50`).
2. Backend uses **$fetch** to call SurveySparrow `GET /v3/contacts` with Bearer/token from **installation_params**; returns normalized payload (rows + `has_next_page` + metadata).
3. User changes page (next/previous or page control); frontend calls **`getContacts`** with updated `page` (and current filter/search state).

**Outcome:** User sees a **stable, paginated** list consistent with SurveySparrow data.

**AppNest note:** UI triggers **`window.appnestClientFunctions.appBackend.invoke({ apiFunctionName: 'getContacts', payload })`**. `getContacts` is declared in `manifest.json` → `backend_api_functions`.

---

## Flow 2: Search and filter in real time

**Trigger:** User types in search or changes a filter control.  
**Actor:** Admin / ops user.  
**Screen(s):** Contacts list (main).  
**Steps:**

1. User enters **search** text; frontend **debounces** (e.g. 300–500 ms) then calls **`getContacts`** with `search` and **resets to page 1**.
2. User selects optional filters (e.g. contact list, status/type, date range) mapped to supported **query parameters** on `GET /v3/contacts`; frontend calls **`getContacts`** with updated params and page 1.
3. Backend forwards allowed parameters only; invalid combinations return a clear error message to the UI.

**Outcome:** Results **update** to match criteria without loading unrelated pages.

---

## Flow 3: Multi-select and export CSV

**Trigger:** User selects one or more rows, then chooses **Export CSV**.  
**Actor:** Admin / ops user.  
**Screen(s):** Contacts list (main).  
**Steps:**

1. User toggles **row selection** (including “select all on current page” if offered—must not silently select unseen pages unless explicitly documented).
2. User clicks **Export CSV**.
3. Frontend builds a **CSV** from **selected** row objects (columns = defined set of fields from API response); triggers browser download (e.g. Blob + filename `surveysparrow-contacts-YYYY-MM-DD.csv`).

**Outcome:** User receives a CSV file containing **only selected** contacts with consistent headers.

**AppNest note:** v1 export is **client-side** from data already returned to the UI; no extra backend function required unless future requirement demands server-side generation ($file / email).

---

## Additional flows

## Flow 4: Recover from API errors

**Trigger:** SurveySparrow returns 401/403/429/5xx or network failure.  
**Actor:** Admin / ops user.  
**Screen(s):** Contacts list (main).  
**Steps:**

1. Backend maps external errors to **`ResultData`** (or structured body) with safe message; never leaks raw tokens.
2. UI shows **Alert** (Twigs) with retry guidance (e.g. check API key, try again later for rate limit).

**Outcome:** User understands failure mode without exposing secrets.
