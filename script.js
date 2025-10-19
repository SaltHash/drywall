// Settings
const upgrades = [
	{
		cost: [25, "drywall"],
		reward: [1, "drywallPC"]
	},
	{
		cost: [600, "drywall"],
		reward: [10, "drywallPC"]
	},
	{
		cost: [40000, "drywall"],
		reward: [250, "drywallPC"]
	},
	{
		cost: [50, "drywall"],
		reward: [10, "drywallPS"]
	},
	{
		cost: [35000, "drywall"],
		reward: [500, "drywallPS"]
	},
	{
		cost: [8 * (10 ** 6), "drywall"],
		reward: [80000, "drywallPS"]
	},
	{
		cost: [1 * (10 ** 9), "drywall"],
		reward: [2500, "drywallPC"]
	},
	{
		cost: [150 * (10 ** 15), "drywall"],
		reward: [300000, "drywallPC"]
	},
	{
		cost: [5 * (10 ** 24), "drywall"],
		reward: [15 * (10 ** 6), "drywallPC"]
	},
	{
		cost: [3.5 * (10 ** 12), "drywall"],
		reward: [3 * (10 ** 6), "drywallPS"]
	},
	{
		cost: [1.5 * (10 ** 21), "drywall"],
		reward: [120 * (10 ** 6), "drywallPS"]
	},
	{
		cost: [2.5 * (10 ** 27), "drywall"],
		reward: [3.5 * (10 ** 9), "drywallPS"]
	},
];
const skillUpgrades = [
	{
		cost: [1, "skilldrywall"],
		reward: [5, "drywallMultiplier"]
	},
	{
		cost: [1.5, "skilldrywall"],
		reward: [3, "drywallMultiplier"]
	},
	{
		cost: [2, "skilldrywall"],
		reward: [1.5, "skillMultiplier"]
	},
]
const displaySuffix = {
	drywall: " drywall",
	drywallPC: " drywall/click",
	drywallPS: " drywall/sec",
	rebirths: " rebirths",
	drywallMultiplier: " drywall",
	skillMultiplier: " Skill drywall",
	skilldrywall: " Skill drywall"
}
const displayPrefix = {
	drywall: "+",
	drywallPC: "+",
	drywallPS: "+",
	rebirths: "+",
	drywallMultiplier: "x",
	skillMultiplier: "x",
	skilldrywall: "x"
}
const suffixes = [
	"", "k", "m", "b", "t", "qa", "qn", "sx", "sp", "oc", "no", "de", "ude", "dde", "tde", "qade"
]
const areas = [
	"Area 1",
	"Area 2",
	"Skill Tree"
]

// Elements
let elts = {
	clickers: document.getElementsByClassName("clicker"),
	rebirthButton1: document.getElementById("rebirthButton1"),
	rebirthButton2: document.getElementById("rebirthButton2"),
	skillResetButton: document.getElementById("skillResetButton"),

	drywallStat: document.getElementById("drywallStat"),
	drywallPSStat: document.getElementById("drywallPSStat"),
	drywallPCStat: document.getElementById("drywallPCStat"),
	rebirthsStat: document.getElementById("rebirthsStat"),
	skilldrywallStat: document.getElementById("skilldrywallStat"),
	upgrades: [

	],
	skillUpgrades: [

	],
	areaSelectors: [

	],
	areas: [

	],
}
for (let i = 0; i < upgrades.length; i += 1) {
	elts.upgrades.push(document.getElementById("upgrade" + (i + 1)));
	elts.upgrades[i].innerHTML = displayPrefix[upgrades[i].reward[1]] + abbrevNum(upgrades[i].reward[0]) + displaySuffix[upgrades[i].reward[1]] + "<br>" + abbrevNum(upgrades[i].cost[0]) + " " + displaySuffix[upgrades[i].cost[1]];
}
for (let i = 0; i < skillUpgrades.length; i += 1) {
	elts.skillUpgrades.push(document.getElementsByClassName("skillUpgrade")[i]);
	elts.skillUpgrades[i].innerHTML = displayPrefix[skillUpgrades[i].reward[1]] + abbrevNum(skillUpgrades[i].reward[0]) + displaySuffix[skillUpgrades[i].reward[1]] + "<br>" + abbrevNum(skillUpgrades[i].cost[0]) + " " + displaySuffix[skillUpgrades[i].cost[1]];
}
for (let i = 0; i < areas.length; i += 1) {
	elts.areaSelectors.push(document.getElementById("area" + (i + 1) + "Selector"));
	elts.areas.push(document.getElementById("area" + (i + 1)));
	elts.areaSelectors[i].textContent = areas[i];
}

// Variables
let data = JSON.parse(localStorage.getItem("DRYWALL"));
let player;
if (data) {
	player = {
		drywall: data.drywall || 0,
		drywallPS: data.drywallPS || 0,
		drywallPC: data.drywallPC || 1,
		rebirths: data.rebirths || 0,
		skilldrywall: data.skilldrywall || 0,
		skillUpgrades: data.skillUpgrades || [],
		skillBoosts: {},
		boosts: {},
	}
} else {
	player = {
		drywall: 0,
		drywallPS: 0,
		drywallPC: 1,
		rebirths: 0,
		skilldrywall: 0,
		skillUpgrades: [],
		skillBoosts: {},
		boosts: {},
	}
}
checkSkillUpgrades();


// Setup
let lastSave = 0;
let lastUpdate = Date.now();
let myInterval = setInterval(tick, 0);


// Setup Click Events
for (let i = 0; i < elts.clickers.length; i += 1) {
	elts.clickers[i].onclick = function() {
		player.drywall += player.drywallPC * player.boosts.drywall * player.boosts.drywallPC;
	};
}
for (let i = 0; i < elts.areaSelectors.length; i += 1) {
	elts.areaSelectors[i].onclick = function() {
		loadArea(i);
	};
}

elts.rebirthButton1.onclick = function() {
	if (player.drywall >= 1000000 * (2 ** player.rebirths)) {
		player.drywall = 0;
		player.drywallPS = 0;
		player.drywallPC = 1;
		player.rebirths += 1;
	}
}
elts.rebirthButton2.onclick = function() {
	if (player.drywall >= 3 * 1000000 * (2 ** player.rebirths)) {
		player.drywall = 0;
		player.drywallPS = 0;
		player.drywallPC = 1;
		player.rebirths += 2;
	}
}
elts.skillResetButton.onclick = function() {
	if (player.drywall >= 10 ** 18) {
		player.skilldrywall += logBaseX(player.drywall / (10 ** 18) + 1, 15) + 1;
		player.drywall = 0;
		player.drywallPS = 0;
		player.drywallPC = 1;
		player.rebirths = 0;
	}
}

for (let i = 0; i < upgrades.length; i += 1) {
	let upg = upgrades[i];
	let upgElt = elts.upgrades[i];

	upgElt.onclick = function() {
		if (player[upg.cost[1]] >= upg.cost[0]) {
			player[upg.cost[1]] -= upg.cost[0];
			player[upg.reward[1]] += upg.reward[0];
		}
	}
}

for (let i = 0; i < skillUpgrades.length; i += 1) {
	let upg = skillUpgrades[i];
	let upgElt = elts.skillUpgrades[i];

	upgElt.onclick = function() {
		if (player[upg.cost[1]] >= upg.cost[0]) {
			if (!player.skillUpgrades.includes(i)) {
				player[upg.cost[1]] -= upg.cost[0];
				player.skillUpgrades.push(i);
			}
		}
	}
}

// Functions
function loadArea(area) {
	for (var i = 0; i < elts.areas.length; i += 1) {
		if (i == area) {
			elts.areas[i].style.display = "block";
		} else {
			elts.areas[i].style.display = "none";
		}
	}
}

function roundToSigFigs(num, sigFigs) {
	if (num === 0) return 0;
	const d = Math.ceil(Math.log10(Math.abs(num)));
	const power = sigFigs - d;
	const magnitude = Math.pow(10, power);
	return Math.round(num * magnitude) / magnitude;
}

function abbrevNum(val) {
	let exp = Math.floor(Math.log10(val) / 3);
	if (!(exp >= 0)) exp = 0;
	return roundToSigFigs(val / (10 ** (exp * 3)), 3) + suffixes[exp];
}

function tick() {
    let now = Date.now();
    let dt = now - lastUpdate;
    lastUpdate = now;

    update(dt);
    render(dt);
}

function calculateBoosts() {
	let boosts = {
		drywall: player.skillBoosts.drywallMultiplier,
		drywallPC: (2 ** player.rebirths),
		drywallPS: (2 ** player.rebirths),
		rebirths: 1,
		skillPoints: player.skillBoosts.skillMultiplier,
	}
}

function update(dt) {
	player.skillBoosts = checkSkillUpgrades();
	boosts = calculateBoosts();
	player.drywall += player.drywallPS * player.boosts.drywall * player.boosts.drywallPS * dt / 1000;

	saveData("DRYWALL", player);
}

function saveData(key, data) {
	const now = Date.now();
	if (now - lastSave > 1000) { // 1 second limit
		localStorage.setItem(key, JSON.stringify(data));
		lastSave = now;
	}
}

function checkSkillUpgrades() {
	let calc = {
		drywallMultiplier: 1,
		skillMultiplier: 1,
		resetTimeMultiplier: 1,
	};

	for (let i = 0; i < player.skillUpgrades.length; i += 1) {
		let skillUpgrade = player.skillUpgrades[i];
		if (skillUpgrades[skillUpgrade].reward[1] == "resetTimeMultiplier") {
			// To add
		} else {
			calc[skillUpgrades[skillUpgrade].reward[1]] += (skillUpgrades[skillUpgrade].reward[0] - 1);
		}
		elts.skillUpgrades[i].innerHTML = displayPrefix[skillUpgrades[i].reward[1]] + abbrevNum(skillUpgrades[i].reward[0]) + displaySuffix[skillUpgrades[i].reward[1]] + "<br>Bought.";
	}
	return calc;
}

function logBaseX(val, base) {
	return Math.log(val) / Math.log(base);
}

function render(dt) {
	elts.drywallStat.textContent = "Drywall: " + abbrevNum(player.drywall);
	elts.drywallPCStat.textContent = "Drywall/click: " + abbrevNum(player.drywallPC);
	elts.drywallPSStat.textContent = "Drywall/sec: " + abbrevNum(player.drywallPS);
	elts.rebirthsStat.textContent = abbrevNum(player.rebirths) + " rebirths (x" + abbrevNum(1.5 ** player.rebirths) + ")";
	elts.rebirthButton1.textContent = "Rebirth for " + abbrevNum((2 ** player.rebirths) * 1000000);
	elts.rebirthButton2.textContent = "Rebirth TWICE for " + abbrevNum((2 ** player.rebirths) * 1000000 * 3);
	if (player.drywall > 10 ** 18) {
		elts.skillResetButton.textContent = "Reset for +" + abbrevNum((logBaseX(player.drywall / (10 ** 18), 15) + 1) * player.boosts.skillBoost) + " skill drywall";
	} else {
		elts.skillResetButton.textContent = "Reach 1qn to reset";
	}
	elts.skilldrywallStat.textContent = "Skill drywall: " + abbrevNum(player.skilldrywall);
}