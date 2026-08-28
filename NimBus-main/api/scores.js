import { list, put } from "@vercel/blob";

const PREFIX = "nimbus-matches/";
const MAX_MATCHES = 1000;

function json(value, status = 200) {
  return Response.json(value, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff"
    }
  });
}

function cleanText(value, maximum = 32) {
  return String(value ?? "").trim().replace(/[\u0000-\u001f\u007f]/g, "").slice(0, maximum);
}

function validScore(value) {
  return Number.isInteger(value) && value >= 0 && value <= 9;
}

function validateMatch(input) {
  if (!input || typeof input !== "object") return null;
  const record = {
    id: cleanText(input.id, 80),
    date: cleanText(input.date, 40),
    mode: input.mode === "Local" ? "Local" : "Vs AI",
    player1: cleanText(input.player1),
    player2: cleanText(input.player2),
    score1: Number(input.score1),
    score2: Number(input.score2),
    winner: cleanText(input.winner)
  };
  if (!record.id || !record.player1 || !record.player2 || !record.winner) return null;
  if (!validScore(record.score1) || !validScore(record.score2)) return null;
  if (![record.player1, record.player2].includes(record.winner)) return null;
  if (Number.isNaN(Date.parse(record.date))) record.date = new Date().toISOString();
  return record;
}

async function allMatchBlobs() {
  const blobs = [];
  let cursor;
  do {
    const page = await list({ prefix: PREFIX, limit: Math.min(1000, MAX_MATCHES - blobs.length), cursor });
    blobs.push(...page.blobs);
    cursor = page.hasMore && blobs.length < MAX_MATCHES ? page.cursor : undefined;
  } while (cursor);
  return blobs;
}

export async function GET() {
  try {
    const blobs = await allMatchBlobs();
    const matches = (await Promise.all(blobs.map(async (blob) => {
      try {
        const response = await fetch(blob.url, { cache: "no-store" });
        if (!response.ok) return null;
        return validateMatch(await response.json());
      } catch (_) {
        return null;
      }
    }))).filter(Boolean).sort((a, b) => b.date.localeCompare(a.date));
    return json({ matches });
  } catch (error) {
    console.error("Could not read NimBus scores", error);
    return json({ error: "Leaderboard is temporarily unavailable." }, 503);
  }
}

export async function POST(request) {
  try {
    const origin = request.headers.get("origin");
    if (origin && new URL(origin).host !== new URL(request.url).host) return json({ error: "Origin not allowed." }, 403);
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > 4096) return json({ error: "Request is too large." }, 413);
    const record = validateMatch(await request.json());
    if (!record) return json({ error: "Invalid match result." }, 400);

    const pathname = `${PREFIX}${Date.now()}-${record.id.replace(/[^a-zA-Z0-9_-]/g, "")}.json`;
    await put(pathname, JSON.stringify(record), {
      access: "public",
      addRandomSuffix: true,
      contentType: "application/json",
      cacheControlMaxAge: 60
    });
    return json({ ok: true }, 201);
  } catch (error) {
    console.error("Could not save NimBus score", error);
    return json({ error: "Score could not be saved." }, 500);
  }
}
