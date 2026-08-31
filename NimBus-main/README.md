# NimBus

NimBus is a turn-based pile game: remove one or two pieces, clear piles to score, and finish with more points than your opponent. The browser edition supports guest play, local accounts, two-player matches, a computer opponent, timed turns, match history, and a leaderboard.

**Live site:** [nimbus-seven-dusky.vercel.app](https://nimbus-seven-dusky.vercel.app/)

## Built with

- HTML, CSS, and vanilla JavaScript
- An exact memoized solver for the computer player
- localStorage for accounts and offline results
- Vercel Functions and Vercel Blob for the shared leaderboard
- C++ for the original console edition

## Run the web game

Open this folder in VS Code and launch `index.html` with Live Server. Local games work immediately; the global leaderboard is available on the Vercel deployment.

To deploy, import the repository into Vercel, set the Root Directory to `NimBus-main`, connect a public Blob store, and redeploy. There is no build command.

## Original C++ edition

The original source remains in `NimBus.cpp`. Build it with:

```powershell
g++ -std=c++17 -O2 -Wall -Wextra -pedantic NimBus.cpp -o NimBus.exe
.\NimBus.exe
```

Run `.\NimBus.exe --self-test` to check the solver against the included game states.
