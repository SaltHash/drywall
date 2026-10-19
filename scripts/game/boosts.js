/**
 * Boost calculations.
 *
 * Computes the multiplicative and exponential boosts that affect every
 * game resource.  Called once per tick (via checkBoosts) and on demand
 * (via getInfinityPoints) during the pre-infinity → break-infinity
 * progression.
 */

import { D, infinityThreshold } from "../core/decimal.js";
import { gameState } from "../core/state.js";
import { abbrevNum } from "../core/formatting.js";
import { achievements } from "../config/achievements.js";
import { skillUpgrades } from "../config/skill-tree.js";
import { infinityTreeUpgrades } from "../config/infinity-tree.js";
// Circular-safe imports: these functions are only called at runtime,
// never during module evaluation, so the live bindings will be resolved
// by the time they execute.
import { infinity } from "./economy.js";
import { redrawUpgradeLines } from "./trees.js";

/**
 * Returns the current infinity-progress object used by the
 * break-infinity bar and IP reward calculation.
 *
 * @returns {{iteration: number, progress: number}}
 */
export function checkInfinityProgress() {
  const intervalSize = 100;
  let iteration = Math.ceil(
    Math.max(0, gameState.player.drywall.exponent - 400) / intervalSize,
  );
  let req = 400 + intervalSize * iteration;
  let oldReq = iteration === 0 ? 308 : 400 + intervalSize * (iteration - 1);
  let prog = (D(gameState.player.drywall).log10() - oldReq) / (req - oldReq);
  return { iteration: iteration, progress: prog };
}

/**
 * Computes the number of Infinity Points the player would gain from
 * performing an infinity reset right now.
 * @returns {Decimal}
 */
export function getInfinityPoints() {
  checkBoosts(true);

  let infinityBar = checkInfinityProgress();
  let ipMult = D(1);
  if (gameState.player.infinityTreeUpgrades.includes("Break Infinity"))
    ipMult = D(10).pow(
      Math.max(0, infinityBar.iteration + infinityBar.progress),
    );
  return gameState.player.boosts.infinityPoints.multiplier
    .times(ipMult)
    .pow(gameState.player.boosts.infinityPoints.exponent)
    .times(
      gameState.player.boosts.infinities.multiplier.pow(
        gameState.player.boosts.infinities.exponent,
      ),
    );
}

/**
 * Applies infinity-tree, minigame, and automation boosts.
 * Mutates player.boosts and player.passive in place.
 */
export function checkInfinityUpgrades(dontCall) {
  const player = gameState.player;

  // --- Base multipliers from infinity generator upgrades ---
  player.boosts.infinityPower.multiplier = D(player.infinities).div(100);
  player.boosts.infinityPower.multiplier = player.boosts.infinityPower.multiplier.times(
    D(10).pow(player.infinityUpgrades["Infinity Power I"]),
  );
  player.boosts.infinityPower.multiplier = player.boosts.infinityPower.multiplier.times(
    D(2).pow(player.infinityUpgrades["Infinity Power II"]),
  );

  player.boosts.drywall.multiplier = player.boosts.drywall.multiplier.times(
    D(3).pow(player.infinityUpgrades["Drywall I"]),
  );
  player.boosts.drywallPS.multiplier = player.boosts.drywallPS.multiplier.times(
    D(2).pow(player.infinityUpgrades["Drywall/sec I"]),
  );
  player.boosts.skillPoints.multiplier = player.boosts.skillPoints.multiplier.times(
    D(2).pow(player.infinityUpgrades["Skill Points I"]),
  );
  player.boosts.infinities.multiplier = player.boosts.infinities.multiplier.times(
    D(2).pow(player.infinityUpgrades["Infinities I"]),
  );

  // --- Everything Boost path ---
  if (player.infinityTreeUpgrades.includes("Everything Boost I")) {
    player.boosts.drywall.multiplier = player.boosts.drywall.multiplier.times(3);
    player.boosts.drywallPS.multiplier = player.boosts.drywallPS.multiplier.times(3);
    player.boosts.drywallPC.multiplier = player.boosts.drywallPC.multiplier.times(3);
    player.boosts.skillPoints.multiplier = player.boosts.skillPoints.multiplier.times(3);
  }
  if (player.infinityTreeUpgrades.includes("Everything Boost II")) {
    player.boosts.drywall.multiplier = player.boosts.drywall.multiplier.times(25);
    player.boosts.infinityPoints.multiplier = player.boosts.infinityPoints.multiplier.times(2);
  }
  if (player.infinityTreeUpgrades.includes("Everything Boost III")) {
    player.boosts.drywall.multiplier = player.boosts.drywall.multiplier.times(2);
    player.boosts.drywallPS.multiplier = player.boosts.drywallPS.multiplier.times(2);
    player.boosts.drywallPC.multiplier = player.boosts.drywallPC.multiplier.times(2);
    player.boosts.skillPoints.multiplier = player.boosts.skillPoints.multiplier.times(2);
    player.boosts.infinityPoints.multiplier = player.boosts.infinityPoints.multiplier.times(2);
  }

  // --- IP Boost path ---
  if (player.infinityTreeUpgrades.includes("IP Boost I")) {
    player.boosts.infinityPoints.multiplier = player.boosts.infinityPoints.multiplier.times(2);
    player.boosts.infinityPower.multiplier = player.boosts.infinityPower.multiplier.times(3);
  }
  if (player.infinityTreeUpgrades.includes("IP Boost II")) {
    player.boosts.infinityPoints.multiplier = player.boosts.infinityPoints.multiplier.times(2);
    player.boosts.infinityPower.exponent *= 1.05;
  }
  if (player.infinityTreeUpgrades.includes("IP Boost III")) {
    player.boosts.infinityPoints.multiplier = player.boosts.infinityPoints.multiplier.times(2);
    player.boosts.infinityPower.exponent *= 1.02;
  }
  if (player.infinityTreeUpgrades.includes("IP Boost IV")) {
    player.boosts.infinityPoints.multiplier = player.boosts.infinityPoints.multiplier.times(3);
    player.boosts.infinityPower.exponent *= 1.02;
  }
  if (player.infinityTreeUpgrades.includes("IP Boost V")) {
    player.boosts.infinityPoints.multiplier = player.boosts.infinityPoints.multiplier.times(2);
    player.boosts.infinityPower.exponent *= 1.1;
  }

  // --- IP Self-Boost path ---
  let ipOneExp = 0.2;
  if (player.infinityTreeUpgrades.includes("IP Self-Boost II")) {
    ipOneExp = 0.3;
  }
  if (player.infinityTreeUpgrades.includes("IP Self-Boost I")) {
    const mult = D(player.infinityPower).div(1000000).pow(ipOneExp).max(1);
    player.boosts.infinityPower.multiplier = player.boosts.infinityPower.multiplier.times(mult);

    const upgName = "IP Self-Boost I";
    let upgElt = gameState.elts.infinityTreeUpgrades[upgName];
    if (upgElt) {
      upgElt = upgElt.querySelector("p");
      upgElt.textContent =
        infinityTreeUpgrades[upgName].reward + " (x" + abbrevNum(mult.toNumber()) + ")";
    }
  }

  // --- IP Infinity Boost path ---
  let ipTwoExp = 0.5;
  if (player.infinityTreeUpgrades.includes("IP Infinity Boost II")) {
    ipTwoExp = 0.8;
  }
  if (player.infinityTreeUpgrades.includes("IP Infinity Boost I")) {
    const mult = D(player.infinities).div(2).pow(ipTwoExp).max(1);
    player.boosts.infinityPoints.multiplier = player.boosts.infinityPoints.multiplier.times(mult);

    const upgName = "IP Infinity Boost I";
    let upgElt = gameState.elts.infinityTreeUpgrades[upgName];
    if (upgElt) {
      upgElt = upgElt.querySelector("p");
      upgElt.textContent =
        infinityTreeUpgrades[upgName].reward + " (x" + abbrevNum(mult.toNumber()) + ")";
    }
  }

  // --- Minigame boosts ---
  let gameExp = D(0.6);
  let gameQuotient = D(10);
  if (player.infinityTreeUpgrades.includes("Gamer II"))
    player.boosts.minigames.multiplier = player.boosts.minigames.multiplier.times(2);
  if (player.infinityTreeUpgrades.includes("Gamer III"))
    player.boosts.minigames.multiplier = player.boosts.minigames.multiplier.times(2);
  if (player.infinityTreeUpgrades.includes("Gamer IV"))
    gameExp = D(1);
  if (player.infinityTreeUpgrades.includes("Gamer V"))
    player.boosts.minigames.multiplier = player.boosts.minigames.multiplier.times(1.5);
  if (player.infinityTreeUpgrades.includes("Gamer VI"))
    player.boosts.minigames.multiplier = player.boosts.minigames.multiplier.times(2);
  if (player.infinityTreeUpgrades.includes("Gamer VII"))
    gameExp = D(1.4);
  player.boosts.minigames.exponent = gameExp.toNumber();

  // --- Minigame stat bonuses ---
  if (player.infinityTreeUpgrades.includes("Gamer I")) {
    gameState.elts.gameDiv.style.display = "block";

    let infBoost = D(player.minigames.geometryDash.stars)
      .div(gameQuotient)
      .pow(player.boosts.minigames.exponent)
      .plus(1)
      .times(player.boosts.minigames.multiplier);
    let ipBoost = D(player.minigames.flappyBird.best)
      .div(gameQuotient.times(1.5))
      .pow(player.boosts.minigames.exponent)
      .plus(1)
      .times(player.boosts.minigames.multiplier);

    player.boosts.infinities.multiplier = player.boosts.infinities.multiplier.times(infBoost);
    player.boosts.infinityPoints.multiplier = player.boosts.infinityPoints.multiplier.times(ipBoost);

    gameState.elts.minigameInfinityBonus.textContent =
      "x" +
      abbrevNum(infBoost.toNumber()) +
      " Infinities (from " +
      player.minigames.geometryDash.stars +
      " stars)";
    gameState.elts.minigameIPBonus.textContent =
      "x" +
      abbrevNum(ipBoost.toNumber()) +
      " Infinity Points (from " +
      player.minigames.flappyBird.best +
      " score)";
  } else {
    gameState.elts.gameDiv.style.display = "none";
  }

  // --- Automation path ---
  if (player.infinityTreeUpgrades.includes("Automation I")) {
    player.boosts.skillPoints.multiplier = player.boosts.skillPoints.multiplier.times(2);
    if (!player.skillUpgrades.includes("Time-saver I")) {
      player.skillUpgrades.push("Time-saver I");
      redrawUpgradeLines();
    }
    if (!player.skillUpgrades.includes("Time-saver II")) {
      player.skillUpgrades.push("Time-saver II");
      redrawUpgradeLines();
    }
    player.passive.skillPoints = 0.01;
  }
  if (player.infinityTreeUpgrades.includes("Automation II")) {
    player.passive.skillUpgrades = 19;
  }
  if (player.infinityTreeUpgrades.includes("Automation III")) {
    player.passive.skillUpgrades = 29;
  }
  if (player.infinityTreeUpgrades.includes("Automation VI")) {
    player.passive.skillUpgrades = 33;
  }

  // --- Auto skill-tree purchase ---
  let sortedSkillKeys = Object.keys(skillUpgrades).sort((a, b) => {
    let ca = skillUpgrades[a].cost;
    let cb = skillUpgrades[b].cost;
    return D(ca[0]).cmp(cb[0]);
  });
  let bought = false;
  if (player.settings.autoSkillTree) {
    for (let i = 0; i < player.passive.skillUpgrades; i += 1) {
      let k = sortedSkillKeys[i];
      let upg = skillUpgrades[k];
      let cost = upg.cost;

      if (
        D(player[cost[1]]).gte(cost[0]) &&
        !player.skillUpgrades.includes(k)
      ) {
        player[cost[1]] = D(player[cost[1]]).minus(cost[0]);
        player.skillUpgrades.push(k);
        bought = true;
      }
    }
  }
  if (bought) {
    redrawUpgradeLines();
  }

  // --- Auto infinity ---
  if (
    player.infinityTreeUpgrades.includes("Automation IV") &&
    player.settings.autoInfinity &&
    player.drywall.gte(infinityThreshold) &&
    !dontCall
  ) {
    infinity();
  }
  if (player.infinityTreeUpgrades.includes("Automation V")) {
    player.passive.skillPoints = 1;
  }
}

/**
 * Applies boosts from unlocked achievements.
 */
export function checkAchievementBoosts() {
  const player = gameState.player;
  for (let i of player.achievements) {
    let reward = achievements[i].reward;
    if (reward) {
      player.boosts[reward.type].multiplier = player.boosts[
        reward.type
      ].multiplier.times(reward.amount);
    }
  }
}

/**
 * Recalculates all boosts from scratch.
 * Called every tick and on demand by getInfinityPoints.
 *
 * @param {*} dontCall - When truthy, prevents the automatic infinity call
 *                       inside checkInfinityUpgrades (used by getInfinityPoints).
 */
export function checkBoosts(dontCall) {
  const player = gameState.player;

  // Reset all boosts to identity
  for (var i = 0; i < Object.keys(player).length; i += 1) {
    player.boosts[Object.keys(player)[i]] = { multiplier: D(1), exponent: 1 };
    player.passive[Object.keys(player)[i]] = 0;
  }

  checkInfinityUpgrades(dontCall);
  checkAchievementBoosts();

  // Achievement-count-based skill point boost
  player.boosts.skillPoints.multiplier = player.boosts.skillPoints.multiplier.times(
    D(player.achievements.length).div(100).plus(1),
  );

  // --- Skill-tree boost paths ---
  let convExp = 0.2;
  if (player.skillUpgrades.includes("Conversion II")) convExp = 0.3;
  if (player.skillUpgrades.includes("Conversion III")) convExp = 0.4;
  if (player.skillUpgrades.includes("Conversion IV")) convExp = 0.5;
  if (player.skillUpgrades.includes("Conversion V")) convExp = 0.6;
  if (player.skillUpgrades.includes("Conversion VI")) convExp = 0.65;
  if (player.skillUpgrades.includes("Conversion VII")) convExp = 0.7;

  let arthritisExp = 0.7;
  let arthritisDen = D(100000);
  if (player.skillUpgrades.includes("Arthritis V")) {
    arthritisExp = 0.9;
    arthritisDen = D(100);
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

  for (let i = 0; i < player.skillUpgrades.length; i += 1) {
    let skillUpg = skillUpgrades[player.skillUpgrades[i]];

    if (typeof skillUpg.reward == "string") {
      if (player.skillUpgrades[i] == "Conversion I") {
        let boost = D(player.drywallPC).pow(convExp);
        player.boosts.drywallPS.multiplier = player.boosts.drywallPS.multiplier.times(boost);
      } else if (player.skillUpgrades[i] == "Arthritis IV") {
        let boost = D(player.skillPoints).div(arthritisDen).pow(arthritisExp);
        player.boosts.drywallPC.multiplier = player.boosts.drywallPC.multiplier.times(boost);
      } else if (player.skillUpgrades[i] == "Self-boost I") {
        let expBoost = D(player.drywall).plus(1).pow(selfBoostExp);
        player.boosts.drywall.exponent *= Math.min(1.15, expBoost.toNumber());
      }
    } else {
      if (skillUpg.reward.length == 3) {
        player.boosts[skillUpg.reward[1]].exponent *= skillUpg.reward[0];
      } else {
        player.boosts[skillUpg.reward[1]].multiplier = player.boosts[
          skillUpg.reward[1]
        ].multiplier.times(skillUpg.reward[0]);
      }
    }
  }

  let rebirthBoost = D(1.5).pow(player.rebirths);
  player.boosts.drywall.multiplier = player.boosts.drywall.multiplier.times(rebirthBoost);
}
