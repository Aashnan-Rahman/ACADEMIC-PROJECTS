"use strict";

const MAX_NODES = 60;
const MAX_EDGES = 200;
const MAX_INPUT = 12000;

function parseGraph(text) {
  if (text.length > MAX_INPUT) throw new Error("Use an edge list under 12,000 characters.");
  const [countLine, ...edgeLines] = text.trim().split(/\r?\n/);
  const count = Number(countLine);
  if (!/^\d+$/.test(countLine.trim()) || count < 1 || count > MAX_NODES) {
    throw new Error(`Enter a node count from 1 to ${MAX_NODES} on the first line.`);
  }
  const list = edgeLines.join("\n").trim();
  if (!/^\[\s*(?:\(\s*\d+\s*,\s*\d+\s*\)(?:\s*,\s*\(\s*\d+\s*,\s*\d+\s*\))*\s*,?\s*)?\]$/.test(list)) {
    throw new Error("Enter edges as [(0,1), (1,2)], or [] for a graph with no edges.");
  }
  const edges = new Map();
  for (const [, left, right] of list.matchAll(/\(\s*(\d+)\s*,\s*(\d+)\s*\)/g)) {
    const u = Math.min(Number(left), Number(right));
    const v = Math.max(Number(left), Number(right));
    if (v >= count || u === v) {
      throw new Error(`Edge (${left}, ${right}) needs two distinct node labels between 0 and ${count - 1}.`);
    }
    edges.set(u * count + v, [u, v]);
  }
  if (edges.size > MAX_EDGES) throw new Error(`Use at most ${MAX_EDGES} distinct edges.`);
  return { count, edges: Array.from(edges.values()).sort((a, b) => a[0] - b[0] || a[1] - b[1]) };
}

function adjacencyList(count, edges) {
  const neighbors = Array.from({ length: count }, () => []);
  edges.forEach(([u, v], index) => {
    neighbors[u].push({ node: v, index });
    neighbors[v].push({ node: u, index });
  });
  return neighbors;
}

function components(neighbors) {
  const visited = new Uint8Array(neighbors.length);
  const groups = [];
  for (let start = 0; start < neighbors.length; start++) {
    if (visited[start]) continue;
    const group = [start];
    visited[start] = 1;
    for (let head = 0; head < group.length; head++) {
      for (const { node } of neighbors[group[head]]) {
        if (visited[node]) continue;
        visited[node] = 1;
        group.push(node);
      }
    }
    groups.push(group.sort((a, b) => a - b));
  }
  return groups;
}

function edgeBetweenness(neighbors, edgeCount) {
  const count = neighbors.length;
  const scores = new Float64Array(edgeCount);
  for (let root = 0; root < count; root++) {
    const distance = new Int32Array(count).fill(-1);
    const paths = new Float64Array(count);
    const credit = new Float64Array(count).fill(1);
    const parents = Array.from({ length: count }, () => []);
    const queue = [root];
    distance[root] = 0;
    paths[root] = 1;
    for (let head = 0; head < queue.length; head++) {
      const u = queue[head];
      for (const { node: v, index } of neighbors[u]) {
        if (distance[v] === -1) {
          distance[v] = distance[u] + 1;
          queue.push(v);
        }
        if (distance[v] === distance[u] + 1) {
          paths[v] += paths[u];
          parents[v].push({ node: u, index });
        }
      }
    }
    for (let i = queue.length - 1; i > 0; i--) {
      const v = queue[i];
      for (const { node: u, index } of parents[v]) {
        const contribution = credit[v] * paths[u] / paths[v];
        credit[u] += contribution;
        scores[index] += contribution / 2;
      }
    }
  }
  return scores;
}

function buildTimeline(graph) {
  const steps = [];
  let edges = graph.edges;
  let removed = null;
  while (true) {
    const neighbors = adjacencyList(graph.count, edges);
    const scores = edgeBetweenness(neighbors, edges.length);
    const ranking = edges.map(([u, v], index) => ({ u, v, score: scores[index], index }));
    ranking.sort((a, b) => b.score - a.score || a.index - b.index);
    if (ranking.length) {
      const bestScore = ranking[0].score;
      const tied = ranking.filter(({ score }) => bestScore - score <= 1e-9);
      const selected = tied.reduce((first, edge) => edge.index < first.index ? edge : first);
      ranking.splice(ranking.indexOf(selected), 1);
      ranking.unshift(selected);
    }
    steps.push({ edges, groups: components(neighbors), ranking, removed });
    if (!ranking.length) break;
    [removed] = ranking;
    edges = edges.filter((_, index) => index !== removed.index);
  }
  return steps;
}
