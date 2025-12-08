// Elements
let elts = {
	// Manually defined
	clickers: document.getElementsByClassName("clicker"),
	infinityUpgrades: [
		...document.getElementById("generatorUpgrades").children,
		...document.getElementById("infinityPowerUpgrades").children
	],
	infinityMilestones: document.getElementsByClassName("infinityMilestone"),
	upgrades: [],
	skillUpgrades: [],
	areaSelectors: [],
	areas: [],
};
const areas = [
	["Trophies", "trophyArea"],
 	["Home", "area1"],
	["High-rise", "area2"],
	["Luxury", "area3"],
	["Skill Tree", "skillTreeArea"],
	["Infinity", "infinityArea"],
];
// create area selectors
for (let i = 0; i < areas.length; i += 1) {
	elts.areaSelectors.push(document.getElementById("areaSelector" + (i + 1)));
	elts.areas.push(document.getElementById(areas[i][1]));
	elts.areaSelectors[i].textContent = areas[i][0];
}



// Settings
const dustSpawnDebounceTime = false;
const clickDebounceTime = 65;



const achievements = {
	// drywall achievements
	"Welcome!": {
		requirement: {amount: 1, type: ["drywall"]},
		description: "Your first drywall, we all start somewhere.",
		tier: 1,
	},
	"Millionaire": {
		requirement: {amount: 10 ** 6, type: ["drywall"]},
		reward: {amount: 1.1, type: "drywall"},
		description: "Reach 1 million drywall. Still poor btw.",
		tier: 1,
	},
	"Billionaire": {
		requirement: {amount: 10 ** 9, type: ["drywall"]},
		reward: {amount: 1.2, type: "drywall"},
		description: "Wow a billion? Thats enough for a big mac!",
		tier: 1,
	},
	"Trillionaire": {
		requirement: {amount: 10 ** 12, type: ["drywall"]},
		reward: {amount: 1.2, type: "drywall"},
		description: "Reach 1 trillion drywall. I ran out of corny jokes.",
		tier: 1,
	},
	"Decillionaire": {
		requirement: {amount: 10 ** 33, type: ["drywall"]},
		reward: {amount: 1.3, type: "drywall"},
		description: "Reach 1 decillion drywall. A big gap, but you made it, right?",
		tier: 2,
	},
	"Vigintillionaire": {
		requirement: {amount: 10 ** 63, type: ["drywall"]},
		reward: {amount: 1.3, type: "drywall"},
		description: "Reach 1 vigintillion drywall. You almost beat the game! nah jk",
		tier: 2,
	},
	"Scrooge Mc. Duck": {
		requirement: {amount: 2.5 * (10 ** 135), type: ["drywall"]},
		reward: {amount: 1.3, type: "drywall"},
		description: "Reach 2.5e135 drywall. Thats enough to buy the final drywall upgrade! Well, for now at least.",
		tier: 2,
	},
	
	// playtime achievements
	"Fulfillment": {
		requirement: {amount: 10 * 60 * 1000, type: ["stats", "playtime"]},
		reward: {amount: 1.1, type: "drywallPS"},
		description: "Play for 10 minutes.",
		tier: 1,
	},
	"Enjoyment": {
		requirement: {amount: 60 * 60 * 1000, type: ["stats", "playtime"]},
		reward: {amount: 1.2, type: "drywallPS"},
		description: "Play for an hour. Starting to have fun now?",
		tier: 1,
	},
	"Dedication": {
		requirement: {amount: 5 * 60 * 60 * 1000, type: ["stats", "playtime"]},
		reward: {amount: 1.3, type: "drywallPS"},
		description: "Play for 5 hours.",
		tier: 2,
	},
	"Connoisseur": {
		requirement: {amount: 24 * 60 * 60 * 1000, type: ["stats", "playtime"]},
		reward: {amount: 1.5, type: "drywallPS"},
		description: "Play for a day (24 hours). Still enjoying it?",
		tier: 2,
	},
	"Beyond no-life": {
		requirement: {amount: 7 * 24 * 60 * 60 * 1000, type: ["stats", "playtime"]},
		reward: {amount: 5, type: "drywallPS"},
		description: "Play for a whole week (168 hours). Go touch grass or something.",
		tier: 3,
	},

	// click achievements
	"Beginner Clicker": {
		requirement: {amount: 10 ** 2, type: ["stats", "clicks"]},
		reward: {amount: 1.1, type: "drywallPC"},
		description: "Click 100 times.",
		tier: 1,
	},
	"Mouse Abuse": {
		requirement: {amount: 10 ** 3, type: ["stats", "clicks"]},
		reward: {amount: 1.3, type: "drywallPC"},
		description: "Click a thousand times.",
		tier: 1,
	},
	"Nuclear Clicker": {
		requirement: {amount: 10 ** 4, type: ["stats", "clicks"]},
		reward: {amount: 1.5, type: "drywallPC"},
		description: "Click 10 thousand times. Fun fact: you can click at most once every 65 milliseconds (~15 cps).",
		tier: 2,
	},
	"Supernova": {
		requirement: {amount: 10 ** 5, type: ["stats", "clicks"]},
		reward: {amount: 3, type: "drywallPC"},
		description: "Click 100 THOUSAND times. 1.8 hours of nonstop clicking. Ya done yet?",
		tier: 2,
	},
	"Godly Clicker": {
		requirement: {amount: 10 ** 6, type: ["stats", "clicks"]},
		reward: {amount: 2, type: "infinityPower"},
		description: "Click one MILLION times. That takes at LEAST 18 hours, just why...",
		tier: 3,
	},

	// infinity achievements
	"Infinity": {
		requirement: {amount: 1, type: ["infinities"]},
		reward: {amount: 1.5, type: "drywall"},
		description: "Hit ~1.79e308 drywall and perform the infinity reset. Welcome to the big leagues, I guess.",
		tier: 1,
	},
	"Deca-infinity": {
		requirement: {amount: 10, type: ["infinities"]},
		reward: {amount: 2, type: "drywallPS"},
		description: "Reach 10 infinities. ",
		tier: 2,
	},
	"Infinity Centipede": {
		requirement: {amount: 100, type: ["infinities"]},
		reward: {amount: 1.5, type: "infinityPower"},
		description: "Reach 100 infinities",
		tier: 2,
	},
	"Need. More. Infinities.": {
		requirement: {amount: 1000, type: ["infinities"]},
		reward: {amount: 1.5, type: "drywall"},
		description: "Reach one THOUSAND infinities. It only gets crazier from here.",
		tier: 2,
	},
	"The Gap": {
		requirement: {amount: 10000, type: ["infinities"]},
		reward: {amount: 1.5, type: "drywall"},
		description: "Reach 10 thousand infinities. Now its time to max out every part of the game. Getting to the next milestone won't be easy.",
		tier: 2,
	},
	"Particle Accelerator": {
		requirement: {amount: 1000000, type: ["infinities"]},
		reward: {amount: 5, type: "infinityPower"},
		description: "Reach one MILLION infinities. You're almost there...",
		tier: 3,
	},

	// infinity power
	"potato": {
		requirement: {amount: 100, type: ["infinityPower"]},
		reward: {amount: 1.1, type: "infinityPower"},
		description: "<span style='font-family: cursive'>make 100 infinity power. potato.</span>",
		tier: 1,
	},
	"Megajoule": {
		requirement: {amount: 10 ** 6, type: ["infinityPower"]},
		reward: {amount: 1.2, type: "infinityPower"},
		description: "Generate 1 million infinity power. *insert energy buzzing sound*",
		tier: 2,
	},
	"Power Enthusiast": {
		requirement: {amount: 10 ** 9, type: ["infinityPower"]},
		reward: {amount: 1.5, type: "infinityPower"},
		description: "Generate 1 billion infinity power. Having fun?",
		tier: 2,
	},
	"Trillionaire pt. 2": {
		requirement: {amount: 10 ** 12, type: ["infinityPower"]},
		reward: {amount: 2, type: "infinityPower"},
		description: "Generate 1 trillion infinity power. I am SO proud of you.",
		tier: 2,
	},
	"Suspicious amounts of power": {
		requirement: {amount: 10 ** 18, type: ["infinityPower"]},
		reward: {amount: 10, type: "drywallPC"},
		description: "Generate 1 quintillion infinity power. Where did you even get this power?",
		tier: 3,
	},
	"Nuclear reactor": {
		requirement: {amount: 10 ** 33, type: ["infinityPower"]},
		reward: {amount: 2, type: "infinities"},
		description: "Generate 1 DECILLION infinity power. Too. Much. Power.",
		tier: 3,
	},
	"Dyson sphere": {
		requirement: {amount: 10 ** 63, type: ["infinityPower"]},
		reward: {amount: 3, type: "infinities"},
		description: "Generate 1 VIGINTILLION infinity power. Are you almost done with the infinity tree? nah prolly not",
		tier: 4,
	},

	// misc
	"Alpha Tester": {
		description: "Play before the v0.5.0 release of the game.",
		tier: 0,
	},
	"Beta Tester": {
		description: "Play before the v1.0.0 release of the game.",
		tier: 0,
	},
	"Informed Voter": {
		reward: {amount: 1.11, type: "drywall"},
		tier: 1,
		description: "Read the changelog.",
	},
	"Infinity Tree Completionist": {
		reward: {amount: 10, type: "infinityPower"},
		description: "Buy every single upgrade in the infinity tree.",
		tier: 3,
	},

	"EZ Rebirth": {
		reward: {amount: 1.5, type: "drywall"},
		description: "Rebirth in 10 clicks (ALL clicks) or less!",
		tier: 1,
	},
	"EZ Skill Reset": {
		reward: {amount: 1.5, type: "skillPoints"},
		description: "Skill reset in 10 clicks (ALL clicks) or less!",
		tier: 2,
	},
	"EZ Infinity": {
		reward: {amount: 1.5, type: "infinityPoints"},
		description: "Infinity in 10 clicks (ALL clicks) or less! Must. Keep. Pushing.",
		tier: 3,
	},
};

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
		cost: [165000, "drywall"],
		reward: [850, "drywallPC"]
	},
	{
		cost: [50, "drywall"],
		reward: [10, "drywallPS"]
	},
	{
		cost: [35000, "drywall"],
		reward: [700, "drywallPS"]
	},
	{
		cost: [8 * (10 ** 6), "drywall"],
		reward: [80000, "drywallPS"]
	},
	{
		cost: [1 * (10 ** 9), "drywall"],
		reward: [75000, "drywallPC"]
	},
	{
		cost: [150 * (10 ** 15), "drywall"],
		reward: [20 * (10 ** 6), "drywallPC"]
	},
	{
		cost: [5 * (10 ** 24), "drywall"],
		reward: [800 * (10 ** 6), "drywallPC"]
	},
	{
		cost: [3.5 * (10 ** 12), "drywall"],
		reward: [6 * (10 ** 6), "drywallPS"]
	},
	{
		cost: [850 * (10 ** 18), "drywall"],
		reward: [900 * (10 ** 6), "drywallPS"]
	},
	{
		cost: [2.5 * (10 ** 27), "drywall"],
		reward: [85 * (10 ** 9), "drywallPS"]
	},
	{
		cost: [10 * (10 ** 45), "drywall"],
		reward: [160 * (10 ** 9), "drywallPC"]
	},
	{
		cost: [10 * (10 ** 69), "drywall"],
		reward: [18 * (10 ** 12), "drywallPC"]
	},
	{
		cost: [100 * (10 ** 108), "drywall"],
		reward: [55 * (10 ** 15), "drywallPC"]
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
		cost: [2 * (10 ** 12), "skillPoints"],
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
	// "Exponential VIII": {
	// 	cost: [1 * (10 ** 100), "skillPoints"],
	// 	reward: [2, "drywall", true],
	// 	connects: ["Exponential VII"],
	// 	x: 600,
	// 	y: 2000,
	// },
	"Self-boost I": {
		cost: [100 * (10 ** 21), "skillPoints"],
		reward: "Drywall exponentiated by itself (^0.0001)",
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
	"Skill Enhancement II": {
		cost: [30000, "skillPoints"],
		reward: [2, "skillPoints"],
		connects: ["Skill Enhancement I"],
		x: -400,
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
const infinityMilestones = [1, 2, 3, 5, 8];
const infinityUpgradeNames = [
	"Infinity Power I",
	"Infinity Power II",
	"Drywall I",
	"Drywall/sec I",
	"Skill Points I",
	"Infinities I"
]
const infinityUpgradeCosts = {
	"Infinity Power I": [[1, 1, 1, 2, 3, 4, 6], "infinityPoints"],
	"Infinity Power II": [[1000, 10 ** 6, 10 ** 9], "infinityPower"],
	"Drywall I": [[0.25, 4, 25, 400, 50000, 5 * (10 ** 6)], "infinityPower"],
	"Drywall/sec I": [[1, 100, 500, 15000], "infinityPower"],
	"Skill Points I": [[5, 50, 225, 30000], "infinityPower"],
	"Infinities I": [[10 ** 6, 10 ** 12, 10 ** 18], "infinityPower"],
}

const settingNames = [
	"darkMode", "scientificNotation", "minimalParticles", "autoRebirth"
]

const displayName = {
	drywall: " drywall",
	drywallPC: " drywall/click",
	drywallPS: " drywall/sec",
	rebirths: " rebirths",
	skillPoints: " skill points",
	infinities: " Infinities",
	infinityPoints: " Infinity Points",
	infinityPower: " Infinity Power",
};
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
];

// Automatically add all other elements with an id
document.querySelectorAll("[id]").forEach(el => {
	const key = el.id;

	// Skip if it's already manually defined
	if (!(key in elts)) {
		elts[key] = el;
	}
});

const canvas = document.getElementById("skillCanvas");
const ctx = canvas.getContext("2d");

const playerTemplate = {
	mylbkey: randomString(12),
	drywall: 0,
	drywallPS: 0,
	drywallPC: 1,
	rebirths: 0,
	skillPoints: 0,
	skillUpgrades: [],
	infinities: 0,
	infinityPoints: 0,
	infinityPower: 0,
	infinityUpgrades: Object.fromEntries(infinityUpgradeNames.map(name => [name, 0])),
	globalToken: null,
	skillBoosts: {},
	boosts: {},
	passive: {},
	settings: {
		darkMode: false,
		scientificNotation: false,
		minimalParticles: false,
		autoRebirth: false
	},
	achievements: [],
	stats: {
		playtime: 0,
		clicks: 0
	},
	username: null
};

function mergeDeep(template, saved) {
	if (!saved || typeof saved !== "object") return template;

	const result = Array.isArray(template) ? [...template] : { ...template };

	for (const key in template) {
		if (saved[key] === undefined) {
			// Missing → fallback to template
			result[key] = template[key];
		} else if (typeof template[key] === "object" && template[key] !== null && !Array.isArray(template[key])) {
			// Deep-merge nested objects
			result[key] = mergeDeep(template[key], saved[key]);
		} else {
			// Primitive or array → saved wins
			result[key] = saved[key];
		}
	}

	return result;
}

let raw = JSON.parse(localStorage.getItem("DRYWALL"));
const mergedPlayer = mergeDeep(playerTemplate, raw);

// Username fallback
mergedPlayer.username = (raw && raw.username) || mergedPlayer.mylbkey;

if (mergedPlayer.username === mergedPlayer.mylbkey) {
	elts.usernamePopup.style.display = "block";
}

const player = mergedPlayer;

// Setup
let lastSave = 0;
let lastUpdate = Date.now();
let myInterval = setInterval(tick, (1/10));

let leaderboards = {};
let lastLeaderboardUpdate = Date.now();
let supabase = window.supabase.createClient(
	"https://chboqcllfpnrzivwocti.supabase.co",
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNoYm9xY2xsZnBucnppdndvY3RpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwMzIyOTIsImV4cCI6MjA3NDYwODI5Mn0.ZLkFa20ZNeheiOaOKMG4wUOtgccJ_791Gpf3SfUxsMA" // yes this is a public key
);


// Replace with your Render URL
let latestGlobalMessage = null;

const ws = new WebSocket(`wss://render-global-messaging.onrender.com`);

ws.onopen = () => displayMessage({message: "Connected to global messaging.", timestamp: formatTime(Date.now())})

let receiveTime = Date.now();
ws.onmessage = async e => {
	receiveTime = Date.now();
	const data = e.data;
	displayMessage(JSON.parse(data));
};

// Example function to use the message in your UI
function displayMessage(msg) {
	let text = msg.message;
	let timestamp = msg.timestamp;

	elts.globalMessageText.innerText = text;
	elts.globalMessageTime.innerText = timestamp;
	elts.globalMessageBox.classList.add("showGlobal");
	setTimeout(function() {
		elts.globalMessageBox.classList.remove("showGlobal");
	}, 8000)
}

// Send a message
function sendMessage(msg) {
	const date = new Date();

	const shortFormat = new Intl.DateTimeFormat('en-US', {
	  timeZoneName: 'short'
	}).format(date).split(", ")[1];
	if (player.globalToken) {
  		ws.send(JSON.stringify({message: msg, token: player.globalToken, timestamp: formatTime(Date.now()) + " " + shortFormat}));
  	} else {
  		return "Send failed: no token"
  	}
}

loadLeaderboard();
checkBoosts();

// highlight unlocked infinity milestones
for (let i = 0; i < infinityMilestones.length; i += 1) {
	if (player.infinities >= infinityMilestones[i]) {
		elts.infinityMilestones[i].classList.add("unlocked");
	} else {
		elts.infinityMilestones[i].classList.remove("unlocked");
	}
}

// add text to regular upgrades
for (let i = 0; i < upgrades.length; i += 1) {
	elts.upgrades.push(document.getElementById("upgrade" + (i + 1)));
	elts.upgrades[i].innerHTML = abbrevNum(upgrades[i].cost[0]) + " " + displayName[upgrades[i].cost[1]] + " → +" + abbrevNum(upgrades[i].reward[0]) + displayName[upgrades[i].reward[1]];
}

// add text to skill tree upgrades
for (let i = 0; i < Object.keys(skillUpgrades).length; i += 1) {
	let upgrade = document.createElement("button");
	let upg = skillUpgrades[Object.keys(skillUpgrades)[i]];
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

	document.querySelector("#skillTreeArea").appendChild(upgrade);
	elts.skillUpgrades[Object.keys(skillUpgrades)[i]] = upgrade;
}

// setup click events

// title screen
elts.playButton.onclick = function() {
	elts.titleScreen.classList.add("fadeOut");
	elts.titleScreen.style.pointerEvents = "none";
	setTimeout(function() {
		elts.titleScreen.style.display = "none";
	}, 1000);
}

// popup
elts.saveUsernameButton.onclick = function() {
	let inp = elts.usernamePopupInput.value;
	if (inp != "") player.username = elts.usernamePopupInput.value;
	elts.usernamePopup.style.display = "none";
}
elts.cancelUsernameButton.onclick = function() {
	elts.usernamePopup.style.display = "none";
}

// rebirth stuff
elts.rebirthButton1.onclick = function() {
	rebirth(1);
}
elts.rebirthButton2.onclick = function() {
	rebirth(2);
}
elts.rebirthButton3.onclick = function() {
	rebirth(4);
}

// skill reset button
elts.skillResetButton.onclick = function() {
	if (player.drywall >= 10 ** 18) {
		player.skillPoints += getSkillPoints();
		player.drywall = 0;
		player.drywallPS = 0;
		player.drywallPC = 1;
		player.rebirths = 0;
	}
}

// normal upgrades
for (let i = 0; i < upgrades.length; i += 1) {
	let upg = upgrades[i];
	let upgElt = elts.upgrades[i];

	upgElt.onclick = function() {
		if (Date.now() - clickDebounce >= clickDebounceTime) {
			clickDebounce = Date.now();
			if (player[upg.cost[1]] >= upg.cost[0]) {
				player[upg.cost[1]] -= upg.cost[0];
				player[upg.reward[1]] += (upg.reward[0] * player.boosts[upg.reward[1]].multiplier) ** player.boosts[upg.reward[1]].exponent;
				if (player.skillUpgrades.includes("Full Circle I") && upg.reward[1] == "drywallPS") {
					player.drywallPC += ((upg.reward[0] * player.boosts[upg.reward[1]].multiplier) ** player.boosts[upg.reward[1]].exponent) * 0.1;
				}
			}
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

// infinity stuff
elts.infinityResetButton.onclick = () => {
	if (player.drywall === Infinity && player.infinities < infinityMilestones[infinityMilestones.length - 1]) {
		infinity();
		if (player.infinities > infinityMilestones[infinityMilestones.length]) {
			player.infinities = infinityMilestones[infinityMilestones.length];
		}
		updateAllText();
	}
};
for (let i = 0; i < elts.infinityUpgrades.length; i += 1) {
	let elt = elts.infinityUpgrades[i];
	let upgName = infinityUpgradeNames[i];
	let upgCost = infinityUpgradeCosts[upgName]
	elt.onclick = function() {
		let upgLevel = player.infinityUpgrades[upgName];
		if (player[upgCost[1]] >= upgCost[0][upgLevel]) {
			player.infinityUpgrades[upgName] += 1;
			player[upgCost[1]] -= upgCost[0][upgLevel];
		}
	}
}


// settings
applySettings();
usernameSetting.onchange = function() {
	player.username = usernameSetting.value;
}
elts.settingsButton.onclick = function() {
	elts.settings.style.display = "block";
}
elts.closeSettingsButton.onclick = function() {
	elts.settings.style.display = "none";
}

for (let i = 0; i < settingNames.length; i += 1) {
	let sn = settingNames[i];
	let setting = document.getElementById(sn + "Setting");
	if (player.settings[sn]) {
		setting.checked = player.settings[sn];
	}
	setting.onchange = function() {
		player.settings[sn] = setting.checked;
		applySettings();
		saveData("DRYWALL", player);
	}
}
elts.usernameSetting.value = player.username || player.mylbkey;


// Clicking for drywall + dust
let dustSpawnDebounce = Date.now();
for (let i = 0; i < elts.areas.length; i += 1) {
	const bg = elts.areas[i].getElementsByClassName("areaBackground")[0];
	if (!bg) continue;

	const rect = bg.getBoundingClientRect();
	bg.onclick = function(e) {
		if (Date.now() - clickDebounce >= clickDebounceTime) {
			player.drywall += (player.drywallPC * player.boosts.drywall.multiplier) ** player.boosts.drywall.exponent;
			player.stats.clicks += 1;
			clickDebounce = Date.now();
			if (dustSpawnDebounceTime === false) {
				for (let j = 0; j < (player.settings.minimalParticles ? 1 : 4); j++) {
					const dust = document.createElement("div");
					dust.className = "dust";

					// random small horizontal spread
					const offsetX = (Math.random() - 0.5) * 50;
					// start slightly above the actual click
					const offsetY = (Math.random() - 0.5) * 20;

					dust.style.left = (e.clientX - rect.left + offsetX) + "px";
					dust.style.top = (e.clientY - rect.top + offsetY) + "px";

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

					dust.style.left = (e.clientX - rect.left + offsetX) + "px";
					dust.style.top = (e.clientY - rect.top + offsetY) + "px";

					bg.appendChild(dust);

					setTimeout(() => dust.remove(), 600);
				}
			}
		}
	};
}
for (let i = 0; i < elts.areaSelectors.length; i += 1) {
	elts.areaSelectors[i].onclick = function() {
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
	const ampm = hours >= 12 ? 'pm' : 'am';
	hours = hours % 12;
	if (hours === 0) hours = 12;

	// pad minutes and seconds with leading zero if needed
	const minStr = minutes.toString().padStart(2, '0');
	const secStr = seconds.toString().padStart(2, '0');

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


function infinity() {
	checkBoosts();
	player.infinities += (1 * player.boosts.infinities.multiplier) ** player.boosts.infinities.exponent;
	player.infinityPoints += ((1 * player.boosts.infinityPoints.multiplier) ** player.boosts.infinityPoints.exponent) * ((1 * player.boosts.infinities.multiplier) ** player.boosts.infinities.exponent);

	player.drywall = 0;
	player.drywallPC = 1;
	player.drywallPS = 0;
	player.rebirths = 0;
	player.skillPoints = 0;
	player.skillUpgrades = [];

	elts.screenOverlay.classList.add("playFlash");
	setTimeout(function() {
		elts.screenOverlay.classList.remove("playFlash");
	}, 5000);

	for (let i = 0; i < infinityMilestones.length; i += 1) {
		if (player.infinities >= infinityMilestones[i]) {
			elts.infinityMilestones[i].classList.add("unlocked");
		} else {
			elts.infinityMilestones[i].classList.remove("unlocked");
		}
	}
}

function updateAllText() {
	for (let i = 0; i < upgrades.length; i += 1) {
		elts.upgrades[i].innerHTML = abbrevNum(upgrades[i].cost[0]) + " " + displayName[upgrades[i].cost[1]] + " → +" + abbrevNum(upgrades[i].reward[0]) + displayName[upgrades[i].reward[1]];
	}
	for (let i = 0; i < Object.keys(skillUpgrades).length; i += 1) {
		let upgrade = elts.skillUpgrades[Object.keys(skillUpgrades)[i]];
		let upg = skillUpgrades[Object.keys(skillUpgrades)[i]];

		if (typeof skillUpgrades[Object.keys(skillUpgrades)[i]].reward == "string") {
			upgrade.innerHTML = upg.reward + "<br><br>" + abbrevNum(upg.cost[0]) + displayName[upg.cost[1]];
		} else {
			if (upg.reward.length == 2) {
				upgrade.innerHTML = "x" + abbrevNum(upg.reward[0]) + displayName[upg.reward[1]] + "<br><br>" + abbrevNum(upg.cost[0]) + displayName[upg.cost[1]];
			} else {
				upgrade.innerHTML = "^" + abbrevNum(upg.reward[0]) + displayName[upg.reward[1]] + "<br><br>" + abbrevNum(upg.cost[0]) + displayName[upg.cost[1]];
			}
		}
	}
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
	return ((player.drywall / (10 ** 18)) ** 0.1) * player.boosts.skillPoints.multiplier;
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
	if (val === Infinity) {
		return "Infinity";
	}
	if (val < 1000) return roundToSigFigs(val, 3);
	if (player.settings.scientificNotation) {
		let exp = Math.floor(Math.log10(val));
		if (!(exp >= 0)) exp = 0;
		return roundToSigFigs(val / (10 ** exp), 3) + "e" + exp;
	} else {
		let exp = Math.floor(Math.log10(val) / 3);
		if (!(exp >= 0)) exp = 0;
		return roundToSigFigs(val / (10 ** (exp * 3)), 3) + suffixes[exp];
	}
}

function tick() {
    let now = Date.now();
    let dt = now - lastUpdate;
    lastUpdate = now;

    update(dt);
    render(dt);
}


// Boosts
function checkInfinityUpgrades() {
	if (player.infinityUpgrades["Infinity Power I"] >= 1) {
		player.boosts.infinityPower.multiplier = 0.01
	} else {
		player.boosts.infinityPower.multiplier = 0;
	}
	player.boosts.infinityPower.multiplier *= (10 ** (player.infinityUpgrades["Infinity Power I"] - 1)) * (2 ** player.infinityUpgrades["Infinity Power II"]);
	player.boosts.drywall.multiplier *= 3 ** player.infinityUpgrades["Drywall I"];
	player.boosts.drywallPS.multiplier *= 2 ** player.infinityUpgrades["Drywall/sec I"];
	player.boosts.skillPoints.multiplier *= 2 ** player.infinityUpgrades["Skill Points I"];
	player.boosts.infinities.multiplier *= 2 ** player.infinityUpgrades["Infinities I"];
	
	if (player.infinities >= 1) {
		if (!player.skillUpgrades.includes("Time-saver I")) {
			player.skillUpgrades.push("Time-saver I");
		}
		if (!player.skillUpgrades.includes("Time-saver II")) {
			player.skillUpgrades.push("Time-saver II");
		}
	}
	if (player.infinities >= 2) {
		player.boosts.drywall.multiplier *= 3;
		player.boosts.drywallPC.multiplier *= 3;
		player.boosts.drywallPS.multiplier *= 3;
		player.boosts.skillPoints.multiplier *= 3;
		player.boosts.infinityPoints.multiplier *= 2;
	}
	if (player.infinities >= 3) {
		player.passive.skillPoints = 0.001;
		player.boosts.infinityPower.multiplier *= 5;
		player.boosts.drywall.multiplier *= 100;
	}
	if (player.infinities >= 5) {
		player.passive.skillPoints = 0.01;
	}
	if (player.infinities >= 8) {
		player.passive.skillPoints = 0.05;
	}
}

function checkAchievementBoosts() {
	for (let i of player.achievements) {
		let reward = achievements[i].reward;
		if (reward) {
			player.boosts[reward.type].multiplier *= reward.amount;
		}
	}
}

function checkBoosts() {
	// Reset
	for (var i = 0; i < Object.keys(player).length; i += 1) {
		player.boosts[Object.keys(player)[i]] = {multiplier: 1, exponent: 1};
		player.passive[Object.keys(player)[i]] = 0;
	}
	checkInfinityUpgrades();

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
	if (player.skillUpgrades.includes("Conversion V")) {
		convExp = 0.6;
	}
	let arthritisExp = 0.7;
	let arthritisDen = 100000;
	if (player.skillUpgrades.includes("Arthritis V")) {
		arthritisExp = 0.9;
		arthritisDen = 100;
	}
	let selfBoostExp = 0.0001;

	// Calculate their boosts
	for (let i = 0; i < player.skillUpgrades.length; i += 1) {
		let skillUpg = skillUpgrades[player.skillUpgrades[i]];
		if (typeof skillUpg.reward == "string") {
			if (player.skillUpgrades[i] == "Conversion I") {
				player.boosts.drywallPS.multiplier *= player.drywallPC ** convExp;
			} else if (player.skillUpgrades[i] == "Arthritis IV") {
				player.boosts.drywallPC.multiplier *= (player.skillPoints / arthritisDen) ** arthritisExp;
			} else if (player.skillUpgrades[i] == "Self-boost I") {
				player.boosts.drywall.exponent *= (player.drywall + 1) ** selfBoostExp;
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


function saveData(key, data) {
	const now = Date.now();
	if (now - lastSave > 1000) { // 1 second limit
		localStorage.setItem(key, JSON.stringify(data));
		lastSave = now;
	}
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
	if (player.skillUpgrades.includes("Conversion V")) {
		convExp = 0.6;
	}
	
	let arthritisExp = 0.7;
	let arthritisDen = 100000;
	if (player.skillUpgrades.includes("Arthritis V")) {
		arthritisExp = 0.9;
		arthritisDen = 100;
	}
	let selfBoostExp = 0.0001;

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
			skillUpgElt.style.boxShadow = "none";
			skillUpgElt.style.backgroundColor = ""; 
			skillUpgElt.style.color = ""; 
			skillUpgElt.style.cursor = "default";
			if (typeof skillUpg.reward === "string") {
				if (upgName === "Conversion I") {
					skillUpgElt.innerHTML = skillUpg.reward + "<br><br>Bought. (x" + abbrevNum(player.drywallPC ** convExp) + ")";
				} else if (upgName === "Arthritis IV") {
					skillUpgElt.innerHTML = skillUpg.reward + "<br><br>Bought. (x" + abbrevNum((player.skillPoints / arthritisDen) ** arthritisExp) + ")";
				} else if (upgName === "Self-boost I") {
					skillUpgElt.innerHTML = skillUpg.reward + "<br><br>Bought. (^" + abbrevNum((player.drywall + 1) ** selfBoostExp) + ")";
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
			skillUpgElt.style.boxShadow = "0px 0px 16px #dddddd80";
			skillUpgElt.style.cursor = "pointer";
			
			if (skillUpgUnlocked) {
				skillUpgElt.style.backgroundColor = "#30303050";

				skillUpgElt.style.color = "#f2f2f2";
        		skillUpgElt.style.backdropFilter = "blur(8px)"
			} else {
				skillUpgElt.style.backgroundColor = "#30303020";
				skillUpgElt.style.color = "#f2f2f290";
				skillUpgElt.style.backdropFilter = "blur(6px)"
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
	const { data, error } = await supabase
		.from("leaderboard")
		.select("key, displayName, drywall, rebirths, skill_points, infinities, achievements");

	if (error) {
		console.error("Error loading leaderboard:", error.message);
		return {};
	}

	const leaderboardTypes = ["drywall", "rebirths", "skill_points", "infinities", "achievements"];

	for (const type of leaderboardTypes) {
		leaderboards[type] = data
			.filter(entry => entry[type] !== null && !isNaN(entry[type]))
			.map(entry => ({
				key: entry.key,
				displayName: entry.displayName,
				value: Number(entry[type])
			}))
			.sort((a, b) => b.value - a.value)
			.slice(0, 10);
	}

	console.log(leaderboards);
	return leaderboards;
}

async function submitScore(name, score) {
  let { error } = await supabase.from("leaderboard").insert([{ name, score }]);

  if (!error) {
    loadLeaderboard(); // refresh
  }
}

async function saveDataToLeaderboard() {
  let playerName = player.mylbkey;

  if (!playerName || player.drywall === undefined || player.username === "ICodeBugs (indev)") return;

  let leaderboardDrywall = Math.floor(player.drywall);
  if (player.drywall === Infinity) {
  	leaderboardDrywall = "Infinity";
  }
  let { error } = await supabase.from("leaderboard").upsert(
    {
      key: player.mylbkey,
      drywall: leaderboardDrywall,
      rebirths: Math.floor(player.rebirths),
      skill_points: Math.floor(player.skillPoints),
      infinities: Math.floor(player.infinities),
      achievements: player.achievements.length,
      flagged: false,
      displayName: player.username || player.mylbkey,
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

function getLeaderboardText(boardType) {
	let text = "";
	if (Object.keys(leaderboards).length == 0) {
		// not loaded
	} else {
		let lb = leaderboards[boardType];
		if (lb) {
			for (var i of Object.keys(lb)) {
				text += lb[i].displayName + " - " + abbrevNum(lb[i].value) + "<br>";
			}
		} else {
			console.warn("Leaderboard '" + boardType + "' not found (somethings broken)");
		}
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
		ctx.strokeStyle = "#dddddda0";
		ctx.lineWidth = 4;
		
		ctx.moveTo(thisUpgrade.x + window.innerWidth / 2, thisUpgrade.y + 200 + window.innerHeight / 2);
		ctx.lineTo(connection.x + window.innerWidth / 2, connection.y + 200 + window.innerHeight / 2);
		ctx.stroke();

		drawLinesFromUpgrade(i);
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
			if (playerAmt >= achievement.requirement.amount) {
				list.push(name);
				if (toBeShown) {
					awardAchievement(name);
				}
			}
		} else if (name == "Alpha Tester") {
			awardAchievement("Alpha Tester");
		} else if (name == "Beta Tester") {
			// awardAchievement("Beta Tester");
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
	console.log("Showing " + name + ", Tier: " + a.tier)
	elts.achievementNotification.classList.add("popout");

	elts.achievementName.innerHTML = name;
	elts.achievementDescription.innerHTML = a.description;
	elts.achievementIcon.src = "assets/icons/" + name + ".png";

	if (a.tier == 1) {
		elts.achievementIcon.style.filter = "drop-shadow(0px 0px 8px #ffffff60)";
	} else if (a.tier == 2) {
		elts.achievementIcon.style.filter = "drop-shadow(0px 0px 8px #88ffaa60)";
	} else if (a.tier == 3) {
		elts.achievementIcon.style.filter = "drop-shadow(0px 0px 8px #88aaff60)";
	} else if (a.tier == 4) {
		elts.achievementIcon.style.filter = "drop-shadow(0px 0px 8px #ffdd8860)";
	} else if (a.tier == 5) {
		elts.achievementIcon.style.filter = "drop-shadow(0px 0px 8px #ff778860)";
	}

	if (a.reward) {
		elts.achievementReward.innerHTML = "x" + a.reward.amount + displayName[a.reward.type];
	} else {
		elts.achievementReward.innerHTML = "";
	}

	setTimeout(function() {
		elts.achievementNotification.classList.remove("popout");

		setTimeout(function() {
			achievementQueue.splice(0, 1);
			if (achievementQueue.length > 0) {
				showAchievement(achievementQueue[0]);
			}
		}, 500)
	}, 5000);
}

function update(dt) {
	checkBoosts();
	if (player.drywall !== Infinity) {
		player.drywall += ((player.drywallPS * player.boosts.drywall.multiplier) ** player.boosts.drywall.exponent) * dt / 1000;
	}
	if (player.skillUpgrades.includes("Time-saver II") && player.settings.autoRebirth) {
		rebirth(1);
	}

	checkAllAchievements(true);
	player.infinityPower += ((player.boosts.infinityPower.multiplier) ** player.boosts.infinityPower.exponent) * dt / 1000;
	player.skillPoints += getSkillPoints() * player.passive.skillPoints * dt / 1000;
	player.stats.playtime += dt;

	if (Date.now() - lastLeaderboardUpdate >= 60000) {
		saveDataToLeaderboard();
		lastLeaderboardUpdate = Date.now();
	}
	saveData("DRYWALL", player);
}


function render(dt) {
	elts.drywallStat.textContent = "Drywall: " + abbrevNum(player.drywall) + " (x" + abbrevNum(player.boosts.drywall.multiplier) + ")";
	elts.drywallPCStat.textContent = "Drywall/click: " + abbrevNum(player.drywallPC) + " (x" + abbrevNum(player.boosts.drywallPC.multiplier) + ")";
	elts.drywallPSStat.textContent = "Drywall/sec: " + abbrevNum(player.drywallPS) + " (x" + abbrevNum(player.boosts.drywallPS.multiplier) + ")";
	elts.rebirthsStat.textContent = abbrevNum(player.rebirths) + " rebirths";
	elts.skillPointsStat.textContent = "Skill Points: " + abbrevNum(player.skillPoints);
	elts.infinityPointsStat.textContent = "Infinity Points: " + abbrevNum(player.infinityPoints);
	elts.infinityPowerStat.textContent = "Infinity Power: " + abbrevNum(player.infinityPower);
	elts.clicksStat.textContent = "Clicks: " + abbrevNum(player.stats.clicks);
	elts.playtimeStat.textContent = "Playtime: " + formatMillis(player.stats.playtime);

	for (let i = 0; i < elts.infinityUpgrades.length; i += 1) {
		let upg = elts.infinityUpgrades[i];
		let upgCost = infinityUpgradeCosts[infinityUpgradeNames[i]];

		if (player.infinityUpgrades[infinityUpgradeNames[i]] < upgCost[0].length) {
			upg.children[1].textContent = abbrevNum(upgCost[0][player.infinityUpgrades[infinityUpgradeNames[i]]]) + displayName[upgCost[1]];
		} else {
			upg.children[1].textContent = "Max level!"
		}

		if (i == 0 && player.infinityUpgrades["Infinity Power I"] >= 1) {
			upg.children[0].textContent = "x10 Infinity Power";
		}
	}

	if (player.drywall >= 1 * (10 ** 15) || player.skillPoints > 0 || player.infinities > 0) {
		elts.areaSelectors[4].style.display = "inline-block";
	} else {
		elts.areaSelectors[4].style.display = "none";
	}
	if (player.drywall >= 10 ** 300 || player.infinities > 0) {
		elts.areaSelectors[5].style.display = "inline-block";
	} else {
		elts.areaSelectors[5].style.display = "none";
	}


	elts.rebirthButton1.textContent = "Rebirth for " + abbrevNum((2 ** player.rebirths) * 1000000);
	elts.rebirthButton2.textContent = "Rebirth TWICE for " + abbrevNum((2 ** player.rebirths) * 1000000 * 3);
	elts.rebirthButton3.textContent = "Rebirth FOUR TIMES for " + abbrevNum((2 ** player.rebirths) * 1000000 * 15);
	if (player.drywall > 10 ** 18) {
		elts.skillResetButton.textContent = "Reset for +" + abbrevNum(getSkillPoints()) + " skill points";
	} else {
		elts.skillResetButton.textContent = "Reach 1qn to reset";
	}
	elts.leaderboard1Div.querySelector("p").innerHTML = getLeaderboardText("drywall");
	elts.leaderboard2Div.querySelector("p").innerHTML = getLeaderboardText("infinities");
	elts.leaderboard3Div.querySelector("p").innerHTML = getLeaderboardText("achievements");

	updateSkillTreeElements();

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawLinesFromUpgrade("Drywall Efficiency I");
}