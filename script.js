// TODO:
// Adding settings:
// - display name
// - number format
// - disable leaderboard
// - advanced info
// Finish balancing area 3



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
		cost: [10 * (10 ** 69), "drywall"],
		reward: [3.5 * (10 ** 12), "drywallPC"]
	},
	{
		cost: [100 * (10 ** 108), "drywall"],
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
		cost: [2.5 * (10 ** 135), "drywall"],
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
	"Arthritis III": {
		cost: [800, "skillPoints"],
		reward: [100, "drywallPC"],
		connects: ["Arthritis II"],
		x: 400,
		y: 700,
	},
	"Arthritis IV": {
		cost: [350 * (10 ** 6), "skillPoints"],
		reward: "Skill points boosts drywall/click (/100k, ^0.7)",
		connects: ["Arthritis III"],
		x: 400,
		y: 500,
	},
	"Arthritis V": {
		cost: [2 * (10 ** 9), "skillPoints"],
		reward: "Improve to /100 and ^0.9",
		connects: ["Arthritis IV"],
		x: 600,
		y: 500,
	},
	"Conversion I": {
		cost: [150, "skillPoints"],
		reward: "Drywall/click boosts drywall/sec (^0.2)",
		connects: ["Arthritis II"],
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
	"Conversion III": {
		cost: [2000, "skillPoints"],
		reward: "Improve the drywall/sec boost exponent by +0.1",
		connects: ["Conversion II"],
		x: 800,
		y: 900,
	},
	"Conversion IV": {
		cost: [10 * (10 ** 9), "skillPoints"],
		reward: "Improve the drywall/sec boost exponent by +0.1",
		connects: ["Conversion III"],
		x: 1000,
		y: 900,
	},
	"Conversion V": {
		cost: [500 * (10 ** 12), "skillPoints"],
		reward: "Improve the drywall/sec boost exponent by +0.1",
		connects: ["Conversion IV"],
		x: 1200,
		y: 800,
	},
	"Full Circle I": {
		cost: [10 * (10 ** 15), "skillPoints"],
		reward: "10% of drywall/sec turns into drywall/click",
		connects: ["Conversion IV"],
		x: 1200,
		y: 1000,
	},
	"Exponential I": {
		cost: [90000, "skillPoints"],
		reward: [1.05, "drywall", true],
		connects: ["Drywall Efficiency VI"],
		x: -200,
		y: 1200,
	},
	"Exponential II": {
		cost: [300000, "skillPoints"],
		reward: [1.01, "drywall", true],
		connects: ["Exponential I"],
		x: -200,
		y: 1400,
	},
	"Exponential III": {
		cost: [400000, "skillPoints"],
		reward: [1.02, "drywall", true],
		connects: ["Exponential II"],
		x: -200,
		y: 1600,
	},
	"Exponential IV": {
		cost: [600000, "skillPoints"],
		reward: [1.02, "drywall", true],
		connects: ["Exponential III"],
		x: -200,
		y: 1800,
	},
	"Exponential V": {
		cost: [900000, "skillPoints"],
		reward: [1.03, "drywall", true],
		connects: ["Exponential IV"],
		x: 0,
		y: 1800,
	},
	"Exponential VI": {
		cost: [10 * (10 ** 12), "skillPoints"],
		reward: [1.03, "drywall", true],
		connects: ["Exponential V"],
		x: 200,
		y: 1900,
	},
	"Exponential VII": {
		cost: [250 * (10 ** 18), "skillPoints"],
		reward: [1.03, "drywall", true],
		connects: ["Exponential VI"],
		x: 400,
		y: 2000,
	},
	"Self-boost I": {
		cost: [250 * (10 ** 18), "skillPoints"],
		reward: "Drywall exponentiated by itself",
		connects: ["Exponential VI"],
		x: 200,
		y: 1700,
	},
	"Skill Enhancement I": {
		cost: [2, "skillPoints"],
		reward: [1.5, "skillPoints"],
		connects: ["Drywall Efficiency I"],
		x: -200,
		y: 0,
	},
	"Time-saver I": {
		cost: [0, "skillPoints"],
		reward: "Rebirth no longer resets.",
		connects: ["Drywall Efficiency I"],
		x: 200,
		y: 0,
	},
	"Time-saver II": {
		cost: [50 * (10 ** 9), "skillPoints"],
		reward: "Auto-rebirth.",
		connects: ["Time-saver I"],
		x: 400,
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
	["Trophies", "trophyArea"],
 	["Area 1", "area1"],
	["Area 2", "area2"],
	["Area 3", "area3"],
	["Skill Tree", "skillTreeArea"],
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
	skillTreeArea: document.getElementById("skillTreeArea"),
	trophyArea: document.getElementById("trophyArea"),
	leaderboard1Div: document.getElementById("leaderboard1Div"),

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
const canvas = document.getElementById("skillCanvas");
const ctx = canvas.getContext("2d");

// Variables
let data = JSON.parse(localStorage.getItem("DRYWALL"));
let player;
if (data) {
	player = {
		mylbkey: data.mylbkey || randomString(12),
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
		mylbkey: randomString(12),
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
let myInterval = setInterval(tick, (1/10));

let drywallLeaderboard = [];
let rebirthsLeaderboard = [];
let lastLeaderboardUpdate = Date.now();
let supabase = window.supabase.createClient(
	"https://chboqcllfpnrzivwocti.supabase.co",
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNoYm9xY2xsZnBucnppdndvY3RpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwMzIyOTIsImV4cCI6MjA3NDYwODI5Mn0.ZLkFa20ZNeheiOaOKMG4wUOtgccJ_791Gpf3SfUxsMA" // yes this is a public key
);

loadLeaderboard();


for (let i = 0; i < upgrades.length; i += 1) {
	elts.upgrades.push(document.getElementById("upgrade" + (i + 1)));
	elts.upgrades[i].innerHTML = "+" + abbrevNum(upgrades[i].reward[0]) + displayName[upgrades[i].reward[1]] + "<br>" + abbrevNum(upgrades[i].cost[0]) + " " + displayName[upgrades[i].cost[1]];
}
for (let i = 0; i < Object.keys(skillUpgrades).length; i += 1) {
	let upgrade = document.createElement("button");
	let upg = skillUpgrades[Object.keys(skillUpgrades)[i]];
	if (skillUpgrades[Object.keys(skillUpgrades)[i]].special) {

	} else {
		if (typeof skillUpgrades[Object.keys(skillUpgrades)[i]].reward == "string") {
			upgrade.innerHTML = upg.reward + "<br><br>" + abbrevNum(upg.cost[0]) + displayName[upg.cost[1]];
		} else {
			if (upg.reward.length == 2) {
				upgrade.innerHTML = "x" + abbrevNum(upg.reward[0]) + displayName[upg.reward[1]] + "<br><br>" + abbrevNum(upg.cost[0]) + displayName[upg.cost[1]];
			} else {
				upgrade.innerHTML = "^" + abbrevNum(upg.reward[0]) + displayName[upg.reward[1]] + "<br><br>" + abbrevNum(upg.cost[0]) + displayName[upg.cost[1]];
			}
		}
		upgrade.classList.add("skillUpgrade");
		upgrade.style.position = "absolute";
		upgrade.style.left = "calc(50vw + " + (skillUpgrades[Object.keys(skillUpgrades)[i]].x) + "px)";
		upgrade.style.top = "calc(50vh + " + (skillUpgrades[Object.keys(skillUpgrades)[i]].y + 200) + "px)";
	}
	document.querySelector("#skillTreeArea").appendChild(upgrade);
	elts.skillUpgrades[Object.keys(skillUpgrades)[i]] = upgrade;
}
for (let i = 0; i < areas.length; i += 1) {
	elts.areaSelectors.push(document.getElementById("area" + (i + 1) + "Selector"));
	elts.areas.push(document.getElementById(areas[i][1]));
	elts.areaSelectors[i].textContent = areas[i][0];
}

checkBoosts();	


// Setup Click Events
for (let i = 0; i < elts.clickers.length; i += 1) {
	elts.clickers[i].onclick = function() {
		player.drywall += (player.drywallPC * player.boosts.drywall.multiplier) ** player.boosts.drywall.exponent;
	};
}
for (let i = 0; i < elts.areaSelectors.length; i += 1) {
	elts.areaSelectors[i].onclick = function() {
		loadArea(i);
	};
}




// Functions
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
	return ((player.drywall / (10 ** 18)) ** 0.1) * player.boosts.skillPoints.multiplier;
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
			player[upg.reward[1]] += (upg.reward[0] * player.boosts[upg.reward[1]].multiplier) ** player.boosts[upg.reward[1]].exponent;
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
	player.drywall += ((player.drywallPS * player.boosts.drywall.multiplier) ** player.boosts.drywall.exponent) * dt / 1000;

	if (player.skillUpgrades.includes("Time-saver II")) {
		rebirth(1);
	}

	if (Date.now() - lastLeaderboardUpdate >= 60000) {
		saveDataToLeaderboard();
		lastLeaderboardUpdate = Date.now();
	}
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
	// Reset
	for (var i = 0; i < Object.keys(player).length; i += 1) {
		player.boosts[Object.keys(player)[i]] = {multiplier: 1, exponent: 1};
	}

	// Check upgrades which boost other upgrades
	let convExp = 0.2;
	if (player.skillUpgrades.includes("Conversion II")) {
		convExp = 0.3;
	}
	if (player.skillUpgrades.includes("Conversion III")) {
		convExp = 0.4;
	}
	if (player.skillUpgrades.includes("Conversion IV")) {
		convExp = 0.5;
	}
	let arthritisExp = 0.7;
	let arthritisDen = 100000;
	if (player.skillUpgrades.includes("Arthritis V")) {
		arthritisExp = 0.9;
		arthritisDen = 100;
	}

	// Calculate their boosts
	for (let i = 0; i < player.skillUpgrades.length; i += 1) {
		let skillUpg = skillUpgrades[player.skillUpgrades[i]];
		if (typeof skillUpg.reward == "string") {
			if (player.skillUpgrades[i] == "Conversion I") {
				player.boosts.drywallPS.multiplier *= player.drywallPC ** convExp;
			} else if (player.skillUpgrades[i] == "Arthritis IV") {
				player.boosts.drywallPC.multiplier *= (player.skillPoints / arthritisDen) ** arthritisExp;
			}
		} else {
			if (skillUpg.reward.length == 3) {
				player.boosts[skillUpg.reward[1]].exponent *= skillUpg.reward[0];
			} else {
				player.boosts[skillUpg.reward[1]].multiplier *= skillUpg.reward[0];
			}
		}
	}

	player.boosts.drywall.multiplier *= (1.5 ** player.rebirths);
}

function updateSkillTreeElements() {
	// Calculate boost vals
	let convExp = 0.2;
	if (player.skillUpgrades.includes("Conversion II")) {
		convExp = 0.3;
	}
	if (player.skillUpgrades.includes("Conversion III")) {
		convExp = 0.4;
	}
	if (player.skillUpgrades.includes("Conversion IV")) {
		convExp = 0.5;
	}
	
	let arthritisExp = 0.7;
	let arthritisDen = 100000;
	if (player.skillUpgrades.includes("Arthritis V")) {
		arthritisExp = 0.9;
		arthritisDen = 100;
	}

	// Update upgrade HTMLs
	const upgradeKeys = Object.keys(skillUpgrades);

	for (let i = 0; i < upgradeKeys.length; i += 1) {
		let upgName = upgradeKeys[i];
		let skillUpg = skillUpgrades[upgName];
		let skillUpgElt = elts.skillUpgrades[upgName];
		
		let skillUpgUnlocked = true;
		
		// Check for connection requirements
		if (skillUpg.connects) {
			skillUpgUnlocked = skillUpg.connects.every(item => player.skillUpgrades.includes(item));
		}

		if (player.skillUpgrades.includes(upgName)) {
			skillUpgElt.style.boxShadow = "0px 0px 16px #dddddd40";
			skillUpgElt.style.backgroundColor = ""; 
			skillUpgElt.style.color = ""; 
			if (typeof skillUpg.reward === "string") {
				if (upgName === "Conversion I") {
					skillUpgElt.innerHTML = skillUpg.reward + "<br><br>Bought. (x" + abbrevNum(player.drywallPC ** convExp) + ")";
				} else if (upgName === "Arthritis IV") {
					skillUpgElt.innerHTML = skillUpg.reward + "<br><br>Bought. (x" + abbrevNum((player.skillPoints / arthritisDen) ** arthritisExp) + ")";
				} else {
					skillUpgElt.innerHTML = skillUpg.reward + "<br><br>Bought.";
				}
			} else {
				if (skillUpg.reward.length === 3) {
					skillUpgElt.innerHTML = "^" + abbrevNum(skillUpg.reward[0]) + displayName[skillUpg.reward[1]] + "<br><br>Bought.";
				} else {
					skillUpgElt.innerHTML = "x" + abbrevNum(skillUpg.reward[0]) + displayName[skillUpg.reward[1]] + "<br><br>Bought.";
				}
			}
		} else {
			skillUpgElt.style.boxShadow = "none";
			
			if (skillUpgUnlocked) {
				if (skillUpgElt.style.backgroundColor === "#20103020") {
					skillUpgElt.style.backgroundColor = "#20103040";
				} else {
          skillUpgElt.style.backgroundColor = "#20103040";
      	}
				skillUpgElt.style.color = "#f2f2f2"; 
        skillUpgElt.style.opacity = 1.0;  
			} else {
				skillUpgElt.style.backgroundColor = "#20103020";
				skillUpgElt.style.color = "#f2f2f290"; 
        skillUpgElt.style.opacity = 0.5; 
			}
		}
	}
}

function logBaseX(val, base) {
	return Math.log(val) / Math.log(base);
}

function randomString(length) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function loadLeaderboard() {
  let { data, error } = await supabase
    .from("leaderboard")
    .select("key, displayName, drywall, rebirths");

  if (error) {
    console.error("Error loading leaderboard:", error.message);
    return;
  }

  // --- Drywalls leaderboard ---
  let drywallData = data
    .filter((entry) => entry.drywall !== null) // remove null scores
    .map((entry) => ({
      ...entry,
      drywalls: parseFloat(entry.drywall),
    }));
  drywallData.sort((a, b) => b.drywall - a.drywall);
  drywallLeaderboard = drywallData.slice(0, 10);

  // --- Rebirth leaderboard ---
  let rebirthData = data
    .filter((entry) => entry.rebirths !== null) // remove null scores
    .map((entry) => ({
      ...entry,
      rebirths: parseFloat(entry.rebirths),
    }));
  rebirthData.sort((a, b) => b.rebirths - a.rebirths);
  rebirthLeaderboard = rebirthData.slice(0, 10);
}

async function submitScore(name, score) {
  let { error } = await supabase.from("leaderboard").insert([{ name, score }]);

  if (!error) {
    loadLeaderboard(); // refresh
  }
}

async function saveDataToLeaderboard() {
  let playerName = player.mylbkey;

  if (!playerName || player.drywall === undefined) return;

  let { error } = await supabase.from("leaderboard").upsert(
    {
      key: player.mylbkey,
      drywall: Math.floor(player.drywall),
      rebirths: Math.floor(player.rebirths),
      displayName: player.displayName || player.mylbkey,
    },
    { onConflict: "key" } // overwrite if same name exists
  );

  if (error) {
    console.error("Error saving score:", error.message);
  } else {
    console.log("Score saved!");
    loadLeaderboard();
  }
}

function getLeaderboardText() {
	let text = "";
	for (var i = 0; i < drywallLeaderboard.length; i += 1) {
		text += drywallLeaderboard[i].displayName + " - " + abbrevNum(drywallLeaderboard[i].drywalls) + "<br>";
	}
	return text;
}

function getConnections(skills) {
	const updated = {};

	// copy data + add connectsTo
	for (const [name, data] of Object.entries(skills)) {
		updated[name] = { ...data, connectsTo: [] };
	}

	// actually do connectsTo
	for (const [name, data] of Object.entries(skills)) {
		if (Array.isArray(data.connects)) {
			for (const target of data.connects) {
				if (updated[target]) {
					updated[target].connectsTo.push(name);
				}
			}
		}
	}

	return updated;
}

function drawLinesFromUpgrade(upgrade) {
	let skills = getConnections(skillUpgrades);
	let thisUpgrade = skills[upgrade];
	if (!thisUpgrade) return;

	for (let i of thisUpgrade.connectsTo) {
		let connection = skills[i];
		if (!connection) continue;

		ctx.beginPath();
		ctx.strokeStyle = "white";
		
		// shift by 50vw and 50vh
		ctx.moveTo(thisUpgrade.x + window.innerWidth / 2, thisUpgrade.y + 200 + window.innerHeight / 2);
		ctx.lineTo(connection.x + window.innerWidth / 2, connection.y + 200 + window.innerHeight / 2);
		ctx.stroke();

		drawLinesFromUpgrade(i);
	}
}


function render(dt) {
	elts.drywallStat.textContent = "Drywall: " + abbrevNum(player.drywall) + " (x" + abbrevNum(player.boosts.drywall.multiplier) + ")";
	elts.drywallPCStat.textContent = "Drywall/click: " + abbrevNum(player.drywallPC) + " (x" + abbrevNum(player.boosts.drywallPC.multiplier) + ")";
	elts.drywallPSStat.textContent = "Drywall/sec: " + abbrevNum(player.drywallPS) + " (x" + abbrevNum(player.boosts.drywallPS.multiplier) + ")";
	elts.rebirthsStat.textContent = abbrevNum(player.rebirths) + " rebirths";
	elts.rebirthButton1.textContent = "Rebirth for " + abbrevNum((2 ** player.rebirths) * 1000000);
	elts.rebirthButton2.textContent = "Rebirth TWICE for " + abbrevNum((2 ** player.rebirths) * 1000000 * 3);
	if (player.drywall > 10 ** 18) {
		elts.skillResetButton.textContent = "Reset for +" + abbrevNum(getSkillPoints()) + " skill points";
	} else {
		elts.skillResetButton.textContent = "Reach 1qn to reset";
	}
	elts.skillPointsStat.textContent = "Skill Points: " + abbrevNum(player.skillPoints);
	elts.leaderboard1Div.querySelector("p").innerHTML = getLeaderboardText();

	updateSkillTreeElements();

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawLinesFromUpgrade("Drywall Efficiency I")
}