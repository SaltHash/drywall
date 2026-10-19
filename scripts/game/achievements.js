/**
 * Achievement system.
 *
 * Handles checking requirements, awarding unlocks, displaying toast
 * notifications, and managing the achievement grid UI.
 */

import { D } from "../core/decimal.js";
import { gameState } from "../core/state.js";
import { abbrevNum, displayNames } from "../core/formatting.js";
import { achievements } from "../config/achievements.js";
import { infinityTreeUpgrades } from "../config/infinity-tree.js";
import { isBadgeObtainable } from "../config/version.js";

/**
 * Checks all achievements against the player's current stats and
 * optionally shows a toast for newly-unlocked ones.
 *
 * @param {boolean} toBeShown - If true, award + show toasts
 * @returns {string[]} Names of all currently-valid achievements
 */
export function checkAllAchievements(toBeShown) {
  let names = Object.keys(achievements);
  let list = [];

  for (let name of names) {
    let achievement = achievements[name];

    if (achievement.requirement) {
      let playerAmt = gameState.player;
      for (let i of achievement.requirement.type) {
        playerAmt = playerAmt[i];
      }
      if (D(playerAmt).gte(achievement.requirement.amount)) {
        list.push(name);
        if (toBeShown) {
          awardAchievement(name);
        }
      }
    } else if (achievement.maxVersion) {
      // Limited-time event badge (Alpha/Beta Tester). It can only be earned
      // while the running build is not newer than the version it closed at.
      if (isBadgeObtainable(achievement.maxVersion)) {
        awardAchievement(name);
      }
    } else if (name == "Infinity Tree Completionist") {
      if (
        gameState.player.infinityTreeUpgrades.length ===
        Object.keys(infinityTreeUpgrades).length
      ) {
        awardAchievement("Infinity Tree Completionist");
      }
    }
  }

  return list;
}

/**
 * Awards an achievement if not already owned. Queues it for display.
 * @param {string} name - Achievement name
 * @returns {boolean} True if newly awarded, false if already owned
 */
export function awardAchievement(name) {
  if (!gameState.player.achievements.includes(name)) {
    gameState.player.achievements.push(name);
    console.log("Awarded the '" + name + "' achievement");
    gameState.achievementQueue.push(name);
    if (gameState.achievementQueue.length === 1) {
      showAchievement(name);
    }
  } else {
    return false;
  }
}

/**
 * Displays an achievement toast notification and chains to the next
 * queued achievement after 4 seconds.
 * @param {string} name - Achievement name
 */
export function showAchievement(name) {
  let a = achievements[name];
  console.log("Showing " + name + ", Tier: " + a.tier);

  const elts = gameState.elts;
  elts.achievementNotification.classList.add("popout");

  elts.achievementName.innerHTML = name;
  elts.achievementDescription.innerHTML = a.description;
  elts.achievementIcon.src = "assets/icons/" + name + ".png";

  // Tier-based glow colour
  const tierGlow = {
    1: "drop-shadow(0px 0px 8px #ffffffa0)",
    2: "drop-shadow(0px 0px 8px #88ffaaa0)",
    3: "drop-shadow(0px 0px 8px #88aaffa0)",
    4: "drop-shadow(0px 0px 8px #ffdd88a0)",
    5: "drop-shadow(0px 0px 8px #ff7788a0)",
  };
  elts.achievementIcon.style.filter = tierGlow[a.tier] || "";

  if (a.reward) {
    elts.achievementReward.innerHTML =
      "x" + a.reward.amount + displayNames[a.reward.type];
  } else {
    elts.achievementReward.innerHTML = "";
  }

  setTimeout(function () {
    elts.achievementNotification.classList.remove("popout");

    setTimeout(function () {
      gameState.achievementQueue.splice(0, 1);
      if (gameState.achievementQueue.length > 0) {
        showAchievement(gameState.achievementQueue[0]);
      }
    }, 500);
  }, 4000);
}

/**
 * Computes the optimal achievement grid layout (box size + column count)
 * and optionally (re)creates the grid DOM elements.
 *
 * @param {boolean} init - If true, rebuild the grid from scratch
 * @returns {{bestCols: number, bestSize: number}}
 */
export function updateAchievementGrid(init) {
  const container = document.getElementById("achievementsContainer");
  const count = Object.keys(achievements).length;

  if (init) container.innerHTML = "";

  const padding = 48;
  const gap = 8;

  const W = container.clientWidth - padding;
  const H = container.clientHeight - padding;

  let bestSize = 0;
  let bestCols = 1;

  const maxPossibleSize = Math.min(W, H);

  for (let s = maxPossibleSize; s >= 1; s--) {
    const cols = Math.floor((W + gap) / (s + gap));
    const rows = Math.floor((H + gap) / (s + gap));

    if (cols * rows >= count) {
      bestSize = s;
      bestCols = cols;
      break;
    }
  }

  if (init) {
    for (let i = 0; i < count; i++) {
      const box = document.createElement("div");
      const key = Object.keys(achievements)[i];
      const file = encodeURIComponent(key);

      if (gameState.player.achievements.includes(key)) {
        box.style.backgroundImage = `url("assets/icons/${file}.png")`;
        box.classList.remove("locked");
      } else {
        box.style.backgroundImage = "url(assets/icons/sillhouette.png)";
        box.classList.add("locked");
      }

      box.classList.add("achievementBox");
      container.appendChild(box);
    }
  }

  if (bestCols !== 1) {
    container.style.gridTemplateColumns = `repeat(${bestCols}, ${bestSize}px)`;
    container.style.gridAutoRows = `${bestSize}px`;
  }

  return { bestCols: bestCols, bestSize: bestSize };
}

/**
 * Refreshes achievement icons and summary text.
 */
export function updateAchievementImages() {
  const count = Object.keys(achievements).length;
  const container = document.getElementById("achievementsContainer");
  const children = container.children;

  for (let i = 0; i < count; i++) {
    const box = children[i];
    if (!box) continue;
    const key = Object.keys(achievements)[i];
    const file = encodeURIComponent(key);

    if (gameState.player.achievements.includes(key)) {
      box.style.backgroundImage = `url("assets/icons/${file}.png")`;
      box.classList.remove("locked");
    } else {
      box.style.backgroundImage = "url(assets/icons/sillhouette.png)";
      box.classList.add("locked");
    }
  }

  gameState.elts.achievementsTitle.textContent =
    "Achievements (" + gameState.player.achievements.length + "/" + count + ")";
  gameState.elts.achievementsBoost.textContent =
    "These achievements give a boost of +" +
    gameState.player.achievements.length +
    "% skill points.";
}

/**
 * Sets up the achievement grid: initial render, periodic layout/image
 * updates, and hover tooltips.
 */
export function initAchievementGrid() {
  gameState.grid = updateAchievementGrid(true);

  setInterval(function () {
    gameState.grid = updateAchievementGrid(false);
  }, 1000);

  setInterval(updateAchievementImages, 2000);

  // Hover tooltips (delayed so grid elements exist)
  setTimeout(function () {
    const container = document.getElementById("achievementsContainer");
    const children = container.children;
    const keys = Object.keys(achievements);

    for (let i = 0; i < children.length && i < keys.length; i++) {
      const box = children[i];
      const key = keys[i];
      const a = achievements[key];

      box.addEventListener("mouseover", function () {
        const elts = gameState.elts;
        elts.achievementHover.style.display = "block";
        const rect = box.getBoundingClientRect();
        let top = rect.top + gameState.grid.bestSize;
        if (top > window.innerHeight - 200) {
          top -= 200 + gameState.grid.bestSize;
        }

        elts.achievementHover.style.left = rect.left - gameState.grid.bestSize + "px";
        elts.achievementHover.style.top = top + "px";
        elts.achievementHoverName.textContent = key;

        if (gameState.player.achievements.includes(key)) {
          elts.achievementHoverDescription.innerHTML = a.description;

          if (a.reward) {
            elts.achievementHoverReward.innerHTML =
              "x" + a.reward.amount + displayNames[a.reward.type];
          } else {
            elts.achievementHoverReward.innerHTML = "";
          }
        } else {
          elts.achievementHoverDescription.innerHTML = "???";
          elts.achievementHoverReward.innerHTML = "???";
        }
      });

      box.addEventListener("mouseleave", function () {
        gameState.elts.achievementHover.style.display = "none";
      });
    }
  }, 750);
}
