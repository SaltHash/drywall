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
		reward: [8000, "drywallPC"]
	},
	{
		cost: [150 * (10 ** 15), "drywall"],
		reward: [350000, "drywallPC"]
	},
	{
		cost: [5 * (10 ** 24), "drywall"],
		reward: [80 * (10 ** 6), "drywallPC"]
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
		reward: [35 * (10 ** 9), "drywallPS"]
	},
	{
		cost: [10 * (10 ** 45), "drywall"],
		reward: [80 * (10 ** 9), "drywallPC"]
	},
	{
		cost: [150 * (10 ** 75), "drywall"],
		reward: [3.5 * (10 ** 12), "drywallPC"]
	},
	{
		cost: [5 * (10 ** 93), "drywall"],
		reward: [30 * (10 ** 15), "drywallPC"]
	},
	{
		cost: [2.5 * (10 ** 54), "drywall"],
		reward: [15 * (10 ** 12), "drywallPS"]
	},
	{
		cost: [1.5 * (10 ** 84), "drywall"],
		reward: [50 * (10 ** 15), "drywallPS"]
	},
	{
		cost: [2.5 * (10 ** 105), "drywall"],
		reward: [85 * (10 ** 18), "drywallPS"]
	},
];
const skillUpgrades = {
	"Drywall Efficiency I": {
		cost: [1, "skillPoints"],
		reward: [2, "drywall"],
		connects: false,
		x: 0,
		y: 0,
	},
	"Drywall Efficiency II": {
		cost: [1.5, "skillPoints"],
		reward: [3, "drywall"],
		connects: ["Drywall Efficiency I"],
		x: 0,
		y: 200,
	},
	"Drywall Efficiency III": {
		cost: [4, "skillPoints"],
		reward: [5, "drywall"],
		connects: ["Drywall Efficiency I"],
		x: 0,
		y: 400,
	},
	"Drywall Efficiency IV": {
		cost: [15, "skillPoints"],
		reward: [8, "drywall"],
		connects: ["Drywall Efficiency III"],
		x: -100,
		y: 600,
	},
	"Drywall Efficiency V": {
		cost: [80, "skillPoints"],
		reward: [15, "drywall"],
		connects: ["Drywall Efficiency IV"],
		x: -200,
		y: 800,
	},
	"Drywall Efficiency VI": {
		cost: [6000, "skillPoints"],
		reward: [50, "drywall"],
		connects: ["Drywall Efficiency V"],
		x: -200,
		y: 1000,
	},
	"Arthritis I": {
		cost: [8, "skillPoints"],
		reward: [5, "drywallPC"],
		connects: ["Drywall Efficiency III"],
		x: 100,
		y: 600,
	},
	"Arthritis II": {
		cost: [45, "skillPoints"],
		reward: [15, "drywallPC"],
		connects: ["Arthritis I"],
		x: 200,
		y: 800,
	},
	"Conversion I": {
		cost: [150, "skillPoints"],
		reward: "Drywall/click boosts drywall/sec (^0.2)",
		connects: ["Arthritis I"],
		x: 400,
		y: 900,
	},
	"Conversion II": {
		cost: [400, "skillPoints"],
		reward: "Improve the drywall/sec boost exponent by +0.1",
		connects: ["Conversion I"],
		x: 600,
		y: 900,
	},
	"Arthritis III": {
		cost: [800, "skillPoints"],
		reward: [100, "drywallPC"],
		connects: ["Arthritis II"],
		x: 400,
		y: 700,
	},
	"Conversion III": {
		cost: [2000, "skillPoints"],
		reward: "Improve the drywall/sec boost exponent by +0.1",
		connects: ["Conversion II"],
		x: 800,
		y: 900,
	},
	"Skill Enhancement I": {
		cost: [2, "skillPoints"],
		reward: [1.5, "skillPoints"],
		connects: ["Drywall Efficiency I"],
		x: 200,
		y: 0,
	},
	"Time-saver I": {
		cost: [0, "skillPoints"],
		reward: "Rebirth no longer resets.",
		connects: ["Drywall Efficiency I"],
		x: -200,
		y: 0,
	},
};


const displayName = {
	drywall: " drywall",
	drywallPC: " drywall/click",
	drywallPS: " drywall/sec",
	rebirths: " rebirths",
	skillPoints: " skill points",
}
const suffixes = [
	"", "k", "m", "b", "t", "qa", "qn", "sx", "sp", "oc", "no",
	"de", "ude", "dde", "tde", "qade", "qnde", "sxde", "spde", "ocde", "nvde",
	"vg", "uvg", "dvg", "tvg", "qavg", "qnvg", "sxvg", "spvg", "ocvg", "nvvg",
	"tg", "utg", "dtg", "ttg", "qatg", "qntg", "sxtg", "sptg", "octg", "nvtg",
	"qag", "uqag", "dqag", "tqag", "qaqag", "qnqag", "sxqag", "spqag", "ocqag", "nvqag",
	"qng", "uqng", "dqng", "tqng", "qaqng", "qnqng", "sxqng", "spqng", "ocqng", "nvqng",
	"sxg", "usxg", "dsxg", "tsxg", "qasxg", "qnsxg", "sxsxg", "spsxg", "ocsxg", "nvsxg",
	"spg", "uspg", "dspg", "tspg", "qasp", "qnspg", "sxspg", "spspg", "ocspg", "nvspg",
	"ocg", "uocg", "docg", "tocg", "qaocg", "qnocg", "sxocg", "spocg", "ococg", "nvocg",
	"nvg", "unvg", "dnvg", "tnvg", "qanvg", "qnnvg", "sxnvg", "spnvg", "ocnvg", "nvnvg",
	"tgnt", "tgnde", "tgng", "tgntg", "tgnqg", "tgnsxg", "tgnspg", "tgnocg", "tgnnvg",
	"ce"
]
const areas = [
	"Area 1",
	"Area 2",
	"Area 3",
	"Skill Reset",
	"Skill Tree",
]

// Elements
let elts = {
	clickers: document.getElementsByClassName("clicker"),
	rebirthButton1: document.getElementById("rebirthButton1"),
	rebirthButton2: document.getElementById("rebirthButton2"),
	skillResetButton: document.getElementById("skillResetButton"),
	area1: document.getElementById("area1"),
	area2: document.getElementById("area2"),
	area3: document.getElementById("area3"),
	area4: document.getElementById("area4"),
	area5: document.getElementById("area5"),

	drywallStat: document.getElementById("drywallStat"),
	drywallPSStat: document.getElementById("drywallPSStat"),
	drywallPCStat: document.getElementById("drywallPCStat"),
	rebirthsStat: document.getElementById("rebirthsStat"),
	skillPointsStat: document.getElementById("skillPointsStat"),
	upgrades: [

	],
	skillUpgrades: [

	],
	areaSelectors: [

	],
	areas: [

	],
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
		skillPoints: data.skillPoints || 0,
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
		skillPoints: 0,
		skillUpgrades: [],
		skillBoosts: {},
		boosts: {},
	}
}

// Setup
let lastSave = 0;
let lastUpdate = Date.now();
let myInterval = setInterval(tick, 0);


for (let i = 0; i < upgrades.length; i += 1) {
	elts.upgrades.push(document.getElementById("upgrade" + (i + 1)));
	elts.upgrades[i].innerHTML = "+" + abbrevNum(upgrades[i].reward[0]) + displayName[upgrades[i].reward[1]] + "<br>" + abbrevNum(upgrades[i].cost[0]) + " " + displayName[upgrades[i].cost[1]];
}
for (let i = 0; i < Object.keys(skillUpgrades).length; i += 1) {
	let upgrade = document.createElement("button");
	if (skillUpgrades[Object.keys(skillUpgrades)[i]].special) {

	} else {
		if (typeof skillUpgrades[Object.keys(skillUpgrades)[i]].reward == "string") {
			upgrade.innerHTML = skillUpgrades[Object.keys(skillUpgrades)[i]].reward + "<br><br>" + abbrevNum(skillUpgrades[Object.keys(skillUpgrades)[i]].cost[0]) + displayName[skillUpgrades[Object.keys(skillUpgrades)[i]].cost[1]];
		} else {
			upgrade.innerHTML = "x" + abbrevNum(skillUpgrades[Object.keys(skillUpgrades)[i]].reward[0]) + displayName[skillUpgrades[Object.keys(skillUpgrades)[i]].reward[1]] + "<br><br>" + abbrevNum(skillUpgrades[Object.keys(skillUpgrades)[i]].cost[0]) + displayName[skillUpgrades[Object.keys(skillUpgrades)[i]].cost[1]];
		}
		upgrade.classList.add("skillUpgrade");
		upgrade.style.position = "absolute";
		upgrade.style.left = "calc(50vw + " + (skillUpgrades[Object.keys(skillUpgrades)[i]].x) + "px)";
		upgrade.style.top = "calc(50vh + " + (skillUpgrades[Object.keys(skillUpgrades)[i]].y) + "px)";
	}
	document.querySelector("#area5").appendChild(upgrade);
	elts.skillUpgrades[Object.keys(skillUpgrades)[i]] = upgrade;
}
for (let i = 0; i < areas.length; i += 1) {
	elts.areaSelectors.push(document.getElementById("area" + (i + 1) + "Selector"));
	elts.areas.push(document.getElementById("area" + (i + 1)));
	elts.areaSelectors[i].textContent = areas[i];
}

checkBoosts();	


// Setup Click Events
for (let i = 0; i < elts.clickers.length; i += 1) {
	elts.clickers[i].onclick = function() {
		player.drywall += player.drywallPC * player.boosts.drywall;
	};
}
for (let i = 0; i < elts.areaSelectors.length; i += 1) {
	elts.areaSelectors[i].onclick = function() {
		loadArea(i);
	};
}

function rebirth(amt) {
	let cost = ((2 ** amt) - 1) * 1000000 * (2 ** player.rebirths);
	if (player.drywall > cost) {
		if (player.skillUpgrades.includes("Time-saver I")) {
			player.drywall -= cost;
			player.rebirths += amt;
		} else {
			player.drywall = 0;
			player.drywallPS = 0;
			player.drywallPC = 1;
			player.rebirths += amt;
		}
	}
}

function getSkillPoints() {
	return ((player.drywall / (10 ** 18)) ** 0.1) * player.boosts.skillPoints;
}

elts.rebirthButton1.onclick = function() {
	rebirth(1);
}
elts.rebirthButton2.onclick = function() {
	rebirth(2);
}
elts.skillResetButton.onclick = function() {
	if (player.drywall >= 10 ** 18) {
		player.skillPoints += getSkillPoints();
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
			player[upg.reward[1]] += upg.reward[0] * player.boosts[upg.reward[1]];
		}
	}
}

for (let i = 0; i < Object.keys(skillUpgrades).length; i += 1) {
	let upg = skillUpgrades[Object.keys(skillUpgrades)[i]];
	let upgElt = elts.skillUpgrades[Object.keys(skillUpgrades)[i]];

	upgElt.onclick = function() {
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
		if (player[upg.cost[1]] >= upg.cost[0]) {
			if (!player.skillUpgrades.includes(Object.keys(skillUpgrades)[i])) {
				player[upg.cost[1]] -= upg.cost[0];
				player.skillUpgrades.push(Object.keys(skillUpgrades)[i]);
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

function update(dt) {
	checkBoosts();
	player.drywall += player.drywallPS * player.boosts.drywall * dt / 1000;

	saveData("DRYWALL", player);
}

function saveData(key, data) {
	const now = Date.now();
	if (now - lastSave > 1000) { // 1 second limit
		localStorage.setItem(key, JSON.stringify(data));
		lastSave = now;
	}
}

function checkBoosts() {
	for (var i = 0; i < Object.keys(player).length; i += 1) {
		player.boosts[Object.keys(player)[i]] = 1;
	}

	let convExp = 0.2;
	if (player.skillUpgrades.includes("Conversion II")) {
		convExp = 0.3;
	}
	if (player.skillUpgrades.includes("Conversion III")) {
		convExp = 0.4;
	}
	for (let i = 0; i < player.skillUpgrades.length; i += 1) {
		player.boosts[skillUpgrades[player.skillUpgrades[i]].reward[1]] *= skillUpgrades[player.skillUpgrades[i]].reward[0];
		if (typeof skillUpgrades[player.skillUpgrades[i]].reward == "string") {
			elts.skillUpgrades[player.skillUpgrades[i]].innerHTML = skillUpgrades[player.skillUpgrades[i]].reward + "<br><br>Bought.";
			if (player.skillUpgrades[i] == "Conversion I") {
				elts.skillUpgrades[player.skillUpgrades[i]].innerHTML = skillUpgrades[player.skillUpgrades[i]].reward + "<br><br>Bought. (x" + abbrevNum(player.drywallPC ** convExp) + ")";
				player.boosts.drywallPS *= player.drywallPC ** convExp;
			}
		} else {
			elts.skillUpgrades[player.skillUpgrades[i]].innerHTML = "x" + abbrevNum(skillUpgrades[player.skillUpgrades[i]].reward[0]) + displayName[skillUpgrades[player.skillUpgrades[i]].reward[1]] + "<br><br>Bought.";
		}
	}

	player.boosts.drywall *= (1.5 ** player.rebirths);
}

function logBaseX(val, base) {
	return Math.log(val) / Math.log(base);
}

function render(dt) {
	elts.drywallStat.textContent = "Drywall: " + abbrevNum(player.drywall) + " (x" + abbrevNum(player.boosts.drywall) + ")";
	elts.drywallPCStat.textContent = "Drywall/click: " + abbrevNum(player.drywallPC) + " (x" + abbrevNum(player.boosts.drywallPC) + ")";
	elts.drywallPSStat.textContent = "Drywall/sec: " + abbrevNum(player.drywallPS) + " (x" + abbrevNum(player.boosts.drywallPS) + ")";
	elts.rebirthsStat.textContent = abbrevNum(player.rebirths) + " rebirths";
	elts.rebirthButton1.textContent = "Rebirth for " + abbrevNum((2 ** player.rebirths) * 1000000);
	elts.rebirthButton2.textContent = "Rebirth TWICE for " + abbrevNum((2 ** player.rebirths) * 1000000 * 3);
	if (player.drywall > 10 ** 18) {
		elts.skillResetButton.textContent = "Reset for +" + abbrevNum(getSkillPoints()) + " skill points";
	} else {
		elts.skillResetButton.textContent = "Reach 1qn to reset";
	}
	elts.skillPointsStat.textContent = "Skill Points: " + abbrevNum(player.skillPoints);
}