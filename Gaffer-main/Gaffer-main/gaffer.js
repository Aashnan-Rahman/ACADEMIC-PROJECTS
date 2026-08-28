(function () {
  "use strict";

  const app = document.querySelector("#app");
  const toast = document.querySelector("#toast");
  const db = window.GafferDB;
  let currentUser = null;
  let activeLineupSlot = null;

  const formations = {
    "4-3-3": [
      ["gk","GK","Goalkeeper",50,91], ["lb","LB","Defender",15,72], ["cb1","CB","Defender",38,78], ["cb2","CB","Defender",62,78], ["rb","RB","Defender",85,72],
      ["cm1","CM","Midfielder",28,50], ["cm2","CM","Midfielder",72,50], ["am","AM","Midfielder",50,39],
      ["lw","LW","Forward",16,17], ["st","ST","Forward",50,11], ["rw","RW","Forward",84,17]
    ],
    "4-4-2": [
      ["gk","GK","Goalkeeper",50,91], ["lb","LB","Defender",15,72], ["cb1","CB","Defender",38,78], ["cb2","CB","Defender",62,78], ["rb","RB","Defender",85,72],
      ["lm","LM","Midfielder",15,43], ["cm1","CM","Midfielder",38,52], ["cm2","CM","Midfielder",62,52], ["rm","RM","Midfielder",85,43],
      ["st1","ST","Forward",38,15], ["st2","ST","Forward",62,15]
    ],
    "3-5-2": [
      ["gk","GK","Goalkeeper",50,91], ["cb1","CB","Defender",25,75], ["cb2","CB","Defender",50,80], ["cb3","CB","Defender",75,75],
      ["lwb","LWB","Midfielder",10,47], ["cm1","CM","Midfielder",33,50], ["dm","DM","Midfielder",50,62], ["cm2","CM","Midfielder",67,50], ["rwb","RWB","Midfielder",90,47],
      ["st1","ST","Forward",38,15], ["st2","ST","Forward",62,15]
    ],
    "4-2-3-1": [
      ["gk","GK","Goalkeeper",50,91], ["lb","LB","Defender",15,72], ["cb1","CB","Defender",38,78], ["cb2","CB","Defender",62,78], ["rb","RB","Defender",85,72],
      ["dm1","DM","Midfielder",36,58], ["dm2","DM","Midfielder",64,58], ["lw","LW","Midfielder",17,35], ["am","AM","Midfielder",50,38], ["rw","RW","Midfielder",83,35],
      ["st","ST","Forward",50,12]
    ]
  };

  const routesByRole = {
    admin: ["dashboard", "players", "staff", "matches", "finance", "data"],
    manager: ["dashboard", "players", "squad", "matches"],
    physio: ["dashboard", "fitness", "players"],
    owner: ["dashboard", "players", "finance"],
    player: ["dashboard", "matches"]
  };

  const navLabels = {
    dashboard: "Overview", players: "Players", staff: "Staff", squad: "Squad",
    fitness: "Fitness", matches: "Matches", finance: "Finance", data: "Club data"
  };

  const esc = (value) => String(value ?? "").replace(/[&<>'"]/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  })[char]);
  const money = (value) => new Intl.NumberFormat("en-US", { style: "currency", currency: db.get().club.currency, maximumFractionDigits: 0 }).format(Number(value) || 0);
  const dateText = (value) => value ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(`${value}T00:00:00`)) : "—";
  const id = (prefix) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const formObject = (form) => Object.fromEntries(new FormData(form).entries());

  function notify(message, error = false) {
    toast.textContent = message;
    toast.className = `toast show${error ? " error" : ""}`;
    window.clearTimeout(notify.timer);
    notify.timer = window.setTimeout(() => { toast.className = "toast"; }, 2600);
  }

  function loginView() {
    app.innerHTML = `
      <div class="login-page">
        <section class="login-hero">
          <div class="brand"><span class="brand-mark">G</span> Gaffer FC</div>
          <div class="hero-copy">
            <p class="eyebrow">Local club management</p>
            <h1>Your whole club. One touchline.</h1>
            <p>Manage the squad, staff, fixtures, fitness and finances directly in your browser.</p>
          </div>
          <small>Built for matchday decisions</small>
        </section>
        <section class="login-panel">
          <div class="login-card">
            <p class="eyebrow">Welcome back</p>
            <h2>Sign in to Gaffer</h2>
            <p class="subtle">Sign in to your club workspace.</p>
            <form id="login-form">
              <div class="field"><label for="username">Username</label><input id="username" name="username" autocomplete="username" required></div>
              <div class="field"><label for="password">Password</label><input id="password" name="password" type="password" autocomplete="current-password" required></div>
              <button class="btn full" type="submit">Sign in</button>
            </form>
            <p class="signup-link">New to the club? <a href="#signup">Create a new account</a></p>
            <div class="demo">
              <p class="subtle">Quick demo login</p>
              <div class="demo-buttons">
                ${["admin", "manager", "physio", "owner", "player"].map((role) => `<button type="button" data-demo="${role}">${role}</button>`).join("")}
              </div>
            </div>
          </div>
        </section>
      </div>`;
  }

  function signupView() {
    app.innerHTML = `
      <div class="login-page">
        <section class="login-hero">
          <div class="brand"><span class="brand-mark">G</span> Gaffer FC</div>
          <div class="hero-copy">
            <p class="eyebrow">Join the squad</p>
            <h1>Your season starts here.</h1>
            <p>Create your player account and keep up with your profile, performance and upcoming fixtures.</p>
          </div>
          <small>Built for matchday decisions</small>
        </section>
        <section class="login-panel">
          <div class="login-card signup-card">
            <p class="eyebrow">Player registration</p>
            <h2>Create your account</h2>
            <p class="subtle">Enter your details to join Gaffer FC.</p>
            <form id="signup-form" class="form-grid">
              <div class="field wide"><label for="signup-name">Full name</label><input id="signup-name" name="name" autocomplete="name" required></div>
              <div class="field"><label for="signup-username">Username</label><input id="signup-username" name="username" autocomplete="username" required></div>
              <div class="field"><label for="signup-number">Squad number</label><input id="signup-number" name="number" type="number" min="1" max="99" required></div>
              <div class="field wide"><label for="signup-position">Position</label><select id="signup-position" name="position"><option>Goalkeeper</option><option>Defender</option><option>Midfielder</option><option>Forward</option></select></div>
              <div class="field"><label for="signup-password">Password</label><input id="signup-password" name="password" type="password" minlength="6" autocomplete="new-password" required></div>
              <div class="field"><label for="signup-confirm">Confirm password</label><input id="signup-confirm" name="confirmPassword" type="password" minlength="6" autocomplete="new-password" required></div>
              <button class="btn full wide" type="submit">Create account</button>
            </form>
            <p class="signup-link">Already registered? <a href="#login">Sign in</a></p>
          </div>
        </section>
      </div>`;
  }

  function shell(content, route) {
    const allowed = routesByRole[currentUser.role] || ["dashboard"];
    app.innerHTML = `
      <div class="shell">
        <aside class="sidebar" id="sidebar">
          <div class="brand"><span class="brand-mark">G</span> Gaffer FC</div>
          <nav class="nav" aria-label="Main navigation">
            ${allowed.map((item) => `<a href="#${item}" class="${route === item ? "active" : ""}">${navLabels[item]}</a>`).join("")}
          </nav>
          <div class="user-card">
            <span class="avatar">${esc(currentUser.name.charAt(0))}</span>
            <div><strong>${esc(currentUser.name)}</strong><small>${esc(currentUser.role)}</small></div>
            <button class="logout" data-action="logout" aria-label="Sign out" title="Sign out">↗</button>
          </div>
        </aside>
        <main class="main">
          <div class="mobile-head"><div class="brand"><span class="brand-mark">G</span> Gaffer</div><button data-action="menu" aria-label="Open menu">☰</button></div>
          ${content}
        </main>
      </div>`;
  }

  function heading(eyebrow, title, actions = "") {
    return `<header class="page-head"><div><p class="eyebrow">${esc(eyebrow)}</p><h1>${esc(title)}</h1></div>${actions ? `<div class="actions">${actions}</div>` : ""}</header>`;
  }

  function resultFor(match) {
    if (match.status !== "played") return "Scheduled";
    if (Number(match.scored) > Number(match.conceded)) return "Win";
    if (Number(match.scored) < Number(match.conceded)) return "Loss";
    return "Draw";
  }

  function dashboardView() {
    const data = db.get();
    if (currentUser.role === "player") return playerDashboard(data);
    const fit = data.players.filter((player) => player.fitness === "fit").length;
    const selected = data.players.filter((player) => player.selected).length;
    const upcoming = data.matches.filter((match) => match.status === "scheduled").sort((a, b) => a.date.localeCompare(b.date));
    const income = data.transactions.filter((item) => item.type === "income").reduce((sum, item) => sum + Number(item.amount), 0);
    const expense = data.transactions.filter((item) => item.type === "expense").reduce((sum, item) => sum + Number(item.amount), 0);
    return `${heading(`${currentUser.role} workspace`, `Welcome, ${currentUser.name.split(" ")[0]}`)}
      <section class="cards">
        <article class="card metric"><span>First-team players</span><strong>${data.players.length}</strong></article>
        <article class="card metric"><span>Match-ready</span><strong>${fit}</strong></article>
        <article class="card metric"><span>Selected squad</span><strong>${selected}</strong></article>
        <article class="card metric"><span>Available funds</span><strong>${money(data.club.budget + income - expense)}</strong></article>
      </section>
      <section class="grid-2">
        <article class="card"><h2>Upcoming fixtures</h2>${fixtureList(upcoming.slice(0, 5))}</article>
        <article class="card"><h2>Fitness snapshot</h2>
          ${data.players.map((player) => `<div class="fixture"><div><strong>${esc(player.name)}</strong><small>#${player.number} · ${esc(player.position)}</small></div><span class="badge ${player.fitness}">${player.fitness}</span></div>`).join("")}
        </article>
      </section>`;
  }

  function playerDashboard(data) {
    const player = data.players.find((item) => item.id === currentUser.playerId);
    if (!player) return `${heading("Player workspace", "Profile unavailable")}<div class="card empty">This account is not linked to a player.</div>`;
    const stat = player.stats;
    return `${heading("Player workspace", `Welcome, ${player.name.split(" ")[0]}`)}
      <section class="cards">
        <article class="card metric"><span>Matches</span><strong>${stat.matches}</strong></article>
        <article class="card metric"><span>Goals</span><strong>${stat.goals}</strong></article>
        <article class="card metric"><span>Assists</span><strong>${stat.assists}</strong></article>
        <article class="card metric"><span>Rating</span><strong>${stat.rating}</strong></article>
      </section>
      <section class="grid-2">
        <article class="card"><h2>Player profile</h2>
          <div class="fixture"><span>Position</span><strong>${esc(player.position)}</strong></div>
          <div class="fixture"><span>Squad number</span><strong>#${player.number}</strong></div>
          <div class="fixture"><span>Fitness</span><span class="badge ${player.fitness}">${player.fitness}</span></div>
          <div class="fixture"><span>Selection</span><span class="badge ${player.selected ? "selected" : ""}">${player.selected ? "Selected" : "Reserve"}</span></div>
        </article>
        <article class="card"><h2>Upcoming fixtures</h2>${fixtureList(data.matches.filter((match) => match.status === "scheduled"))}</article>
      </section>`;
  }

  function fixtureList(matches) {
    if (!matches.length) return `<p class="empty">No fixtures to show.</p>`;
    return matches.map((match) => `<div class="fixture"><div><strong>${esc(match.opponent)}</strong><small>${dateText(match.date)} · ${esc(match.time)} · ${esc(match.venue)}</small></div>${match.status === "played" ? `<span class="score">${match.scored}–${match.conceded}</span>` : `<span class="badge scheduled">scheduled</span>`}</div>`).join("");
  }

  function playersView(mode = "players") {
    const data = db.get();
    const canCreate = currentUser.role === "admin";
    const canFitness = ["admin", "physio"].includes(currentUser.role);
    const canSquad = ["admin", "manager"].includes(currentUser.role);
    const actions = canCreate ? `<a class="btn" href="#player-new">Add player</a>` : "";
    return `${heading(mode === "fitness" ? "Medical room" : mode === "squad" ? "Matchday planning" : "First team", mode === "fitness" ? "Player fitness" : mode === "squad" ? "Squad selection" : "Players", actions)}
      <article class="card"><div class="table-wrap"><table>
        <thead><tr><th>#</th><th>Player</th><th>Position</th><th>Fitness</th><th>Squad</th><th>Matches</th><th>G / A</th><th>Rating</th><th>Action</th></tr></thead>
        <tbody>${data.players.map((player) => `<tr>
          <td>${player.number}</td><td><strong>${esc(player.name)}</strong></td><td>${esc(player.position)}</td>
          <td>${canFitness ? `<form class="inline-form" data-form="fitness"><input type="hidden" name="id" value="${player.id}"><select name="fitness" aria-label="Fitness for ${esc(player.name)}"><option value="fit" ${player.fitness === "fit" ? "selected" : ""}>Fit</option><option value="injured" ${player.fitness === "injured" ? "selected" : ""}>Injured</option></select><button class="btn small" type="submit">Save</button></form>` : `<span class="badge ${player.fitness}">${player.fitness}</span>`}</td>
          <td>${canSquad ? `<button class="btn small ${player.selected ? "secondary" : ""}" data-action="squad" data-id="${player.id}" ${player.fitness !== "fit" ? "disabled title=\"Injured players cannot be selected\"" : ""}>${player.selected ? "Remove" : "Select"}</button>` : `<span class="badge ${player.selected ? "selected" : ""}">${player.selected ? "Selected" : "Reserve"}</span>`}</td>
          <td>${player.stats.matches}</td><td>${player.stats.goals} / ${player.stats.assists}</td><td>${player.stats.rating}</td>
          <td><div class="actions">${["admin", "manager"].includes(currentUser.role) ? `<a class="btn secondary small" href="#player-stats/${player.id}">Stats</a>` : ""}${canCreate ? `<button class="btn danger small" data-action="delete-player" data-id="${player.id}">Delete</button>` : ""}</div></td>
        </tr>`).join("")}</tbody>
      </table></div></article>`;
  }

  function squadBuilderView() {
    if (currentUser.role !== "manager") return forbidden();
    const data = db.get();
    const lineup = data.lineup || { squadSize: 18, formation: "4-3-3", starters: {} };
    const slots = formations[lineup.formation] || formations["4-3-3"];
    if (!slots.some(([key]) => key === activeLineupSlot)) activeLineupSlot = null;
    const assignedIds = new Set(Object.values(lineup.starters || {}).filter(Boolean));
    const selected = data.players.filter((player) => player.selected);
    const bench = selected.filter((player) => !assignedIds.has(player.id));
    const reserves = data.players.filter((player) => player.fitness === "fit" && !player.selected);
    const injured = data.players.filter((player) => player.fitness !== "fit");
    const activeDefinition = slots.find(([key]) => key === activeLineupSlot);
    const eligible = activeDefinition ? selected.filter((player) => player.position === activeDefinition[2] && (!assignedIds.has(player.id) || lineup.starters[activeLineupSlot] === player.id)) : [];
    const filled = slots.filter(([key]) => lineup.starters[key]).length;
    const sizeOptions = Array.from({ length: 13 }, (_, index) => index + 11).map((size) => `<option value="${size}" ${lineup.squadSize === size ? "selected" : ""}>${size} players</option>`).join("");

    return `${heading("Matchday planning", "Squad builder", `<button class="btn secondary" data-action="clear-lineup">Clear</button><button class="btn" data-action="auto-pick">Auto-pick squad</button>`)}
      <section class="lineup-summary cards">
        <article class="card metric"><span>Formation</span><strong>${esc(lineup.formation)}</strong></article>
        <article class="card metric"><span>Matchday squad</span><strong>${selected.length}/${lineup.squadSize}</strong></article>
        <article class="card metric"><span>Starting XI</span><strong>${filled}/11</strong></article>
        <article class="card metric"><span>Bench</span><strong>${bench.length}/${Math.max(0, lineup.squadSize - 11)}</strong></article>
      </section>
      <article class="card lineup-controls"><form data-form="lineup-settings" class="lineup-settings">
        <div class="field"><label>Formation</label><select name="formation">${Object.keys(formations).map((formation) => `<option value="${formation}" ${lineup.formation === formation ? "selected" : ""}>${formation}</option>`).join("")}</select></div>
        <div class="field"><label>Squad size</label><select name="squadSize">${sizeOptions}</select></div>
        <button class="btn" type="submit">Apply setup</button>
        <p class="subtle">Changing formation clears the starting positions, but keeps the selected matchday squad.</p>
      </form></article>
      <section class="squad-workspace">
        <div class="football-pitch" aria-label="${esc(lineup.formation)} formation">
          <div class="pitch-line halfway"></div><div class="pitch-circle"></div><div class="penalty-box top"></div><div class="penalty-box bottom"></div>
          ${slots.map(([key,label,type,x,y]) => {
            const player = data.players.find((item) => item.id === lineup.starters[key]);
            return `<button class="position-slot ${player ? "filled" : ""} ${activeLineupSlot === key ? "active" : ""}" style="left:${x}%;top:${y}%" data-action="choose-slot" data-slot="${key}" title="Choose ${label}">
              <span>${label}</span><strong>${player ? `#${player.number} ${esc(player.name)}` : "Pick player"}</strong><small>${type}</small>
            </button>`;
          }).join("")}
        </div>
        <aside class="card assignment-panel">
          ${activeDefinition ? `<div><p class="eyebrow">Assign position</p><h2>${activeDefinition[1]} · ${activeDefinition[2]}</h2>
            ${lineup.starters[activeLineupSlot] ? `<button class="btn danger small" data-action="unassign-slot" data-slot="${activeLineupSlot}">Move current player to bench</button>` : ""}
            <div class="assignment-list">${eligible.length ? eligible.map((player) => `<button class="player-pick ${lineup.starters[activeLineupSlot] === player.id ? "current" : ""}" data-action="assign-player" data-slot="${activeLineupSlot}" data-id="${player.id}"><span class="shirt-number">${player.number}</span><span><strong>${esc(player.name)}</strong><small>${player.position} · ${player.stats.rating} rating</small></span></button>`).join("") : `<p class="empty">No selected ${activeDefinition[2].toLowerCase()} is available. Add one to the squad below.</p>`}</div>
          </div>` : `<div class="assignment-help"><span>↖</span><h2>Pick a position</h2><p>Select a slot on the pitch, then choose a compatible player from the matchday squad.</p></div>`}
        </aside>
      </section>
      <section class="squad-lists grid-2">
        <article class="card"><h2>Bench · ${bench.length}</h2><div class="player-chip-list">${bench.length ? bench.map((player) => playerChip(player, "remove-squad")).join("") : `<p class="empty">Assigned starters and substitutes will appear here.</p>`}</div></article>
        <article class="card"><h2>Available first team · ${reserves.length}</h2><div class="player-chip-list">${reserves.length ? reserves.map((player) => playerChip(player, "add-squad")).join("") : `<p class="empty">Every fit player is already selected.</p>`}</div></article>
      </section>
      ${injured.length ? `<article class="card injured-list"><h2>Unavailable</h2><div class="player-chip-list">${injured.map((player) => `<div class="player-chip disabled"><span class="shirt-number">${player.number}</span><span><strong>${esc(player.name)}</strong><small>${player.position} · injured</small></span></div>`).join("")}</div></article>` : ""}`;
  }

  function playerChip(player, action) {
    return `<div class="player-chip"><span class="shirt-number">${player.number}</span><span><strong>${esc(player.name)}</strong><small>${player.position} · ${player.stats.rating} rating</small></span><button class="btn ${action === "remove-squad" ? "danger" : "secondary"} small" data-action="${action}" data-id="${player.id}">${action === "remove-squad" ? "Remove" : "Add"}</button></div>`;
  }

  function autoPickSquad() {
    db.update((data) => {
      const lineup = data.lineup;
      const slots = formations[lineup.formation];
      const fitPlayers = data.players.filter((player) => player.fitness === "fit").sort((a, b) => b.stats.rating - a.stats.rating);
      const used = new Set();
      lineup.starters = {};
      slots.forEach(([key,,type]) => {
        const player = fitPlayers.find((candidate) => candidate.position === type && !used.has(candidate.id));
        if (player) { lineup.starters[key] = player.id; used.add(player.id); }
      });
      const benchCount = Math.max(0, lineup.squadSize - used.size);
      fitPlayers.filter((player) => !used.has(player.id)).slice(0, benchCount).forEach((player) => used.add(player.id));
      data.players.forEach((player) => { player.selected = used.has(player.id); });
    });
    activeLineupSlot = null;
    navigate("squad", "Best available squad selected.");
  }

  function playerFormView() {
    if (currentUser.role !== "admin") return forbidden();
    return `${heading("Team administration", "Add player", `<a class="btn secondary" href="#players">Cancel</a>`)}
      <article class="card form-card"><form data-form="player-new" class="form-grid">
        <div class="field"><label>Full name</label><input name="name" required></div>
        <div class="field"><label>Squad number</label><input name="number" type="number" min="1" max="99" required></div>
        <div class="field"><label>Date of birth</label><input name="dob" type="date" required></div>
        <div class="field"><label>Position</label><select name="position"><option>Goalkeeper</option><option>Defender</option><option>Midfielder</option><option>Forward</option></select></div>
        <div class="field"><label>Height (cm)</label><input name="height" type="number" min="120" max="230" required></div>
        <div class="field"><label>Weight (kg)</label><input name="weight" type="number" min="40" max="160" required></div>
        <div class="field"><label>Annual salary</label><input name="salary" type="number" min="0" required></div>
        <div class="field"><label>Fitness</label><select name="fitness"><option value="fit">Fit</option><option value="injured">Injured</option></select></div>
        <div class="field"><label>Login username</label><input name="username" required></div>
        <div class="field"><label>Initial password</label><input name="password" type="password" minlength="6" required></div>
        <div class="wide"><button class="btn" type="submit">Create player</button></div>
      </form></article>`;
  }

  function playerStatsView(playerId) {
    const player = db.get().players.find((item) => item.id === playerId);
    if (!player || !["admin", "manager"].includes(currentUser.role)) return forbidden();
    const stats = player.stats;
    return `${heading("Match performance", `Update ${player.name}`, `<a class="btn secondary" href="#players">Cancel</a>`)}
      <article class="card form-card"><form data-form="player-stats" class="form-grid"><input type="hidden" name="id" value="${player.id}">
        ${[["matches","Matches"],["goals","Goals"],["assists","Assists"],["yellow","Yellow cards"],["red","Red cards"],["rating","Rating"]].map(([name,label]) => `<div class="field"><label>${label}</label><input name="${name}" type="number" min="0" ${name === "rating" ? "max=\"10\" step=\"0.1\"" : ""} value="${stats[name]}" required></div>`).join("")}
        <div class="wide"><button class="btn" type="submit">Save statistics</button></div>
      </form></article>`;
  }

  function staffView() {
    if (currentUser.role !== "admin") return forbidden();
    const data = db.get();
    return `${heading("Club administration", "Staff", `<a class="btn" href="#staff-new">Add staff member</a>`)}
      <article class="card"><div class="table-wrap"><table><thead><tr><th>Name</th><th>Role</th><th>Speciality</th><th>Experience</th><th>Salary</th><th></th></tr></thead><tbody>
        ${data.staff.map((item) => `<tr><td><strong>${esc(item.name)}</strong></td><td><span class="badge">${esc(item.role)}</span></td><td>${esc(item.speciality)}</td><td>${item.experience} years</td><td>${money(item.salary)}</td><td><button class="btn danger small" data-action="delete-staff" data-id="${item.id}">Delete</button></td></tr>`).join("")}
      </tbody></table></div></article>`;
  }

  function staffFormView() {
    if (currentUser.role !== "admin") return forbidden();
    return `${heading("Club administration", "Add staff member", `<a class="btn secondary" href="#staff">Cancel</a>`)}
      <article class="card form-card"><form data-form="staff-new" class="form-grid">
        <div class="field"><label>Full name</label><input name="name" required></div>
        <div class="field"><label>Role</label><select name="role"><option value="manager">Manager</option><option value="physio">Physio</option><option value="owner">Owner</option></select></div>
        <div class="field"><label>Speciality</label><input name="speciality" required></div>
        <div class="field"><label>Experience (years)</label><input name="experience" type="number" min="0" required></div>
        <div class="field"><label>Annual salary</label><input name="salary" type="number" min="0" required></div>
        <div class="field"><label>Login username</label><input name="username" required><small class="subtle">Initial password: welcome123</small></div>
        <div class="wide"><button class="btn" type="submit">Create staff account</button></div>
      </form></article>`;
  }

  function matchesView() {
    const data = db.get();
    const canManage = ["admin", "manager"].includes(currentUser.role);
    const sorted = [...data.matches].sort((a, b) => b.date.localeCompare(a.date));
    return `${heading("Season schedule", "Matches", canManage ? `<a class="btn" href="#match-new">Schedule match</a>` : "")}
      <article class="card"><div class="table-wrap"><table><thead><tr><th>Date</th><th>Opponent</th><th>Venue</th><th>Status</th><th>Score</th><th>Result</th><th></th></tr></thead><tbody>
        ${sorted.map((match) => `<tr><td>${dateText(match.date)} · ${esc(match.time)}</td><td><strong>${esc(match.opponent)}</strong></td><td>${esc(match.venue)}</td><td><span class="badge ${match.status}">${match.status}</span></td><td>${match.status === "played" ? `${match.scored}–${match.conceded}` : "—"}</td><td>${resultFor(match)}</td><td>${canManage ? `<div class="actions">${match.status === "scheduled" ? `<a class="btn secondary small" href="#match-result/${match.id}">Add result</a>` : ""}<button class="btn danger small" data-action="delete-match" data-id="${match.id}">Delete</button></div>` : ""}</td></tr>`).join("")}
      </tbody></table></div></article>`;
  }

  function matchFormView() {
    if (!["admin", "manager"].includes(currentUser.role)) return forbidden();
    return `${heading("Season schedule", "Schedule match", `<a class="btn secondary" href="#matches">Cancel</a>`)}
      <article class="card form-card"><form data-form="match-new" class="form-grid">
        <div class="field"><label>Opponent</label><input name="opponent" required></div>
        <div class="field"><label>Venue</label><select name="venue"><option>Home</option><option>Away</option><option>Neutral</option></select></div>
        <div class="field"><label>Date</label><input name="date" type="date" required></div>
        <div class="field"><label>Kick-off</label><input name="time" type="time" required></div>
        <div class="wide"><button class="btn" type="submit">Add fixture</button></div>
      </form></article>`;
  }

  function resultFormView(matchId) {
    const match = db.get().matches.find((item) => item.id === matchId);
    if (!match || !["admin", "manager"].includes(currentUser.role)) return forbidden();
    return `${heading("Matchday", `Result vs ${match.opponent}`, `<a class="btn secondary" href="#matches">Cancel</a>`)}
      <article class="card form-card"><form data-form="match-result" class="form-grid"><input type="hidden" name="id" value="${match.id}">
        <div class="field"><label>Goals scored</label><input name="scored" type="number" min="0" required></div>
        <div class="field"><label>Goals conceded</label><input name="conceded" type="number" min="0" required></div>
        <div class="wide"><button class="btn" type="submit">Save result</button></div>
      </form></article>`;
  }

  function financeView() {
    if (!["admin", "owner"].includes(currentUser.role)) return forbidden();
    const data = db.get();
    const income = data.transactions.filter((item) => item.type === "income").reduce((sum, item) => sum + Number(item.amount), 0);
    const expenses = data.transactions.filter((item) => item.type === "expense").reduce((sum, item) => sum + Number(item.amount), 0);
    return `${heading("Club accounts", "Finance")}
      <section class="cards">
        <article class="card metric"><span>Opening budget</span><strong>${money(data.club.budget)}</strong></article>
        <article class="card metric"><span>Income</span><strong>${money(income)}</strong></article>
        <article class="card metric"><span>Expenses</span><strong>${money(expenses)}</strong></article>
        <article class="card metric"><span>Available</span><strong>${money(data.club.budget + income - expenses)}</strong></article>
      </section>
      <section class="grid-2"><article class="card"><h2>Transactions</h2><div class="table-wrap"><table><thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Amount</th><th></th></tr></thead><tbody>
        ${data.transactions.map((item) => `<tr><td>${dateText(item.date)}</td><td>${esc(item.description)}</td><td><span class="badge ${item.type}">${esc(item.category)}</span></td><td>${item.type === "expense" ? "−" : "+"}${money(item.amount)}</td><td><button class="btn danger small" data-action="delete-transaction" data-id="${item.id}">Delete</button></td></tr>`).join("")}
      </tbody></table></div></article>
      <article class="card"><h2>Add transaction</h2><form data-form="transaction-new">
        <div class="field"><label>Type</label><select name="type"><option value="income">Income</option><option value="expense">Expense</option></select></div>
        <div class="field"><label>Category</label><input name="category" required></div>
        <div class="field"><label>Description</label><input name="description" required></div>
        <div class="field"><label>Date</label><input name="date" type="date" required value="${new Date().toISOString().slice(0, 10)}"></div>
        <div class="field"><label>Amount</label><input name="amount" type="number" min="0.01" step="0.01" required></div>
        <button class="btn" type="submit">Add transaction</button>
      </form></article></section>`;
  }

  function dataView() {
    if (currentUser.role !== "admin") return forbidden();
    const data = db.get();
    const cloud = db.cloudStatus();
    return `${heading("Storage and backup", "Club data")}
      <section class="grid-2">
        <article class="card"><h2>Vercel Blob sync</h2><p class="subtle">Club operations are saved to the connected Blob store when deployed. Login credentials remain in this browser.</p><div class="fixture"><span>Status</span><span class="badge ${cloud === "online" ? "fit" : cloud === "syncing" ? "scheduled" : ""}">${esc(cloud)}</span></div><button class="btn" data-action="sync-cloud">Sync now</button></article>
        <article class="card"><h2>Backup and restore</h2><p class="subtle">Download all current club data as JSON, or restore a previous Gaffer backup.</p><div class="actions"><button class="btn" data-action="export">Export JSON</button><label class="btn secondary" for="import-file">Import JSON</label><input id="import-file" type="file" accept="application/json,.json" hidden></div></article>
        <article class="card"><h2>Reset demo</h2><p class="subtle">Clear browser changes and reload the original seed data. This cannot be undone unless you export a backup first.</p><button class="btn danger" data-action="reset">Reset all local data</button></article>
        <article class="card"><h2>Storage summary</h2><div class="fixture"><span>Players</span><strong>${data.players.length}</strong></div><div class="fixture"><span>Staff</span><strong>${data.staff.length}</strong></div><div class="fixture"><span>Matches</span><strong>${data.matches.length}</strong></div><div class="fixture"><span>Transactions</span><strong>${data.transactions.length}</strong></div></article>
        <article class="card"><h2>How it works</h2><p class="subtle">The first visit loads <code>data/seed.json</code>. Every change is then saved in this browser's localStorage. Export a backup before clearing browser data or moving to another device.</p></article>
      </section>`;
  }

  function forbidden() {
    return `${heading("Access", "Not available")}<article class="card empty">Your role does not have access to this page.</article>`;
  }

  function render() {
    currentUser = db.currentUser();
    if (!currentUser) {
      if (location.hash === "#signup") signupView(); else loginView();
      return;
    }
    const raw = location.hash.slice(1) || "dashboard";
    const [route, parameter] = raw.split("/");
    const baseAllowed = routesByRole[currentUser.role].includes(route);
    const extraAllowed = ["player-new", "player-stats", "staff-new", "match-new", "match-result"].includes(route);
    let content;
    if (!baseAllowed && !extraAllowed) content = forbidden();
    else if (route === "dashboard") content = dashboardView();
    else if (["players", "fitness"].includes(route)) content = playersView(route);
    else if (route === "squad") content = squadBuilderView();
    else if (route === "player-new") content = playerFormView();
    else if (route === "player-stats") content = playerStatsView(parameter);
    else if (route === "staff") content = staffView();
    else if (route === "staff-new") content = staffFormView();
    else if (route === "matches") content = matchesView();
    else if (route === "match-new") content = matchFormView();
    else if (route === "match-result") content = resultFormView(parameter);
    else if (route === "finance") content = financeView();
    else if (route === "data") content = dataView();
    else content = dashboardView();
    shell(content, route);
  }

  function navigate(route, message) {
    if (location.hash === `#${route}`) render(); else location.hash = route;
    if (message) notify(message);
  }

  app.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.target;
    if (form.id === "login-form") {
      const values = formObject(form);
      currentUser = db.login(values.username, values.password);
      if (!currentUser) { notify("Incorrect username or password.", true); return; }
      location.hash = "dashboard";
      render();
      return;
    }
    if (form.id === "signup-form") {
      const values = formObject(form);
      try {
        if (values.password !== values.confirmPassword) throw new Error("Passwords do not match.");
        db.update((data) => {
          const username = values.username.trim();
          const number = Number(values.number);
          if (data.users.some((user) => user.username.toLowerCase() === username.toLowerCase())) throw new Error("That username already exists.");
          if (data.players.some((player) => player.number === number)) throw new Error("That squad number is already in use.");
          const playerId = id("p");
          const userId = id("u");
          data.players.push({ id: playerId, name: values.name.trim(), number, dob: "", position: values.position, height: 0, weight: 0, salary: 0, fitness: "fit", selected: false, stats: { matches: 0, goals: 0, assists: 0, yellow: 0, red: 0, rating: 0 } });
          data.users.push({ id: userId, name: values.name.trim(), role: "player", username, password: values.password, playerId });
        });
        currentUser = db.login(values.username, values.password);
        location.hash = "dashboard";
        render();
        notify("Account created. Welcome to Gaffer FC!");
      } catch (error) { notify(error.message || "Could not create that account.", true); }
      return;
    }
    const values = formObject(form);
    const type = form.dataset.form;
    try {
      if (type === "fitness") {
        db.update((data) => {
          const player = data.players.find((item) => item.id === values.id);
          player.fitness = values.fitness;
          if (values.fitness !== "fit") {
            player.selected = false;
            Object.keys(data.lineup?.starters || {}).forEach((slot) => { if (data.lineup.starters[slot] === player.id) delete data.lineup.starters[slot]; });
          }
        });
        navigate(location.hash.slice(1), "Fitness updated.");
      } else if (type === "lineup-settings") {
        db.update((data) => {
          const nextFormation = values.formation;
          const nextSize = Number(values.squadSize);
          if (!formations[nextFormation]) throw new Error("Choose a valid formation.");
          if (nextSize < 11 || nextSize > 23) throw new Error("Squad size must be between 11 and 23.");
          if (data.lineup.formation !== nextFormation) data.lineup.starters = {};
          data.lineup.formation = nextFormation;
          data.lineup.squadSize = nextSize;
          const assigned = new Set(Object.values(data.lineup.starters));
          const selected = data.players.filter((player) => player.selected);
          if (selected.length > nextSize) {
            const keep = [...selected].sort((a, b) => Number(assigned.has(b.id)) - Number(assigned.has(a.id)) || b.stats.rating - a.stats.rating).slice(0, nextSize);
            const keepIds = new Set(keep.map((player) => player.id));
            data.players.forEach((player) => { if (player.selected && !keepIds.has(player.id)) player.selected = false; });
          }
        });
        activeLineupSlot = null;
        navigate("squad", "Formation and squad size updated.");
      } else if (type === "player-new") {
        db.update((data) => {
          if (data.players.some((player) => player.number === Number(values.number))) throw new Error("That squad number is already in use.");
          if (data.users.some((user) => user.username.toLowerCase() === values.username.trim().toLowerCase())) throw new Error("That login username already exists.");
          const playerId = id("p");
          data.players.push({ id: playerId, name: values.name.trim(), number: Number(values.number), dob: values.dob, position: values.position, height: Number(values.height), weight: Number(values.weight), salary: Number(values.salary), fitness: values.fitness, selected: false, stats: { matches: 0, goals: 0, assists: 0, yellow: 0, red: 0, rating: 0 } });
          data.users.push({ id: id("u"), name: values.name.trim(), role: "player", username: values.username.trim(), password: values.password, playerId });
        });
        navigate("players", "Player created.");
      } else if (type === "player-stats") {
        db.update((data) => { const player = data.players.find((item) => item.id === values.id); ["matches","goals","assists","yellow","red","rating"].forEach((key) => { player.stats[key] = Number(values[key]); }); });
        navigate("players", "Statistics saved.");
      } else if (type === "staff-new") {
        db.update((data) => {
          if (data.users.some((user) => user.username.toLowerCase() === values.username.trim().toLowerCase())) throw new Error("That username already exists.");
          const staffId = id("s");
          data.staff.push({ id: staffId, name: values.name.trim(), role: values.role, speciality: values.speciality.trim(), experience: Number(values.experience), salary: Number(values.salary) });
          data.users.push({ id: id("u"), name: values.name.trim(), role: values.role, username: values.username.trim(), password: "welcome123", staffId });
        });
        navigate("staff", "Staff account created with password welcome123.");
      } else if (type === "match-new") {
        db.update((data) => data.matches.push({ id: id("m"), opponent: values.opponent.trim(), venue: values.venue, date: values.date, time: values.time, status: "scheduled", scored: null, conceded: null }));
        navigate("matches", "Fixture scheduled.");
      } else if (type === "match-result") {
        db.update((data) => { const match = data.matches.find((item) => item.id === values.id); match.status = "played"; match.scored = Number(values.scored); match.conceded = Number(values.conceded); });
        navigate("matches", "Result saved.");
      } else if (type === "transaction-new") {
        db.update((data) => data.transactions.unshift({ id: id("t"), type: values.type, category: values.category.trim(), description: values.description.trim(), date: values.date, amount: Number(values.amount) }));
        navigate("finance", "Transaction added.");
      }
    } catch (error) { notify(error.message || "Could not save that change.", true); }
  });

  app.addEventListener("click", async (event) => {
    const demo = event.target.closest("[data-demo]");
    if (demo) {
      const credentials = { admin: ["admin","admin123"], manager: ["manager","manager123"], physio: ["physio","physio123"], owner: ["owner","owner123"], player: ["10","player123"] }[demo.dataset.demo];
      currentUser = db.login(...credentials); location.hash = "dashboard"; render(); return;
    }
    const button = event.target.closest("[data-action]");
    if (!button) {
      if (event.target.closest(".nav a")) document.querySelector("#sidebar")?.classList.remove("open");
      return;
    }
    const action = button.dataset.action;
    if (action === "menu") { document.querySelector("#sidebar")?.classList.toggle("open"); return; }
    if (action === "logout") { db.logout(); location.hash = ""; loginView(); return; }
    if (action === "choose-slot") { activeLineupSlot = button.dataset.slot; render(); return; }
    if (action === "auto-pick") { autoPickSquad(); return; }
    if (action === "clear-lineup") {
      if (!window.confirm("Clear the starting XI and matchday squad?")) return;
      db.update((data) => { data.lineup.starters = {}; data.players.forEach((player) => { player.selected = false; }); });
      activeLineupSlot = null; navigate("squad", "Matchday squad cleared."); return;
    }
    if (action === "add-squad") {
      try {
        db.update((data) => {
          const selectedCount = data.players.filter((player) => player.selected).length;
          if (selectedCount >= data.lineup.squadSize) throw new Error(`The ${data.lineup.squadSize}-player squad is full.`);
          const player = data.players.find((item) => item.id === button.dataset.id);
          if (!player || player.fitness !== "fit") throw new Error("Only fit players can join the squad.");
          player.selected = true;
        });
        navigate("squad", "Player added to the matchday squad.");
      } catch (error) { notify(error.message, true); }
      return;
    }
    if (action === "remove-squad") {
      db.update((data) => {
        const player = data.players.find((item) => item.id === button.dataset.id);
        if (player) player.selected = false;
        Object.keys(data.lineup.starters).forEach((slot) => { if (data.lineup.starters[slot] === button.dataset.id) delete data.lineup.starters[slot]; });
      });
      navigate("squad", "Player removed from the matchday squad."); return;
    }
    if (action === "assign-player") {
      try {
        db.update((data) => {
          const slot = button.dataset.slot;
          const definition = formations[data.lineup.formation].find(([key]) => key === slot);
          const player = data.players.find((item) => item.id === button.dataset.id);
          if (!definition || !player || !player.selected || player.fitness !== "fit") throw new Error("That player cannot be assigned.");
          if (player.position !== definition[2]) throw new Error(`This position requires a ${definition[2].toLowerCase()}.`);
          Object.keys(data.lineup.starters).forEach((key) => { if (data.lineup.starters[key] === player.id) delete data.lineup.starters[key]; });
          data.lineup.starters[slot] = player.id;
        });
        navigate("squad", "Player placed in the starting XI.");
      } catch (error) { notify(error.message, true); }
      return;
    }
    if (action === "unassign-slot") {
      db.update((data) => { delete data.lineup.starters[button.dataset.slot]; });
      navigate("squad", "Player moved to the bench."); return;
    }
    if (action === "squad") {
      try {
        db.update((data) => {
          const player = data.players.find((item) => item.id === button.dataset.id);
          if (player.fitness !== "fit") return;
          if (!player.selected && data.players.filter((item) => item.selected).length >= data.lineup.squadSize) throw new Error(`The ${data.lineup.squadSize}-player squad is full.`);
          player.selected = !player.selected;
          if (!player.selected) Object.keys(data.lineup.starters).forEach((slot) => { if (data.lineup.starters[slot] === player.id) delete data.lineup.starters[slot]; });
        });
        navigate(location.hash.slice(1), "Squad updated.");
      } catch (error) { notify(error.message, true); }
      return;
    }
    const deletions = { "delete-player": "players", "delete-staff": "staff", "delete-match": "matches", "delete-transaction": "transactions" };
    if (deletions[action]) {
      if (!window.confirm("Delete this item?")) return;
      const collection = deletions[action];
      db.update((data) => {
        data[collection] = data[collection].filter((item) => item.id !== button.dataset.id);
        if (action === "delete-player") data.users = data.users.filter((user) => user.playerId !== button.dataset.id);
        if (action === "delete-player") Object.keys(data.lineup?.starters || {}).forEach((slot) => { if (data.lineup.starters[slot] === button.dataset.id) delete data.lineup.starters[slot]; });
        if (action === "delete-staff") data.users = data.users.filter((user) => user.staffId !== button.dataset.id);
      });
      navigate(location.hash.slice(1), "Item deleted."); return;
    }
    if (action === "export") {
      const blob = new Blob([JSON.stringify(db.get(), null, 2)], { type: "application/json" });
      const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = `gaffer-backup-${new Date().toISOString().slice(0,10)}.json`; link.click(); URL.revokeObjectURL(link.href); notify("Backup exported."); return;
    }
    if (action === "sync-cloud") {
      const synced = await db.pushCloud();
      navigate("data", synced ? "Club data synced to Vercel Blob." : "Cloud sync is unavailable; changes remain saved locally.");
      return;
    }
    if (action === "reset") {
      if (!window.confirm("Reset all local changes and sign out?")) return;
      await db.reset(); location.hash = ""; loginView(); notify("Local data reset.");
    }
  });

  app.addEventListener("change", async (event) => {
    if (event.target.id !== "import-file" || !event.target.files[0]) return;
    try {
      const value = JSON.parse(await event.target.files[0].text());
      db.importData(value); location.hash = ""; loginView(); notify("Backup imported. Sign in again.");
    } catch (error) { notify(error.message || "Could not import that file.", true); }
  });

  window.addEventListener("hashchange", render);
  db.init().then(render).catch((error) => {
    app.innerHTML = `<main class="loading"><h1>Gaffer could not start</h1><p>${esc(error.message)}</p><p>Open this folder with Live Server instead of opening index.html directly.</p></main>`;
  });
})();
