/**
 * Game loop and state-update logic.
 *
 * `tick` is the per-frame entry point: it computes delta-time, calls
 * `update` (game-state mutations) and `render` (DOM updates).
 */

import { D, infinityThreshold } from "../core/decimal.js";
import { gameState, setLastLeaderboardUpdate } from "../core/state.js";
import { levelStars } from "../config/constants.js";
import { checkBoosts } from "./boosts.js";
import { checkAllAchievements } from "./achievements.js";
import { rebirth, getSkillPoints } from "./economy.js";
import { saveData } from "./save.js";
import { pushSaveToCloud } from "./sync.js";
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

  // Panels use the light-mode token set whenever dark mode is off.
  document.documentElement.classList.toggle(
    "lightMode",
    !player.settings.darkMode,
  );

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

  // Dim the leaderboard / achievements backgrounds. A single 0-1 custom
  // property feeds a black gradient layer in styles/panels.css so only the
  // background image is dimmed, never the text or icons on top of it.
  const bgDim = Math.min(100, Math.max(0, Number(player.settings.bgDim) || 0));
  document.documentElement.style.setProperty("--bg-dim", String(bgDim / 100));
  if (gameState.elts.bgDimSetting) {
    gameState.elts.bgDimSetting.value = String(bgDim);
  }
  if (gameState.elts.bgDimValue) {
    gameState.elts.bgDimValue.textContent = `${Math.round(bgDim)}%`;
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

  // Periodic cloud save upload (the same call also feeds the leaderboard,
  // since the public projection is derived from the uploaded save).
  // The schedule is anchored to the persisted wall-clock time so a reload
  // resumes the 60-second cadence instead of restarting it.
  if (Date.now() - gameState.lastLeaderboardUpdate >= 60000) {
    setLastLeaderboardUpdate();
    pushSaveToCloud();
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
