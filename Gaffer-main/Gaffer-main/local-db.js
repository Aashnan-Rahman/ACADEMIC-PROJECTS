(function () {
  "use strict";

  const DATA_KEY = "gaffer-fc-data-v1";
  const SESSION_KEY = "gaffer-fc-session-v1";
  let data = null;

  const clone = (value) => JSON.parse(JSON.stringify(value));

  async function readSeed() {
    const response = await fetch("./data/seed.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Could not load data/seed.json");
    return response.json();
  }

  async function init() {
    const stored = localStorage.getItem(DATA_KEY);
    if (stored) {
      try {
        data = JSON.parse(stored);
        return clone(data);
      } catch (_) {
        localStorage.removeItem(DATA_KEY);
      }
    }
    data = await readSeed();
    save();
    return clone(data);
  }

  function save() {
    localStorage.setItem(DATA_KEY, JSON.stringify(data));
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
    data = await readSeed();
    save();
    logout();
    return get();
  }

  function importData(value) {
    const required = ["club", "users", "players", "staff", "matches", "transactions"];
    if (!value || required.some((key) => !(key in value)) || required.slice(1).some((key) => !Array.isArray(value[key]))) {
      throw new Error("That file is not a valid Gaffer backup.");
    }
    data = clone(value);
    save();
    logout();
  }

  window.GafferDB = { init, get, update, currentUser, login, logout, reset, importData };
})();
