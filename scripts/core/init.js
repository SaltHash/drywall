/**
 * DOM initialisation.
 *
 * Sets up the shared `elts` reference object with frequently-used DOM nodes,
 * creates the area-selector buttons, and auto-maps every element that has an
 * `id` attribute.
 */

import { D } from "./decimal.js";
import { gameState } from "./state.js";

// Ordered list of in-game areas: [display name, element id]
export const areas = [
  ["Leaderboards", "leaderboardArea"],
  ["Achievements", "achievementsArea"],
  ["Home", "area1"],
  ["High-rise", "area2"],
  ["Luxury", "area3"],
  ["Bungalow", "area4"],
  ["Skill Tree", "skillTreeArea"],
  ["Infinity", "infinityArea"],
];

/**
 * Populate gameState.elts with DOM references.
 * Called once from main.js after the DOM is ready.
 */
export function initDOM() {
  const elts = {
    clickers: document.getElementsByClassName("clicker"),
    infinityUpgrades: [
      ...document.getElementById("generatorUpgrades").children,
      ...document.getElementById("infinityPowerUpgrades").children,
    ],
    infinityTreeUpgrades: {},
    upgrades: [],
    skillUpgrades: {},
    areaSelectors: [],
    areas: [],
  };

  // Create area selector buttons
  for (let i = 0; i < areas.length; i += 1) {
    elts.areaSelectors.push(document.getElementById("areaSelector" + (i + 1)));
    elts.areas.push(document.getElementById(areas[i][1]));
    elts.areaSelectors[i].textContent = areas[i][0];
  }

  // Auto-map every element with an id attribute
  document.querySelectorAll("[id]").forEach((el) => {
    const key = el.id;
    if (!(key in elts)) {
      elts[key] = el;
    }
  });

  gameState.elts = elts;

  // Canvas contexts for tree line drawing
  gameState.canvas = document.getElementById("skillCanvas");
  gameState.ctx = gameState.canvas.getContext("2d");
  gameState.canvas2 = document.getElementById("infinityCanvas");
  gameState.ctx2 = gameState.canvas2.getContext("2d");
}
