# Gaffer FC

Gaffer is now a browser-only football club manager. It runs with VS Code Live Server and does not need PHP, MySQL, Node.js, or an internet connection.

## Run it

1. Open this inner `Gaffer-main/Gaffer-main` folder in VS Code.
2. Install the **Live Server** extension if needed.
3. Right-click `index.html` and choose **Open with Live Server**.

Do not open `index.html` by double-clicking it: browsers block the JSON seed request on `file://` URLs.

## Demo accounts

| Role | Username | Password |
| --- | --- | --- |
| Admin | `admin` | `admin123` |
| Manager | `manager` | `manager123` |
| Physio | `physio` | `physio123` |
| Owner | `owner` | `owner123` |
| Player | `10` | `player123` |

The login screen also has one-click demo buttons.

## Local data

Initial records are read from `data/seed.json`. The demo includes a balanced 19-player roster. Managers can choose a formation and matchday squad size, auto-pick an XI, assign compatible players on a visual pitch, and manage substitutes on the bench.

Changes are always saved in browser `localStorage`. When deployed with a connected public Vercel Blob store, club operations also sync through `api/club-data.js`; login credentials remain browser-local. Admins can use **Club data** to sync manually, export a JSON backup, import it, or reset the demo.

## Deploy with Vercel Blob

1. Set the Vercel project **Root Directory** to `Gaffer-main/Gaffer-main` when deploying from the full academic-projects repository.
2. Use the `Other` framework preset with no build-command or output-directory override.
3. Connect a **public** Vercel Blob store to the project.
4. Redeploy so Vercel installs `@vercel/blob` and injects `BLOB_READ_WRITE_TOKEN` into the function.
5. Log in as the admin and open **Club data → Sync now**. The status should change to `online`.

For local Blob testing, run `npm install`, `vercel link`, `vercel env pull .env.local`, and `vercel dev`. Live Server continues to work with localStorage fallback but cannot execute the `/api/club-data` function.

This storage and login system are intended for a local academic/demo project, not a public production deployment. The old PHP files remain in the folder only as project history and are not used by the new entry point.
