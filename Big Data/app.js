"use strict";

const byId = (id) => document.getElementById(id);
const canvas = byId("network");
const ctx = canvas.getContext("2d");
const input = byId("graph-input");
const position = byId("position");
const play = byId("play");
const previous = byId("previous");
const next = byId("next");
const split = byId("split");
const sample = parseGraph(input.defaultValue);
const W = 800;
const H = 480;
const palette = ["#a5e9ff", "#f9b78b", "#c9b4ff", "#a8e9ac", "#f9a9cf", "#f5de8c"];
const colorFor = (index) => palette[index] ?? `hsl(${index * 137.5 % 360} 65% 72%)`;
const edgeName = ({ u, v }) => `${u}–${v}`;
const formatScore = new Intl.NumberFormat(undefined, { maximumFractionDigits: 3 });

let timeline = [];
let points = [];
let step = 0;
let timer = null;
let graphRequest = 0;

function layout(graph) {
  if (JSON.stringify(graph) === JSON.stringify(sample)) {
    return [[136, 126], [267, 245], [126, 358], [493, 245], [641, 113], [700, 250], [629, 373]];
  }
  if (graph.count === 1) return [[W / 2, H / 2]];
  const nodes = Array.from({ length: graph.count }, (_, i) => {
    const angle = i / graph.count * Math.PI * 2 - Math.PI / 2;
    return [W / 2 + 260 * Math.cos(angle), H / 2 + 160 * Math.sin(angle)];
  });
  const ideal = 1450 / Math.sqrt(graph.count * 10);
  for (let iteration = 0; iteration < 100; iteration++) {
    const force = nodes.map(([x, y]) => [(W / 2 - x) * .08, (H / 2 - y) * .08]);
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i][0] - nodes[j][0], dy = nodes[i][1] - nodes[j][1];
        const factor = ideal ** 2 / Math.max(1, dx * dx + dy * dy);
        force[i][0] += dx * factor;
        force[i][1] += dy * factor;
        force[j][0] -= dx * factor;
        force[j][1] -= dy * factor;
      }
    }
    for (const [i, j] of graph.edges) {
      const dx = nodes[i][0] - nodes[j][0], dy = nodes[i][1] - nodes[j][1];
      const factor = Math.hypot(dx, dy) / ideal;
      force[i][0] -= dx * factor;
      force[i][1] -= dy * factor;
      force[j][0] += dx * factor;
      force[j][1] += dy * factor;
    }
    nodes.forEach(([x, y], i) => {
      const [dx, dy] = force[i];
      const speed = Math.min(1, (14 * (1 - iteration / 100)) / (Math.hypot(dx, dy) || 1));
      nodes[i] = [Math.max(38, Math.min(W - 38, x + speed * dx)), Math.max(38, Math.min(H - 38, y + speed * dy))];
    });
  }
  return nodes;
}

function drawNetwork(current) {
  ctx.setTransform(2, 0, 0, 2, 0, 0);
  ctx.clearRect(0, 0, W, H);
  const colors = [];
  current.groups.forEach((group, i) => group.forEach((node) => { colors[node] = colorFor(i); }));
  const radius = points.length > 22 ? 15 : points.length > 12 ? 20 : 25;
  function drawEdge(u, v, color, thickness, dash = []) {
    ctx.beginPath();
    ctx.moveTo(...points[u]);
    ctx.lineTo(...points[v]);
    ctx.strokeStyle = color;
    ctx.lineWidth = thickness;
    ctx.setLineDash(dash);
    ctx.stroke();
  }
  for (const [u, v] of current.edges) drawEdge(u, v, "#74889f", 2);
  if (current.removed) drawEdge(current.removed.u, current.removed.v, "#ff9e8b", 3, [7, 8]);
  if (current.ranking.length) {
    const { u, v } = current.ranking[0];
    drawEdge(u, v, "#a5e9ff", 4);
  }
  ctx.setLineDash([]);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `700 ${Math.round(radius * .85)}px system-ui, sans-serif`;
  points.forEach(([x, y], node) => {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = colors[node];
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#0d1420";
    ctx.stroke();
    ctx.fillStyle = "#0b1621";
    ctx.fillText(node, x, y);
  });
}

function listItem(text) {
  const item = document.createElement("li");
  item.textContent = text;
  return item;
}

function nextSplitIndex() {
  return timeline.findIndex((entry, index) => index > step && entry.groups.length > timeline[step].groups.length);
}

function render() {
  const current = timeline[step];
  const last = timeline.length - 1;
  position.max = last;
  position.value = step;
  position.disabled = last === 0;
  byId("step-label").textContent = `Step ${step} of ${last}`;
  const communityCount = current.groups.length;
  const groupLabel = `${communityCount} ${communityCount === 1 ? "community" : "communities"}`;
  byId("graph-size").textContent = `${points.length} nodes · ${current.edges.length} edges · ${groupLabel}`;
  byId("event").textContent = current.removed
    ? `Removed ${edgeName(current.removed)} (score ${formatScore.format(current.removed.score)}). ${groupLabel}.`
    : `Starting graph · ${groupLabel}.`;

  const items = current.groups.map((group, i) => {
    const item = listItem(group.join(", "));
    const swatch = document.createElement("span");
    swatch.className = "community-swatch";
    swatch.style.backgroundColor = colorFor(i);
    swatch.setAttribute("aria-hidden", "true");
    item.prepend(swatch);
    return item;
  });
  byId("communities").replaceChildren(...items);

  const ranks = current.ranking.slice(0, 5).map((edge, i) => {
    const row = listItem(`${edgeName(edge)}${i === 0 ? " · next" : ""}`);
    const value = document.createElement("span");
    value.textContent = formatScore.format(edge.score);
    row.append(value);
    return row;
  });
  byId("rankings").replaceChildren(...(ranks.length ? ranks : [listItem("No edges remain.")]));
  previous.disabled = step === 0;
  next.disabled = step === last;
  play.disabled = last === 0;
  split.disabled = nextSplitIndex() === -1;
  drawNetwork(current);
}

function pause() {
  clearInterval(timer);
  timer = null;
  play.textContent = "Play";
}

function goTo(index) {
  pause();
  step = index;
  render();
}

function loadGraph(text, success) {
  const status = byId("input-status");
  try {
    const graph = parseGraph(text);
    const steps = buildTimeline(graph);
    points = layout(graph);
    timeline = steps;
    input.value = text.trim();
    goTo(0);
    status.textContent = success;
    status.dataset.error = "false";
  } catch (error) {
    status.textContent = error.message;
    status.dataset.error = "true";
  }
}

play.addEventListener("click", () => {
  if (timer !== null) {
    pause();
    return;
  }
  if (step === timeline.length - 1) goTo(0);
  play.textContent = "Pause";
  timer = setInterval(() => {
    step++;
    if (step === timeline.length - 1) pause();
    render();
  }, 850);
});
position.addEventListener("input", () => goTo(Number(position.value)));
previous.addEventListener("click", () => goTo(step - 1));
next.addEventListener("click", () => goTo(step + 1));
split.addEventListener("click", () => {
  const index = nextSplitIndex();
  if (index !== -1) goTo(index);
});
byId("graph-form").addEventListener("submit", (event) => {
  event.preventDefault();
  graphRequest++;
  loadGraph(input.value, "Graph loaded.");
});
byId("sample").addEventListener("click", () => {
  graphRequest++;
  loadGraph(input.defaultValue, "Sample graph restored.");
});
byId("graph-file").addEventListener("change", async ({ currentTarget }) => {
  const request = ++graphRequest;
  const [file] = currentTarget.files;
  currentTarget.value = "";
  if (!file) return;
  try {
    if (file.size > MAX_INPUT * 4) throw new Error("The graph file is too large.");
    const text = await file.text();
    if (request === graphRequest) loadGraph(text, "Graph file loaded.");
  } catch (error) {
    if (request !== graphRequest) return;
    const status = byId("input-status");
    status.textContent = error.message || "Could not read the graph file.";
    status.dataset.error = "true";
  }
});

loadGraph(input.defaultValue, "");
