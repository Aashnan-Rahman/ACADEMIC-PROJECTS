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

Initial records are read from `data/seed.json`. Changes are saved in browser `localStorage`, so they survive refreshes but stay in the same browser/profile. Admins can use **Local data** to export a JSON backup, import it on another browser, or reset the demo.

This storage and login system are intended for a local academic/demo project, not a public production deployment. The old PHP files remain in the folder only as project history and are not used by the new entry point.
