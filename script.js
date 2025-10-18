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
		cost: [3000, "drywall"],
		reward: [200, "drywallPS"]
	},
	{
		cost: [350000, "drywall"],
		reward: [10000, "drywallPS"]
	},
	{
		cost: [1 * (10 ** 6), "drywall"],
		reward: [2500, "drywallPC"]
	},
	{
		cost: [150 * (10 ** 6), "drywall"],
		reward: [80000, "drywallPC"]
	},
	{
		cost: [5 * (10 ** 9), "drywall"],
		reward: [1 * (10 ** 6), "drywallPC"]
	},
	{
		cost: [35 * (10 ** 6), "drywall"],
		reward: [300000, "drywallPS"]
	},
	{
		cost: [4 * (10 ** 9), "drywall"],
		reward: [12 * (10 ** 6), "drywallPS"]
	},
	{
		cost: [800 * (10 ** 9), "drywall"],
		reward: [950 * (10 ** 6), "drywallPS"]
	},
]
const displayName = {
	drywall: "drywall",
	drywallPC: "drywall/click",
	drywallPS: "drywall/sec",
	rebirths: "rebirths",
}
const suffixes = [
	"", "k", "m", "b", "t", "qa", "qn", "sx", "sp", "oc", "no", "de", "ude", "dde", "tde", "qade"
]
const areas = [
	"Area 1",
	"Area 2",
]

// Elements
let elts = {
	clickers: document.getElementsByClassName("clicker"),
	rebirthButton1: document.getElementById("rebirthButton1"),
	rebirthButton2: document.getElementById("rebirthButton2"),

	drywallStat: document.getElementById("drywallStat"),
	drywallPSStat: document.getElementById("drywallPSStat"),
	drywallPCStat: document.getElementById("drywallPCStat"),
	rebirthsStat: document.getElementById("rebirthsStat"),
	upgrades: [

	],
	areaSelectors: [

	],
}
for (let i = 0; i < upgrades.length; i += 1) {
	elts.upgrades.push(document.getElementById("upgrade" + (i + 1)))
	elts.upgrades[i].innerHTML = "+" + abbrevNum(upgrades[i].reward[0]) + " " + displayName[upgrades[i].reward[1]] + "<br>" + abbrevNum(upgrades[i].cost[0]) + " " + displayName[upgrades[i].cost[1]];
}
for (let i = 0; i < areas.length; i += 1) {
	elts.areaSelectors.push(document.getElementById("area" + (i + 1) + "Selector"));
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
		maxRebirths: data.maxRebirths || 40,
	}
} else {
	player = {
		drywall: 0,
		drywallPS: 0,
		drywallPC: 1,
		rebirths: 0,
		maxRebirths: 40,
	}
}


// Setup
let lastSave = 0;
let lastUpdate = Date.now();
let myInterval = setInterval(tick, 0);


// Setup Click Events
for (let i = 0; i < elts.clickers.length; i += 1) {
	elts.clickers[i].onclick = function() {
		player.drywall += player.drywallPC * (1.5 ** player.rebirths);
	};
}
for (let i = 0; i < elts.areaSelectors.length; i += 1) {
	let area = areas[i];
	elts.areaSelectors[i].onclick = function() {
		loadArea(area);
	};
}

elts.rebirthButton1.onclick = function() {
	if (player.drywall >= (2 ** player.rebirths)) {
		player.drywall = 0;
		player.drywallPS = 0;
		player.drywallPC = 1;
		player.rebirths += 1;
	}
}
elts.rebirthButton2.onclick = function() {
	if (player.drywall >= 3 * (2 ** player.rebirths)) {
		player.drywall = 0;
		player.drywallPS = 0;
		player.drywallPC = 1;
		player.rebirths += 2;
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


// Functions
function loadArea(area) {
	if (area == "Area 1") {
		area1.style.display = "block";
		area2.style.display = "none";
	} else if (area == "Area 2") {
		area1.style.display = "none";
		area2.style.display = "block";
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
	player.drywall += player.drywallPS * (1.5 ** player.rebirths) * dt / 1000;

	saveData("DRYWALL", player);
}

function saveData(key, data) {
	const now = Date.now();
	if (now - lastSave > 1000) { // 1 second limit
		localStorage.setItem(key, JSON.stringify(data));
		lastSave = now;
	}
}

function render(dt) {
	elts.drywallStat.textContent = "Drywall: " + abbrevNum(player.drywall);
	elts.drywallPCStat.textContent = "Drywall/click: " + abbrevNum(player.drywallPC);
	elts.drywallPSStat.textContent = "Drywall/sec: " + abbrevNum(player.drywallPS);
	elts.rebirthsStat.textContent = abbrevNum(player.rebirths) + " rebirths (x" + abbrevNum(1.5 ** player.rebirths) + ")";
	elts.rebirthButton1.textContent = "Rebirth for " + abbrevNum((2 ** player.rebirths) * 1000000);
	elts.rebirthButton2.textContent = "Rebirth TWICE for " + abbrevNum((2 ** player.rebirths) * 1000000 * 3);
}