/**
 * Drywall backend API (Cloudflare Worker + Neon Postgres).
 *
 * The game frontend is served as static assets from this same Worker, so the
 * API is same-origin and the raw DATABASE_URL secret never reaches the browser.
 *
 * Routes
 * ------
 *   GET  /api/leaderboard  Public leaderboard projection (name + stats only).
 *   POST /api/connect      Resolve a row from a secret key and return the full
 *                          private save (used to link a device).
 *   POST /api/sync         Create/update the caller's row. Authenticated by the
 *                          same secret key; last write wins by timestamp.
 *
 * Security model
 * --------------
 *   * The secret key is a high-entropy client-generated credential. It is
 *     SHA-256-hashed here and only the hash is stored, so dumping the database
 *     does not reveal any usable key.
 *   * The full save is only ever returned to a caller that presents the secret.
 *     The public leaderboard exposes only `stats`.
 *   * All access is parameterised, so there is no SQL injection surface.
 */

import { neon } from "@neondatabase/serverless";

const JSON_HEADERS = { "content-type": "application/json; charset=utf-8" };

const MIN_SECRET_LENGTH = 32;
const MAX_SECRET_LENGTH = 512;
const MAX_NAME_LENGTH = 20;
const MAX_SAVE_CHARS = 200_000;
const LEADERBOARD_LIMIT = 5000;

/** Public player id: URL-safe, 8-64 chars (matches the schema constraint). */
const ID_PATTERN = /^[A-Za-z0-9_-]{8,64}$/;

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

/** Hex-encoded SHA-256 of a string. */
async function sha256Hex(value) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/** Trims a display name and strips control characters. Returns null if invalid. */
function cleanDisplayName(value) {
  if (typeof value !== "string") return null;
  const cleaned = value.replace(/[\u0000-\u001f\u007f]/g, "").trim();
  if (cleaned.length === 0 || cleaned.length > MAX_NAME_LENGTH) return null;
  return cleaned;
}

/**
 * Builds the public leaderboard projection from a full save document.
 * Keep this in sync with LEADERBOARD_TYPES in scripts/services/leaderboard.js.
 */
function buildStats(save) {
  const source = save && typeof save === "object" ? save : {};
  const stats = source.stats && typeof source.stats === "object" ? source.stats : {};
  return {
    drywall: String(source.drywall ?? "0"),
    rebirths: String(source.rebirths ?? "0"),
    skillPoints: String(source.skillPoints ?? "0"),
    infinities: String(source.infinities ?? "0"),
    infinityPower: String(source.infinityPower ?? "0"),
    playtime: String(stats.playtime ?? "0"),
    clicks: String(stats.clicks ?? "0"),
    achievements: Array.isArray(source.achievements)
      ? source.achievements.length
      : 0,
  };
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function isUniqueViolation(err) {
  return err?.code === "23505" || err?.sourceError?.code === "23505";
}

/** GET /api/leaderboard */
async function getLeaderboard(sql) {
  const rows = await sql`
    select display_name, stats
    from public.players
    where leaderboard_opt_in = true
      -- Opting in isn't enough: a player must also have picked a real name,
      -- otherwise they'd show up as their raw id.
      and display_name <> id
    order by updated_at desc
    limit ${LEADERBOARD_LIMIT}
  `;
  return json({
    entries: rows.map((row) => ({ name: row.display_name, stats: row.stats })),
  });
}

/** POST /api/connect */
async function connect(sql, request) {
  const body = await readJson(request);
  const secret = body && typeof body.secret === "string" ? body.secret : "";

  if (secret.length < MIN_SECRET_LENGTH || secret.length > MAX_SECRET_LENGTH) {
    return json({ error: "invalid secret" }, 400);
  }

  const hash = await sha256Hex(secret);
  const rows = await sql`
    select id, display_name, stats, save, save_updated_at
    from public.players
    where secret_hash = ${hash}
    limit 1
  `;

  if (rows.length === 0) return json({ error: "not found" }, 404);

  const row = rows[0];
  return json({
    id: row.id,
    displayName: row.display_name,
    stats: row.stats,
    save: row.save,
    saveUpdatedAt: Number(row.save_updated_at),
  });
}

/** POST /api/sync */
async function sync(sql, request) {
  const body = await readJson(request);
  if (!body || typeof body !== "object") {
    return json({ error: "invalid body" }, 400);
  }

  const id = typeof body.id === "string" ? body.id : "";
  const secret = typeof body.secret === "string" ? body.secret : "";
  const save = body.save && typeof body.save === "object" ? body.save : null;

  if (!ID_PATTERN.test(id)) return json({ error: "invalid id" }, 400);
  if (secret.length < MIN_SECRET_LENGTH || secret.length > MAX_SECRET_LENGTH) {
    return json({ error: "invalid secret" }, 400);
  }
  if (!save) return json({ error: "invalid save" }, 400);
  if (JSON.stringify(save).length > MAX_SAVE_CHARS) {
    return json({ error: "save too large" }, 413);
  }

  // The secret is stored as a hash in its own column, never inside the save.
  delete save.editKey;

  const displayName = cleanDisplayName(body.displayName) ?? id;
  const saveUpdatedAt = Math.max(0, Math.floor(Number(body.saveUpdatedAt) || 0));
  const stats = buildStats(save);
  const leaderboardOptIn = save.leaderboardOptIn === true;
  const hash = await sha256Hex(secret);

  let rows;
  try {
    rows = await sql`
      insert into public.players as p
        (id, display_name, secret_hash, stats, save, save_updated_at, leaderboard_opt_in)
      values
        (${id}, ${displayName}, ${hash}, ${stats}, ${save}, ${saveUpdatedAt}, ${leaderboardOptIn})
      on conflict (id) do update set
        display_name       = excluded.display_name,
        stats              = excluded.stats,
        save               = excluded.save,
        save_updated_at    = excluded.save_updated_at,
        leaderboard_opt_in = excluded.leaderboard_opt_in,
        updated_at         = now()
      where p.secret_hash = excluded.secret_hash
        and excluded.save_updated_at >= p.save_updated_at
      returning id, save_updated_at
    `;
  } catch (err) {
    if (isUniqueViolation(err)) {
      return json({ error: "secret already linked to another player" }, 409);
    }
    throw err;
  }

  if (rows.length > 0) {
    return json({
      ok: true,
      id,
      saveUpdatedAt: Number(rows[0].save_updated_at),
    });
  }

  // Nothing was written. Either the secret is wrong, or the incoming save is
  // stale (older than what the server already holds for this player).
  const owner = await sql`
    select 1
    from public.players
    where id = ${id} and secret_hash = ${hash}
    limit 1
  `;
  if (owner.length === 0) return json({ error: "secret mismatch" }, 403);

  const current = await sql`
    select save_updated_at from public.players where id = ${id} limit 1
  `;
  return json({
    ok: true,
    id,
    stale: true,
    saveUpdatedAt: Number(current[0]?.save_updated_at ?? 0),
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (!url.pathname.startsWith("/api/")) {
      // Static site: index.html, scripts/, styles/, assets/, ...
      return env.ASSETS.fetch(request);
    }

    if (!env.DATABASE_URL) {
      console.error("DATABASE_URL secret is not configured");
      return json({ error: "server misconfigured" }, 500);
    }

    const sql = neon(env.DATABASE_URL);

    try {
      if (url.pathname === "/api/leaderboard" && request.method === "GET") {
        return await getLeaderboard(sql);
      }
      if (url.pathname === "/api/connect" && request.method === "POST") {
        return await connect(sql, request);
      }
      if (url.pathname === "/api/sync" && request.method === "POST") {
        return await sync(sql, request);
      }
      return json({ error: "not found" }, 404);
    } catch (err) {
      // Log server-side, but never surface internal details to the client.
      console.error("API error", url.pathname, err);
      return json({ error: "internal error" }, 500);
    }
  },
};
