(function () {
  "use strict";

  const DATA_KEY = "gaffer-fc-data-v1";
  const SESSION_KEY = "gaffer-fc-session-v1";
  const CLOUD_FIELDS = ["version", "club", "players", "staff", "matches", "transactions", "lineup"];
  let data = null;
  let seedData = null;
  let cloudState = "local";
  let cloudTimer = null;

  const clone = (value) => JSON.parse(JSON.stringify(value));

  async function readSeed() {
    const response = await fetch("./data/seed.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Could not load data/seed.json");
    return response.json();
  }

  function migrate(value, seed) {
    const migrated = { ...seed, ...value, version: seed.version };
    const existingPlayerIds = new Set((value.players || []).map((player) => player.id));
    migrated.players = [...(value.players || []), ...seed.players.filter((player) => !existingPlayerIds.has(player.id))];
    migrated.users = value.users || seed.users;
    migrated.staff = value.staff || seed.staff;
    migrated.matches = value.matches || seed.matches;
    migrated.transactions = value.transactions || seed.transactions;
    migrated.lineup = value.lineup || seed.lineup;
    return migrated;
  }

  function cloudPayload(source = data) {
    return Object.fromEntries(CLOUD_FIELDS.map((key) => [key, clone(source[key])]));
  }

  async function pullCloud() {
    try {
      cloudState = "syncing";
      const response = await fetch("/api/club-data", { headers: { Accept: "application/json" }, cache: "no-store" });
      if (!response.ok) throw new Error("Cloud data unavailable");
      const payload = await response.json();
      if (payload.data) {
        const localUsers = data.users;
        data = migrate({ ...data, ...payload.data, users: localUsers }, seedData);
        save(false);
      } else {
        scheduleCloudSave(0);
      }
      cloudState = "online";
      return true;
    } catch (_) {
      cloudState = "local";
      return false;
    }
  }

  async function pushCloud() {
    try {
      cloudState = "syncing";
      const response = await fetch("/api/club-data", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(cloudPayload())
      });
      if (!response.ok) throw new Error("Cloud save failed");
      cloudState = "online";
      window.dispatchEvent(new CustomEvent("gaffer-cloud", { detail: cloudState }));
      return true;
    } catch (_) {
      cloudState = "local";
      window.dispatchEvent(new CustomEvent("gaffer-cloud", { detail: cloudState }));
      return false;
    }
  }

  function scheduleCloudSave(delay = 500) {
    window.clearTimeout(cloudTimer);
    cloudTimer = window.setTimeout(pushCloud, delay);
  }

  async function init() {
    seedData = await readSeed();
    const stored = localStorage.getItem(DATA_KEY);
    if (stored) {
      try {
        data = migrate(JSON.parse(stored), seedData);
        save(false);
        await pullCloud();
        return clone(data);
      } catch (_) {
        localStorage.removeItem(DATA_KEY);
      }
    }
    data = clone(seedData);
    save(false);
    await pullCloud();
    return clone(data);
  }

  function save(sync = true) {
    localStorage.setItem(DATA_KEY, JSON.stringify(data));
    if (sync) scheduleCloudSave();
  }

  function get() {
    if (!data) throw new Error("Local database has not been initialized");
    return clone(data);
  }

  function update(mutator) {
    const draft = clone(data);
    mutator(draft);
    data = draft;
    save();
    return get();
  }

  function currentUser() {
    const id = sessionStorage.getItem(SESSION_KEY);
    return data?.users.find((user) => user.id === id) || null;
  }

  function login(username, password) {
    const user = data.users.find((item) =>
      item.username.toLowerCase() === String(username).trim().toLowerCase() &&
      item.password === String(password)
    );
    if (!user) return null;
    sessionStorage.setItem(SESSION_KEY, user.id);
    return clone(user);
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  async function reset() {
    seedData = await readSeed();
    data = clone(seedData);
    save();
    logout();
    return get();
  }

  function importData(value) {
    const required = ["club", "users", "players", "staff", "matches", "transactions"];
    if (!value || required.some((key) => !(key in value)) || required.slice(1).some((key) => !Array.isArray(value[key]))) {
      throw new Error("That file is not a valid Gaffer backup.");
    }
    data = migrate(value, seedData);
    save();
    logout();
  }

  function cloudStatus() { return cloudState; }

  window.GafferDB = { init, get, update, currentUser, login, logout, reset, importData, cloudStatus, pushCloud };
})();
