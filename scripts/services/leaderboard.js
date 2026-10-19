/**
 * Leaderboard + cloud-save service.
 *
 * Talks to the Drywall Worker API (see src/index.js), which is the only thing
 * that can reach the Neon database. The browser never sees DATABASE_URL.
 *
 *   GET  /api/leaderboard  -> public projection (name + stats)
 *   POST /api/connect      -> resolve a secret key and return the private save
 *   POST /api/sync         -> create/update the caller's row
 */

import { D } from "../core/decimal.js";
import { abbrevNum, formatMillis } from "../core/formatting.js";

const FETCH_TIMEOUT_MS = 8000;

/**
 * Every leaderboard the dropdown offers.
 *
 * `key` must match the keys produced by buildStats() in src/index.js.
 * `kind` selects the display formatter.
 */
export const LEADERBOARD_TYPES = [
  { key: "drywall", label: "Drywall", kind: "decimal" },
  { key: "rebirths", label: "Rebirths", kind: "decimal" },
  { key: "skillPoints", label: "Skill Points", kind: "decimal" },
  { key: "infinities", label: "Infinities", kind: "decimal" },
  { key: "infinityPower", label: "Infinity Power", kind: "decimal" },
  { key: "playtime", label: "Playtime", kind: "time" },
  { key: "clicks", label: "Clicks", kind: "decimal" },
  { key: "achievements", label: "Achievements", kind: "integer" },
];

const NUMBER_OF_ENTRIES = 10;

const FORMATTERS = {
  decimal: (value) => abbrevNum(value),
  time: (value) => formatMillis(Number(value) || 0),
  integer: (value) => Math.floor(Number(value) || 0).toLocaleString(),
};

// Sorted, filtered entries per leaderboard type: { [key]: { name, value }[] }
let leaderboards = {};

// Bumped whenever new data arrives so the renderer knows to repaint.
export let leaderboardVersion = 0;

/** fetch() with a timeout so a slow backend can't hang the game. */
async function apiFetch(path, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(path, {
      ...options,
      signal: controller.signal,
      headers: { "content-type": "application/json", ...(options.headers || {}) },
    });
  } finally {
    clearTimeout(timer);
  }
}

/** Escapes text before it is interpolated into leaderboard innerHTML. */
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
    switch (char) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      default:
        return "&#39;";
    }
  });
}

/**
 * Fetches the public leaderboard and rebuilds every sorted list.
 * Entries with a missing, zero, or invalid value are excluded.
 */
export async function loadLeaderboard() {
  const res = await apiFetch("/api/leaderboard", { method: "GET" });
  if (!res.ok) throw new Error(`Leaderboard request failed (${res.status})`);

  const { entries } = await res.json();
  const rows = Array.isArray(entries) ? entries : [];

  const next = {};
  for (const type of LEADERBOARD_TYPES) {
    next[type.key] = rows
      .map((entry) => {
        const raw = entry?.stats ? entry.stats[type.key] : null;
        if (raw === null || raw === undefined || raw === "") return null;

        let value;
        try {
          value = D(raw);
        } catch {
          return null;
        }

        // Skip null/zero stats and absurd/corrupt values.
        if (value.lte(0) || value.exponent > 1e9) return null;

        return { name: entry.name, value };
      })
      .filter((item) => item !== null)
      .sort((a, b) => b.value.cmp(a.value))
      .slice(0, NUMBER_OF_ENTRIES);
  }

  leaderboards = next;
  leaderboardVersion += 1;
  return next;
}

/** Human-readable label for a leaderboard key. */
export function getLeaderboardLabel(typeKey) {
  return LEADERBOARD_TYPES.find((type) => type.key === typeKey)?.label ?? "Leaderboard";
}

/**
 * Renders a leaderboard as an HTML string.
 * Each entry is a row: an outlined rank badge, the name pinned to the left,
 * and the score pinned to the right.
 * Returns null when leaderboard data has not loaded yet, so the caller can
 * leave the "Loading..." placeholder in place.
 */
export function getLeaderboardText(typeKey) {
  const type = LEADERBOARD_TYPES.find((item) => item.key === typeKey);
  const list = leaderboards[typeKey];

  if (!type || !list) return null;
  if (list.length === 0) return "No entries yet.";

  return list
    .map(
      (entry, index) => `
        <div class="lbRow">
          <span class="lbRank">${index + 1}</span>
          <span class="lbName">${escapeHtml(entry.name)}</span>
          <span class="lbScore">${FORMATTERS[type.kind](entry.value)}</span>
        </div>`,
    )
    .join("");
}

/** Fills a <select> element with one option per leaderboard type. */
export function initLeaderboardSelect(select) {
  if (!select) return;
  select.innerHTML = LEADERBOARD_TYPES.map(
    (type) => `<option value="${type.key}">${type.label}</option>`,
  ).join("");
  select.value = LEADERBOARD_TYPES[0].key;
}

/**
 * Resolves a secret key to the private save document.
 * @returns {Promise<Object|null>} The remote profile, or null if not found.
 */
export async function fetchRemoteSave(secret) {
  const res = await apiFetch("/api/connect", {
    method: "POST",
    body: JSON.stringify({ secret }),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Connect failed (${res.status})`);
  return res.json();
}

/**
 * Uploads the caller's save. The backend ignores stale writes and mismatched
 * secrets (403), so this never throws for those cases.
 */
export async function pushSave(payload) {
  const res = await apiFetch("/api/sync", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok && res.status !== 403) {
    throw new Error(`Sync failed (${res.status})`);
  }
  return res.json();
}
