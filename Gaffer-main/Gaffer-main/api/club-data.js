import { get, put } from "@vercel/blob";

const PATHNAME = "gaffer-club/club-data.json";
const ACCESS = "public";
const ALLOWED_KEYS = ["version", "club", "players", "staff", "matches", "transactions", "lineup"];

function json(value, status = 200) {
  return Response.json(value, {
    status,
    headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" }
  });
}

function validClubData(value) {
  if (!value || typeof value !== "object") return false;
  if (!value.club || typeof value.club !== "object") return false;
  if (!["players", "staff", "matches", "transactions"].every((key) => Array.isArray(value[key]))) return false;
  if (!value.lineup || typeof value.lineup !== "object" || !value.lineup.starters) return false;
  return value.players.length <= 100 && value.staff.length <= 50 && value.matches.length <= 500 && value.transactions.length <= 1000;
}

export async function GET() {
  try {
    const result = await get(PATHNAME, { access: ACCESS });
    if (!result || result.statusCode !== 200) return json({ data: null });
    const value = await new Response(result.stream).json();
    return json({ data: validClubData(value) ? value : null });
  } catch (error) {
    if (error?.name === "BlobNotFoundError") return json({ data: null });
    console.error("Could not read Gaffer club data", error);
    return json({ error: "Club data is temporarily unavailable." }, 503);
  }
}

export async function POST(request) {
  try {
    const origin = request.headers.get("origin");
    if (origin && new URL(origin).host !== new URL(request.url).host) return json({ error: "Origin not allowed." }, 403);
    const length = Number(request.headers.get("content-length") || 0);
    if (length > 1000000) return json({ error: "Club data is too large." }, 413);
    const input = await request.json();
    if (!validClubData(input)) return json({ error: "Invalid club data." }, 400);
    const safe = Object.fromEntries(ALLOWED_KEYS.map((key) => [key, input[key]]));
    await put(PATHNAME, JSON.stringify(safe), {
      access: ACCESS,
      allowOverwrite: true,
      contentType: "application/json",
      cacheControlMaxAge: 60
    });
    return json({ ok: true });
  } catch (error) {
    console.error("Could not save Gaffer club data", error);
    return json({ error: "Club data could not be saved." }, 500);
  }
}
