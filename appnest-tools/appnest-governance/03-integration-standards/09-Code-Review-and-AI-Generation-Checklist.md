# Code Review and AI Generation Checklist

**Before considering a change complete, verify every item below.** Use this checklist for code review and when validating AI-generated code.

## Runtime Safety

- [ ] Batching implemented for large datasets
- [ ] $schedule used for long-running flows
- [ ] $db used for state persistence
- [ ] No unbounded loops

## External API

- [ ] Idempotency implemented
- [ ] Non-200 handled
- [ ] Rate limits respected

## SDK Compliance

- [ ] No direct HTTP libraries (use $http)
- [ ] Handlers exported from **app-backend/server.js** only
- [ ] ResultData or structured return used

## Manifest

- [ ] **event_listener_functions** and **backend_api_functions** match exports from app-backend/server.js
- [ ] **oauth_config** declared if OAuth is used
- [ ] **frontend_locations** (e.g. full_page_app.url) set correctly

## Entry Points

- [ ] Frontend entry: **app-frontend/src/App.jsx**
- [ ] Backend entry: **app-backend/server.js** (only exported functions are invokable)

## AI Generated Code

- [ ] No hallucinated SDK methods
- [ ] No forbidden libraries
- [ ] Structure matches Appnest standards