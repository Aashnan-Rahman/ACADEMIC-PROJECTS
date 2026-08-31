# Gaffer FC

Gaffer FC turns an older football-club database project into a visual browser app. It includes role-based dashboards, player fitness and staff records, transactions, fixtures, and a formation-aware squad builder.

**Live site:** [gaffer-silk.vercel.app/Gaffer-main](https://gaffer-silk.vercel.app/Gaffer-main/)

## Built with

- HTML and CSS
- Vanilla JavaScript
- localStorage for accounts and offline data
- Vercel Functions and Vercel Blob for shared club records

## Run locally

Open this folder in VS Code, right-click `index.html`, and choose **Open with Live Server**. Live Server uses the localStorage fallback because it cannot run the Vercel API function.

## Demo accounts

| Role | Username | Password |
| --- | --- | --- |
| Admin | `admin` | `admin123` |
| Manager | `manager` | `manager123` |
| Physio | `physio` | `physio123` |
| Owner | `owner` | `owner123` |
| Player | `10` | `player123` |

## Squad builder

Managers can choose a squad size from 11 to 23 and use 4-3-3, 4-4-2, 3-5-2, or 4-2-3-1. Players can be auto-picked or assigned manually to compatible positions. Selected players who are not in the starting XI appear on the bench.

## Deploy to Vercel

1. Set the project Root Directory to `Gaffer-main/Gaffer-main`.
2. Use the `Other` framework preset and leave the build settings empty.
3. Connect a public Vercel Blob store and redeploy.
4. Sign in as admin and select **Club data → Sync now**.

Club records are shared through Blob. Login details stay in the browser and are never uploaded. To test the Blob function locally, use `vercel dev` instead of Live Server.
