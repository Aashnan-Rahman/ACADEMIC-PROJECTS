(function () {
  "use strict";

  const DATA_KEY = "nimbus-web-data-v1";
  const SESSION_KEY = "nimbus-web-session-v1";
  const app = document.querySelector("#app");
  const modalRoot = document.querySelector("#modal-root");
  const toast = document.querySelector("#toast");

  let data = loadData();
  let session = loadSession();
  let authMode = "login";
  let game = null;
  const aiMemo = new Map();

  function loadData() {
    try {
      const stored = JSON.parse(localStorage.getItem(DATA_KEY));
      if (stored && Array.isArray(stored.users) && Array.isArray(stored.matches)) return stored;
    } catch (_) { /* Start with clean local data. */ }
    const initial = { version: 1, users: [], matches: [] };
    localStorage.setItem(DATA_KEY, JSON.stringify(initial));
    return initial;
  }

  function saveData() { localStorage.setItem(DATA_KEY, JSON.stringify(data)); }

  function loadSession() {
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)); }
    catch (_) { return null; }
  }

  function saveSession(value) {
    session = value;
    if (value) sessionStorage.setItem(SESSION_KEY, JSON.stringify(value));
    else sessionStorage.removeItem(SESSION_KEY);
  }

  function profile() {
    if (!session) return null;
    if (session.type === "guest") return { id: null, name: session.name, type: "guest", wins: 0, losses: 0, games: 0, points: 0 };
    return data.users.find((user) => user.id === session.userId) || null;
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
  }

  function makeId(prefix) {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  }

  async function passwordHash(password) {
    const bytes = new TextEncoder().encode(password);
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  function notify(message, isError = false) {
    toast.textContent = message;
    toast.className = `toast show${isError ? " error" : ""}`;
    clearTimeout(notify.timer);
    notify.timer = setTimeout(() => { toast.className = "toast"; }, 2600);
  }

  function navigate(route) {
    if (location.hash === `#${route}`) render();
    else location.hash = route;
  }

  function welcomeView() {
    const isLogin = authMode === "login";
    app.innerHTML = `
      <main class="welcome">
        <section class="welcome-art">
          <a class="brand" href="#welcome"><span class="brand-mark">N</span> NimBus</a>
          <div class="hero-copy">
            <div class="poster-code">NMB / 01 — STRATEGY LEAGUE</div>
            <h1>NIM<br><span>BUS</span></h1>
            <p>One pile. One move. No luck to hide behind.</p>
            <div class="poster-meta"><span>01—02 / REMOVE</span><span>LAST PIECE / SCORES</span><span>MOST POINTS / WINS</span></div>
          </div>
          <div class="welcome-links"><span>WEB EDITION / 2026</span><a href="#instructions">Rules ↗</a><a href="#leaderboard">Rankings ↗</a></div>
        </section>
        <section class="auth-panel">
          <div class="auth-card">
            <p class="eyebrow">Player access</p>
            <h2>${isLogin ? "Sign in." : "Get a player card."}</h2>
            <p class="muted">${isLogin ? "Your record, matches and rank are waiting." : "Create a name. Build a record. Take the top spot."}</p>
            <div class="tabs"><button data-auth-tab="login" class="${isLogin ? "active" : ""}">Log in</button><button data-auth-tab="signup" class="${!isLogin ? "active" : ""}">Sign up</button></div>
            ${isLogin ? `
              <form id="login-form">
                <div class="field"><label for="login-username">Username</label><input id="login-username" name="username" autocomplete="username" required></div>
                <div class="field"><label for="login-password">Password</label><input id="login-password" name="password" type="password" autocomplete="current-password" required></div>
                <button class="btn full" type="submit">Log in</button>
              </form>` : `
              <form id="signup-form">
                <div class="field"><label for="signup-name">Display name</label><input id="signup-name" name="name" maxlength="24" autocomplete="name" required></div>
                <div class="field"><label for="signup-username">Username</label><input id="signup-username" name="username" maxlength="24" autocomplete="username" required></div>
                <div class="field"><label for="signup-password">Password</label><input id="signup-password" name="password" type="password" minlength="6" autocomplete="new-password" required></div>
                <div class="field"><label for="signup-confirm">Confirm password</label><input id="signup-confirm" name="confirm" type="password" minlength="6" autocomplete="new-password" required></div>
                <button class="btn full" type="submit">Create account</button>
              </form>`}
            <div class="guest-block"><p class="muted">Skip the record keeping.</p><button class="btn secondary full" data-action="guest">Enter as guest →</button></div>
          </div>
        </section>
      </main>`;
  }

  const navItems = [["home", "Home"], ["setup", "New game"], ["leaderboard", "Leaderboard"], ["instructions", "How to play"]];

  function shell(content, active) {
    const user = profile();
    app.innerHTML = `
      <div class="shell">
        <aside class="sidebar" id="sidebar">
          <a class="brand" href="#home"><span class="brand-mark">N</span> NimBus</a>
          <nav class="nav">${navItems.map(([route, label]) => `<a href="#${route}" class="${active === route ? "active" : ""}">${label}</a>`).join("")}</nav>
          <div class="profile-chip"><span class="avatar">${escapeHtml(user.name.charAt(0).toUpperCase())}</span><div><strong>${escapeHtml(user.name)}</strong><small>${escapeHtml(user.type === "guest" ? "Guest" : "Player")}</small></div><button data-action="logout" title="Log out" aria-label="Log out">↗</button></div>
        </aside>
        <main class="content"><div class="mobile-bar"><a class="brand" href="#home"><span class="brand-mark">N</span> NimBus</a><button data-action="menu" aria-label="Open menu">☰</button></div>${content}</main>
      </div>`;
  }

  function publicShell(content) {
    app.innerHTML = `<main class="content" style="max-width:1100px;margin:auto"><div class="game-top"><a class="brand" href="#welcome"><span class="brand-mark">N</span> NimBus</a><a class="btn secondary" href="#welcome">Back to login</a></div>${content}</main>`;
  }

  function pageHeading(eyebrow, title, actions = "") {
    return `<header class="page-head"><div><p class="eyebrow">${escapeHtml(eyebrow)}</p><h1>${escapeHtml(title)}</h1></div>${actions ? `<div class="actions">${actions}</div>` : ""}</header>`;
  }

  function homeView() {
    const user = profile();
    const ownMatches = data.matches.filter((match) => session.type === "account" ? match.userId === user.id : match.sessionName === user.name).slice(0, 6);
    const wins = session.type === "account" ? user.wins : ownMatches.filter((match) => match.winner === user.name).length;
    const losses = session.type === "account" ? user.losses : Math.max(0, ownMatches.length - wins);
    const points = session.type === "account" ? user.points : ownMatches.reduce((sum, match) => sum + match.score1, 0);
    const rate = wins + losses ? Math.round((wins / (wins + losses)) * 100) : 0;
    return `${pageHeading("Player dashboard", `Hello, ${user.name}`, `<a class="btn cyan" href="#setup">Play now</a>`)}
      <section class="cards">
        <article class="card metric"><span>Games played</span><strong>${wins + losses}</strong></article>
        <article class="card metric"><span>Victories</span><strong class="good">${wins}</strong></article>
        <article class="card metric"><span>Points scored</span><strong>${points}</strong></article>
        <article class="card metric"><span>Win rate</span><strong>${rate}%</strong></article>
      </section>
      <section class="grid-2">
        <article class="card"><h2>Recent matches</h2>${ownMatches.length ? ownMatches.map(matchRow).join("") : `<div class="empty">No matches yet. Your first challenge awaits.</div>`}</article>
        <article class="card"><h2>Quick start</h2><p class="muted">Face the optimal Nimbus AI or share the board with a friend in local two-player mode.</p><div class="actions"><a class="btn" href="#setup">New match</a><a class="btn secondary" href="#instructions">Read the rules</a></div></article>
      </section>`;
  }

  function matchRow(match) {
    const won = match.winner === match.player1;
    return `<div class="match-row"><div><strong>${escapeHtml(match.player1)} vs ${escapeHtml(match.player2)}</strong><small>${new Date(match.date).toLocaleString()} · ${escapeHtml(match.mode)}</small></div><div><span class="score">${match.score1} — ${match.score2}</span><small><span class="badge ${won ? "" : "loss"}">${escapeHtml(match.winner)} won</span></small></div></div>`;
  }

  function setupView() {
    return `${pageHeading("Match setup", "Choose your challenge")}
      <article class="card setup"><form id="setup-form">
        <h2>Game mode</h2>
        <div class="choice-grid">
          <label class="choice"><input type="radio" name="mode" value="ai" checked><strong>Versus Nimbus AI</strong><small>Challenge the exact strategy solver.</small></label>
          <label class="choice"><input type="radio" name="mode" value="local"><strong>Local two-player</strong><small>Take turns on the same screen.</small></label>
        </div>
        <div class="field" id="opponent-field" hidden><label for="opponent">Second player's name</label><input id="opponent" name="opponent" maxlength="24" value="Player 2"></div>
        <div class="field"><label for="pile-count">Number of piles</label><select id="pile-count" name="pileCount"><option value="3">3 · Quick match</option><option value="5" selected>5 · Standard match</option><option value="7">7 · Long match</option></select></div>
        <p class="muted">Pile sizes are randomized. An odd number of piles guarantees a winner.</p>
        <button class="btn cyan" type="submit">Start match</button>
      </form></article>`;
  }

  function instructionsView() {
    return `${pageHeading("Rules & strategy", "How to play")}
      <section class="card instructions">
        <div class="rule"><span class="rule-num">1</span><div><h3>Read the board</h3><p>Every column is a pile. The number below it shows how many pieces remain.</p></div></div>
        <div class="rule"><span class="rule-num">2</span><div><h3>Choose one pile</h3><p>Click any non-empty pile during your turn. Your selected pile will be highlighted.</p></div></div>
        <div class="rule"><span class="rule-num">3</span><div><h3>Remove one or two</h3><p>Use the controls below the board to remove one or two pieces. You cannot remove more pieces than the pile contains.</p></div></div>
        <div class="rule"><span class="rule-num">4</span><div><h3>Clear piles to score</h3><p>The player who removes the final piece from a pile earns one point. Turns continue until every pile is empty.</p></div></div>
        <div class="rule"><span class="rule-num">5</span><div><h3>Win the match</h3><p>The player with the most points wins. Matches always use an odd number of piles, so there are no draws.</p></div></div>
        <div class="strategy-tip"><strong>Strategy tip:</strong> Taking a point immediately is tempting, but it is not always the best move. Think about which pile sizes you leave for the next player—the Nimbus AI evaluates the entire remaining game before choosing.</div>
      </section>`;
  }

  function leaderboardView() {
    const standings = new Map();
    function playerEntry(name) {
      if (!standings.has(name)) standings.set(name, { name, games: 0, wins: 0, points: 0 });
      return standings.get(name);
    }
    data.matches.forEach((match) => {
      const first = playerEntry(match.player1); first.games += 1; first.points += match.score1; if (match.winner === match.player1) first.wins += 1;
      if (match.player2 !== "Nimbus AI") { const second = playerEntry(match.player2); second.games += 1; second.points += match.score2; if (match.winner === match.player2) second.wins += 1; }
    });
    const ranked = [...standings.values()].sort((a, b) => b.wins - a.wins || b.points - a.points || a.name.localeCompare(b.name));
    const content = `${pageHeading("Hall of challengers", "Leaderboard")}
      <article class="card"><div class="table-wrap"><table><thead><tr><th>Rank</th><th>Player</th><th>Games</th><th>Wins</th><th>Points</th><th>Win rate</th></tr></thead><tbody>
        ${ranked.length ? ranked.map((entry, index) => `<tr><td class="rank">#${index + 1}</td><td><strong>${escapeHtml(entry.name)}</strong></td><td>${entry.games}</td><td>${entry.wins}</td><td>${entry.points}</td><td>${Math.round(entry.wins / entry.games * 100)}%</td></tr>`).join("") : `<tr><td colspan="6" class="empty">No completed matches yet. Be the first on the board.</td></tr>`}
      </tbody></table></div></article>`;
    return content;
  }

  function createPiles(count) {
    return Array.from({ length: count }, () => 5 + Math.floor(Math.random() * 5));
  }

  function startGame(values) {
    const user = profile();
    const mode = values.mode;
    game = {
      id: makeId("game"), mode, piles: createPiles(Number(values.pileCount)),
      names: [user.name, mode === "ai" ? "Nimbus AI" : (values.opponent.trim() || "Player 2")],
      scores: [0, 0], current: Math.random() < .5 ? 0 : 1, selected: null,
      status: "playing", message: "Select a pile to begin your turn.", aiPending: false, saved: false
    };
    navigate("game");
  }

  function gameView() {
    if (!game) return `${pageHeading("Match", "No active game")}<article class="card empty"><p>Start a new match to enter the arena.</p><a class="btn" href="#setup">Set up a match</a></article>`;
    const aiTurn = game.mode === "ai" && game.current === 1 && game.status === "playing";
    const humanTurn = !aiTurn && game.status === "playing";
    const content = `<section class="game-page">
      <div class="game-top"><div class="turn-card"><span class="turn-dot"></span><div><small class="muted">Current turn</small><strong>${escapeHtml(game.names[game.current])}</strong></div></div><button class="btn danger" data-action="abandon">Leave match</button></div>
      <article class="card scoreboard"><div class="player-score"><span>${escapeHtml(game.names[0])}</span><strong>${game.scores[0]}</strong></div><span class="versus">VS</span><div class="player-score"><span>${escapeHtml(game.names[1])}</span><strong>${game.scores[1]}</strong></div></article>
      <article class="card board" aria-label="NimBus game board">
        ${game.piles.map((count, index) => `<button class="pile ${game.selected === index ? "selected" : ""}" data-pile="${index}" ${!humanTurn || count === 0 ? "disabled" : ""} aria-label="Pile ${index + 1}, ${count} pieces">
          ${count ? `<span class="tokens">${Array.from({length: count}, () => `<span class="token"></span>`).join("")}</span>` : `<span class="cleared">✓</span>`}
          <span class="pile-number">PILE ${index + 1}</span><span class="pile-count">${count}</span>
        </button>`).join("")}
      </article>
      <div class="game-controls"><p class="game-message">${aiTurn ? "Nimbus AI is calculating the best move…" : escapeHtml(game.message)}</p><div class="remove-actions"><button class="btn secondary" data-remove="1" ${game.selected === null || !humanTurn ? "disabled" : ""}>Remove 1</button><button class="btn" data-remove="2" ${game.selected === null || !humanTurn || game.piles[game.selected] < 2 ? "disabled" : ""}>Remove 2</button></div></div>
    </section>`;
    if (aiTurn && !game.aiPending) {
      game.aiPending = true;
      const gameId = game.id;
      setTimeout(() => {
        if (!game || game.id !== gameId || game.status !== "playing") return;
        game.aiPending = false;
        const move = bestAiMove(game.piles);
        performMove(move.pile, move.amount);
      }, 650);
    }
    return content;
  }

  function normalizedKey(piles) { return piles.filter(Boolean).sort((a, b) => a - b).join(","); }

  function solveAi(piles) {
    const key = normalizedKey(piles);
    if (!key) return 0;
    if (aiMemo.has(key)) return aiMemo.get(key);
    const state = key.split(",").map(Number);
    let best = -Infinity;
    state.forEach((size, pile) => {
      for (let amount = 1; amount <= Math.min(2, size); amount += 1) {
        const next = [...state]; next[pile] -= amount;
        best = Math.max(best, (next[pile] === 0 ? 1 : 0) - solveAi(next));
      }
    });
    aiMemo.set(key, best);
    return best;
  }

  function bestAiMove(piles) {
    let best = null;
    piles.forEach((size, pile) => {
      for (let amount = 1; amount <= Math.min(2, size); amount += 1) {
        const next = [...piles]; next[pile] -= amount;
        const value = (next[pile] === 0 ? 1 : 0) - solveAi(next);
        if (!best || value > best.value) best = { pile, amount, value };
      }
    });
    return best;
  }

  function performMove(pile, amount) {
    if (!game || game.status !== "playing" || game.piles[pile] < amount || amount < 1 || amount > 2) return;
    const player = game.current;
    game.piles[pile] -= amount;
    let message = `${game.names[player]} removed ${amount} from pile ${pile + 1}.`;
    if (game.piles[pile] === 0) { game.scores[player] += 1; message = `${game.names[player]} cleared pile ${pile + 1} and scored!`; }
    game.selected = null;
    if (game.piles.every((size) => size === 0)) {
      game.status = "ended";
      game.message = message;
      finishGame();
      return;
    }
    game.current = 1 - game.current;
    game.message = message;
    render();
  }

  function finishGame() {
    if (!game || game.saved) return;
    game.saved = true;
    const winnerIndex = game.scores[0] > game.scores[1] ? 0 : 1;
    const user = profile();
    const record = {
      id: makeId("match"), date: new Date().toISOString(), mode: game.mode === "ai" ? "Vs AI" : "Local",
      player1: game.names[0], player2: game.names[1], score1: game.scores[0], score2: game.scores[1],
      winner: game.names[winnerIndex], userId: session.type === "account" ? user.id : null,
      sessionName: session.type === "guest" ? user.name : null
    };
    data.matches.unshift(record);
    if (session.type === "account") {
      const account = data.users.find((item) => item.id === user.id);
      account.games += 1; account.points += game.scores[0];
      if (winnerIndex === 0) account.wins += 1; else account.losses += 1;
    }
    saveData();
    render();
    modalRoot.innerHTML = `<div class="modal-backdrop"><section class="modal"><div class="modal-icon">W</div><p class="eyebrow">Match complete</p><h2>${escapeHtml(record.winner)} wins.</h2><p class="muted">Final score: ${escapeHtml(record.player1)} ${record.score1} — ${record.score2} ${escapeHtml(record.player2)}</p><div class="actions"><button class="btn" data-action="rematch">Play again</button><button class="btn secondary" data-action="finish-home">Dashboard</button></div></section></div>`;
  }

  function guestModal() {
    modalRoot.innerHTML = `<div class="modal-backdrop"><section class="modal"><p class="eyebrow">Guest mode</p><h2>Choose a nickname</h2><p class="muted">This name will appear in match results and on the local leaderboard.</p><form id="guest-form"><div class="field"><label for="guest-name">Nickname</label><input id="guest-name" name="name" maxlength="24" required autofocus></div><div class="actions"><button class="btn" type="submit">Continue</button><button class="btn secondary" type="button" data-action="close-modal">Cancel</button></div></form></section></div>`;
  }

  function render() {
    const route = location.hash.slice(1) || (session ? "home" : "welcome");
    const user = profile();
    if (session && !user) saveSession(null);
    if (!session) {
      if (route === "instructions") publicShell(instructionsView());
      else if (route === "leaderboard") publicShell(leaderboardView());
      else welcomeView();
      return;
    }
    if (route === "home") shell(homeView(), "home");
    else if (route === "setup") shell(setupView(), "setup");
    else if (route === "leaderboard") shell(leaderboardView(), "leaderboard");
    else if (route === "instructions") shell(instructionsView(), "instructions");
    else if (route === "game") shell(gameView(), "setup");
    else navigate("home");
  }

  app.addEventListener("click", (event) => {
    const tab = event.target.closest("[data-auth-tab]");
    if (tab) { authMode = tab.dataset.authTab; welcomeView(); return; }
    const pile = event.target.closest("[data-pile]");
    if (pile && game && game.status === "playing" && !(game.mode === "ai" && game.current === 1)) {
      game.selected = Number(pile.dataset.pile); render(); return;
    }
    const remove = event.target.closest("[data-remove]");
    if (remove && game && game.selected !== null) { performMove(game.selected, Number(remove.dataset.remove)); return; }
    const actionButton = event.target.closest("[data-action]");
    if (!actionButton) { if (event.target.closest(".nav a")) document.querySelector("#sidebar")?.classList.remove("open"); return; }
    const action = actionButton.dataset.action;
    if (action === "guest") guestModal();
    else if (action === "close-modal") modalRoot.innerHTML = "";
    else if (action === "menu") document.querySelector("#sidebar")?.classList.toggle("open");
    else if (action === "logout") { saveSession(null); game = null; navigate("welcome"); }
    else if (action === "abandon") { if (confirm("Leave this match? Its result will not be saved.")) { game = null; navigate("home"); } }
    else if (action === "finish-home") { modalRoot.innerHTML = ""; game = null; navigate("home"); }
    else if (action === "rematch") { modalRoot.innerHTML = ""; navigate("setup"); }
  });

  app.addEventListener("change", (event) => {
    if (event.target.name === "mode") document.querySelector("#opponent-field").hidden = event.target.value !== "local";
  });

  app.addEventListener("submit", async (event) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.target).entries());
    try {
      if (event.target.id === "login-form") {
        const hash = await passwordHash(values.password);
        const user = data.users.find((item) => item.username.toLowerCase() === values.username.trim().toLowerCase() && item.passwordHash === hash);
        if (!user) throw new Error("Incorrect username or password.");
        saveSession({ type: "account", userId: user.id }); navigate("home"); notify(`Welcome back, ${user.name}!`);
      } else if (event.target.id === "signup-form") {
        if (values.password !== values.confirm) throw new Error("Passwords do not match.");
        const username = values.username.trim();
        if (data.users.some((item) => item.username.toLowerCase() === username.toLowerCase())) throw new Error("That username is already taken.");
        const user = { id: makeId("user"), type: "account", name: values.name.trim(), username, passwordHash: await passwordHash(values.password), games: 0, wins: 0, losses: 0, points: 0 };
        data.users.push(user); saveData(); saveSession({ type: "account", userId: user.id }); navigate("home"); notify("Account created. Welcome to NimBus!");
      } else if (event.target.id === "setup-form") startGame(values);
    } catch (error) { notify(error.message || "Something went wrong.", true); }
  });

  modalRoot.addEventListener("submit", (event) => {
    event.preventDefault();
    if (event.target.id !== "guest-form") return;
    const name = new FormData(event.target).get("name").trim();
    if (!name) return;
    saveSession({ type: "guest", name }); modalRoot.innerHTML = ""; navigate("home"); notify(`Welcome, ${name}!`);
  });

  modalRoot.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const action = button.dataset.action;
    if (action === "close-modal") modalRoot.innerHTML = "";
    else if (action === "finish-home") { modalRoot.innerHTML = ""; game = null; navigate("home"); }
    else if (action === "rematch") { modalRoot.innerHTML = ""; navigate("setup"); }
  });

  window.addEventListener("hashchange", render);
  render();
})();
