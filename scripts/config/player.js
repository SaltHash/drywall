/**
 * Player template and helper utilities.
 *
 * The player template defines the initial structure of the save file.
 * `mergeAndFix` in game/save.js merges a saved object onto this template,
 * preserving any new fields added in later versions.
 */

import { D } from "../core/decimal.js";
import { infinityUpgradeNames } from "./infinity-tree.js";

/**
 * Generates a random alphanumeric string of the given length.
 * Used for the public player id; backed by the Web Crypto API when available.
 */
export function randomString(length) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

  if (globalThis.crypto?.getRandomValues) {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    for (let i = 0; i < length; i++) {
      result += chars[bytes[i] % chars.length];
    }
    return result;
  }

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generates a high-entropy secret key (32 random bytes, base64url encoded).
 *
 * This is the credential that authorises cloud saves and links devices. It is
 * shown in Settings so the player can move their save to another browser.
 * It is never sent anywhere except the backend, which stores only its hash.
 */
export function randomSecret() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** The default save-file structure, used as a template for new / corrupted saves. */
export const playerTemplate = {
  mylbkey: randomString(12),
  // Secret key: authorises cloud saves and links devices. Never shown publicly.
  editKey: randomSecret(),
  // Last time the save was written locally (ms). Drives cloud sync conflicts.
  updatedAt: 0,
  drywall: D(0),
  drywallPS: D(0),
  drywallPC: D(1),
  rebirths: D(0),
  skillPoints: D(0),
  skillUpgrades: [],
  infinities: D(0),
  infinityPoints: D(0),
  infinityPower: D(0),
  infinityUpgrades: Object.fromEntries(
    infinityUpgradeNames.map((name) => [name, 0]),
  ),
  infinityTreeUpgrades: [],
  globalToken: null,
  skillBoosts: {},
  areasUnlocked: [],
  boosts: {},
  passive: {},
  settings: {
    darkMode: false,
    scientificNotation: false,
    minimalParticles: false,
    // Dims the leaderboard and achievements backgrounds (0-100%).
    bgDim: 0,
    autoRebirth: false,
    autoSkillTree: true,
    autoInfinity: false,
    resetStats: false,
  },
  minigames: {
    geometryDash: {
      completions: [],
      stars: 0,
    },
    flappyBird: {
      best: 0,
    },
  },
  achievements: [],
  stats: {
    playtime: D(0),
    clicks: D(0),
  },
  username: null,
  // True once the player has either picked a name or skipped the setup prompt.
  usernameChosen: false,
  // Whether the player wants to appear on the public leaderboards.
  leaderboardOptIn: false,
};
