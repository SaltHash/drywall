/**
 * UI rendering functions.
 *
 * Updates the text content and visual state of all DOM elements that
 * reflect the player's current stats: upgrade buttons, skill-tree nodes,
 * infinity-tree nodes, stat displays, and area selectors.
 */

import { D, infinityThreshold } from "../core/decimal.js";
import { gameState } from "../core/state.js";
import {
  abbrevNum,
  displayNames,
  formatMillis,
  roundToSigFigs,
} from "../core/formatting.js";
import { upgrades } from "../config/upgrades.js";
import { skillUpgrades } from "../config/skill-tree.js";
import {
  infinityTreeUpgrades,
  infinityUpgradeNames,
  infinityUpgradeCosts,
} from "../config/infinity-tree.js";
import { checkInfinityProgress, getInfinityPoints } from "./boosts.js";
import { getRebirthCost, getSkillPoints } from "./economy.js";
import { checkAreaUnlocks } from "./areas.js";
import { getLeaderboardText } from "../services/leaderboard.js";
import { getConnections } from "./trees.js";

/**
 * Sets the click-handler text on regular upgrade buttons (upgrade1..upgrade24).
 */
export function setupUpgradeButtons() {
  const elts = gameState.elts;

  for (let i = 0; i < upgrades.length; i += 1) {
    elts.upgrades.push(document.getElementById("upgrade" + (i + 1)));
    elts.upgrades[i].innerHTML =
      abbrevNum(upgrades[i].cost[0]) +
      " " +
      displayNames[upgrades[i].cost[1]] +
      " → +" +
      abbrevNum(upgrades[i].reward[0]) +
      displayNames[upgrades[i].reward[1]];
  }
}

/**
 * Formats a stat value, appending the boost multiplier if requested.
 * @param {string} name - Stat key on player
 * @param {boolean} multiplier - Whether to show the boost multiplier
 * @returns {string}
 */
export function getStatText(name, multiplier) {
  const player = gameState.player;

  if (multiplier) {
    return (
      abbrevNum(player[name]) +
      (player.boosts[name].multiplier === 1
        ? ""
        : " (x" + abbrevNum(player.boosts[name].multiplier) + ")")
    );
  } else {
    return abbrevNum(player[name]);
  }
}

/**
 * Refreshes the text on all regular upgrade buttons.
 */
export function updateAllText() {
  const elts = gameState.elts;

  for (let i = 0; i < upgrades.length; i += 1) {
    elts.upgrades[i].innerHTML =
      abbrevNum(upgrades[i].cost[0]) +
      " " +
      displayNames[upgrades[i].cost[1]] +
      " → +" +
      abbrevNum(upgrades[i].reward[0]) +
      displayNames[upgrades[i].reward[1]];
  }

  updateSkillTreeElements();
  updateInfinityTreeElements();
}

/**
 * Updates the visual state of every skill-tree button (bought / unlocked /
 * hidden / branch) and refreshes dynamic reward text.
 */
export function updateSkillTreeElements() {
  const elts = gameState.elts;
  const player = gameState.player;

  // --- Replicate boost-exponent calculations (mirrors checkBoosts) ---
  let convExp = 0.2;
  if (player.skillUpgrades.includes("Conversion II")) convExp = 0.3;
  if (player.skillUpgrades.includes("Conversion III")) convExp = 0.4;
  if (player.skillUpgrades.includes("Conversion IV")) convExp = 0.5;
  if (player.skillUpgrades.includes("Conversion V")) convExp = 0.6;
  if (player.skillUpgrades.includes("Conversion VI")) convExp = 0.65;
  if (player.skillUpgrades.includes("Conversion VII")) convExp = 0.7;

  let arthritisExp = 0.7;
  let arthritisDen = 100000;
  if (player.skillUpgrades.includes("Arthritis V")) {
    arthritisExp = 0.9;
    arthritisDen = 100;
  }
  if (player.skillUpgrades.includes("Arthritis VI")) {
    arthritisDen = D(1);
  }
  if (player.skillUpgrades.includes("Arthritis VII")) {
    arthritisExp = 1;
  }
  if (player.skillUpgrades.includes("Arthritis VIII")) {
    arthritisExp = 1.1;
  }

  let selfBoostExp = 0.0001;

  const upgradeKeys = Object.keys(skillUpgrades);
  let skillConnections = getConnections(skillUpgrades, player.skillUpgrades);

  for (let i = 0; i < upgradeKeys.length; i += 1) {
    let upgName = upgradeKeys[i];
    let skillUpg = skillUpgrades[upgName];
    let skillUpgElt = elts.skillUpgrades[upgName];

    let skillUpgUnlocked = true;
    if (skillUpg.connects) {
      skillUpgUnlocked = skillUpg.connects.every((item) =>
        player.skillUpgrades.includes(item),
      );
    }

    if (player.skillUpgrades.includes(upgName)) {
      // Bought state
      skillUpgElt.classList.remove("unlocked");
      skillUpgElt.classList.remove("branch");
      skillUpgElt.classList.add("bought");
      skillUpgElt.classList.remove("hidden");

      if (typeof skillUpg.reward === "string") {
        if (upgName === "Conversion I") {
          skillUpgElt.innerHTML =
            skillUpg.reward +
            "<br><br>Bought. (x" +
            abbrevNum(D(player.drywallPC).pow(convExp)) +
            ")";
        } else if (upgName === "Arthritis IV") {
          skillUpgElt.innerHTML =
            skillUpg.reward +
            "<br><br>Bought. (x" +
            abbrevNum(D(player.skillPoints).div(arthritisDen).pow(arthritisExp)) +
            ")";
        } else if (upgName === "Self-boost I") {
          skillUpgElt.innerHTML =
            skillUpg.reward +
            "<br><br>Bought. (^" +
            abbrevNum(Math.min(1.15, D(player.drywall).plus(1).pow(selfBoostExp).toNumber())) +
            ")";
        } else {
          skillUpgElt.innerHTML = skillUpg.reward + "<br><br>Bought.";
        }
      } else {
        if (skillUpg.reward.length === 3) {
          skillUpgElt.innerHTML =
            "^" +
            abbrevNum(skillUpg.reward[0]) +
            displayNames[skillUpg.reward[1]] +
            "<br><br>Bought.";
        } else {
          skillUpgElt.innerHTML =
            "x" +
            abbrevNum(skillUpg.reward[0]) +
            displayNames[skillUpg.reward[1]] +
            "<br><br>Bought.";
        }
      }
    } else {
      // Not purchased
      if (skillConnections[upgName].visible || upgName == "Drywall Efficiency I") {
        if (skillUpgUnlocked) {
          // Unlocked state
          skillUpgElt.classList.add("unlocked");
          skillUpgElt.classList.remove("branch");
          skillUpgElt.classList.remove("bought");
          skillUpgElt.classList.remove("hidden");
          skillUpgElt.innerHTML = buildUpgradeText(skillUpg, displayNames, abbrevNum);
        } else {
          // Branch (locked) state
          skillUpgElt.classList.remove("unlocked");
          skillUpgElt.classList.add("branch");
          skillUpgElt.classList.remove("bought");
          skillUpgElt.classList.remove("hidden");
          skillUpgElt.innerHTML =
            "???<br><br>" +
            abbrevNum(skillUpg.cost[0]) +
            displayNames[skillUpg.cost[1]];
        }
      } else {
        // Hidden
        skillUpgElt.classList.remove("unlocked");
        skillUpgElt.classList.remove("branch");
        skillUpgElt.classList.remove("bought");
        skillUpgElt.classList.add("hidden");
      }
    }
  }
}

/**
 * Formats the label for a skill-tree upgrade button.
 * @param {Object} skillUpg - The upgrade definition
 */
function buildUpgradeText(skillUpg) {
  if (typeof skillUpg.reward === "string") {
    return (
      skillUpg.reward +
      "<br><br>" +
      abbrevNum(skillUpg.cost[0]) +
      displayNames[skillUpg.cost[1]]
    );
  } else {
    if (skillUpg.reward.length == 2) {
      return (
        "x" +
        abbrevNum(skillUpg.reward[0]) +
        displayNames[skillUpg.reward[1]] +
        "<br><br>" +
        abbrevNum(skillUpg.cost[0]) +
        displayNames[skillUpg.cost[1]]
      );
    } else {
      return (
        "^" +
        abbrevNum(skillUpg.reward[0]) +
        displayNames[skillUpg.reward[1]] +
        "<br><br>" +
        abbrevNum(skillUpg.cost[0]) +
        displayNames[skillUpg.cost[1]]
      );
    }
  }
}

/**
 * Updates the visual state of every infinity-tree upgrade button.
 */
export function updateInfinityTreeElements() {
  const elts = gameState.elts;
  const player = gameState.player;

  const upgradeKeys = Object.keys(infinityTreeUpgrades);
  let connections = getConnections(
    infinityTreeUpgrades,
    player.infinityTreeUpgrades,
  );

  for (let i = 0; i < upgradeKeys.length; i += 1) {
    let upgName = upgradeKeys[i];
    let infinityUpg = infinityTreeUpgrades[upgName];
    let infinityUpgElt = elts.infinityTreeUpgrades[upgName];
    let nameElt = infinityUpgElt.querySelector("h3");
    let costElt = infinityUpgElt.querySelector("h4");
    let descriptionElt = infinityUpgElt.querySelector("p");

    let infinityUpgUnlocked = true;
    if (infinityUpg.connects) {
      infinityUpgUnlocked = infinityUpg.connects.every((item) =>
        player.infinityTreeUpgrades.includes(item),
      );
    }

    nameElt.textContent = upgName;

    if (player.infinityTreeUpgrades.includes(upgName)) {
      // Bought
      infinityUpgElt.classList.remove("unlocked");
      infinityUpgElt.classList.remove("branch");
      infinityUpgElt.classList.add("bought");
      infinityUpgElt.classList.remove("hidden");
      costElt.textContent = "Bought.";
    } else {
      costElt.textContent =
        abbrevNum(infinityUpg.cost[0]) + displayNames[infinityUpg.cost[1]];

      if (
        connections[upgName].visible ||
        ["Automation I", "Everything Boost I"].includes(upgName)
      ) {
        if (infinityUpgUnlocked) {
          // Unlocked
          infinityUpgElt.classList.add("unlocked");
          infinityUpgElt.classList.remove("branch");
          infinityUpgElt.classList.remove("bought");
          infinityUpgElt.classList.remove("hidden");
          descriptionElt.textContent = infinityUpg.reward;
        } else {
          // Branch (locked)
          descriptionElt.textContent = "???";
          infinityUpgElt.classList.remove("unlocked");
          infinityUpgElt.classList.add("branch");
          infinityUpgElt.classList.remove("bought");
          infinityUpgElt.classList.remove("hidden");
        }
      } else {
        // Hidden
        infinityUpgElt.classList.remove("unlocked");
        infinityUpgElt.classList.remove("branch");
        infinityUpgElt.classList.remove("bought");
        infinityUpgElt.classList.add("hidden");
      }
    }
  }
}

/**
 * Renders all game UI elements: stats, break-infinity bar, area selectors,
 * rebirth buttons, skill-point display, settings visibility, and leaderboards.
 * Called every tick.
 */
export function render() {
  const elts = gameState.elts;
  const player = gameState.player;

  // --- Stats display ---
  elts.drywallStat.textContent = "Drywall: " + getStatText("drywall", true);
  elts.drywallPCStat.textContent = "Drywall/click: " + getStatText("drywallPC", true);
  elts.drywallPSStat.textContent = "Drywall/sec: " + getStatText("drywallPS", true);
  elts.rebirthsStat.textContent = abbrevNum(D(player.rebirths)) + " rebirths";
  elts.skillPointsStat.textContent = "Skill Points: " + getStatText("skillPoints", true);
  elts.infinityPointsStat.textContent = "Infinity Points: " + getStatText("infinityPoints", true);
  elts.infinityPowerStat.textContent = "Infinity Power: " + getStatText("infinityPower", true);
  elts.infinityStat.textContent = "Infinities: " + getStatText("infinities", true);
  elts.clicksStat.textContent = "Clicks: " + abbrevNum(player.stats.clicks);
  elts.playtimeStat.textContent = "Playtime: " + formatMillis(player.stats.playtime);

  // --- Break infinity bar ---
  let infinityBar = checkInfinityProgress();

  elts.breakInfinityLabel.textContent =
    roundToSigFigs(infinityBar.progress * 100, 3, true) + "% to x10 infinity points";
  elts.breakInfinityProgressBar.style.width = infinityBar.progress * 100 + "%";
  elts.breakInfinityBar.style.display =
    player.drywall.gte(infinityThreshold) &&
    player.infinityTreeUpgrades.includes("Break Infinity")
      ? "block"
      : "none";

  if (player.drywall.gte(infinityThreshold)) {
    elts.ipReward.textContent = "+" + abbrevNum(getInfinityPoints()) + " IP";
  } else {
    elts.ipReward.textContent = "Infinity drywall needed";
  }

  // --- Infinity generator upgrade costs ---
  for (let i = 0; i < elts.infinityUpgrades.length; i += 1) {
    let upg = elts.infinityUpgrades[i];
    let upgCost = infinityUpgradeCosts[infinityUpgradeNames[i]];

    if (player.infinityUpgrades[infinityUpgradeNames[i]] < upgCost[0].length) {
      upg.children[1].textContent =
        abbrevNum(upgCost[0][player.infinityUpgrades[infinityUpgradeNames[i]]]) +
        displayNames[upgCost[1]];
    } else {
      upg.children[1].textContent = "Max level!";
    }
  }

  // --- Area unlock indicators ---
  checkAreaUnlocks();

  const areaMap = {
    "High-rise": 3,
    Luxury: 4,
    Bungalow: 5,
    "Skill Tree": 6,
    Infinity: 7,
  };

  for (let [areaName, index] of Object.entries(areaMap)) {
    if (player.areasUnlocked.includes(areaName)) {
      if (elts.areaSelectors[index].style.display == "none") {
        elts.areaSelectors[index].classList.add("flashAreaSelector");
      }
      elts.areaSelectors[index].style.display = "inline-block";
    } else {
      elts.areaSelectors[index].style.display = "none";
    }
  }

  // --- Rebirth button text ---
  elts.rebirthButton1.textContent = "Rebirth for " + abbrevNum(getRebirthCost(1));
  elts.rebirthButton2.textContent = "Rebirth TWICE for " + abbrevNum(getRebirthCost(2));
  elts.rebirthButton3.textContent = "Rebirth FOUR TIMES for " + abbrevNum(getRebirthCost(4));

  // --- Skill reset button ---
  if (D(player.drywall).gte(D(10).pow(18))) {
    elts.skillResetButton.textContent =
      "Reset for +" + abbrevNum(getSkillPoints()) + " skill points";
  } else {
    elts.skillResetButton.textContent = "Reach 1qn to reset";
  }

  // --- Settings automation visibility ---
  if (player.skillUpgrades.includes("Time-saver II")) {
    elts.autoRebirthSetting.parentElement.parentElement.style.display = "";
  } else {
    elts.autoRebirthSetting.parentElement.parentElement.style.display = "none";
  }
  if (player.infinityTreeUpgrades.includes("Automation IV")) {
    elts.autoInfinitySetting.parentElement.parentElement.style.display = "";
  } else {
    elts.autoInfinitySetting.parentElement.parentElement.style.display = "none";
  }
  if (
    player.infinityTreeUpgrades.includes("Automation II") ||
    player.infinityTreeUpgrades.includes("Automation III")
  ) {
    elts.autoSkillTreeSetting.parentElement.parentElement.style.display = "";
  } else {
    elts.autoSkillTreeSetting.parentElement.parentElement.style.display = "none";
  }

  // --- Leaderboard text ---
  elts.leaderboard.querySelector("p").innerHTML = getLeaderboardText("drywall");

  // --- Tree element states ---
  updateSkillTreeElements();
  updateInfinityTreeElements();
}
