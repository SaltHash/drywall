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

  gameState.player = mergeAndFix(playerTemplate, raw);
  gameState.player.username = raw.username || gameState.player.mylbkey;

  if (gameState.player.username === gameState.player.mylbkey && gameState.elts.usernamePopup) {
    gameState.elts.usernamePopup.style.display = "block";
  }
}

/**
 * Persists data to localStorage with a 1-second rate limit.
 * @param {string} key - Storage key
 * @param {*} data - Data to store
 */
export function saveData(key, data) {
  const now = Date.now();
  if (now - gameState.lastSave > 1000) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      gameState.lastSave = now;
    } catch (e) {
      console.warn("Unable to save data (storage might be full):", e);
    }
  }
}
