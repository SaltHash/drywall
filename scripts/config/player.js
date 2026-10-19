/**
 * Player template and helper utilities.
 *
 * The player template defines the initial structure of the save file.
 * `mergeAndFix` in game/save.js merges a saved object onto this template,
 * preserving any new fields added in later versions.
 */

import { D } from "../core/decimal.js";
import { infinityUpgradeNames } from "./infinity-tree.js";

/** Generates a random alphanumeric string of the given length. */
export function randomString(length) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/** The default save-file structure, used as a template for new / corrupted saves. */
export const playerTemplate = {
  mylbkey: randomString(12),
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
};
