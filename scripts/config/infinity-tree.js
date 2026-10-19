/**
 * Infinity tree upgrade definitions, infinity generator names,
 * and the dynamically-extended cost tables.
 *
 * The cost tables start with a base set of levels and are then extended
 * by `extendInfinityCosts()` to 250 additional levels each.
 */

import { D } from "../core/decimal.js";

export const infinityTreeUpgrades = {
  "Automation I": {
    cost: [D(1), "infinityPoints"],
    reward: "x2 skill points, generate skill points at a rate of 1%/sec, keep auto and no-cost rebirth.",
    x: -400,
    y: 0,
    connects: false,
  },
  "Automation II": {
    cost: [D(150), "infinityPoints"],
    reward: "Gain +19 skill tree autobuyers.",
    x: -550,
    y: 220,
    connects: ["Automation I"],
  },
  "Automation III": {
    cost: [D(600), "infinityPoints"],
    reward: "Gain +10 skill tree autobuyers.",
    x: -250,
    y: 220,
    connects: ["Automation I"],
  },
  "Automation IV": {
    cost: [D(2500), "infinityPoints"],
    reward: "Unlock auto-infinity.",
    x: -400,
    y: 440,
    connects: ["Automation II", "Automation III"],
  },
  "Automation V": {
    cost: [D(10).pow(4), "infinityPoints"],
    reward: "Generate skill points at a rate of 100%/sec.",
    x: -400,
    y: 1100,
    connects: ["Automation IV"],
  },
  "Break Infinity": {
    cost: [D(4).times(D(10).pow(9)), "infinityPoints"],
    reward: "Break infinity.",
    x: -400,
    y: 1980,
    connects: ["Automation V"],
  },
  "Automation VI": {
    cost: [D(10).pow(27), "infinityPoints"],
    reward: "Gain +4 skill tree autobuyers.",
    x: -400,
    y: 2420,
    connects: ["Automation V"],
  },
  "Everything Boost I": {
    cost: [D(1), "infinityPoints"],
    reward: "x3 all previous stats.",
    x: 400,
    y: 0,
    connects: false,
  },
  "Everything Boost II": {
    cost: [D(1), "infinityPoints"],
    reward: "x25 drywall and x2 infinity points.",
    x: 550,
    y: 220,
    connects: ["Everything Boost I"],
  },
  "Everything Boost III": {
    cost: [D(2), "infinityPoints"],
    reward: "x2 all previous stats and x2 infinity points.",
    x: 250,
    y: 220,
    connects: ["Everything Boost I"],
  },
  "IP Boost I": {
    cost: [D(3), "infinityPoints"],
    reward: "x2 infinity points and x3 infinity power.",
    x: 400,
    y: 440,
    connects: ["Everything Boost II", "Everything Boost III"],
  },
  "IP Boost II": {
    cost: [D(100000), "infinityPower"],
    reward: "x2 infinity points and ^1.05 infinity power.",
    x: 400,
    y: 660,
    connects: ["IP Boost I"],
  },
  "IP Boost III": {
    cost: [D(10000000), "infinityPower"],
    reward: "x2 infinity points and ^1.02 infinity power.",
    x: 250,
    y: 880,
    connects: ["IP Boost II"],
  },
  "IP Boost IV": {
    cost: [D(10).pow(9), "infinityPower"],
    reward: "x3 infinity points and ^1.02 infinity power.",
    x: 550,
    y: 880,
    connects: ["IP Boost II"],
  },
  "IP Boost V": {
    cost: [D(10).pow(12), "infinityPower"],
    reward: "x2 infinity points, ^1.1 infinity power.",
    x: 400,
    y: 1100,
    connects: ["IP Boost III", "IP Boost IV"],
  },
  "IP Self-Boost I": {
    cost: [D(1000), "infinityPoints"],
    reward: "Infinity Power boosted by itself.",
    x: 250,
    y: 1320,
    connects: ["IP Boost V"],
  },
  "IP Infinity Boost I": {
    cost: [D(10).pow(18), "infinityPower"],
    reward: "Infinity Points boosted by infinities.",
    x: 550,
    y: 1320,
    connects: ["IP Boost V"],
  },
  "Gamer I": {
    cost: [D(10).pow(25), "infinityPower"],
    reward: "Unlock minigames.",
    x: 400,
    y: 1540,
    connects: ["IP Self-Boost I", "IP Infinity Boost I"],
  },
  "Gamer II": {
    cost: [D(10).pow(6), "infinityPoints"],
    reward: "Double minigame rewards.",
    x: 250,
    y: 1760,
    connects: ["Gamer I"],
  },
  "Gamer III": {
    cost: [D(10).pow(30), "infinityPower"],
    reward: "Double minigame rewards.",
    x: 550,
    y: 1760,
    connects: ["Gamer I"],
  },
  "Gamer IV": {
    cost: [D(10).pow(36), "infinityPower"],
    reward: "Improve gaming exponent (^0.6 --> ^1).",
    x: 400,
    y: 1980,
    connects: ["Gamer II", "Gamer III"],
  },
  "Gamer V": {
    cost: [D(10).pow(48), "infinityPower"],
    reward: "1.5x minigame rewards.",
    x: 250,
    y: 2200,
    connects: ["Gamer IV"],
  },
  "Gamer VI": {
    cost: [D(10).pow(54), "infinityPower"],
    reward: "Double minigame rewards.",
    x: 550,
    y: 2200,
    connects: ["Gamer IV"],
  },
  "IP Self-Boost II": {
    cost: [D(10).pow(70), "infinityPower"],
    reward: "Improve IP Self-Boost I exponent from 0.2 -> 0.3.",
    x: 250,
    y: 2420,
    connects: ["Gamer V"],
  },
  "IP Infinity Boost II": {
    cost: [D(10).pow(100), "infinityPower"],
    reward: "Improve IP Infinity Boost I exponent from 0.5 -> 0.8.",
    x: 550,
    y: 2420,
    connects: ["Gamer VI"],
  },
};

// Names of the purchasable infinity generator upgrades (shown as buttons)
export const infinityUpgradeNames = [
  "Infinity Power I",
  "Infinity Power II",
  "Drywall I",
  "Drywall/sec I",
  "Skill Points I",
  "Infinities I",
];

/** Base cost levels for each infinity generator upgrade. */
export const infinityUpgradeCosts = {
  "Infinity Power I": [
    [
      D(1), D(1), D(3), D(5), D(8), D(15), D(40), D(100), D(450), D(2000),
      D(6500), D(35000), D(150000), D(2).times(D(10).pow(6)), D(10).pow(7),
      D(5).times(D(10).pow(7)), D(1.5).times(D(10).pow(8)), D(4).times(D(10).pow(8)),
      D(10).pow(9), D(10).pow(10), D(2).times(D(10).pow(10)), D(5).times(D(10).pow(10)),
      D(10).pow(11), D(3).times(D(10).pow(11)), D(10).pow(12), D(3).times(D(10).pow(12)),
      D(8).times(D(10).pow(12)), D(5).times(D(10).pow(13)), D(2).times(D(10).pow(14)),
      D(5).times(D(10).pow(14)),
    ],
    "infinityPoints",
  ],
  "Infinity Power II": [
    [
      D(1000), D(10).pow(6), D(10).pow(9), D(10).pow(12), D(10).pow(15),
      D(10).pow(18), D(10).pow(21), D(10).pow(24), D(10).pow(27), D(10).pow(30),
      D(10).pow(33), D(10).pow(36), D(10).pow(39), D(10).pow(42), D(10).pow(45),
      D(10).pow(48), D(10).pow(51), D(10).pow(54), D(10).pow(57), D(10).pow(60),
    ],
    "infinityPower",
  ],
  "Drywall I": [
    [
      D(0.25), D(6), D(25), D(2.5).times(D(10).pow(3)), D(4).times(D(10).pow(9)),
      D(5).times(D(10).pow(15)), D(8).times(D(10).pow(32)), D(2).times(D(10).pow(38)),
      D(5).times(D(10).pow(43)),
    ],
    "infinityPower",
  ],
  "Drywall/sec I": [
    [
      D(1), D(20), D(1.5).times(D(10).pow(2)), D(4).times(D(10).pow(8)),
      D(8).times(D(10).pow(14)), D(2.5).times(D(10).pow(30)), D(5).times(D(10).pow(33)),
      D(1).times(D(10).pow(39)), D(8).times(D(10).pow(43)),
    ],
    "infinityPower",
  ],
  "Skill Points I": [
    [
      D(5), D(4).times(D(10).pow(2)), D(5).times(D(10).pow(4)), D(8).times(D(10).pow(14)),
      D(4).times(D(10).pow(21)), D(1).times(D(10).pow(35)), D(2.5).times(D(10).pow(40)),
      D(4).times(D(10).pow(44)),
    ],
    "infinityPower",
  ],
  "Infinities I": [[D(10).pow(7)], "infinityPower"],
};

/**
 * Extends each generator cost array by 250 levels using its multiplier.
 * Called once at module load time.
 */
function extendInfinityCosts() {
  const multipliers = {
    "Infinity Power I": D(10),
    "Infinity Power II": D(100),
    "Drywall I": D(3),
    "Drywall/sec I": D(4),
    "Skill Points I": D(10),
    "Infinities I": D(1000000),
  };

  for (let i = 0; i < 250; i += 1) {
    for (const name of Object.keys(multipliers)) {
      const arr = infinityUpgradeCosts[name][0];
      arr.push(arr[arr.length - 1].times(multipliers[name]));
    }
  }
}

extendInfinityCosts();
