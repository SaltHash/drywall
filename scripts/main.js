let player;
function mergeAndFix(template, saved) {
  if (typeof template !== "object" || template === null) return template;

  if (Array.isArray(template)) {
    if (!Array.isArray(saved)) saved = [];

    // Determine type hint from template[0] (could be Decimal, object, primitive)
    const typeHint = template[0];

    return saved.map((item) => {
      if (typeHint instanceof Decimal) return D(item);
      if (typeof typeHint === "object" && typeHint !== null)
        return mergeAndFix(typeHint, item);
      return item;
    });
  }

  const result = {};

  for (const key of Object.keys(template)) {
    const tempVal = template[key];
    const savedVal = saved && saved[key] !== undefined ? saved[key] : undefined;

    if (savedVal === undefined) {
      result[key] = tempVal;
    } else if (tempVal instanceof Decimal) {
      result[key] = D(savedVal);
    } else if (typeof tempVal === "object" && tempVal !== null) {
      result[key] = mergeAndFix(tempVal, savedVal);
    } else {
      result[key] = savedVal;
    }
  }

  return result;
}

function resetPlayer(clear = false) {
  let raw = {};
  if (!clear) {
    try {
      const stored = localStorage.getItem("DRYWALL");
      if (stored) raw = JSON.parse(stored);
    } catch (e) {
      console.error("Save file corrupted, resetting.", e);
      raw = {};
    }
  }

  player = mergeAndFix(playerTemplate, raw);
  player.username = raw.username || player.mylbkey;

  let noKeyYet = false;
  if (raw.editKey) noKeyYet = true;

  player.editKey =
    typeof raw.editKey === "string" && raw.editKey.length >= 24
      ? raw.editKey
      : generateEditKey();

  if ((player.username === player.mylbkey || noKeyYet) && elts.usernamePopup) {
    elts.usernamePopupEditKey.value = player.editKey;
    elts.usernamePopup.style.display = "block";
  }
}

let lastSave = 0;
let lastUpdate = Date.now();
let animationFrameHandle = null;

resetPlayer(false);

loadLeaderboard();
checkBoosts();

// add text to regular upgrades
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

// add text to skill tree upgrades
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

// add text to infinity tree upgrades
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

// setup click events
window.addEventListener("keydown", (e) => {
  if (e.key == " " || e.key == "ArrowUp") {
    e.preventDefault();
  }
});

document.getElementById("geometryDashButton").addEventListener("click", () => {
  document.getElementById("gdCanvas").style.display = "block";
  document.getElementById("fbCanvas").style.display = "none";
  updateMinigameLoopState();
});

document.getElementById("flappyBirdButton").addEventListener("click", () => {
  document.getElementById("fbCanvas").style.display = "block";
  document.getElementById("gdCanvas").style.display = "none";
  updateMinigameLoopState();
});

// msg box
elts.globalMessageBox.onclick = function () {
  console.log(true);
  elts.globalMessageBox.classList.remove("showGlobal");
};

// title screen
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

// popup
elts.saveUsernameButton.onclick = function () {
  let inp = elts.usernamePopupInput.value;
  if (inp != "") player.username = elts.usernamePopupInput.value;
  player.editKey = elts.usernamePopupEditKey.value || player.editKey;
  elts.usernameSetting.value = player.username;
  elts.editKeySetting.value = player.editKey;
  elts.usernamePopup.style.display = "none";
  saveData("DRYWALL", player);
};
elts.cancelUsernameButton.onclick = function () {
  elts.usernamePopup.style.display = "none";
};

// rebirth stuff
elts.rebirthButton1.onclick = function () {
  rebirth(1);
};
elts.rebirthButton2.onclick = function () {
  rebirth(2);
};
elts.rebirthButton3.onclick = function () {
  rebirth(4);
};

// skill reset button
elts.skillResetButton.onclick = function () {
  if (player.drywall.gte(D(10).pow(18))) {
    player.skillPoints = player.skillPoints.plus(getSkillPoints());
    player.drywall = D(0);
    player.drywallPS = D(0);
    player.drywallPC = D(1);
    player.rebirths = D(0);
  }
};

// normal upgrades
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

// infinity stuff
elts.infinityResetButton.onclick = () => {
  if (player.drywall.gte(infinityThreshold)) {
    infinity();
    updateAllText();
  }
};

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

// settings
applySettings();
usernameSetting.onchange = function () {
  player.username = usernameSetting.value;
};
elts.settingsButton.onclick = function () {
  elts.settings.style.display = "block";
};
elts.closeSettingsButton.onclick = function () {
  elts.settings.style.display = "none";
};

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
elts.usernameSetting.value = player.username || player.mylbkey;
elts.editKeySetting.value = player.editKey;
elts.usernamePopupEditKey.value = player.editKey;

function wireSecretField(input, toggleButton, copyButton) {
  toggleButton.onclick = function () {
    const reveal = input.type === "password";
    input.type = reveal ? "text" : "password";
    toggleButton.textContent = reveal ? "Hide" : "Show";
  };
  copyButton.onclick = async function () {
    try {
      await navigator.clipboard.writeText(input.value);
      copyButton.textContent = "Copied";
      setTimeout(() => {
        copyButton.textContent = "Copy";
      }, 1000);
    } catch (err) {
      console.warn("Clipboard write failed:", err);
    }
  };
}

wireSecretField(
  elts.usernamePopupEditKey,
  elts.togglePopupEditKeyButton,
  elts.copyPopupEditKeyButton,
);
wireSecretField(
  elts.editKeySetting,
  elts.toggleEditKeyButton,
  elts.copyEditKeyButton,
);

// Clicking for drywall + dust
let dustSpawnDebounce = Date.now();
let clickDebounce = Date.now();
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

          // random small horizontal spread
          const offsetX = (Math.random() - 0.5) * 50;
          // start slightly above the actual click
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

          // random small horizontal spread
          const offsetX = (Math.random() - 0.5) * 50;
          // start slightly above the actual click
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

// area selectors
for (let i = 0; i < elts.areaSelectors.length; i += 1) {
  elts.areaSelectors[i].onclick = function () {
    loadArea(i);
  };
}

// Functions
function formatMillis(ms) {
  let seconds = Math.floor(ms / 1000);
  const days = Math.floor(seconds / 86400);
  seconds %= 86400;
  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  const minutes = Math.floor(seconds / 60);
  seconds %= 60;

  const parts = [];
  if (days) parts.push(`${days}d`);
  if (hours || days) parts.push(`${hours}h`);
  if (minutes || hours || days) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);

  return parts.join(" ");
}

function formatTime(unixMs) {
  const date = new Date(unixMs);
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  if (hours === 0) hours = 12;

  // pad minutes and seconds with leading zero if needed
  const minStr = minutes.toString().padStart(2, "0");
  const secStr = seconds.toString().padStart(2, "0");

  return `${hours}:${minStr}:${secStr}${ampm}`;
}

function applySettings() {
  if (player.settings.darkMode) {
    document.querySelector("#area1 .areaBackground").classList.add("darkBG");
    document.querySelector("#area2 .areaBackground").classList.add("darkBG");
    document.querySelector("#area3 .areaBackground").classList.add("darkBG");
  } else {
    document.querySelector("#area1 .areaBackground").classList.remove("darkBG");
    document.querySelector("#area2 .areaBackground").classList.remove("darkBG");
    document.querySelector("#area3 .areaBackground").classList.remove("darkBG");
  }
  updateAllText();
}

function getInfinityPoints() {
  checkBoosts(true);

  let infinityBar = checkInfinityProgress();
  let ipMult = 1;
  if (player.infinityTreeUpgrades.includes("Break Infinity"))
    ipMult = D(10).pow(
      Math.max(0, infinityBar.iteration + infinityBar.progress),
    );
  return player.boosts.infinityPoints.multiplier
    .times(ipMult)
    .pow(player.boosts.infinityPoints.exponent)
    .times(
      player.boosts.infinities.multiplier.pow(
        player.boosts.infinities.exponent,
      ),
    );
}

function infinity() {
  checkBoosts(true);

  let infProg = checkInfinityProgress();

  let ipMult = 1;
  if (player.infinityTreeUpgrades.includes("Break Infinity"))
    ipMult = D(10).pow(Math.max(0, infProg.iteration - 1 + infProg.progress));

  player.infinities = player.infinities.plus(
    D(1)
      .times(player.boosts.infinities.multiplier)
      .pow(player.boosts.infinities.exponent),
  );
  player.infinityPoints = player.infinityPoints.plus(getInfinityPoints());

  player.drywall = D(0);
  player.drywallPC = D(1);
  player.drywallPS = D(0);
  player.rebirths = D(0);
  player.skillPoints = D(0);
  player.skillUpgrades = [];
  redrawUpgradeLines();

  elts.screenOverlay.classList.add("playFlash");
  setTimeout(function () {
    elts.screenOverlay.classList.remove("playFlash");
  }, 5000);
}

function updateAllText() {
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

function getRebirthCost(amt, rebirths = player.rebirths) {
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

function rebirth(amt) {
  let cost = getRebirthCost(amt);

  if (player.drywall.gte(cost)) {
    if (player.skillUpgrades.includes("Time-saver I")) {
      player.drywall = player.drywall.minus(cost);
      player.rebirths = player.rebirths.plus(amt);
    } else {
      player.drywall = D(0);
      player.drywallPS = D(0);
      player.drywallPC = D(1);
      player.rebirths = player.rebirths.plus(amt);
    }
  }
}

function getSkillPoints() {
  return D(player.drywall)
    .div(D(10).pow(18))
    .pow(D(0.1))
    .times(player.boosts.skillPoints.multiplier)
    .toNumber();
}

function loadArea(area) {
  for (var i = 0; i < elts.areas.length; i += 1) {
    if (i == area) {
      elts.areas[i].style.display = "block";
    } else {
      elts.areas[i].style.display = "none";
    }
  }

  if (area == 1) {
    updateAchievementGrid();
    updateAchievementImages();
  }
  updateMinigameLoopState();
}

function roundToSigFigs(num, sigFigs, padding = false) {
  num = D(num);
  if (num.eq(0)) return "0";

  const d = num.exponent + 1; // digits before decimal
  const power = sigFigs - d;

  const magnitude = D(10).pow(power);
  const rounded = num.mul(magnitude).round().div(magnitude);

  const decimals = Math.max(sigFigs - d, 0);

  let str = rounded.toFixed(decimals);

  if (!padding) {
    // extra zeroes
    str = str.replace(/(\.\d*?[1-9])0+$/, "$1");
    // remaining decimal point
    str = str.replace(/\.0*$|\.?$/, "");
  }

  return str;
}

function abbrevNum(val) {
  if (val instanceof Decimal) {
    if (
      val.gte(infinityThreshold) &&
      !player.infinityTreeUpgrades.includes("Break Infinity")
    ) {
      return "Infinity";
    }
  } else if (val === Infinity) {
    console.warn("Real infinity input into abbrevNum. This should not happen.");
    return "Infinity";
  }
  val = D(val);
  if (val.lt(1000)) return roundToSigFigs(val, 3);
  if (player.settings.scientificNotation || val.gte(D(10).pow(300))) {
    return roundToSigFigs(val.mantissa, 3) + "e" + val.exponent;
  } else {
    let exp = Math.floor(val.exponent / 3);
    if (!(exp >= 0)) exp = 0;
    return roundToSigFigs(val.div(D(10).pow(exp * 3)), 3) + suffixes[exp];
  }
}

function tick() {
  let now = Date.now();
  deltatime = now - lastUpdate;
  lastUpdate = now;

  update(deltatime);
  render(deltatime);
  animationFrameHandle = requestAnimationFrame(tick);
}
animationFrameHandle = requestAnimationFrame(tick);

// Boosts
function checkInfinityUpgrades(dontCall) {
  // math stuff
  let gameExp = D(0.6);
  let gameQuotient = D(10);
  let ipOneExp = 0.2;
  let ipTwoExp = 0.5;
  if (player.infinityTreeUpgrades.includes("IP Self-Boost II")) {
    ipOneExp = 0.3;
  }
  if (player.infinityTreeUpgrades.includes("IP Infinity Boost II")) {
    ipTwoExp = 0.8;
  }

  player.boosts.infinityPower.multiplier = D(player.infinities).div(100);
  player.boosts.infinityPower.multiplier =
    player.boosts.infinityPower.multiplier.times(
      D(10).pow(player.infinityUpgrades["Infinity Power I"]),
    );
  player.boosts.infinityPower.multiplier =
    player.boosts.infinityPower.multiplier.times(
      D(2).pow(player.infinityUpgrades["Infinity Power II"]),
    );

  player.boosts.drywall.multiplier = player.boosts.drywall.multiplier.times(
    D(3).pow(player.infinityUpgrades["Drywall I"]),
  );
  player.boosts.drywallPS.multiplier = player.boosts.drywallPS.multiplier.times(
    D(2).pow(player.infinityUpgrades["Drywall/sec I"]),
  );
  player.boosts.skillPoints.multiplier =
    player.boosts.skillPoints.multiplier.times(
      D(2).pow(player.infinityUpgrades["Skill Points I"]),
    );
  player.boosts.infinities.multiplier =
    player.boosts.infinities.multiplier.times(
      D(2).pow(player.infinityUpgrades["Infinities I"]),
    );

  // Boost path
  if (player.infinityTreeUpgrades.includes("Everything Boost I")) {
    player.boosts.drywall.multiplier =
      player.boosts.drywall.multiplier.times(3);
    player.boosts.drywallPS.multiplier =
      player.boosts.drywallPS.multiplier.times(3);
    player.boosts.drywallPC.multiplier =
      player.boosts.drywallPC.multiplier.times(3);
    player.boosts.skillPoints.multiplier =
      player.boosts.skillPoints.multiplier.times(3);
  }
  if (player.infinityTreeUpgrades.includes("Everything Boost II")) {
    player.boosts.drywall.multiplier =
      player.boosts.drywall.multiplier.times(25);
    player.boosts.infinityPoints.multiplier =
      player.boosts.infinityPoints.multiplier.times(2);
  }
  if (player.infinityTreeUpgrades.includes("Everything Boost III")) {
    player.boosts.drywall.multiplier =
      player.boosts.drywall.multiplier.times(2);
    player.boosts.drywallPS.multiplier =
      player.boosts.drywallPS.multiplier.times(2);
    player.boosts.drywallPC.multiplier =
      player.boosts.drywallPC.multiplier.times(2);
    player.boosts.skillPoints.multiplier =
      player.boosts.skillPoints.multiplier.times(2);
    player.boosts.infinityPoints.multiplier =
      player.boosts.infinityPoints.multiplier.times(2);
  }
  if (player.infinityTreeUpgrades.includes("IP Boost I")) {
    player.boosts.infinityPoints.multiplier =
      player.boosts.infinityPoints.multiplier.times(2);
    player.boosts.infinityPower.multiplier =
      player.boosts.infinityPower.multiplier.times(3);
  }
  if (player.infinityTreeUpgrades.includes("IP Boost II")) {
    player.boosts.infinityPoints.multiplier =
      player.boosts.infinityPoints.multiplier.times(2);
    player.boosts.infinityPower.exponent *= 1.05;
  }
  if (player.infinityTreeUpgrades.includes("IP Boost III")) {
    player.boosts.infinityPoints.multiplier =
      player.boosts.infinityPoints.multiplier.times(2);
    player.boosts.infinityPower.exponent *= 1.02;
  }
  if (player.infinityTreeUpgrades.includes("IP Boost IV")) {
    player.boosts.infinityPoints.multiplier =
      player.boosts.infinityPoints.multiplier.times(3);
    player.boosts.infinityPower.exponent *= 1.02;
  }
  if (player.infinityTreeUpgrades.includes("IP Boost V")) {
    player.boosts.infinityPoints.multiplier =
      player.boosts.infinityPoints.multiplier.times(2);
    player.boosts.infinityPower.exponent *= 1.1;
  }
  if (player.infinityTreeUpgrades.includes("IP Self-Boost I")) {
    const mult = D(player.infinityPower).div(1000000).pow(ipOneExp).max(1);
    player.boosts.infinityPower.multiplier =
      player.boosts.infinityPower.multiplier.times(mult);

    const upgName = "IP Self-Boost I";
    let upgElt = elts.infinityTreeUpgrades[upgName];
    if (upgElt) {
      upgElt = upgElt.querySelector("p");
      upgElt.textContent =
        infinityTreeUpgrades[upgName].reward +
        " (x" +
        abbrevNum(mult.toNumber()) +
        ")";
    }
  }
  if (player.infinityTreeUpgrades.includes("IP Infinity Boost I")) {
    const mult = D(player.infinities).div(2).pow(ipTwoExp).max(1);
    player.boosts.infinityPoints.multiplier =
      player.boosts.infinityPoints.multiplier.times(mult);

    const upgName = "IP Infinity Boost I";
    let upgElt = elts.infinityTreeUpgrades[upgName];
    if (upgElt) {
      upgElt = upgElt.querySelector("p");
      upgElt.textContent =
        infinityTreeUpgrades[upgName].reward +
        " (x" +
        abbrevNum(mult.toNumber()) +
        ")";
    }
  }

  player.boosts.minigames.exponent = 0.6;
  if (player.infinityTreeUpgrades.includes("Gamer II"))
    player.boosts.minigames.multiplier =
      player.boosts.minigames.multiplier.times(2);
  if (player.infinityTreeUpgrades.includes("Gamer III"))
    player.boosts.minigames.multiplier =
      player.boosts.minigames.multiplier.times(2);
  if (player.infinityTreeUpgrades.includes("Gamer IV"))
    player.boosts.minigames.exponent = 1;
  if (player.infinityTreeUpgrades.includes("Gamer V"))
    player.boosts.minigames.multiplier =
      player.boosts.minigames.multiplier.times(1.5);
  if (player.infinityTreeUpgrades.includes("Gamer VI"))
    player.boosts.minigames.multiplier =
      player.boosts.minigames.multiplier.times(2);
  if (player.infinityTreeUpgrades.includes("Gamer VII"))
    player.boosts.minigames.exponent = 1.4;

  if (player.infinityTreeUpgrades.includes("Gamer I")) {
    elts.gameDiv.style.display = "block";

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

    player.boosts.infinities.multiplier =
      player.boosts.infinities.multiplier.times(infBoost);
    player.boosts.infinityPoints.multiplier =
      player.boosts.infinityPoints.multiplier.times(ipBoost);

    elts.minigameInfinityBonus.textContent =
      "x" +
      abbrevNum(infBoost.toNumber()) +
      " Infinities (from " +
      player.minigames.geometryDash.stars +
      " stars)";
    elts.minigameIPBonus.textContent =
      "x" +
      abbrevNum(ipBoost.toNumber()) +
      " Infinity Points (from " +
      player.minigames.flappyBird.best +
      " score)";
  } else {
    elts.gameDiv.style.display = "none";
  }

  // Automation path
  if (player.infinityTreeUpgrades.includes("Automation I")) {
    player.boosts.skillPoints.multiplier =
      player.boosts.skillPoints.multiplier.times(2);
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

function checkAchievementBoosts() {
  for (let i of player.achievements) {
    let reward = achievements[i].reward;
    if (reward) {
      player.boosts[reward.type].multiplier = player.boosts[
        reward.type
      ].multiplier.times(reward.amount);
    }
  }
}

function checkBoosts(dontCall) {
  // Reset
  for (var i = 0; i < Object.keys(player).length; i += 1) {
    player.boosts[Object.keys(player)[i]] = { multiplier: D(1), exponent: 1 };
    player.passive[Object.keys(player)[i]] = 0;
  }

  checkInfinityUpgrades(dontCall);
  checkAchievementBoosts();

  player.boosts.skillPoints.multiplier =
    player.boosts.skillPoints.multiplier.times(
      D(player.achievements.length).div(100).plus(1),
    );

  // Check upgrades which boost other upgrades
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

  // Calculate their boosts
  for (let i = 0; i < player.skillUpgrades.length; i += 1) {
    let skillUpg = skillUpgrades[player.skillUpgrades[i]];

    if (typeof skillUpg.reward == "string") {
      if (player.skillUpgrades[i] == "Conversion I") {
        let boost = D(player.drywallPC).pow(convExp);
        player.boosts.drywallPS.multiplier =
          player.boosts.drywallPS.multiplier.times(boost);
      } else if (player.skillUpgrades[i] == "Arthritis IV") {
        let boost = D(player.skillPoints).div(arthritisDen).pow(arthritisExp);
        player.boosts.drywallPC.multiplier =
          player.boosts.drywallPC.multiplier.times(boost);
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
  player.boosts.drywall.multiplier =
    player.boosts.drywall.multiplier.times(rebirthBoost);
}

function saveData(key, data) {
  const now = Date.now();
  if (now - lastSave > 1000) {
    // 1 second limit
    try {
      localStorage.setItem(key, JSON.stringify(data));
      lastSave = now;
    } catch (e) {
      console.warn("Unable to save data (storage might be full):", e);
    }
  }
}

function updateAchievementGrid(init) {
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

      if (player.achievements.includes(key)) {
        box.style.backgroundImage = `url("assets/icons/${file}.png")`;
      } else {
        box.style.backgroundImage = "url(assets/icons/sillhouette.png)";
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

function updateAchievementImages() {
  const count = Object.keys(achievements).length;
  const container = document.getElementById("achievementsContainer");
  const children = container.children;

  for (let i = 0; i < count; i++) {
    const box = children[i];
    if (!box) continue;
    const key = Object.keys(achievements)[i];
    const file = encodeURIComponent(key);

    if (player.achievements.includes(key)) {
      box.style.backgroundImage = `url("assets/icons/${file}.png")`;
    } else {
      box.style.backgroundImage = "url(assets/icons/sillhouette.png)";
    }
  }

  elts.achievementsTitle.textContent =
    "Achievements (" + player.achievements.length + "/" + count + ")";
  elts.achievementsBoost.textContent =
    "These achievements give a boost of +" +
    player.achievements.length +
    "% skill points.";
}

let grid;
grid = updateAchievementGrid(true);

setInterval(function () {
  if (elts.achievementsArea.style.display === "block") {
    grid = updateAchievementGrid(false);
    updateAchievementImages();
  }
}, 2000);

const container = document.getElementById("achievementsContainer");
const children = container.children;
const keys = Object.keys(achievements);

setTimeout(function () {
  for (let i = 0; i < children.length && i < keys.length; i++) {
    const box = children[i];
    const key = keys[i];
    const a = achievements[key];

    box.addEventListener("mouseover", function () {
      elts.achievementHover.style.display = "block";
      const rect = box.getBoundingClientRect();
      let top = rect.top + grid.bestSize;
      if (top > window.innerHeight - 200) {
        top -= 200 + grid.bestSize;
      } else {
        console.log(top, window.innerHeight);
      }

      elts.achievementHover.style.left = rect.left - grid.bestSize + "px";
      elts.achievementHover.style.top = top + "px";
      elts.achievementHoverName.textContent = key;
      if (player.achievements.includes(key)) {
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

      console.log("hovered", key);
    });
    box.addEventListener("mouseleave", function () {
      elts.achievementHover.style.display = "none";
    });
  }
}, 750);

function updateSkillTreeElements() {
  // Calculate boost vals
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

  // Update upgrade HTMLs
  const upgradeKeys = Object.keys(skillUpgrades);
  let skillConnections = getConnections(skillUpgrades, player.skillUpgrades);

  for (let i = 0; i < upgradeKeys.length; i += 1) {
    let upgName = upgradeKeys[i];
    let skillUpg = skillUpgrades[upgName];
    let skillUpgElt = elts.skillUpgrades[upgName];

    let skillUpgUnlocked = true;

    // Check for connection requirements
    if (skillUpg.connects) {
      skillUpgUnlocked = skillUpg.connects.every((item) =>
        player.skillUpgrades.includes(item),
      );
    }

    if (player.skillUpgrades.includes(upgName)) {
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
            abbrevNum(
              D(player.skillPoints).div(arthritisDen).pow(arthritisExp),
            ) +
            ")";
        } else if (upgName === "Self-boost I") {
          skillUpgElt.innerHTML =
            skillUpg.reward +
            "<br><br>Bought. (^" +
            abbrevNum(
              Math.min(1.15, D(player.drywall).plus(1).pow(selfBoostExp)),
            ) +
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
      if (
        skillConnections[upgName].visible ||
        upgName == "Drywall Efficiency I"
      ) {
        if (skillUpgUnlocked) {
          skillUpgElt.classList.add("unlocked");
          skillUpgElt.classList.remove("branch");
          skillUpgElt.classList.remove("bought");
          skillUpgElt.classList.remove("hidden");
          if (
            typeof skillUpgrades[Object.keys(skillUpgrades)[i]].reward ==
            "string"
          ) {
            skillUpgElt.innerHTML =
              skillUpg.reward +
              "<br><br>" +
              abbrevNum(skillUpg.cost[0]) +
              displayNames[skillUpg.cost[1]];
          } else {
            if (skillUpg.reward.length == 2) {
              skillUpgElt.innerHTML =
                "x" +
                abbrevNum(skillUpg.reward[0]) +
                displayNames[skillUpg.reward[1]] +
                "<br><br>" +
                abbrevNum(skillUpg.cost[0]) +
                displayNames[skillUpg.cost[1]];
            } else {
              skillUpgElt.innerHTML =
                "^" +
                abbrevNum(skillUpg.reward[0]) +
                displayNames[skillUpg.reward[1]] +
                "<br><br>" +
                abbrevNum(skillUpg.cost[0]) +
                displayNames[skillUpg.cost[1]];
            }
          }
        } else {
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
        skillUpgElt.classList.remove("unlocked");
        skillUpgElt.classList.remove("branch");
        skillUpgElt.classList.remove("bought");
        skillUpgElt.classList.add("hidden");
      }
    }
  }
}

function updateInfinityTreeElements() {
  // Calculate boost vals

  // Update upgrade HTMLs
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

    // Check for connection requirements
    if (infinityUpg.connects) {
      infinityUpgUnlocked = infinityUpg.connects.every((item) =>
        player.infinityTreeUpgrades.includes(item),
      );
    }

    nameElt.textContent = upgName;

    if (player.infinityTreeUpgrades.includes(upgName)) {
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
          infinityUpgElt.classList.add("unlocked");
          infinityUpgElt.classList.remove("branch");
          infinityUpgElt.classList.remove("bought");
          infinityUpgElt.classList.remove("hidden");
          descriptionElt.textContent = infinityUpg.reward;
        } else {
          descriptionElt.textContent = "???";
          infinityUpgElt.classList.remove("unlocked");
          infinityUpgElt.classList.add("branch");
          infinityUpgElt.classList.remove("bought");
          infinityUpgElt.classList.remove("hidden");
        }
      } else {
        infinityUpgElt.classList.remove("unlocked");
        infinityUpgElt.classList.remove("branch");
        infinityUpgElt.classList.remove("bought");
        infinityUpgElt.classList.add("hidden");
      }
    }
  }
}

function logBaseX(val, base) {
  return Math.log(val) / Math.log(base);
}

function getConnections(skills, boughtUpgrades) {
  const updated = {};

  // copy data + add connectsTo + visible (default false)
  for (const [name, data] of Object.entries(skills)) {
    updated[name] = { ...data, connectsTo: [], visible: false };
  }

  // build reverse connections
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

  // helper to get all direct connections (both directions)
  function getNeighbors(name) {
    const data = updated[name];
    if (!data) return [];
    return [
      ...(Array.isArray(data.connects) ? data.connects : []),
      ...data.connectsTo,
    ];
  }

  // determine visibility
  for (const name of Object.keys(updated)) {
    // 1. bought
    if (bought.has(name)) {
      updated[name].visible = true;
      continue;
    }

    const neighbors = getNeighbors(name);

    // 2. connected to a bought upgrade
    if (neighbors.some((n) => bought.has(n))) {
      updated[name].visible = true;
      continue;
    }

    // 3. connected to an upgrade which is connected to a bought upgrade
    if (neighbors.some((n) => getNeighbors(n).some((nn) => bought.has(nn)))) {
      updated[name].visible = true;
    }
  }

  return updated;
}

function drawLinesFromUpgrade(upgrade) {
  let skills = getConnections(skillUpgrades, player.skillUpgrades);
  let thisUpgrade = skills[upgrade];
  if (!thisUpgrade) return;

  for (let i of thisUpgrade.connectsTo) {
    let connection = skills[i];
    if (!connection || !connection.visible) continue;

    ctx.beginPath();
    ctx.strokeStyle = "#dddddda0";
    ctx.lineWidth = 4;

    ctx.moveTo(thisUpgrade.x + window.innerWidth / 2, thisUpgrade.y + 650);
    ctx.lineTo(connection.x + window.innerWidth / 2, connection.y + 650);
    ctx.stroke();

    drawLinesFromUpgrade(i);
  }
}

let drawnFromInfinities = [];
function drawLinesFromInfinityUpgrade(upgrade) {
  if (upgrade == "Automation I") {
    drawnFromInfinities = [];
  }

  if (!drawnFromInfinities.includes(upgrade)) {
    let upgs = getConnections(
      infinityTreeUpgrades,
      player.infinityTreeUpgrades,
    );
    let thisUpgrade = upgs[upgrade];
    if (!thisUpgrade) return;

    drawnFromInfinities.push(upgrade);

    for (let i of thisUpgrade.connectsTo) {
      let connection = upgs[i];
      if (!connection || !connection.visible) continue;

      ctx2.beginPath();
      ctx2.strokeStyle = "#dddddda0";
      ctx2.lineWidth = 4;

      ctx2.moveTo(thisUpgrade.x + 1500 / 2, thisUpgrade.y);
      ctx2.lineTo(connection.x + 1500 / 2, connection.y);
      ctx2.stroke();

      drawLinesFromInfinityUpgrade(i);
    }
  }
}

// achievement stuff

let achievementQueue = [];
function checkAllAchievements(toBeShown) {
  let names = Object.keys(achievements);
  let list = [];
  for (let name of names) {
    let achievement = achievements[name];

    if (achievement.requirement) {
      let playerAmt = player;
      for (let i of achievement.requirement.type) {
        playerAmt = playerAmt[i];
      }
      if (D(playerAmt).gte(achievement.requirement.amount)) {
        list.push(name);
        if (toBeShown) {
          awardAchievement(name);
        }
      }
    } else if (name == "Beta Tester") {
      awardAchievement("Beta Tester");
    } else if (name == "Infinity Tree Completionist") {
      if (
        player.infinityTreeUpgrades.length ===
        Object.keys(infinityTreeUpgrades).length
      ) {
        awardAchievement("Infinity Tree Completionist");
      }
    }
  }

  return list;
}

function awardAchievement(name) {
  if (!player.achievements.includes(name)) {
    player.achievements.push(name);
    console.log("Awarded the '" + name + "' achievement");
    achievementQueue.push(name);
    if (achievementQueue.length === 1) {
      showAchievement(name);
    }
  } else {
    return false;
  }
}

function showAchievement(name) {
  let a = achievements[name];
  console.log("Showing " + name + ", Tier: " + a.tier);
  elts.achievementNotification.classList.add("popout");

  elts.achievementName.innerHTML = name;
  elts.achievementDescription.innerHTML = a.description;
  elts.achievementIcon.src = "assets/icons/" + name + ".png";

  if (a.tier == 1) {
    elts.achievementIcon.style.filter = "drop-shadow(0px 0px 8px #ffffffa0)";
  } else if (a.tier == 2) {
    elts.achievementIcon.style.filter = "drop-shadow(0px 0px 8px #88ffaaa0)";
  } else if (a.tier == 3) {
    elts.achievementIcon.style.filter = "drop-shadow(0px 0px 8px #88aaffa0)";
  } else if (a.tier == 4) {
    elts.achievementIcon.style.filter = "drop-shadow(0px 0px 8px #ffdd88a0)";
  } else if (a.tier == 5) {
    elts.achievementIcon.style.filter = "drop-shadow(0px 0px 8px #ff7788a0)";
  }

  if (a.reward) {
    elts.achievementReward.innerHTML =
      "x" + a.reward.amount + displayNames[a.reward.type];
  } else {
    elts.achievementReward.innerHTML = "";
  }

  setTimeout(function () {
    elts.achievementNotification.classList.remove("popout");

    setTimeout(function () {
      achievementQueue.splice(0, 1);
      if (achievementQueue.length > 0) {
        showAchievement(achievementQueue[0]);
      }
    }, 500);
  }, 4000);
}

function updateMinigameStats() {
  player.minigames.geometryDash.stars = 0;
  for (let i of player.minigames.geometryDash.completions) {
    player.minigames.geometryDash.stars += levelStars[i];
  }
}

function checkInfinityProgress() {
  const intervalSize = 100;
  let iteration = Math.ceil(
    Math.max(0, player.drywall.exponent - 400) / intervalSize,
  );
  let req = 400 + intervalSize * iteration;
  let oldReq = iteration === 0 ? 308 : 400 + intervalSize * (iteration - 1);
  let prog = (D(player.drywall).log10() - oldReq) / (req - oldReq);
  return { iteration: iteration, progress: prog };
}

function update(dt) {
  if (elts.infinityArea.style.display === "block") {
    updateMinigameStats();
  }
  checkBoosts();

  player.drywall = player.drywall.plus(
    D(player.drywallPS)
      .times(player.boosts.drywall.multiplier)
      .pow(player.boosts.drywall.exponent)
      .times(dt)
      .div(1000),
  );

  if (
    player.skillUpgrades.includes("Time-saver II") &&
    player.settings.autoRebirth
  ) {
    rebirth(9);
    rebirth(1);
  }

  checkAllAchievements(true);
  player.infinityPower = D(player.infinityPower).plus(
    D(player.boosts.infinityPower.multiplier)
      .pow(player.boosts.infinityPower.exponent)
      .times(dt)
      .div(1000),
  );
  if (D(player.passive.skillPoints) !== D(0)) {
    player.skillPoints = D(player.skillPoints).plus(
      D(getSkillPoints()).times(player.passive.skillPoints).times(dt).div(1000),
    );
  }
  player.stats.playtime = player.stats.playtime.plus(dt);

  if (Date.now() - lastLeaderboardUpdate >= 60000) {
    saveDataToLeaderboard();
    lastLeaderboardUpdate = Date.now();
  }

  if (player.settings.resetStats) {
    player.drywall = D(0);
    player.drywallPC = D(1);
    player.drywallPS = D(0);
  }

  saveData("DRYWALL", player);
}

function getStatText(name, multiplier) {
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

function redrawUpgradeLines() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
  drawLinesFromUpgrade("Drywall Efficiency I");
  drawLinesFromInfinityUpgrade("Automation I");
  drawLinesFromInfinityUpgrade("Everything Boost I");
}

window.addEventListener("resize", function () {
  redrawUpgradeLines();
});
redrawUpgradeLines();

function checkAreaUnlocks() {
  if (player.drywall.gte(D(10).pow(6))) {
    if (!player.areasUnlocked.includes("High-rise"))
      player.areasUnlocked.push("High-rise");
  }
  if (player.drywall.gte(D(10).pow(45))) {
    if (!player.areasUnlocked.includes("Luxury"))
      player.areasUnlocked.push("Luxury");
  }
  if (player.infinityTreeUpgrades.includes("Break Infinity")) {
    if (!player.areasUnlocked.includes("Bungalow"))
      player.areasUnlocked.push("Bungalow");
  }
  if (player.drywall.gte(D(10).pow(15))) {
    if (!player.areasUnlocked.includes("Skill Tree"))
      player.areasUnlocked.push("Skill Tree");
  }
  if (player.drywall.gte(D(10).pow(300)) || player.infinities.gte(1)) {
    if (!player.areasUnlocked.includes("Infinity"))
      player.areasUnlocked.push("Infinity");
  }
}

function render(dt) {
  // stats
  elts.drywallStat.textContent = "Drywall: " + getStatText("drywall", true);
  elts.drywallPCStat.textContent =
    "Drywall/click: " + getStatText("drywallPC", true);
  elts.drywallPSStat.textContent =
    "Drywall/sec: " + getStatText("drywallPS", true);
  elts.rebirthsStat.textContent = abbrevNum(D(player.rebirths)) + " rebirths";
  elts.skillPointsStat.textContent =
    "Skill Points: " + getStatText("skillPoints", true);
  elts.infinityPointsStat.textContent =
    "Infinity Points: " + getStatText("infinityPoints", true);
  elts.infinityPowerStat.textContent =
    "Infinity Power: " + getStatText("infinityPower", true);
  elts.infinityStat.textContent =
    "Infinities: " + getStatText("infinities", true);
  elts.clicksStat.textContent = "Clicks: " + abbrevNum(player.stats.clicks);
  elts.playtimeStat.textContent =
    "Playtime: " + formatMillis(player.stats.playtime);

  // break infinity bar
  let infinityBar = checkInfinityProgress();

  elts.breakInfinityLabel.textContent =
    roundToSigFigs(infinityBar.progress * 100, 3, true) +
    "% to x10 infinity points";
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

  // infinity upgrades
  for (let i = 0; i < elts.infinityUpgrades.length; i += 1) {
    let upg = elts.infinityUpgrades[i];
    let upgCost = infinityUpgradeCosts[infinityUpgradeNames[i]];

    if (player.infinityUpgrades[infinityUpgradeNames[i]] < upgCost[0].length) {
      upg.children[1].textContent =
        abbrevNum(
          upgCost[0][player.infinityUpgrades[infinityUpgradeNames[i]]],
        ) + displayNames[upgCost[1]];
    } else {
      upg.children[1].textContent = "Max level!";
    }
  }

  checkAreaUnlocks();
  if (player.areasUnlocked.includes("High-rise")) {
    if (elts.areaSelectors[3].style.display == "none") {
      elts.areaSelectors[3].classList.add("flashAreaSelector");
    }
    elts.areaSelectors[3].style.display = "inline-block";
  } else {
    elts.areaSelectors[3].style.display = "none";
  }
  if (player.areasUnlocked.includes("Luxury")) {
    if (elts.areaSelectors[4].style.display == "none") {
      elts.areaSelectors[4].classList.add("flashAreaSelector");
    }
    elts.areaSelectors[4].style.display = "inline-block";
  } else {
    elts.areaSelectors[4].style.display = "none";
  }
  if (player.areasUnlocked.includes("Bungalow")) {
    if (elts.areaSelectors[5].style.display == "none") {
      elts.areaSelectors[5].classList.add("flashAreaSelector");
    }
    elts.areaSelectors[5].style.display = "inline-block";
  } else {
    elts.areaSelectors[5].style.display = "none";
  }
  if (player.areasUnlocked.includes("Skill Tree")) {
    if (elts.areaSelectors[6].style.display == "none") {
      elts.areaSelectors[6].classList.add("flashAreaSelector");
    }
    elts.areaSelectors[6].style.display = "inline-block";
  } else {
    elts.areaSelectors[6].style.display = "none";
  }
  if (player.areasUnlocked.includes("Infinity")) {
    if (elts.areaSelectors[7].style.display == "none") {
      elts.areaSelectors[7].classList.add("flashAreaSelector");
    }
    elts.areaSelectors[7].style.display = "inline-block";
  } else {
    elts.areaSelectors[7].style.display = "none";
  }

  // rebirth buttons
  elts.rebirthButton1.textContent =
    "Rebirth for " + abbrevNum(getRebirthCost(1));
  elts.rebirthButton2.textContent =
    "Rebirth TWICE for " + abbrevNum(getRebirthCost(2));
  elts.rebirthButton3.textContent =
    "Rebirth FOUR TIMES for " + abbrevNum(getRebirthCost(4));

  // skill reset button
  if (D(player.drywall).gte(D(10).pow(18))) {
    elts.skillResetButton.textContent =
      "Reset for +" + abbrevNum(getSkillPoints()) + " skill points";
  } else {
    elts.skillResetButton.textContent = "Reach 1qn to reset";
  }

  // setting automation show/hide
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
    elts.autoSkillTreeSetting.parentElement.parentElement.style.display =
      "none";
  }

  // leaderboards
  elts.leaderboard.querySelector("p").innerHTML = getLeaderboardText("drywall");

  // draw upgrade trees
  if (elts.skillTreeArea.style.display === "block") {
    updateSkillTreeElements();
  }
  if (elts.infinityArea.style.display === "block") {
    updateInfinityTreeElements();
  }
}

function updateMinigameLoopState() {
  const inInfinityArea = elts.infinityArea.style.display === "block";
  const gdCanvas = document.getElementById("gdCanvas");
  const fbCanvas = document.getElementById("fbCanvas");
  const gdShown =
    inInfinityArea && gdCanvas && gdCanvas.style.display !== "none";
  const fbShown =
    inInfinityArea && fbCanvas && fbCanvas.style.display !== "none";

  if (
    typeof window.loop === "function" &&
    typeof window.noLoop === "function"
  ) {
    if (gdShown) window.loop();
    else window.noLoop();
  }

  if (window.flappyBirdInstance) {
    if (fbShown) window.flappyBirdInstance.loop();
    else window.flappyBirdInstance.noLoop();
  }
}
updateMinigameLoopState();
