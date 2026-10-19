/**
 * Drywall backend API (Cloudflare Worker + Neon Postgres).
 *
 * The game frontend is served as static assets from this same Worker, so the
 * API is same-origin and the raw DATABASE_URL secret never reaches the browser.
 *
 * Routes
 * ------
 *   GET  /api/leaderboard      Public leaderboard projection (name + stats only).
 *   POST /api/connect          Resolve a row from a secret key and return the
 *                              full private save (used to link a device).
 *   POST /api/sync             Create/update the caller's row. Authenticated by
 *                              the same secret key; last write wins by timestamp.
 *   GET  /api/global-message   The current global announcement (or null).
 *   POST /api/dev/*            Moderation tools, gated on the dev secret hash.
 *
 * Security model
 * --------------
 *   * The secret key is a high-entropy client-generated credential. It is
 *     SHA-256-hashed here and only the hash is stored, so dumping the database
 *     does not reveal any usable key.
 *   * The full save is only ever returned to a caller that presents the secret.
 *     The public leaderboard exposes only `stats`.
 *   * All access is parameterised, so there is no SQL injection surface.
 *   * Dev/moderation endpoints check the caller's SHA-256 against a fixed hash;
 *     the dev secret itself is never stored in the repository.
 */

import { neon } from "@neondatabase/serverless";
import { GlobalMessage } from "./global-message.js";

export { GlobalMessage };

const JSON_HEADERS = { "content-type": "application/json; charset=utf-8" };

const MIN_SECRET_LENGTH = 32;
const MAX_SECRET_LENGTH = 512;
const MAX_NAME_LENGTH = 20;
const MAX_SAVE_CHARS = 200_000;
const LEADERBOARD_LIMIT = 5000;

/**
 * Only the account whose secret hashes to this value may use /api/dev/*.
 * Storing the hash (not the secret) means the repo is safe to publish.
 */
const DEV_SECRET_HASH =
  "99f1d666ff7ddabd2bc956cf168178cf026ed4efd5bc4584b32772408a0e6e64";

/** Player fields the dev panel may add deltas to. */
const DELTA_STAT_KEYS = [
  "drywall",
  "drywallPS",
  "drywallPC",
  "rebirths",
  "skillPoints",
  "infinities",
  "infinityPoints",
  "infinityPower",
  "playtime",
  "clicks",
];

const DELTA_NUMBER_PATTERN = /^-?\d+(\.\d+)?([eE][+-]?\d+)?$/;

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

/** Role levels for the dev panel. Higher = more access. */
const ROLES = { none: 0, moderator: 1, owner: 2 };

/** Whether the supplied secret belongs to the bootstrap developer account. */
async function isBootstrapDev(secret) {
  if (typeof secret !== "string" || secret.length < MIN_SECRET_LENGTH) {
    return false;
  }
  return (await sha256Hex(secret)) === DEV_SECRET_HASH;
}

/**
 * Resolves the caller's role from their secret hash.
 *
 * The fixed DEV_SECRET_HASH is always 'owner' (bootstrap — it is the only
 * credential that can grant the first role). Everyone else gets whatever
 * `permissions` the database holds for them, defaulting to 'none'.
 */
async function callerRole(sql, secret) {
  if (await isBootstrapDev(secret)) return "owner";
  if (typeof secret !== "string" || secret.length < MIN_SECRET_LENGTH) {
    return "none";
  }
  const hash = await sha256Hex(secret);
  const rows = await sql`
    select permissions from public.players where secret_hash = ${hash} limit 1
  `;
  const role = rows[0]?.permissions;
  return role === "moderator" || role === "owner" ? role : "none";
}

/** Gate a dev route on the caller's role. Returns true if authorised. */
async function requireRole(sql, body, minRole) {
  const role = await callerRole(sql, body?.secret);
  return (ROLES[role] ?? 0) >= (ROLES[minRole] ?? 99);
}

/** Legacy owner-only gate, kept for the bootstrap check. */
async function requireDev(secret) {
  return isBootstrapDev(secret);
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
      and leaderboard_banned = false
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
    select id, display_name, stats, save, save_updated_at,
           leaderboard_banned, force_reset, pending_stats, pending_stats_rev,
           permissions
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
    leaderboardBanned: row.leaderboard_banned === true,
    forceReset: row.force_reset === true,
    pendingStats: row.pending_stats ?? {},
    pendingStatsRev: Number(row.pending_stats_rev) || 0,
    permissions: row.permissions,
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
  const resetAck = body.resetAck === true;
  const statsAckRev = Math.max(0, Math.floor(Number(body.statsAckRev) || 0));
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
        -- A banned player can never re-enable their leaderboard visibility.
        leaderboard_opt_in = excluded.leaderboard_opt_in and not p.leaderboard_banned,
        -- Acknowledge a moderation reset, and zero pending stat deltas once the
        -- client has applied them. Both are best-effort: a stale write applies
        -- neither because the row is not touched at all.
        force_reset        = case when ${resetAck} then false else p.force_reset end,
        pending_stats      = case when ${statsAckRev}::bigint >= p.pending_stats_rev
                                  then '{}'::jsonb else p.pending_stats end,
        updated_at         = now()
      where p.secret_hash = excluded.secret_hash
        and excluded.save_updated_at >= p.save_updated_at
      returning id, save_updated_at, leaderboard_banned
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
      leaderboardBanned: rows[0].leaderboard_banned === true,
    });
  }

  // Nothing was written. Either the secret is wrong, or the incoming save is
  // stale (older than what the server already holds for this player).
  const owner = await sql`
    select leaderboard_banned
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
    leaderboardBanned: owner[0]?.leaderboard_banned === true,
  });
}

/** Resolves the single global-message Durable Object, if it is bound. */
function globalMessageStub(env) {
  if (!env.GLOBAL_MESSAGE) return null;
  return env.GLOBAL_MESSAGE.get(env.GLOBAL_MESSAGE.idFromName("global"));
}

/** GET /api/global-message (public: any client may read the announcement). */
async function getGlobalMessage(env) {
  const stub = globalMessageStub(env);
  if (!stub) return json({ message: null });
  try {
    const res = await stub.fetch("https://global-message/");
    return new Response(res.body, { status: res.status, headers: JSON_HEADERS });
  } catch (err) {
    console.error("Global message unavailable", err);
    return json({ message: null });
  }
}

/** POST /api/dev/global-message (moderator+) */
async function devGlobalMessage(sql, env, request) {
  const body = await readJson(request);
  if (!(await requireRole(sql, body, "moderator"))) return json({ error: "forbidden" }, 403);

  const stub = globalMessageStub(env);
  if (!stub) return json({ error: "global messaging unavailable" }, 503);

  const res = await stub.fetch("https://global-message/", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text: body?.text, label: body?.label }),
  });
  return new Response(res.body, { status: res.status, headers: JSON_HEADERS });
}

/** POST /api/dev/lookup - find players by id or display name (moderator+) */
async function devLookup(sql, request) {
  const body = await readJson(request);
  if (!(await requireRole(sql, body, "moderator"))) return json({ error: "forbidden" }, 403);

  const query = typeof body.query === "string" ? body.query.trim() : "";
  if (!query) return json({ error: "invalid query" }, 400);

  const rows = await sql`
    select id, display_name, leaderboard_opt_in, leaderboard_banned, force_reset,
           stats, save_updated_at, pending_stats, pending_stats_rev, permissions
    from public.players
    where id = ${query} or display_name = ${query}
    order by updated_at desc
    limit 25
  `;
  return json({
    players: rows.map((row) => ({
      id: row.id,
      displayName: row.display_name,
      leaderboardOptIn: row.leaderboard_opt_in === true,
      leaderboardBanned: row.leaderboard_banned === true,
      forceReset: row.force_reset === true,
      permissions: row.permissions,
      stats: row.stats,
      saveUpdatedAt: Number(row.save_updated_at) || 0,
      pendingStats: row.pending_stats ?? {},
      pendingStatsRev: Number(row.pending_stats_rev) || 0,
    })),
  });
}

/** POST /api/dev/remove | /api/dev/restore (moderator+) */
async function devSetRemoved(sql, request, removed) {
  const body = await readJson(request);
  if (!(await requireRole(sql, body, "moderator"))) return json({ error: "forbidden" }, 403);

  const id = typeof body.id === "string" ? body.id : "";
  if (!ID_PATTERN.test(id)) return json({ error: "invalid id" }, 400);

  const rows = removed
    ? await sql`
        update public.players
        set leaderboard_banned = true, leaderboard_opt_in = false, updated_at = now()
        where id = ${id}
        returning id, display_name
      `
    : await sql`
        update public.players
        set leaderboard_banned = false, updated_at = now()
        where id = ${id}
        returning id, display_name
      `;
  if (rows.length === 0) return json({ error: "not found" }, 404);
  return json({ ok: true, id: rows[0].id, leaderboardBanned: removed });
}

/** POST /api/dev/reset - force the player's local save back to defaults (moderator+) */
async function devReset(sql, request) {
  const body = await readJson(request);
  if (!(await requireRole(sql, body, "moderator"))) return json({ error: "forbidden" }, 403);

  const id = typeof body.id === "string" ? body.id : "";
  if (!ID_PATTERN.test(id)) return json({ error: "invalid id" }, 400);

  const rows = await sql`
    update public.players
    set force_reset = true, updated_at = now()
    where id = ${id}
    returning id, display_name
  `;
  if (rows.length === 0) return json({ error: "not found" }, 404);
  return json({ ok: true, id: rows[0].id });
}

/** POST /api/dev/list - every player row, for the dev panel's full roster view (moderator+) */
async function devList(sql, request) {
  const body = await readJson(request);
  if (!(await requireRole(sql, body, "moderator"))) return json({ error: "forbidden" }, 403);

  const rows = await sql`
    select id, display_name, secret_hash, stats, save, save_updated_at,
           leaderboard_opt_in, leaderboard_banned, force_reset,
           pending_stats, pending_stats_rev, created_at, updated_at, permissions
    from public.players
    order by updated_at desc
  `;
  return json({
    players: rows.map((row) => ({
      id: row.id,
      displayName: row.display_name,
      secretHash: row.secret_hash,
      stats: row.stats,
      save: row.save,
      saveUpdatedAt: Number(row.save_updated_at) || 0,
      leaderboardOptIn: row.leaderboard_opt_in === true,
      leaderboardBanned: row.leaderboard_banned === true,
      forceReset: row.force_reset === true,
      permissions: row.permissions,
      pendingStats: row.pending_stats ?? {},
      pendingStatsRev: Number(row.pending_stats_rev) || 0,
      createdAt: Number(row.created_at) || 0,
      updatedAt: Number(row.updated_at) || 0,
    })),
  });
}

/** POST /api/dev/add-stats - queue stat deltas to apply to a player once (owner only) */
async function devAddStats(sql, request) {
  const body = await readJson(request);
  if (!(await requireRole(sql, body, "owner"))) return json({ error: "forbidden" }, 403);

  const id = typeof body.id === "string" ? body.id : "";
  if (!ID_PATTERN.test(id)) return json({ error: "invalid id" }, 400);

  const input = body.stats && typeof body.stats === "object" ? body.stats : null;
  if (!input) return json({ error: "invalid stats" }, 400);

  const deltas = {};
  for (const [key, value] of Object.entries(input)) {
    if (!DELTA_STAT_KEYS.includes(key)) continue;
    const asString = String(value).trim();
    if (!DELTA_NUMBER_PATTERN.test(asString)) continue;
    if (Number(asString) === 0) continue; // ignore empty/zero fields
    deltas[key] = asString;
  }
  if (Object.keys(deltas).length === 0) {
    return json({ error: "no valid deltas" }, 400);
  }

  const rows = await sql`
    update public.players
    set pending_stats = ${JSON.stringify(deltas)}::jsonb,
        pending_stats_rev = pending_stats_rev + 1,
        updated_at = now()
    where id = ${id}
    returning id, pending_stats, pending_stats_rev
  `;
  if (rows.length === 0) return json({ error: "not found" }, 404);
  return json({
    ok: true,
    id: rows[0].id,
    pendingStats: rows[0].pending_stats,
    pendingStatsRev: Number(rows[0].pending_stats_rev) || 0,
  });
}

/** POST /api/dev/set-role - grant or revoke a player's role (owner only).
 *
 * Roles: 'none' (regular player), 'moderator', 'owner'. The caller cannot
 * assign a role higher than their own, and cannot demote themselves.
 */
async function devSetRole(sql, request) {
  const body = await readJson(request);
  if (!(await requireRole(sql, body, "owner"))) return json({ error: "forbidden" }, 403);

  const id = typeof body.id === "string" ? body.id : "";
  if (!ID_PATTERN.test(id)) return json({ error: "invalid id" }, 400);

  const role = body.role === "moderator" || body.role === "owner" || body.role === "none"
    ? body.role
    : null;
  if (role === null) return json({ error: "invalid role" }, 400);

  // Resolve the caller's own id from their secret, to prevent self-demotion.
  const callerSecret = typeof body.secret === "string" ? body.secret : "";
  const callerHash = await sha256Hex(callerSecret);
  const callerRows = await sql`
    select id, permissions from public.players where secret_hash = ${callerHash} limit 1
  `;
  const callerRole = callerRows[0]?.permissions === "owner" ? "owner" : "none";
  const callerId = callerRows[0]?.id;

  if (callerRole !== "owner") return json({ error: "forbidden" }, 403);
  if (callerId === id) return json({ error: "cannot change your own role" }, 403);

  const rows = await sql`
    update public.players
    set permissions = ${role}, updated_at = now()
    where id = ${id}
    returning id, display_name, permissions
  `;
  if (rows.length === 0) return json({ error: "not found" }, 404);
  return json({ ok: true, id: rows[0].id, permissions: rows[0].permissions });
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

    // Global announcements live in a Durable Object, independent of the
    // player database. The dev route still needs the DB for role checks.
    if (url.pathname === "/api/global-message" && request.method === "GET") {
      return await getGlobalMessage(env);
    }
    if (url.pathname === "/api/dev/global-message" && request.method === "POST") {
      return await devGlobalMessage(sql, env, request);
    }

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
      if (url.pathname === "/api/dev/lookup" && request.method === "POST") {
        return await devLookup(sql, request);
      }
      if (url.pathname === "/api/dev/list" && request.method === "POST") {
        return await devList(sql, request);
      }
      if (url.pathname === "/api/dev/remove" && request.method === "POST") {
        return await devSetRemoved(sql, request, true);
      }
      if (url.pathname === "/api/dev/restore" && request.method === "POST") {
        return await devSetRemoved(sql, request, false);
      }
      if (url.pathname === "/api/dev/reset" && request.method === "POST") {
        return await devReset(sql, request);
      }
      if (url.pathname === "/api/dev/add-stats" && request.method === "POST") {
        return await devAddStats(sql, request);
      }
      if (url.pathname === "/api/dev/set-role" && request.method === "POST") {
        return await devSetRole(sql, request);
      }
      return json({ error: "not found" }, 404);
    } catch (err) {
      // Log server-side, but never surface internal details to the client.
      console.error("API error", url.pathname, err);
      return json({ error: "internal error" }, 500);
    }
  },
};
