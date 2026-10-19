/**
 * Save / load system.
 *
 * Handles loading saved data from localStorage, merging it onto the
 * player template (to support new fields in later versions), and
 * persisting data back to localStorage with a rate-limited debouncer.
 */

import { D } from "../core/decimal.js";
import { gameState } from "../core/state.js";
import { playerTemplate } from "../config/player.js";

/**
 * Recursively merges saved data onto a template, coercing Decimal
 * fields and pruning unknown keys.
 *
 * @param {*} template - The template value (could be Decimal, object, array, primitive)
 * @param {*} saved - The saved value from localStorage
 * @returns {*} The merged result
 */
export function mergeAndFix(template, saved) {
  if (typeof template !== "object" || template === null) return template;

  if (Array.isArray(template)) {
    if (!Array.isArray(saved)) saved = [];

    const typeHint = template[0];

    return saved.map((item) => {
      if (typeHint instanceof Decimal) return D(item);
      if (typeof typeHint === "object" && typeHint !== null)
        return mergeAndFix(typeHint, item);
      return item;
    });
  }

  const result = {};

  for (const key of Object.keys(template)) {
    const tempVal = template[key];
    const savedVal = saved && saved[key] !== undefined ? saved[key] : undefined;

    if (savedVal === undefined) {
      result[key] = tempVal;
    } else if (tempVal instanceof Decimal) {
      result[key] = D(savedVal);
    } else if (typeof tempVal === "object" && tempVal !== null) {
      result[key] = mergeAndFix(tempVal, savedVal);
    } else {
      result[key] = savedVal;
    }
  }

  return result;
}

/**
 * Shows or hides the username setup popup (and its backdrop).
 * @param {boolean} visible
 */
export function setUsernamePopupVisible(visible) {
  const { usernamePopup, usernameBackdrop } = gameState.elts;
  if (usernamePopup) usernamePopup.style.display = visible ? "block" : "none";
  if (usernameBackdrop) usernameBackdrop.style.display = visible ? "block" : "none";
}

// Remembers that the removal notice has been shown, so it only appears once.
const REMOVAL_NOTICE_KEY = "DRYWALL_REMOVAL_NOTICE_SEEN";

/** Whether the "removed from leaderboard" notice has already been shown. */
export function removalNoticeSeen() {
  try {
    return localStorage.getItem(REMOVAL_NOTICE_KEY) === "1";
  } catch {
    return false;
  }
}

/** Marks the removal notice as shown (best effort). */
export function markRemovalNoticeSeen() {
  try {
    localStorage.setItem(REMOVAL_NOTICE_KEY, "1");
  } catch {
    // Ignore storage failures; the notice may show again next session.
  }
}

/**
 * Shows or hides the moderation "you were removed" popup (and its backdrop).
 * @param {boolean} visible
 */
export function setRemovedPopupVisible(visible) {
  const { removedPopup, removedBackdrop } = gameState.elts;
  if (removedPopup) removedPopup.style.display = visible ? "block" : "none";
  if (removedBackdrop) removedBackdrop.style.display = visible ? "block" : "none";
}

/**
 * Resets / loads the player object from localStorage.
 * @param {boolean} clear - If true, ignore saved data (hard reset)
 */
export function resetPlayer(clear = false) {
  let raw = {};
  if (!clear) {
    try {
      const stored = localStorage.getItem("DRYWALL");
      if (stored) raw = JSON.parse(stored);
    } catch (e) {
      console.error("Save file corrupted, resetting.", e);
      raw = {};
    }
  }

  const player = (gameState.player = mergeAndFix(playerTemplate, raw));

  // An empty username means "not chosen yet"; don't fall back to the random id.
  player.username =
    typeof raw.username === "string" && raw.username.length > 0
      ? raw.username
      : null;

  // Migrate saves made before the leaderboard opt-in existed: anyone who had
  // already picked a name was implicitly on the leaderboard.
  if (raw.usernameChosen === undefined) {
    const hadName = player.username !== null;
    player.usernameChosen = hadName;
    player.leaderboardOptIn = hadName;
  }

  // First run only: ask the player to choose a name (or skip).
  if (!player.usernameChosen) {
    setUsernamePopupVisible(true);
  }
}

/**
 * Persists data to localStorage with a 1-second rate limit.
 *
 * The player's `updatedAt` timestamp is refreshed on every write so that cloud
 * sync can tell which copy (local vs. remote) is newer.
 *
 * @param {string} key - Storage key
 * @param {*} data - Data to store
 * @param {boolean} force - Bypass the rate limit (e.g. after adopting a remote save)
 */
export function saveData(key, data, force = false) {
  const now = Date.now();
  if (force || now - gameState.lastSave > 1000) {
    try {
      if (data && typeof data === "object") data.updatedAt = now;
      localStorage.setItem(key, JSON.stringify(data));
      gameState.lastSave = now;
    } catch (e) {
      console.warn("Unable to save data (storage might be full):", e);
    }
  }
}

/**
 * Replaces the live player object in place with a merged copy of `source`.
 *
 * Mutating the existing object (instead of reassigning `gameState.player`)
 * keeps every module's captured reference valid, which matters because event
 * handlers close over `gameState.player` at setup time.
 *
 * @param {Object} source - A save document (e.g. pulled from the cloud)
 * @param {{secret?: string, id?: string}} [identity] - Identity to preserve/apply
 * @returns {Object} The updated live player object
 */
export function applyPlayerSave(source, { secret, id } = {}) {
  const merged = mergeAndFix(playerTemplate, source || {});

  // Some fields are intentionally not stored in the cloud copy.
  if (secret) merged.editKey = secret;
  if (id) merged.mylbkey = id;

  const player = gameState.player;
  for (const key of Object.keys(player)) delete player[key];
  Object.assign(player, merged);
  return player;
}
