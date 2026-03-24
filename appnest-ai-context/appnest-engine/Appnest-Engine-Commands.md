# Appnest Engine — Commands overview

Quick reference for **`appnest-engine`** CLI actions. All **`app`** commands are invoked as:

```bash
appnest-engine app <action>
```

Run these from your **app project directory** (where `app-backend` / `app-frontend` live) unless noted. The engine resolves paths from **`process.cwd()`** and passes **`ORIGINAL_CWD`** to the proxy and Vite builds.

For architecture and setup, see **[Appnest-Engine-README.md](./Appnest-Engine-README.md)**.

---

## Command summary

| Action | Purpose |
|--------|---------|
| **`init`** | Scaffold or refresh the standard Appnest app layout in the current folder (base code from GitHub). Use once or when you need a fresh template. |
| **`precheck`** | Verify **Node.js ≥ 22** and that every engine + app path the CLI knows about exists on disk. Fails fast with guidance if something is missing. |
| **`install-packages`** | Run **`npm install`** inside each **engine** package: `appnest-backend`, `appnest-frontend`, `appnest-install-frontend`, `appnest-proxy`. Use after cloning the engine or changing engine dependencies. |
| **`start`** | Start the **proxy** only; the proxy then starts the backend wrapper, main Vite app, and (if present) the installation Vite app. This is the main **local dev** entry point (single port, unified routing). |
| **`bundle-frontend`** | Production **build** for both engine frontends (`npm run build` in `appnest-frontend` and `appnest-install-frontend`). Output is written into **your** `app-frontend/dist` and `app-install-frontend/dist` via `ORIGINAL_CWD`. |
| **`pack`** | Runs **`bundle-frontend`**, adjusts `app-frontend/dist/index.html` paths where needed, copies **`app-frontend`**, **`app-backend`**, **`app-install-frontend`**, and **`manifest.json`** into **`appnest-app-pack/`**, then zips that folder to **`app-pack-zip/app-pack-<timestamp>.zip`**. For deployment / distribution packs. |
| **`validate`** | Run linting (and related validation) on **`app-backend`** and **`app-frontend`**, and validate **`manifest.json`**. |
| **`ai-context`** | Download AI context from GitHub into **`appnest-ai-context/`** at project root. Replaces existing folder if present. |

---

## Other invocations

| Invocation | Purpose |
|------------|---------|
| **`appnest-engine --version`** | Show engine version from root `package.json`. |
| **`appnest-engine help`** | Print the built-in short list of `app` actions. |
| **`appnest-engine app`** (no param) | Same as above — lists all app actions. |
| **`appnest-engine app help`** | Same as above. |
| **`appnest-engine app -h`** | Same as above (Commander built-in help). |

---

## Notes

- **`install-packages`** does **not** run `npm install` in the user’s `app-backend` / `app-frontend`; those are your app’s own dependencies—install them in those folders as usual.
- **`app-install-frontend`** is **optional**; if the folder is missing, install UI is skipped and zip may warn for that path.
- Engine folder **`appnest-install-frontend`** serves the user folder **`app-install-frontend`** (names differ on purpose).
