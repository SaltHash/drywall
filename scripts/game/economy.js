/**
 * Economy calculations.
 *
 * Handles rebirth costs/reset mechanics, skill-point derivation,
 * and the infinity reset flow.
 */

import { D, infinityThreshold } from "../core/decimal.js";
import { gameState } from "../core/state.js";
import { checkBoosts, getInfinityPoints, checkInfinityProgress } from "./boosts.js";
import { redrawUpgradeLines } from "./trees.js";

/**
 * Computes the total drywall cost to perform `amt` consecutive rebirths
 * starting from the player's current rebirth count.
 *
 * The cost curve changes after rebirth 1000 (base ×3 per rebirth instead of ×2).
 *
 * @param {number} amt - How many rebirths to buy at once
 * @param {Decimal|number} [rebirths] - Starting rebirth count (defaults to player)
 * @returns {Decimal} Total cost
 */
export function getRebirthCost(amt, rebirths = gameState.player.rebirths) {
  if (typeof rebirths !== "number") {
    rebirths = rebirths.toNumber();
  }
  let base = D(1e6);
  let start = rebirths;
  let end = rebirths + amt;

  let total = D(0);

  if (start < 1000) {
    let a = start;
    let b = Math.min(end, 1000);

    let first = base.mul(D(2).pow(a));
    let count = b - a;

    let sum = first.mul(D(2).pow(count).sub(1)).div(1);

    total = total.add(sum);
  }

  if (end > 1000) {
    let a = Math.max(start, 1000);
    let b = end;

    let first = base.mul(D(2).pow(1000)).mul(D(3).pow(a - 1000));

    let count = b - a;

    let sum = first.mul(D(3).pow(count).sub(1)).div(2);

    total = total.add(sum);
  }

  return total;
}

/**
 * Calculates skill points gained from drywall.
 * Uses 10^18 drywall → 1 skill point with 0.1 exponent (square-root-like growth).
 * @returns {number}
 */
export function getSkillPoints() {
  return D(gameState.player.drywall)
    .div(D(10).pow(18))
    .pow(D(0.1))
    .times(gameState.player.boosts.skillPoints.multiplier)
    .toNumber();
}

/**
 * Performs an infinity reset, granting Infinity Points and Infinity Power
 * while wiping drywall, rebirths, and skill-tree progress.
 */
export function infinity() {
  checkBoosts(true);

  let infProg = checkInfinityProgress();

  let ipMult = D(1);
  if (gameState.player.infinityTreeUpgrades.includes("Break Infinity"))
    ipMult = D(10).pow(Math.max(0, infProg.iteration - 1 + infProg.progress));

  gameState.player.infinities = gameState.player.infinities.plus(
    D(1)
      .times(gameState.player.boosts.infinities.multiplier)
      .pow(gameState.player.boosts.infinities.exponent),
  );
  gameState.player.infinityPoints = gameState.player.infinityPoints.plus(getInfinityPoints());

  gameState.player.drywall = D(0);
  gameState.player.drywallPC = D(1);
  gameState.player.drywallPS = D(0);
  gameState.player.rebirths = D(0);
  gameState.player.skillPoints = D(0);
  gameState.player.skillUpgrades = [];
  redrawUpgradeLines();

  gameState.elts.screenOverlay.classList.add("playFlash");
  setTimeout(function () {
    gameState.elts.screenOverlay.classList.remove("playFlash");
  }, 5000);
}

/**
 * Performs a rebirth, spending drywall and gaining rebirths.
 * @param {number} amt - Number of rebirths to perform
 */
export function rebirth(amt) {
  let cost = getRebirthCost(amt);

  if (gameState.player.drywall.gte(cost)) {
    if (gameState.player.skillUpgrades.includes("Time-saver I")) {
      gameState.player.drywall = gameState.player.drywall.minus(cost);
      gameState.player.rebirths = gameState.player.rebirths.plus(amt);
    } else {
      gameState.player.drywall = D(0);
      gameState.player.drywallPS = D(0);
      gameState.player.drywallPC = D(1);
      gameState.player.rebirths = gameState.player.rebirths.plus(amt);
    }
  }
}
