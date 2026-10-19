/**
 * Game loop and state-update logic.
 *
 * `tick` is the per-frame entry point: it computes delta-time, calls
 * `update` (game-state mutations) and `render` (DOM updates).
 */

import { D, infinityThreshold } from "../core/decimal.js";
import { gameState } from "../core/state.js";
import { levelStars } from "../config/constants.js";
import { checkBoosts } from "./boosts.js";
import { checkAllAchievements } from "./achievements.js";
import { rebirth, getSkillPoints } from "./economy.js";
import { saveData } from "./save.js";
import { saveDataToLeaderboard } from "../services/leaderboard.js";
import { updateAllText, render } from "./render.js";

/**
 * Computes the total stars earned from completed Geometry Dash levels.
 * Mutates player.minigames.geometryDash.stars in place.
 */
export function updateMinigameStats() {
  const player = gameState.player;

  player.minigames.geometryDash.stars = 0;
  for (let i of player.minigames.geometryDash.completions) {
    player.minigames.geometryDash.stars += levelStars[i];
  }
}

/**
 * Toggles the darkBG filter class on area backgrounds.
 * Called when the dark-mode setting changes and on initial load.
 */
export function applySettings() {
  const player = gameState.player;

  const areaIds = ["area1", "area2", "area3"];
  for (const id of areaIds) {
    const bg = document.querySelector(`#${id} .areaBackground`);
    if (bg) {
      if (player.settings.darkMode) {
        bg.classList.add("darkBG");
      } else {
        bg.classList.remove("darkBG");
      }
    }
  }

  updateAllText();
}

/**
 * Main per-frame state update.
 * @param {number} dt - Delta time in milliseconds since the last tick
 */
export function update(dt) {
  const player = gameState.player;

  updateMinigameStats();
  checkBoosts();

  // Drywall per second
  player.drywall = player.drywall.plus(
    D(player.drywallPS)
      .times(player.boosts.drywall.multiplier)
      .pow(player.boosts.drywall.exponent)
      .times(dt)
      .div(1000),
  );

  // Auto-rebirth (Time-saver II)
  if (
    player.skillUpgrades.includes("Time-saver II") &&
    player.settings.autoRebirth
  ) {
    rebirth(9);
    rebirth(1);
  }

  // Check achievements
  checkAllAchievements(true);

  // Infinity power per second
  player.infinityPower = player.infinityPower.plus(
    D(player.boosts.infinityPower.multiplier)
      .pow(player.boosts.infinityPower.exponent)
      .times(dt)
      .div(1000),
  );

  // Passive skill points
  if (D(player.passive.skillPoints) !== D(0)) {
    player.skillPoints = D(player.skillPoints).plus(
      D(getSkillPoints()).times(player.passive.skillPoints).times(dt).div(1000),
    );
  }

  player.stats.playtime = player.stats.playtime.plus(dt);

  // Periodic leaderboard upload
  if (Date.now() - gameState.lastLeaderboardUpdate >= 60000) {
    saveDataToLeaderboard();
    gameState.lastLeaderboardUpdate = Date.now();
  }

  // Reset-stats setting
  if (player.settings.resetStats) {
    player.drywall = D(0);
    player.drywallPC = D(1);
    player.drywallPS = D(0);
  }

  saveData("DRYWALL", player);
}

/**
 * The main tick: computes delta-time then updates + renders.
 */
export function tick() {
  let now = Date.now();
  gameState.deltatime = now - gameState.lastUpdate;
  gameState.lastUpdate = now;

  update(gameState.deltatime);
  render();
}
