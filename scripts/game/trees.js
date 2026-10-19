/**
 * Tree rendering for the skill tree and infinity tree.
 *
 * Handles:
 *  - Connection-graph computation (getConnections)
 *  - Canvas line drawing between connected upgrades
 *  - One-time button creation for skill-tree and infinity-tree upgrades
 */

import { D } from "../core/decimal.js";
import { gameState } from "../core/state.js";
import { abbrevNum, displayNames } from "../core/formatting.js";
import { skillUpgrades } from "../config/skill-tree.js";
import { infinityTreeUpgrades } from "../config/infinity-tree.js";

// ---------------------------------------------------------------------------
// Connection graphs
// ---------------------------------------------------------------------------

/**
 * Builds a visibility map for a tree of upgrades.
 *
 * An upgrade is "visible" if it is:
 *  1. Already purchased, OR
 *  2. Directly connected to a purchased upgrade, OR
 *  3. Connected to an upgrade that is itself connected to a purchased upgrade.
 *
 * @param {Object} skills - The tree data (e.g. skillUpgrades or infinityTreeUpgrades)
 * @param {string[]} boughtUpgrades - Names of purchased upgrades
 * @returns {Object} Visibility + connection data for each upgrade
 */
export function getConnections(skills, boughtUpgrades) {
  const updated = {};

  // Copy data + add connectsTo + visible (default false)
  for (const [name, data] of Object.entries(skills)) {
    updated[name] = { ...data, connectsTo: [], visible: false };
  }

  // Build reverse connections
  for (const [name, data] of Object.entries(skills)) {
    if (Array.isArray(data.connects)) {
      for (const target of data.connects) {
        if (updated[target]) {
          updated[target].connectsTo.push(name);
        }
      }
    }
  }

  const bought = new Set(boughtUpgrades);

  // Helper: all direct neighbours (both directions)
  function getNeighbors(name) {
    const data = updated[name];
    if (!data) return [];
    return [
      ...(Array.isArray(data.connects) ? data.connects : []),
      ...data.connectsTo,
    ];
  }

  // Determine visibility
  for (const name of Object.keys(updated)) {
    // 1. Bought
    if (bought.has(name)) {
      updated[name].visible = true;
      continue;
    }

    const neighbors = getNeighbors(name);

    // 2. Connected to a bought upgrade
    if (neighbors.some((n) => bought.has(n))) {
      updated[name].visible = true;
      continue;
    }

    // 3. Connected to an upgrade which is connected to a bought upgrade
    if (neighbors.some((n) => getNeighbors(n).some((nn) => bought.has(nn)))) {
      updated[name].visible = true;
    }
  }

  return updated;
}

// ---------------------------------------------------------------------------
// Canvas line drawing
// ---------------------------------------------------------------------------

/**
 * Recursively draws lines from a skill-tree upgrade to its children.
 * @param {string} upgrade - Name of the starting upgrade
 */
export function drawLinesFromUpgrade(upgrade) {
  let skills = getConnections(skillUpgrades, gameState.player.skillUpgrades);
  let thisUpgrade = skills[upgrade];
  if (!thisUpgrade) return;

  for (let i of thisUpgrade.connectsTo) {
    let connection = skills[i];
    if (!connection || !connection.visible) continue;

    gameState.ctx.beginPath();
    gameState.ctx.strokeStyle = "#dddddda0";
    gameState.ctx.lineWidth = 4;
    gameState.ctx.moveTo(thisUpgrade.x + window.innerWidth / 2, thisUpgrade.y + 650);
    gameState.ctx.lineTo(connection.x + window.innerWidth / 2, connection.y + 650);
    gameState.ctx.stroke();

    drawLinesFromUpgrade(i);
  }
}

/**
 * Recursively draws lines from an infinity-tree upgrade to its children.
 * @param {string} upgrade - Name of the starting upgrade
 */
export function drawLinesFromInfinityUpgrade(upgrade) {
  if (upgrade == "Automation I") {
    gameState.drawnFromInfinities = [];
  }

  if (!gameState.drawnFromInfinities.includes(upgrade)) {
    let upgs = getConnections(
      infinityTreeUpgrades,
      gameState.player.infinityTreeUpgrades,
    );
    let thisUpgrade = upgs[upgrade];
    if (!thisUpgrade) return;

    gameState.drawnFromInfinities.push(upgrade);

    for (let i of thisUpgrade.connectsTo) {
      let connection = upgs[i];
      if (!connection || !connection.visible) continue;

      gameState.ctx2.beginPath();
      gameState.ctx2.strokeStyle = "#dddddda0";
      gameState.ctx2.lineWidth = 4;
      gameState.ctx2.moveTo(thisUpgrade.x + 1500 / 2, thisUpgrade.y);
      gameState.ctx2.lineTo(connection.x + 1500 / 2, connection.y);
      gameState.ctx2.stroke();

      drawLinesFromInfinityUpgrade(i);
    }
  }
}

/**
 * Clears both tree canvases and redraws all connection lines.
 */
export function redrawUpgradeLines() {
  gameState.ctx.clearRect(0, 0, gameState.canvas.width, gameState.canvas.height);
  gameState.ctx2.clearRect(0, 0, gameState.canvas2.width, gameState.canvas2.height);
  drawLinesFromUpgrade("Drywall Efficiency I");
  drawLinesFromInfinityUpgrade("Automation I");
  drawLinesFromInfinityUpgrade("Everything Boost I");
}

// ---------------------------------------------------------------------------
// Button creation (one-time setup)
// ---------------------------------------------------------------------------

/**
 * Creates a button element for each skill-tree upgrade and appends it
 * to the skill-tree canvas container.
 */
export function setupSkillTreeButtons() {
  const elts = gameState.elts;

  for (let i = 0; i < Object.keys(skillUpgrades).length; i += 1) {
    let upgrade = document.createElement("button");
    let upg = skillUpgrades[Object.keys(skillUpgrades)[i]];

    if (typeof skillUpgrades[Object.keys(skillUpgrades)[i]].reward == "string") {
      upgrade.innerHTML =
        upg.reward +
        "<br><br>" +
        abbrevNum(upg.cost[0]) +
        displayNames[upg.cost[1]];
    } else {
      if (upg.reward.length == 2) {
        upgrade.innerHTML =
          "x" +
          abbrevNum(upg.reward[0]) +
          displayNames[upg.reward[1]] +
          "<br><br>" +
          abbrevNum(upg.cost[0]) +
          displayNames[upg.cost[1]];
      } else {
        upgrade.innerHTML =
          "^" +
          abbrevNum(upg.reward[0]) +
          displayNames[upg.reward[1]] +
          "<br><br>" +
          abbrevNum(upg.cost[0]) +
          displayNames[upg.cost[1]];
      }
    }

    upgrade.classList.add("skillUpgrade");
    upgrade.style.position = "absolute";
    upgrade.style.left =
      "calc(50vw + " +
      (skillUpgrades[Object.keys(skillUpgrades)[i]].x - 75) +
      "px)";
    upgrade.style.top =
      skillUpgrades[Object.keys(skillUpgrades)[i]].y + 650 - 75 + "px";
    elts.skillTreeArea.appendChild(upgrade);
    elts.skillUpgrades[Object.keys(skillUpgrades)[i]] = upgrade;
  }
}

/**
 * Creates a button element (with name / description / cost children) for
 * each infinity-tree upgrade and appends it to the infinity-tree canvas.
 */
export function setupInfinityTreeButtons() {
  const elts = gameState.elts;
  const player = gameState.player;

  for (let i = 0; i < Object.keys(infinityTreeUpgrades).length; i += 1) {
    let upgrade = document.createElement("button");
    let nameElt = document.createElement("h3");
    let descriptionElt = document.createElement("p");
    let costElt = document.createElement("h4");
    let name = Object.keys(infinityTreeUpgrades)[i];
    let upg = infinityTreeUpgrades[name];

    nameElt.innerHTML = name;

    if (
      typeof infinityTreeUpgrades[Object.keys(infinityTreeUpgrades)[i]].reward ==
      "string"
    ) {
      descriptionElt.innerHTML = upg.reward;
    }

    if (player.infinityTreeUpgrades.includes(name)) {
      costElt.innerHTML = "Bought!";
    } else {
      costElt.innerHTML = abbrevNum(upg.cost[0]) + displayNames[upg.cost[1]];
    }

    upgrade.classList.add("infinityUpgrade");
    upgrade.style.position = "absolute";
    upgrade.style.left =
      "calc(50% + " +
      (infinityTreeUpgrades[Object.keys(infinityTreeUpgrades)[i]].x - 125) +
      "px)";
    upgrade.style.top =
      infinityTreeUpgrades[Object.keys(infinityTreeUpgrades)[i]].y - 90 + "px";

    upgrade.appendChild(nameElt);
    upgrade.appendChild(descriptionElt);
    upgrade.appendChild(costElt);
    elts.infinityTreeArea.appendChild(upgrade);
    elts.infinityTreeUpgrades[Object.keys(infinityTreeUpgrades)[i]] = upgrade;
  }
}
