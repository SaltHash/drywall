/**
 * Cloud save synchronisation.
 *
 * The player's whole save lives in one row on the server, keyed by their
 * secret key. This module reconciles the local copy with the cloud copy:
 *
 *   * On load, whichever copy has the newer `updatedAt` wins
 *     (last-write-wins). If the cloud copy wins it is applied locally; if the
 *     local copy wins it is pushed up.
 *   * When a device is linked by pasting a secret key, the cloud copy always
 *     wins regardless of timestamps (the player explicitly asked for it).
 *
 * UI concerns (re-rendering, applying settings) are intentionally left to the
 * caller so this module stays free of DOM dependencies.
 */

import { D } from "../core/decimal.js";
import { gameState, setLeaderboardBanned } from "../core/state.js";
import { applyPlayerSave, saveData } from "./save.js";
import { fetchRemoteSave, pushSave } from "../services/leaderboard.js";

const SAVE_KEY = "DRYWALL";

// Remembers the highest pending-stats revision this device has already applied,
// so a reload between applying and acknowledging cannot double-apply a delta.
const APPLIED_STATS_REV_KEY = "DRYWALL_APPLIED_STATS_REV";

/** Stats managed inside `player.stats` rather than at the top level. */
const NESTED_STAT_KEYS = ["playtime", "clicks"];

function readAppliedStatsRev() {
  try {
    const stored = Number(localStorage.getItem(APPLIED_STATS_REV_KEY));
    return Number.isFinite(stored) && stored > 0 ? stored : 0;
  } catch {
    return 0;
  }
}

function writeAppliedStatsRev(rev) {
  try {
    localStorage.setItem(APPLIED_STATS_REV_KEY, String(rev));
  } catch {
    // Best effort; the server clears the delta once we acknowledge it.
  }
}

/** Adds a single stat delta onto the live player, using Decimal arithmetic. */
function applyStatDelta(key, delta) {
  const player = gameState.player;
  const amount = D(delta);
  if (NESTED_STAT_KEYS.includes(key)) {
    player.stats[key] = D(player.stats[key]).plus(amount);
  } else if (key in player) {
    player[key] = D(player[key]).plus(amount);
  }
}

/**
 * Applies moderation stat deltas exactly once.
 *
 * The server stores a delta (with a revision); this runs relative to whatever
 * the player currently has, then records the revision so a later reload does
 * not apply it again. The revision is acknowledged on the next push, which
 * makes the server zero the delta.
 */
function applyPendingStats(remote) {
  const pending = remote?.pendingStats;
  const rev = Number(remote?.pendingStatsRev) || 0;
  if (!pending || typeof pending !== "object" || rev <= readAppliedStatsRev()) {
    return;
  }

  for (const [key, delta] of Object.entries(pending)) {
    applyStatDelta(key, delta);
  }
  writeAppliedStatsRev(rev);
  gameState.statsAckRev = rev;
}

/**
 * Builds the payload sent to the API. The secret is sent in its own field and
 * stripped from the save document.
 *
 * `boosts` and `passive` are derived at runtime by checkBoosts(), so they are
 * temporary values and are left out of the persisted save.
 */
function buildPayload(player) {
  const save = JSON.parse(JSON.stringify(player));
  delete save.editKey;
  delete save.boosts;
  delete save.passive;

  return {
    id: player.mylbkey,
    secret: player.editKey,
    displayName: player.username,
    save,
    saveUpdatedAt: Number(player.updatedAt) || 0,
    // Moderation acknowledgements (see sync() in src/index.js).
    resetAck: gameState.resetAck === true,
    statsAckRev: Number(gameState.statsAckRev) || 0,
  };
}

/**
 * Reconciles the local save with the cloud copy for this player's secret.
 *
 * @param {{force?: boolean}} [options] - force the cloud copy to win
 * @returns {Promise<{status: string, remote?: Object}>}
 */
export async function reconcileSave({ force = false } = {}) {
  const player = gameState.player;
  if (!player?.editKey) return { status: "no-key" };

  let remote;
  try {
    remote = await fetchRemoteSave(player.editKey);
  } catch (err) {
    console.warn("Cloud sync unavailable:", err.message);
    return { status: "offline" };
  }

  if (!remote) return { status: "new-player" };

  // A removed player is barred permanently; remember it on this device too so
  // the ban cannot be undone by wiping the local save.
  if (remote.leaderboardBanned) {
    setLeaderboardBanned(true);
    gameState.player.leaderboardOptIn = false;
  }

  // Surface the caller's role from the server so the UI can gate dev features.
  gameState.player.permissions = remote.permissions || null;

  const remoteTime = Number(remote.saveUpdatedAt) || 0;
  const localTime = Number(player.updatedAt) || 0;

  let status;
  if (remote.forceReset) {
    // A moderator reset: the default save wins even over a newer local copy.
    applyPlayerSave({}, { secret: player.editKey, id: remote.id });
    gameState.resetAck = true;
    status = "reset";
  } else if (force || remoteTime > localTime) {
    applyPlayerSave(remote.save, { secret: player.editKey, id: remote.id });
    // The server falls back to the raw id as a display name; only adopt a name
    // the player actually chose, so skipped players stay nameless.
    if (remote.displayName && remote.displayName !== remote.id) {
      gameState.player.username = remote.displayName;
    }
    status = "pulled";
  } else {
    status = "local-newer";
  }

  // Apply any queued moderation deltas on top of the resolved save.
  applyPendingStats(remote);

  // Push straight away when a reset or stat delta needs acknowledging, rather
  // than waiting for the next periodic sync.
  if (gameState.resetAck || gameState.statsAckRev > 0) {
    saveData(SAVE_KEY, gameState.player, true);
    pushSaveToCloud();
  }

  return { status, remote };
}

/** Pushes the current local save to the cloud. Never throws. */
export async function pushSaveToCloud() {
  const player = gameState.player;
  if (!player?.editKey || !player?.mylbkey) return { status: "no-key" };

  gameState.cloudSaveStatus = "saving";
  try {
    const result = await pushSave(buildPayload(player));
    gameState.cloudSaveStatus = "saved";
    gameState.lastCloudSave = Date.now();

    // The server confirms (or denies) moderation state on every write.
    if (result?.leaderboardBanned) setLeaderboardBanned(true);

    // Once the write lands, the server has applied our acknowledgements.
    if (result?.ok && !result?.stale) {
      gameState.resetAck = false;
      gameState.statsAckRev = 0;
    }
    return { status: "pushed", result };
  } catch (err) {
    gameState.cloudSaveStatus = "error";
    console.warn("Cloud save failed:", err.message);
    return { status: "error", error: err };
  }
}

/**
 * Links this browser to the account identified by `secret`, adopting its cloud
 * save. Used when the player pastes their secret key into Settings.
 *
 * @returns {Promise<{ok: boolean, reason?: string}>}
 */
export async function linkAccount(secret) {
  const trimmed = typeof secret === "string" ? secret.trim() : "";
  if (!trimmed) return { ok: false, reason: "empty" };

  let remote;
  try {
    remote = await fetchRemoteSave(trimmed);
  } catch (err) {
    console.warn("Link failed:", err.message);
    return { ok: false, reason: "offline" };
  }

  if (!remote) return { ok: false, reason: "not-found" };

  if (remote.leaderboardBanned) {
    setLeaderboardBanned(true);
  }

  applyPlayerSave(remote.save, { secret: trimmed, id: remote.id });
  if (remote.displayName && remote.displayName !== remote.id) {
    gameState.player.username = remote.displayName;
  }

  // Surface the caller's role from the server so the UI can gate dev features.
  gameState.player.permissions = remote.permissions || null;

  // Adopt the cloud timestamp so the next local save becomes strictly newer.
  gameState.player.updatedAt = Number(remote.saveUpdatedAt) || Date.now();
  saveData(SAVE_KEY, gameState.player, true);

  return { ok: true, remote };
}
