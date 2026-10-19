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

import { gameState } from "../core/state.js";
import { applyPlayerSave, saveData } from "./save.js";
import { fetchRemoteSave, pushSave } from "../services/leaderboard.js";

const SAVE_KEY = "DRYWALL";

/**
 * Builds the payload sent to the API. The secret is sent in its own field and
 * stripped from the save document.
 */
function buildPayload(player) {
  const save = JSON.parse(JSON.stringify(player));
  delete save.editKey;

  return {
    id: player.mylbkey,
    secret: player.editKey,
    displayName: player.username,
    save,
    saveUpdatedAt: Number(player.updatedAt) || 0,
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

  const remoteTime = Number(remote.saveUpdatedAt) || 0;
  const localTime = Number(player.updatedAt) || 0;

  if (force || remoteTime > localTime) {
    applyPlayerSave(remote.save, { secret: player.editKey, id: remote.id });
    // The server falls back to the raw id as a display name; only adopt a name
    // the player actually chose, so skipped players stay nameless.
    if (remote.displayName && remote.displayName !== remote.id) {
      gameState.player.username = remote.displayName;
    }
    return { status: "pulled", remote };
  }

  return { status: "local-newer", remote };
}

/** Pushes the current local save to the cloud. Never throws. */
export async function pushSaveToCloud() {
  const player = gameState.player;
  if (!player?.editKey || !player?.mylbkey) return { status: "no-key" };

  try {
    const result = await pushSave(buildPayload(player));
    return { status: "pushed", result };
  } catch (err) {
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

  applyPlayerSave(remote.save, { secret: trimmed, id: remote.id });
  if (remote.displayName && remote.displayName !== remote.id) {
    gameState.player.username = remote.displayName;
  }

  // Adopt the cloud timestamp so the next local save becomes strictly newer.
  gameState.player.updatedAt = Number(remote.saveUpdatedAt) || Date.now();
  saveData(SAVE_KEY, gameState.player, true);

  return { ok: true, remote };
}
