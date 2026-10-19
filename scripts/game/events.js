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
import { saveData, setUsernamePopupVisible, setRemovedPopupVisible, markRemovalNoticeSeen } from "./save.js";
import { applySettings } from "./loop.js";
import { updateAllText, render } from "./render.js";
import { checkBoosts } from "./boosts.js";
import { linkAccount, pushSaveToCloud } from "./sync.js";
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

  // --- Username setup popup ---
  // The rank-1 preview shows exactly how the name will read on the leaderboard.
  const setPopupNamePreview = function () {
    const name = elts.usernamePopupInput.value.trim();
    elts.usernamePreviewName.textContent = name || "your name";
    elts.usernamePreviewName.classList.toggle("placeholder", name === "");
  };

  const finishUsernameSetup = function (name) {
    player.usernameChosen = true;
    if (name) {
      player.username = name;
      player.leaderboardOptIn = true;
    } else {
      // Skipping keeps the player off the leaderboard until they opt in.
      player.username = null;
      player.leaderboardOptIn = false;
    }
    setUsernamePopupVisible(false);
    elts.usernameSetting.value = player.username || "";
    saveData("DRYWALL", player, true);
    // Persist the decision right away instead of waiting for the next sync.
    pushSaveToCloud();
    render();
  };

  elts.usernamePopupInput.addEventListener("input", function () {
    elts.usernamePopupInput.classList.toggle(
      "empty",
      elts.usernamePopupInput.value.trim() === "",
    );
    setPopupNamePreview();
  });

  elts.usernamePopupInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      elts.saveUsernameButton.click();
    }
  });

  elts.saveUsernameButton.onclick = function () {
    const name = elts.usernamePopupInput.value.trim();
    if (!name) {
      elts.usernamePopupInput.classList.add("empty");
      elts.usernamePopupInput.focus();
      return;
    }
    finishUsernameSetup(name);
  };

  elts.skipUsernameButton.onclick = function () {
    finishUsernameSetup(null);
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

  elts.usernameSetting.value = player.username || "";
  elts.usernameSetting.onchange = function () {
    player.username = elts.usernameSetting.value.trim() || null;
    saveData("DRYWALL", player, true);
    // Push the new display name promptly instead of waiting for the next sync.
    pushSaveToCloud();
  };

  elts.leaderboardToggleButton.onclick = function () {
    // A moderated account can never rejoin the leaderboard.
    if (gameState.leaderboardBanned) return;

    const optingIn = !player.leaderboardOptIn;
    // Opting out stays off the board but keeps the name for later; opting in
    // reveals the display-name entry beneath the button.
    player.leaderboardOptIn = optingIn;
    saveData("DRYWALL", player, true);
    pushSaveToCloud();
    // Repaint first so the entry is visible, then focus it.
    render();
    if (optingIn) {
      elts.usernameSetting.focus();
      elts.usernameSetting.select();
    }
  };

  // --- Secret key: view / copy / link another device ---
  elts.secretKeySetting.value = player.editKey;

  elts.viewSecretKeyButton.onclick = function () {
    const button = elts.viewSecretKeyButton;
    const isVisible = elts.secretKeySetting.type === "text";
    elts.secretKeySetting.type = isVisible ? "password" : "text";
    button.textContent = isVisible ? "View" : "Hide";
  };

  elts.copySecretKeyButton.onclick = async function () {
    const button = elts.copySecretKeyButton;
    try {
      await navigator.clipboard.writeText(player.editKey);
      button.textContent = "Copied!";
    } catch {
      // Clipboard access can be blocked; select the text so it can be copied.
      elts.secretKeySetting.select();
      button.textContent = "Press Ctrl+C";
    }
    setTimeout(() => {
      button.textContent = "Copy";
    }, 1500);
  };

  elts.linkDeviceButton.onclick = async function () {
    const status = elts.linkDeviceStatus;
    const secret = elts.linkDeviceInput.value.trim();

    if (!secret) {
      status.textContent = "Paste a secret key first.";
      return;
    }

    status.textContent = "Linking...";
    const result = await linkAccount(secret);

    if (result.ok) {
      status.textContent = "Linked! Cloud save loaded.";
      elts.usernameSetting.value = player.username || "";
      elts.secretKeySetting.value = player.editKey;
      elts.linkDeviceInput.value = "";
      // The linked profile already has a name; drop the setup prompt if open.
      setUsernamePopupVisible(false);
      checkBoosts();
      applySettings();
      updateAllText();
      render();
    } else if (result.reason === "not-found") {
      status.textContent = "No profile exists for that secret key.";
    } else if (result.reason === "offline") {
      status.textContent = "Couldn't reach the server. Try again later.";
    } else {
      status.textContent = "Couldn't link that key.";
    }
  };

  // Keep the secret key hidden again whenever settings are (re)opened.
  function hideSecretKey() {
    elts.secretKeySetting.type = "password";
    elts.viewSecretKeyButton.textContent = "View";
  }

  elts.settingsButton.onclick = function () {
    const isOpen = elts.settings.style.display === "block";
    if (!isOpen) hideSecretKey();
    elts.settings.style.display = isOpen ? "none" : "block";
  };

  elts.closeSettingsButton.onclick = function () {
    hideSecretKey();
    elts.settings.style.display = "none";
  };

  // --- Moderation notice ---
  if (elts.removedPopupDismiss) {
    elts.removedPopupDismiss.onclick = function () {
      setRemovedPopupVisible(false);
      markRemovalNoticeSeen();
    };
  }

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

  // --- Menu background dim slider (0-100%) ---
  if (elts.bgDimSetting) {
    elts.bgDimSetting.oninput = function () {
      player.settings.bgDim = Number(elts.bgDimSetting.value) || 0;
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

  // --- Username prompt state ---
  // reconcile() may have pulled a profile that already chose a name, so only
  // keep the prompt open when the player really hasn't decided yet.
  if (player.usernameChosen) {
    setUsernamePopupVisible(false);
  } else {
    setPopupNamePreview();
    elts.usernamePopupInput.focus();
  }
}
