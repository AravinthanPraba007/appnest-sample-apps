# Appnest Engine

Development CLI and runtime for Appnest apps. It wires your **app-backend**, **app-frontend**, and optional **app-install-frontend** behind a single proxy, runs checks, and helps you bundle and zip the app for distribution.

**Package:** `@aravinthan_p/appnest-engine` · **CLI binary:** `appnest-engine`

For a focused list of commands, see **[Appnest-Engine-Commands.md](./Appnest-Engine-Commands.md)**.

---

## Overview

Appnest Engine runs from the **developer's project directory** (where `app-backend`, `app-frontend`, etc. live). It provides:

- **CLI** – Commands for init, precheck, install, start, validate, bundle, and pack (see [Appnest-Engine-Commands.md](./Appnest-Engine-Commands.md)).
- **Proxy** – One server on port **3000** (default) that routes traffic to your app's backend and frontends.
- **Engine packages** – Shared runtime (proxy, backend layer, Vite dev servers) that load your app code from the current directory via `ORIGINAL_CWD`.

---

## Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Developer runs:  appnest-engine app start                              │
│  (from their app project directory: app-backend, app-frontend, etc.)      │
└─────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  CLI (cli.js)                                                            │
│  • Parses "app start" → appnestAction("start")                             │
│  • runtimeUtils.runApp() starts only: appnest-proxy                       │
└─────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  appnest-proxy (port 3000)                                               │
│  • Reads .env from ORIGINAL_CWD (developer's project)                    │
│  • Allocates ports for app-backend, app-frontend, app-install-frontend   │
│  • Starts appnest-backend (loads user's app-backend/server.js)          │
│  • Starts appnest-frontend (Vite dev server for app-frontend)             │
│  • Starts appnest-install-frontend if app-install-frontend exists    │
│  • Proxies:                                                              │
│      /app-backend/*  → app-backend                                       │
│      /app-frontend/* → app-frontend                                      │
│      /app-install-frontend/* → installation UI                      │
│  • Watches app-backend / app-frontend and restarts on change (backend)   │
│    or on config change (frontends); HMR for normal frontend edits        │
└─────────────────────────────────────────────────────────────────────────┘
                                      │
          ┌───────────────────────────┼───────────────────────────┐
          ▼                           ▼                           ▼
┌──────────────────┐    ┌────────────────────┐    ┌────────────────────────────┐
│ appnest-backend  │    │ appnest-frontend   │    │ appnest-install-frontend   │
│ (Express layer)  │    │ (Vite dev server)  │    │ (Vite dev server)          │
│ Loads user's     │    │ Serves user's      │    │ Serves user's              │
│ app-backend/     │    │ app-frontend/      │    │ app-install-frontend/ │
│ server.js        │    │                    │    │ (optional)                 │
└──────────────────┘    └────────────────────┘    └────────────────────────────┘
```

- **User directory** = where the developer runs the CLI (`process.cwd()` → `ORIGINAL_CWD` for child processes).
- **Engine packages** (in this repo) = `appnest-backend`, `appnest-frontend`, `appnest-install-frontend`, `appnest-proxy`. They load and serve the **app** folders from the user directory.

---

## Project structure

| Path | Role |
|------|------|
| `cli.js` | Entry point for `appnest-engine`; Commander; delegates to `appnest-command-line`. |
| `index.js` | Exports `appnestAction` for programmatic use. |
| `package.json` | Root package; `bin.appnest-engine` → `cli.js`; version used by CLI. |
| **appnest-command-line/** | CLI actions: init, precheck, install, start, validate, bundle, pack. |
| **appnest-proxy/** | Express on port 3000; reads user `.env`; starts backend + frontends; proxies and file watching. |
| **appnest-backend/** | Express app that loads the user's `app-backend/server.js` under `/app-backend`. |
| **appnest-frontend/** | Vite dev server / build tooling for the user's `app-frontend`. |
| **appnest-install-frontend/** | Vite dev server / build for the user's optional `app-install-frontend`. |

**Developer project** (user directory) typically includes:

- `app-backend/` (e.g. `server.js`)
- `app-frontend/` (e.g. Vite/React app)
- Optional: `app-install-frontend/`
- `.env` — proxy reads this for ports, `CLIENT_SCRIPT_URL`, `PROXY_DEBUG_LOGS`, etc.

---

## Installation

From the **engine** repo root:

```bash
npm install
```

That installs **root** dependencies only (`commander`, `eslint`, `stylelint`, …). To install dependencies inside each engine package (`appnest-backend`, `appnest-frontend`, `appnest-install-frontend`, `appnest-proxy`), run:

```bash
appnest-engine app install-packages
```

(Run from anywhere with the CLI on your `PATH`, or use `node path/to/cli.js app install-packages` from the engine repo.)

---

## CLI usage

| Command | Description |
|---------|-------------|
| `appnest-engine --version` | Print engine version (root `package.json`). |
| `appnest-engine app init` | Download Appnest base code from GitHub into the current directory. |
| `appnest-engine app precheck` | Node.js (≥22) and existence of all configured engine + app paths. |
| `appnest-engine app install-packages` | `npm install` in `appnest-backend`, `appnest-frontend`, `appnest-install-frontend`, `appnest-proxy`. |
| `appnest-engine app start` | Start **appnest-proxy**; proxy starts backend + frontends and proxies traffic. |
| `appnest-engine app bundle-frontend` | Run `npm run build` in `appnest-frontend` and `appnest-install-frontend` (builds into the **user's** app folders via `ORIGINAL_CWD`). |
| `appnest-engine app pack` | Runs **bundle-frontend**, then packages `app-frontend`, `app-backend`, `app-install-frontend` (+ `manifest.json`) into `appnest-app-pack/` and a timestamped zip under `app-pack-zip/`. |
| `appnest-engine app validate` | ESLint (and related checks) on `app-backend` / `app-frontend`; validates `manifest.json`. |
| `appnest-engine app ai-context` | Download AI context into `appnest-ai-context/` at project root. Replaces existing folder if present. |
| `appnest-engine help` | Print short help for available `app` actions. |

**Typical developer flow**

1. In the **app project** directory: `appnest-engine app init` (if needed).
2. `appnest-engine app precheck` (optional).
3. `appnest-engine app install-packages` (after cloning or updating the engine).
4. From the **app project** directory: `appnest-engine app start` → proxy on port **3000**, e.g. `http://localhost:3000/app-frontend/`, API at `http://localhost:3000/app-backend/`.

---

## Runtime flow (`start`)

1. **CLI** starts **appnest-proxy** with `ORIGINAL_CWD` = current working directory.
2. **Proxy** reads `.env`, allocates ports, then:
   - Starts **appnest-backend** (user's `app-backend/server.js`).
   - Starts **appnest-frontend** (Vite for `app-frontend`).
   - If `app-install-frontend` exists, starts **appnest-install-frontend**.
3. Routes (defaults; ports from `.env` where applicable):
   - `/app-backend` → backend
   - `/app-frontend` → main frontend
   - `/app-install-frontend` → installation UI
4. **Watching**: `app-backend` changes restart the backend; `vite.config.js` / `.env` changes can restart frontends; ordinary source edits use Vite HMR.

---

## Zip / bundle flow

- **`bundle-frontend`** builds both engine frontends so output lands in the user's `app-frontend/dist` and `app-install-frontend/dist` (when those trees exist).
- **`pack`** runs **bundle-frontend**, may rewrite paths in `app-frontend/dist/index.html`, copies `app-frontend`, `app-backend`, `app-install-frontend`, and `manifest.json` into **`appnest-app-pack/`**, then creates **`app-pack-zip/app-pack-<timestamp>.zip`**.

---

## License

ISC
