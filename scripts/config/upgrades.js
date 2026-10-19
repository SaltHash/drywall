/**
 * All regular (non-skill, non-infinity) upgrade definitions.
 *
 * Each upgrade costs a resource and rewards a (possibly different) resource.
 * The order of this array determines the order upgrades appear on buttons
 * upgrade1 → upgrade24 in the HTML.
 */

import { D } from "../core/decimal.js";

export const upgrades = [
  { cost: [D(25), "drywall"], reward: [D(1), "drywallPC"] },
  { cost: [D(600), "drywall"], reward: [D(10), "drywallPC"] },
  { cost: [D(165000), "drywall"], reward: [D(850), "drywallPC"] },
  { cost: [D(50), "drywall"], reward: [D(10), "drywallPS"] },
  { cost: [D(35000), "drywall"], reward: [D(700), "drywallPS"] },
  { cost: [D(8).times(D(10).pow(6)), "drywall"], reward: [D(80000), "drywallPS"] },
  { cost: [D(1).times(D(10).pow(9)), "drywall"], reward: [D(75000), "drywallPC"] },
  { cost: [D(150).times(D(10).pow(15)), "drywall"], reward: [D(20).times(D(10).pow(6)), "drywallPC"] },
  { cost: [D(5).times(D(10).pow(24)), "drywall"], reward: [D(800).times(D(10).pow(6)), "drywallPC"] },
  { cost: [D(3.5).times(D(10).pow(12)), "drywall"], reward: [D(6).times(D(10).pow(6)), "drywallPS"] },
  { cost: [D(850).times(D(10).pow(18)), "drywall"], reward: [D(900).times(D(10).pow(6)), "drywallPS"] },
  { cost: [D(2.5).times(D(10).pow(27)), "drywall"], reward: [D(85).times(D(10).pow(9)), "drywallPS"] },
  { cost: [D(10).times(D(10).pow(45)), "drywall"], reward: [D(160).times(D(10).pow(9)), "drywallPC"] },
  { cost: [D(10).times(D(10).pow(69)), "drywall"], reward: [D(18).times(D(10).pow(12)), "drywallPC"] },
  { cost: [D(100).times(D(10).pow(108)), "drywall"], reward: [D(55).times(D(10).pow(15)), "drywallPC"] },
  { cost: [D(2.5).times(D(10).pow(54)), "drywall"], reward: [D(15).times(D(10).pow(12)), "drywallPS"] },
  { cost: [D(1.5).times(D(10).pow(84)), "drywall"], reward: [D(50).times(D(10).pow(15)), "drywallPS"] },
  { cost: [D(2.5).times(D(10).pow(135)), "drywall"], reward: [D(85).times(D(10).pow(18)), "drywallPS"] },
  { cost: [D(1).times(D(10).pow(400)), "drywall"], reward: [D(1).times(D(10).pow(40)), "drywallPC"] },
  { cost: [D(8).times(D(10).pow(650)), "drywall"], reward: [D(3).times(D(10).pow(55)), "drywallPC"] },
  { cost: [D(5).times(D(10).pow(1000)), "drywall"], reward: [D(1).times(D(10).pow(100)), "drywallPC"] },
  { cost: [D(2.5).times(D(10).pow(540)), "drywall"], reward: [D(3).times(D(10).pow(28)), "drywallPS"] },
  { cost: [D(1.5).times(D(10).pow(845)), "drywall"], reward: [D(2).times(D(10).pow(35)), "drywallPS"] },
  { cost: [D(1).times(D(10).pow(1200)), "drywall"], reward: [D(6.5).times(D(10).pow(55)), "drywallPS"] },
];

/**
 * Adds incremental cost scaling to a cost array using a multiplier.
 * @param {number[]} arr - The cost array to extend
 * @param {Decimal} multiplier - The multiplier applied each step
 * @param {number} count - How many levels to add
 */
function extendCost(arr, multiplier, count) {
  for (let i = 0; i < count; i += 1) {
    arr.push(arr[arr.length - 1].times(multiplier));
  }
}
