# Appnest Sample App

Appnest (SurveySparrow) sample app with frontend, installation frontend, and backend.

## Structure

- **`app-frontend/`** – Main app UI (Vite + React). Full-page app entry.
- **`app-installation-frontend/`** – Custom installation/setup UI (Vite + React).
- **`app-backend/`** – Node backend: API functions and event handlers (e.g. `onSubmissionComplete`, `onContactCreate`).
- **`manifest.json`** – App manifest (platform version, frontend locations, backend functions, installation params, OAuth).
- **`.env`** – Environment variables (not committed).

## Running locally

1. **Backend** (from project root):
   ```bash
   cd app-backend && npm install && node server.js
   ```

2. **Frontend** (from project root):
   ```bash
   cd app-frontend && npm install && npm run dev
   ```
   (If the basecode uses Vite, ensure `package.json` has a `dev` script; otherwise build with the tooling that generated `dist/`.)

3. **Installation frontend** (optional):
   ```bash
   cd app-installation-frontend && npm install && npm run dev
   ```

## Cleanup (optional)

If you no longer need the original extracted folder and zip:

- Remove `appnest-sample-basecode-main/`
- Remove `appnest.zip`
