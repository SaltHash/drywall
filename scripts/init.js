// Const for wrappers
const infinityThreshold = new Decimal(2).pow(1024);

// Wrappers
const D = (x) => {
  if (x instanceof Decimal) return x;

  if (typeof x !== "number" && typeof x !== "string") {
    return new Decimal(0);
  }

  if (x === Infinity || x === "Infinity") return infinityThreshold;
  if (x === -Infinity || x === "-Infinity") return new Decimal(0);

  const n = Number(x);
  if (!Number.isFinite(n)) return new Decimal(0);

  return new Decimal(n);
};

let elts = {
  clickers: document.getElementsByClassName("clicker"),
  infinityUpgrades: [
    ...document.getElementById("generatorUpgrades").children,
    ...document.getElementById("infinityPowerUpgrades").children,
  ],
  infinityTreeUpgrades: {},
  upgrades: [],
  skillUpgrades: [],
  areaSelectors: [],
  areas: [],
};
const areas = [
  ["Leaderboards", "leaderboardArea"],
  ["Achievements", "achievementsArea"],
  ["Home", "area1"],
  ["High-rise", "area2"],
  ["Luxury", "area3"],
  ["Bungalow", "area4"],
  ["Skill Tree", "skillTreeArea"],
  ["Infinity", "infinityArea"],
];
// create area selectors
for (let i = 0; i < areas.length; i += 1) {
  elts.areaSelectors.push(document.getElementById("areaSelector" + (i + 1)));
  elts.areas.push(document.getElementById(areas[i][1]));
  elts.areaSelectors[i].textContent = areas[i][0];
}
