/**
 * Area navigation and unlock logic.
 *
 * Handles switching between the game's different "areas" (Home, High-rise,
 * Luxury, Bungalow, Skill Tree, Infinity, Leaderboards, Achievements) and
 * detecting when new areas should be unlocked based on progression.
 */

import { D, infinityThreshold } from "../core/decimal.js";
import { gameState } from "../core/state.js";

/**
 * Shows the requested area and hides all others.
 * When entering the Home area, the achievement grid is refreshed.
 *
 * @param {number} area - Index into the areas array (0-based)
 */
export function loadArea(area) {
  for (var i = 0; i < gameState.elts.areas.length; i += 1) {
    if (i == area) {
      gameState.elts.areas[i].style.display = "block";
    } else {
      gameState.elts.areas[i].style.display = "none";
    }
  }

  // Refresh achievement display when entering the home area
  if (area == 2) {
    updateAchievementImages();
  }
}

// Import at bottom to avoid circular dependency with achievements module.
// updateAchievementImages is only called at runtime, not at evaluation time.
import { updateAchievementImages } from "./achievements.js";

/**
 * Checks progression milestones and unlocks new areas as appropriate.
 * Called every render tick.
 */
export function checkAreaUnlocks() {
  const player = gameState.player;

  if (player.drywall.gte(D(10).pow(6))) {
    if (!player.areasUnlocked.includes("High-rise"))
      player.areasUnlocked.push("High-rise");
  }
  if (player.drywall.gte(D(10).pow(45))) {
    if (!player.areasUnlocked.includes("Luxury"))
      player.areasUnlocked.push("Luxury");
  }
  if (player.infinityTreeUpgrades.includes("Break Infinity")) {
    if (!player.areasUnlocked.includes("Bungalow"))
      player.areasUnlocked.push("Bungalow");
  }
  if (player.drywall.gte(D(10).pow(15))) {
    if (!player.areasUnlocked.includes("Skill Tree"))
      player.areasUnlocked.push("Skill Tree");
  }
  if (player.drywall.gte(D(10).pow(300)) || player.infinities.gte(1)) {
    if (!player.areasUnlocked.includes("Infinity"))
      player.areasUnlocked.push("Infinity");
  }
}
