# NimBus

## Visual web game

The main version is now a visual browser game. It includes player accounts, guest mode, clickable piles, an optimal AI opponent, local two-player matches, instructions, player statistics, match history, and a leaderboard.

To run it:

1. Open this `NimBus-main` folder in VS Code.
2. Right-click `index.html`.
3. Choose **Open with Live Server**.

Create an account to keep a player profile, or choose **Play as guest** and enter a nickname. Game records and accounts are stored in the current browser. The leaderboard is shared by accounts and guests using that browser profile.

Each human turn has a 10-second timer. If it reaches zero, the game automatically makes a legal one-piece move for that player. The computer's turn is not timed.

### Deploy to Vercel

This folder is ready for a zero-build static deployment:

1. Push the project to GitHub, GitLab, or Bitbucket.
2. In Vercel, choose **Add New → Project** and import the repository.
3. If this repository contains the other academic projects too, set **Root Directory** to `NimBus-main`.
4. Leave **Framework Preset** as `Other`; keep the build and output-directory overrides empty.
5. Select **Deploy**.

With the Vercel CLI, run `vercel --cwd NimBus-main` from the repository root (or simply `vercel` if `NimBus-main` is its own repository). The `.vercelignore` file keeps the C++ executable, source, PDF, and terminal score file out of the web deployment.

Accounts and rankings currently use browser storage. This works on Vercel, but each browser has its own separate data. A shared public leaderboard or accounts that work across devices would require a hosted authentication/database service.

## Original C++ edition

NimBus is an interactive terminal strategy game based on Nim. In NimBus, players remove one or two objects from a pile each turn. Clearing a pile scores a point, and the player with the most points wins.

### Features

- NimBus against an optimal computer player
- Two-player NimBus
- Traditional Nim against a classic XOR-strategy AI
- Two-player Traditional Nim
- Special NimBus with one power move per player
- Configurable game length, safe input handling, score history, and leaderboard
- Built-in rules—no missing help files

The NimBus computer uses a memoized exact solver. It evaluates the best achievable final score difference for every legal move instead of relying on the old heuristic.

### Build and run

From this folder:

```powershell
g++ -std=c++17 -O2 -Wall -Wextra -pedantic NimBus.cpp -o NimBus.exe
.\NimBus.exe
```

On Linux or macOS, output to `NimBus` and run `./NimBus` instead.

### Test the AI

```powershell
.\NimBus.exe --self-test
```

The self-test checks known positions, exhaustively checks all states with up to four piles of size 0–5, and verifies that the Traditional Nim AI leaves a zero nim-sum when a winning move exists.

Completed games are stored locally in `nimbus_scores.tsv` beside the executable.
