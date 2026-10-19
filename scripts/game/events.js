/**
 * Event listener setup.
 *
 * Wires up every DOM event handler in the game: keyboard shortcuts,
 * title-screen navigation, username popup, upgrade clicks, rebirth
 * buttons, skill-tree & infinity-tree interactions, settings toggles,
 * area navigation, and the canvas resize listener.
 *
 * Must be called after initDOM(), resetPlayer(), and the tree-button
 * setup functions have run.
 */

import { D, infinityThreshold } from "../core/decimal.js";
import { gameState } from "../core/state.js";
import { abbrevNum, displayNames } from "../core/formatting.js";
import { upgrades } from "../config/upgrades.js";
import { skillUpgrades } from "../config/skill-tree.js";
import {
  infinityTreeUpgrades,
  infinityUpgradeNames,
  infinityUpgradeCosts,
} from "../config/infinity-tree.js";
import {
  dustSpawnDebounceTime,
  clickDebounceTime,
} from "../config/constants.js";
import { rebirth, getSkillPoints } from "./economy.js";
import { infinity } from "./economy.js";
import { saveData } from "./save.js";
import { applySettings } from "./loop.js";
import { updateAllText } from "./render.js";
import { redrawUpgradeLines } from "./trees.js";
import { awardAchievement } from "./achievements.js";
import { loadArea } from "./areas.js";

// Click debounce state (module-level closures for the handlers)
let clickDebounce = Date.now();
let dustSpawnDebounce = Date.now();

/**
 * Registers all DOM event listeners.
 */
export function setupEventListeners() {
  const elts = gameState.elts;
  const player = gameState.player;

  // --- Keyboard: prevent scrolling with Space / ArrowUp ---
  window.addEventListener("keydown", (e) => {
    if (e.key == " " || e.key == "ArrowUp") {
      e.preventDefault();
    }
  });

  // --- Minigame canvas toggles ---
  document.getElementById("geometryDashButton").addEventListener("click", () => {
    document.getElementById("gdCanvas").style.display = "block";
    document.getElementById("fbCanvas").style.display = "none";
  });

  document.getElementById("flappyBirdButton").addEventListener("click", () => {
    document.getElementById("fbCanvas").style.display = "block";
    document.getElementById("gdCanvas").style.display = "none";
  });

  // --- Global message box ---
  elts.globalMessageBox.onclick = function () {
    elts.globalMessageBox.classList.remove("showGlobal");
  };

  // --- Title screen ---
  elts.playButton.onclick = function () {
    elts.titleScreen.classList.add("fadeOut");
    elts.titleScreen.style.pointerEvents = "none";
    setTimeout(function () {
      elts.titleScreen.style.display = "none";
    }, 1000);
  };

  elts.changelogButton.onclick = function () {
    if (elts.changelogContainer.classList.contains("open")) {
      elts.changelogContainer.classList.remove("open");
    } else {
      elts.changelogContainer.classList.add("open");
      awardAchievement("Informed Voter");
    }
  };

  // --- Username popup ---
  elts.saveUsernameButton.onclick = function () {
    let inp = elts.usernamePopupInput.value;
    if (inp != "") player.username = elts.usernamePopupInput.value;
    elts.usernamePopup.style.display = "none";
  };

  elts.cancelUsernameButton.onclick = function () {
    elts.usernamePopup.style.display = "none";
  };

  // --- Rebirth buttons ---
  elts.rebirthButton1.onclick = function () {
    rebirth(1);
  };
  elts.rebirthButton2.onclick = function () {
    rebirth(2);
  };
  elts.rebirthButton3.onclick = function () {
    rebirth(4);
  };

  // --- Skill reset button ---
  elts.skillResetButton.onclick = function () {
    if (player.drywall.gte(D(10).pow(18))) {
      player.skillPoints = player.skillPoints.plus(getSkillPoints());
      player.drywall = D(0);
      player.drywallPS = D(0);
      player.drywallPC = D(1);
      player.rebirths = D(0);
    }
  };

  // --- Normal upgrade buttons ---
  for (let i = 0; i < upgrades.length; i += 1) {
    let upg = upgrades[i];
    let upgElt = elts.upgrades[i];
    upgElt.onclick = function () {
      if (Date.now() - clickDebounce >= clickDebounceTime) {
        clickDebounce = Date.now();
        if (player[upg.cost[1]].gte(upg.cost[0])) {
          player[upg.cost[1]] = player[upg.cost[1]].minus(upg.cost[0]);
          player[upg.reward[1]] = player[upg.reward[1]].plus(
            upg.reward[0]
              .times(player.boosts[upg.reward[1]].multiplier)
              .pow(player.boosts[upg.reward[1]].exponent),
          );
          if (
            player.skillUpgrades.includes("Full Circle I") &&
            upg.reward[1] == "drywallPS"
          ) {
            player.drywallPC = player.drywallPC.plus(
              upg.reward[0]
                .times(player.boosts[upg.reward[1]].multiplier)
                .pow(player.boosts[upg.reward[1]].exponent)
                .times(0.1),
            );
          }
        }
      }
    };
  }

  // --- Skill-tree upgrade buttons ---
  for (let i = 0; i < Object.keys(skillUpgrades).length; i += 1) {
    let upg = skillUpgrades[Object.keys(skillUpgrades)[i]];
    let upgElt = elts.skillUpgrades[Object.keys(skillUpgrades)[i]];
    upgElt.onclick = function () {
      if (upg.connects) {
        let connections = 0;
        for (let i = 0; i < Object.keys(player.skillUpgrades).length; i += 1) {
          if (upg.connects.includes(player.skillUpgrades[i])) {
            connections += 1;
          }
        }
        if (connections !== upg.connects.length) {
          return;
        }
      }
      if (player[upg.cost[1]].gte(upg.cost[0])) {
        if (!player.skillUpgrades.includes(Object.keys(skillUpgrades)[i])) {
          player[upg.cost[1]] = player[upg.cost[1]].minus(upg.cost[0]);
          player.skillUpgrades.push(Object.keys(skillUpgrades)[i]);
          redrawUpgradeLines();
        }
      }
    };
  }

  // --- Infinity reset button ---
  elts.infinityResetButton.onclick = () => {
    if (player.drywall.gte(infinityThreshold)) {
      infinity();
      updateAllText();
    }
  };

  // --- Infinity generator upgrade buttons ---
  for (let i = 0; i < elts.infinityUpgrades.length; i += 1) {
    let elt = elts.infinityUpgrades[i];
    let upgName = infinityUpgradeNames[i];
    let upgCost = infinityUpgradeCosts[upgName];
    elt.onclick = function () {
      let upgLevel = player.infinityUpgrades[upgName];
      if (player[upgCost[1]].gte(upgCost[0][upgLevel])) {
        player.infinityUpgrades[upgName] += 1;
        player[upgCost[1]] = player[upgCost[1]].minus(upgCost[0][upgLevel]);
      }
    };
  }

  // --- Infinity tree upgrade buttons ---
  for (let i = 0; i < Object.keys(infinityTreeUpgrades).length; i += 1) {
    let upgName = Object.keys(infinityTreeUpgrades)[i];
    let upg = infinityTreeUpgrades[upgName];
    let upgCost = upg.cost;
    let elt = elts.infinityTreeUpgrades[upgName];

    elt.onclick = function () {
      console.log(upgName);
      if (upg.connects) {
        let connections = 0;
        for (
          let i = 0;
          i < Object.keys(player.infinityTreeUpgrades).length;
          i += 1
        ) {
          if (upg.connects.includes(player.infinityTreeUpgrades[i])) {
            connections += 1;
          }
        }
        if (connections !== upg.connects.length) {
          return;
        }
      }
      if (
        player[upgCost[1]].gte(D(upgCost[0])) &&
        !player.infinityTreeUpgrades.includes(upgName)
      ) {
        player.infinityTreeUpgrades.push(upgName);
        player[upgCost[1]] = player[upgCost[1]].minus(D(upgCost[0]));
        console.log(upgCost[0]);
        elt.querySelector("h4").textContent = "Bought!";
        redrawUpgradeLines();

        if (upgName == "Break Infinity") {
          updateAllText();
        }
      }
    };
  }

  // --- Settings ---
  applySettings();

  elts.usernameSetting.value = player.username || player.mylbkey;
  elts.usernameSetting.onchange = function () {
    player.username = elts.usernameSetting.value;
  };

  elts.settingsButton.onclick = function () {
    elts.settings.style.display = "block";
  };

  elts.closeSettingsButton.onclick = function () {
    elts.settings.style.display = "none";
  };

  const settingNames = ["darkMode", "scientificNotation", "minimalParticles",
    "autoRebirth", "autoSkillTree", "autoInfinity", "resetStats"];

  for (let i = 0; i < settingNames.length; i += 1) {
    let sn = settingNames[i];
    let setting = document.getElementById(sn + "Setting");
    if (player.settings[sn]) {
      setting.checked = player.settings[sn];
    }
    setting.onchange = function () {
      player.settings[sn] = setting.checked;
      applySettings();
      saveData("DRYWALL", player);
    };
  }

  // --- Click for drywall + dust ---
  for (let i = 0; i < elts.areas.length; i += 1) {
    const bg = elts.areas[i].getElementsByClassName("areaBackground")[0];
    if (!bg) continue;

    const rect = bg.getBoundingClientRect();
    bg.onclick = function (e) {
      if (Date.now() - clickDebounce >= clickDebounceTime) {
        player.drywall = player.drywall.plus(
          D(player.drywallPC)
            .times(player.boosts.drywall.multiplier)
            .pow(player.boosts.drywall.exponent),
        );
        player.stats.clicks = player.stats.clicks.plus(1);
        clickDebounce = Date.now();
        if (dustSpawnDebounceTime === false) {
          for (let j = 0; j < (player.settings.minimalParticles ? 1 : 4); j++) {
            const dust = document.createElement("div");
            dust.className = "dust";
            const offsetX = (Math.random() - 0.5) * 50;
            const offsetY = (Math.random() - 0.5) * 20;
            dust.style.left = e.clientX - rect.left + offsetX + "px";
            dust.style.top = e.clientY - rect.top + offsetY + "px";
            bg.appendChild(dust);
            setTimeout(() => dust.remove(), 600);
          }
          return;
        }
      }

      if (dustSpawnDebounceTime) {
        if (Date.now() - dustSpawnDebounce >= dustSpawnDebounceTime) {
          dustSpawnDebounce = Date.now();
          for (let j = 0; j < (player.settings.minimalParticles ? 1 : 4); j++) {
            const dust = document.createElement("div");
            dust.className = "dust";
            const offsetX = (Math.random() - 0.5) * 50;
            const offsetY = (Math.random() - 0.5) * 20;
            dust.style.left = e.clientX - rect.left + offsetX + "px";
            dust.style.top = e.clientY - rect.top + offsetY + "px";
            bg.appendChild(dust);
            setTimeout(() => dust.remove(), 600);
          }
        }
      }
    };
  }

  // --- Area selectors ---
  for (let i = 0; i < elts.areaSelectors.length; i += 1) {
    elts.areaSelectors[i].onclick = function () {
      loadArea(i);
    };
  }

  // --- Canvas resize listener ---
  window.addEventListener("resize", function () {
    redrawUpgradeLines();
  });
  redrawUpgradeLines();
}
