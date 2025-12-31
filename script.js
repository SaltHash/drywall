// Wrappers
const D = x => x instanceof Decimal ? x : new Decimal(x);

// Elements
let elts = {
	// Manually defined
	clickers: document.getElementsByClassName("clicker"),
	infinityUpgrades: [
		...document.getElementById("generatorUpgrades").children,
		...document.getElementById("infinityPowerUpgrades").children
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



// Settings
const dustSpawnDebounceTime = false;
const clickDebounceTime = 65;

const infinityThreshold = D(2).pow(1024);

const achievements = {
	// drywall achievements
	"Welcome!": {
		requirement: {amount: D(1), type: ["drywall"]},
		description: "Your first drywall, we all start somewhere.",
		tier: 1,
	},
	"Millionaire": {
		requirement: {amount: D(10).pow(6), type: ["drywall"]},
		reward: {amount: D(1.1), type: "drywall"},
		description: "Reach 1 million drywall. Still poor btw.",
		tier: 1,
	},
	"Billionaire": {
		requirement: {amount: D(10).pow(9), type: ["drywall"]},
		reward: {amount: D(1.2), type: "drywall"},
		description: "Wow a billion? Thats enough for a big mac!",
		tier: 1,
	},
	"Trillionaire": {
		requirement: {amount: D(10).pow(12), type: ["drywall"]},
		reward: {amount: D(1.2), type: "drywall"},
		description: "Reach 1 trillion drywall. I ran out of corny jokes.",
		tier: 1,
	},
	"Decillionaire": {
		requirement: {amount: D(10).pow(33), type: ["drywall"]},
		reward: {amount: D(1.3), type: "drywall"},
		description: "Reach 1 decillion drywall. A big gap, but you made it, right?",
		tier: 2,
	},
	"Vigintillionaire": {
		requirement: {amount: D(10).pow(63), type: ["drywall"]},
		reward: {amount: D(1.3), type: "drywall"},
		description: "Reach 1 vigintillion drywall. You almost beat the game! nah jk",
		tier: 2,
	},
	"Scrooge Mc. Duck": {
		requirement: {amount: D(2.5).times(D(10).pow(135)), type: ["drywall"]},
		reward: {amount: D(1.3), type: "drywall"},
		description: "Reach 2.5e135 drywall. Thats enough to buy the final drywall upgrade! Well, for now at least.",
		tier: 2,
	},
	"THATS A LOT OF DRYWALL": {
		requirement: {amount: D(10).pow(1000), type: ["drywall"]},
		reward: {amount: D(1000), type: "drywall"},
		description: "Reach 1e1000 drywall. Not a jump at all :D",
	},
	
	// playtime achievements
	"Fulfillment": {
		requirement: {amount: D(10).times(60).times(1000), type: ["stats", "playtime"]},
		reward: {amount: D(1.1), type: "drywallPS"},
		description: "Play for 10 minutes.",
		tier: 1,
	},
	"Enjoyment": {
		requirement: {amount: D(60).times(60).times(1000), type: ["stats", "playtime"]},
		reward: {amount: D(1.2), type: "drywallPS"},
		description: "Play for an hour. Starting to have fun now?",
		tier: 1,
	},
	"Dedication": {
		requirement: {amount: D(5).times(60).times(60).times(1000), type: ["stats", "playtime"]},
		reward: {amount: D(1.3), type: "drywallPS"},
		description: "Play for 5 hours.",
		tier: 2,
	},
	"Connoisseur": {
		requirement: {amount: D(24).times(60).times(60).times(1000), type: ["stats", "playtime"]},
		reward: {amount: D(1.5), type: "drywallPS"},
		description: "Play for a day (24 hours). Still enjoying it?",
		tier: 2,
	},
	"Beyond no-life": {
		requirement: {amount: D(7).times(24).times(60).times(60).times(1000), type: ["stats", "playtime"]},
		reward: {amount: D(5), type: "drywallPS"},
		description: "Play for a whole week (168 hours). Go touch grass or something.",
		tier: 3,
	},

	// click achievements
	"Beginner Clicker": {
		requirement: {amount: D(10).pow(2), type: ["stats", "clicks"]},
		reward: {amount: D(1.1), type: "drywallPC"},
		description: "Click 100 times.",
		tier: 1,
	},
	"Mouse Abuse": {
		requirement: {amount: D(10).pow(3), type: ["stats", "clicks"]},
		reward: {amount: D(1.3), type: "drywallPC"},
		description: "Click a thousand times.",
		tier: 1,
	},
	"Nuclear Clicker": {
		requirement: {amount: D(10).pow(4), type: ["stats", "clicks"]},
		reward: {amount: D(1.5), type: "drywallPC"},
		description: "Click 10 thousand times. Fun fact: you can click at most once every 65 milliseconds (~15 cps).",
		tier: 2,
	},
	"Supernova": {
		requirement: {amount: D(10).pow(5), type: ["stats", "clicks"]},
		reward: {amount: D(3), type: "drywallPC"},
		description: "Click 100 THOUSAND times. 1.8 hours of nonstop clicking. Ya done yet?",
		tier: 2,
	},
	"Godly Clicker": {
		requirement: {amount: D(10).pow(6), type: ["stats", "clicks"]},
		reward: {amount: D(2), type: "infinityPower"},
		description: "Click one MILLION times. That takes at LEAST 18 hours, just why...",
		tier: 3,
	},

	// infinity achievements
	"Infinity": {
		requirement: {amount: D(1), type: ["infinities"]},
		reward: {amount: D(1.5), type: "drywall"},
		description: "Hit ~1.79e308 drywall and perform the infinity reset. Welcome to the big leagues, I guess.",
		tier: 1,
	},
	"Deca-infinity": {
		requirement: {amount: D(10), type: ["infinities"]},
		reward: {amount: D(2), type: "drywallPS"},
		description: "Reach 10 infinities. ",
		tier: 2,
	},
	"Infinity Centipede": {
		requirement: {amount: D(100), type: ["infinities"]},
		reward: {amount: D(1.5), type: "infinityPower"},
		description: "Reach 100 infinities",
		tier: 2,
	},
	"Need. More. Infinities.": {
		requirement: {amount: D(1000), type: ["infinities"]},
		reward: {amount: D(1.5), type: "drywall"},
		description: "Reach one THOUSAND infinities. It only gets crazier from here.",
		tier: 2,
	},
	"The Gap": {
		requirement: {amount: D(10000), type: ["infinities"]},
		reward: {amount: D(1.5), type: "drywall"},
		description: "Reach 10 thousand infinities. Now its time to max out every part of the game. Getting to the next milestone won't be easy.",
		tier: 2,
	},
	"Particle Accelerator": {
		requirement: {amount: D(1000000), type: ["infinities"]},
		reward: {amount: D(5), type: "infinityPower"},
		description: "Reach one MILLION infinities. You're almost there...",
		tier: 3,
	},

	// infinity power
	"potato": {
		requirement: {amount: D(100), type: ["infinityPower"]},
		reward: {amount: D(1.1), type: "infinityPower"},
		description: "<span style='color: #eee; font-weight: 700; font-family: &quot;Comic Neue&quot;, &quot;Comic Sans MS&quot;, &quot;Comic Sans&quot;, cursive;'>make 100 infinity power 🥔</span>",
		tier: 1,
	},
	"Megajoule": {
		requirement: {amount: D(10).pow(6), type: ["infinityPower"]},
		reward: {amount: D(1.2), type: "infinityPower"},
		description: "Generate 1 million infinity power. *insert energy buzzing sound*",
		tier: 2,
	},
	"Power Enthusiast": {
		requirement: {amount: D(10).pow(9), type: ["infinityPower"]},
		reward: {amount: D(1.5), type: "infinityPower"},
		description: "Generate 1 billion infinity power. Having fun?",
		tier: 2,
	},
	"Trillionaire pt. 2": {
		requirement: {amount: D(10).pow(12), type: ["infinityPower"]},
		reward: {amount: D(2), type: "infinityPower"},
		description: "Generate 1 trillion infinity power. I am SO proud of you.",
		tier: 2,
	},
	"Suspicious amounts of power": {
		requirement: {amount: D(10).pow(18), type: ["infinityPower"]},
		reward: {amount: D(10), type: "drywallPC"},
		description: "Generate 1 quintillion infinity power. Where did you even get this power?",
		tier: 3,
	},
	"Nuclear reactor": {
		requirement: {amount: D(10).pow(33), type: ["infinityPower"]},
		reward: {amount: D(2), type: "infinities"},
		description: "Generate 1 DECILLION infinity power. Too. Much. Power.",
		tier: 3,
	},
	"Dyson sphere": {
		requirement: {amount: D(10).pow(63), type: ["infinityPower"]},
		reward: {amount: D(3), type: "infinities"},
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
		reward: {amount: D(1.11), type: "drywall"},
		tier: 1,
		description: "Read the changelog.",
	},
	"Infinity Tree Completionist": {
		reward: {amount: D(10), type: "infinityPower"},
		description: "Buy every single upgrade in the infinity tree.",
		tier: 3,
	},

	"EZ Rebirth": {
		reward: {amount: D(1.5), type: "drywall"},
		description: "Rebirth in 10 clicks (ALL clicks) or less!",
		tier: 1,
	},
	"EZ Skill Reset": {
		reward: {amount: D(1.5), type: "skillPoints"},
		description: "Skill reset in 10 clicks (ALL clicks) or less!",
		tier: 2,
	},
	"EZ Infinity": {
		reward: {amount: D(1.5), type: "infinityPoints"},
		description: "Infinity in 10 clicks (ALL clicks) or less! Must. Keep. Pushing.",
		tier: 3,
	},
};

const upgrades = [
	{
		cost: [D(25), "drywall"],
		reward: [D(1), "drywallPC"]
	},
	{
		cost: [D(600), "drywall"],
		reward: [D(10), "drywallPC"]
	},
	{
		cost: [D(165000), "drywall"],
		reward: [D(850), "drywallPC"]
	},
	{
		cost: [D(50), "drywall"],
		reward: [D(10), "drywallPS"]
	},
	{
		cost: [D(35000), "drywall"],
		reward: [D(700), "drywallPS"]
	},
	{
		cost: [D(8).times(D(10).pow(6)), "drywall"],
		reward: [D(80000), "drywallPS"]
	},
	{
		cost: [D(1).times(D(10).pow(9)), "drywall"],
		reward: [D(75000), "drywallPC"]
	},
	{
		cost: [D(150).times(D(10).pow(15)), "drywall"],
		reward: [D(20).times(D(10).pow(6)), "drywallPC"]
	},
	{
		cost: [D(5).times(D(10).pow(24)), "drywall"],
		reward: [D(800).times(D(10).pow(6)), "drywallPC"]
	},
	{
		cost: [D(3.5).times(D(10).pow(12)), "drywall"],
		reward: [D(6).times(D(10).pow(6)), "drywallPS"]
	},
	{
		cost: [D(850).times(D(10).pow(18)), "drywall"],
		reward: [D(900).times(D(10).pow(6)), "drywallPS"]
	},
	{
		cost: [D(2.5).times(D(10).pow(27)), "drywall"],
		reward: [D(85).times(D(10).pow(9)), "drywallPS"]
	},
	{
		cost: [D(10).times(D(10).pow(45)), "drywall"],
		reward: [D(160).times(D(10).pow(9)), "drywallPC"]
	},
	{
		cost: [D(10).times(D(10).pow(69)), "drywall"],
		reward: [D(18).times(D(10).pow(12)), "drywallPC"]
	},
	{
		cost: [D(100).times(D(10).pow(108)), "drywall"],
		reward: [D(55).times(D(10).pow(15)), "drywallPC"]
	},
	{
		cost: [D(2.5).times(D(10).pow(54)), "drywall"],
		reward: [D(15).times(D(10).pow(12)), "drywallPS"]
	},
	{
		cost: [D(1.5).times(D(10).pow(84)), "drywall"],
		reward: [D(50).times(D(10).pow(15)), "drywallPS"]
	},
	{
		cost: [D(2.5).times(D(10).pow(135)), "drywall"],
		reward: [D(85).times(D(10).pow(18)), "drywallPS"]
	},
	{
		cost: [D(1).times(D(10).pow(400)), "drywall"],
		reward: [D(1).times(D(10).pow(40)), "drywallPC"]
	},
	{
		cost: [D(8).times(D(10).pow(650)), "drywall"],
		reward: [D(3).times(D(10).pow(55)), "drywallPC"]
	},
	{
		cost: [D(5).times(D(10).pow(1000)), "drywall"],
		reward: [D(1).times(D(10).pow(100)), "drywallPC"]
	},
	{
		cost: [D(2.5).times(D(10).pow(540)), "drywall"],
		reward: [D(3).times(D(10).pow(28)), "drywallPS"]
	},
	{
		cost: [D(1.5).times(D(10).pow(845)), "drywall"],
		reward: [D(2).times(D(10).pow(35)), "drywallPS"]
	},
	{
		cost: [D(1).times(D(10).pow(1200)), "drywall"],
		reward: [D(6.5).times(D(10).pow(45)), "drywallPS"]
	},
];

const skillUpgrades = {
	"Drywall Efficiency I": {
		cost: [D(1), "skillPoints"],
		reward: [D(2), "drywall"],
		connects: false,
		x: 0,
		y: 0,
	},
	"Drywall Efficiency II": {
		cost: [D(1.5), "skillPoints"],
		reward: [D(3), "drywall"],
		connects: ["Drywall Efficiency I"],
		x: 0,
		y: 200,
	},
	"Drywall Efficiency III": {
		cost: [D(4), "skillPoints"],
		reward: [D(5), "drywall"],
		connects: ["Drywall Efficiency II"],
		x: 0,
		y: 400,
	},
	"Drywall Efficiency IV": {
		cost: [D(15), "skillPoints"],
		reward: [D(8), "drywall"],
		connects: ["Drywall Efficiency III"],
		x: -100,
		y: 600,
	},
	"Drywall Efficiency V": {
		cost: [D(80), "skillPoints"],
		reward: [D(15), "drywall"],
		connects: ["Drywall Efficiency IV"],
		x: -200,
		y: 800,
	},
	"Drywall Efficiency VI": {
		cost: [D(6000), "skillPoints"],
		reward: [D(50), "drywall"],
		connects: ["Drywall Efficiency V"],
		x: -200,
		y: 1000,
	},
	"Arthritis I": {
		cost: [D(8), "skillPoints"],
		reward: [D(5), "drywallPC"],
		connects: ["Drywall Efficiency III"],
		x: 100,
		y: 600,
	},
	"Arthritis II": {
		cost: [D(45), "skillPoints"],
		reward: [D(15), "drywallPC"],
		connects: ["Arthritis I"],
		x: 200,
		y: 800,
	},
	"Arthritis III": {
		cost: [D(800), "skillPoints"],
		reward: [D(100), "drywallPC"],
		connects: ["Arthritis II"],
		x: 400,
		y: 700,
	},
	"Arthritis IV": {
		cost: [D(350).times(D(10).pow(6)), "skillPoints"],
		reward: "Skill points boosts drywall/click (/100k, ^0.7)",
		connects: ["Arthritis III"],
		x: 400,
		y: 500,
	},
	"Arthritis V": {
		cost: [D(2).times(D(10).pow(9)), "skillPoints"],
		reward: "Improve to /100 and ^0.9",
		connects: ["Arthritis IV"],
		x: 600,
		y: 500,
	},
	"Arthritis VI": {
		cost: [D(5).times(D(10).pow(55)), "skillPoints"],
		reward: "Improve to no quotient (/1)",
		connects: ["Arthritis V"],
		x: 800,
		y: 400,
	},
	"Arthritis VII": {
		cost: [D(2).times(D(10).pow(57)), "skillPoints"],
		reward: "Improve to no exponent (^1)",
		connects: ["Arthritis V"],
		x: 800,
		y: 600,
	},
	"Arthritis VIII": {
		cost: [D(1).times(D(10).pow(137)), "skillPoints"],
		reward: "Improve the exponent to ^1.1",
		connects: ["Arthritis VI", "Arthritis VII"],
		x: 1000,
		y: 500,
	},
	"Conversion I": {
		cost: [D(150), "skillPoints"],
		reward: "Drywall/click boosts drywall/sec (^0.2)",
		connects: ["Arthritis II"],
		x: 400,
		y: 900,
	},
	"Conversion II": {
		cost: [D(400), "skillPoints"],
		reward: "Improve the drywall/sec boost exponent by +0.1",
		connects: ["Conversion I"],
		x: 600,
		y: 900,
	},
	"Conversion III": {
		cost: [D(2000), "skillPoints"],
		reward: "Improve the drywall/sec boost exponent by +0.1",
		connects: ["Conversion II"],
		x: 800,
		y: 900,
	},
	"Conversion IV": {
		cost: [D(10).times(D(10).pow(9)), "skillPoints"],
		reward: "Improve the drywall/sec boost exponent by +0.1",
		connects: ["Conversion III"],
		x: 1000,
		y: 900,
	},
	"Conversion V": {
		cost: [D(500).times(D(10).pow(12)), "skillPoints"],
		reward: "Improve the drywall/sec boost exponent by +0.1",
		connects: ["Conversion IV"],
		x: 1200,
		y: 800,
	},
	"Conversion VI": {
		cost: [D(1).times(D(10).pow(40)), "skillPoints"],
		reward: "Improve the drywall/sec boost exponent by +0.05",
		connects: ["Conversion V"],
		x: 1400,
		y: 800,
	},
	"Full Circle I": {
		cost: [D(10).times(D(10).pow(15)), "skillPoints"],
		reward: "10% of drywall/sec turns into drywall/click",
		connects: ["Conversion IV"],
		x: 1200,
		y: 1000,
	},
	"Exponential I": {
		cost: [D(90000), "skillPoints"],
		reward: [D(1.05), "drywall", true],
		connects: ["Drywall Efficiency VI"],
		x: -200,
		y: 1200,
	},
	"Exponential II": {
		cost: [D(300000), "skillPoints"],
		reward: [D(1.01), "drywall", true],
		connects: ["Exponential I"],
		x: -200,
		y: 1400,
	},
	"Exponential III": {
		cost: [D(400000), "skillPoints"],
		reward: [D(1.02), "drywall", true],
		connects: ["Exponential II"],
		x: -200,
		y: 1600,
	},
	"Exponential IV": {
		cost: [D(600000), "skillPoints"],
		reward: [D(1.02), "drywall", true],
		connects: ["Exponential III"],
		x: -200,
		y: 1800,
	},
	"Exponential V": {
		cost: [D(900000), "skillPoints"],
		reward: [D(1.03), "drywall", true],
		connects: ["Exponential IV"],
		x: 0,
		y: 1800,
	},
	"Exponential VI": {
		cost: [D(2).times(D(10).pow(12)), "skillPoints"],
		reward: [D(1.03), "drywall", true],
		connects: ["Exponential V"],
		x: 200,
		y: 1900,
	},
	"Exponential VII": {
		cost: [D(250).times(D(10).pow(18)), "skillPoints"],
		reward: [D(1.03), "drywall", true],
		connects: ["Exponential VI"],
		x: 400,
		y: 2000,
	},
	"Self-boost I": {
		cost: [D(100).times(D(10).pow(21)), "skillPoints"],
		reward: "Drywall exponentiated by itself (^0.0001, max 1.15)",
		connects: ["Exponential VI"],
		x: 200,
		y: 1700,
	},
	"Skill Enhancement I": {
		cost: [D(2), "skillPoints"],
		reward: [D(1.5), "skillPoints"],
		connects: ["Drywall Efficiency I"],
		x: -200,
		y: 0,
	},
	"Skill Enhancement II": {
		cost: [D(30000), "skillPoints"],
		reward: [D(2), "skillPoints"],
		connects: ["Skill Enhancement I"],
		x: -400,
		y: 0,
	},
	"Time-saver I": {
		cost: [D(0), "skillPoints"],
		reward: "Rebirth no longer resets. (settings)",
		connects: ["Drywall Efficiency I"],
		x: 200,
		y: 0,
	},
	"Time-saver II": {
		cost: [D(50).times(D(10).pow(9)), "skillPoints"],
		reward: "Auto-rebirth.",
		connects: ["Time-saver I"],
		x: 400,
		y: 0,
	},
};

const infinityTreeUpgrades = {
	"Automation I": {
		cost: [D(1), "infinityPoints"],
		reward: "x2 skill points, generate skill points at a rate of 1%/sec, keep auto and no-cost rebirth.",
		x: -400, y: 0,
		connects: false,
	},
	"Automation II": {
		cost: [D(150), "infinityPoints"],
		reward: "Gain +19 skill tree autobuyers.",
		x: -550, y: 220,
		connects: ["Automation I"],
	},
	"Automation III": {
		cost: [D(600), "infinityPoints"],
		reward: "Gain +10 skill tree autobuyers.",
		x: -250, y: 220,
		connects: ["Automation I"],
	},
	"Automation IV": {
		cost: [D(2500), "infinityPoints"],
		reward: "Unlock auto-infinity.",
		x: -400, y: 440,
		connects: ["Automation II", "Automation III"],
	},
	"Automation V": {
		cost: [D(10).pow(4), "infinityPoints"],
		reward: "Generate skill points at a rate of 100%/sec.",
		x: -400, y: 1100,
		connects: ["Automation IV"],
	},
	"Break Infinity": {
		cost: [D(4).times(D(10).pow(9)), "infinityPoints"],
		reward: "Break infinity.",
		x: -400, y: 1980,
		connects: ["Automation V"],
	},
	"Automation VI": {
		cost: [D(10).pow(27), "infinityPoints"],
		reward: "Gain +4 skill tree autobuyers.",
		x: -400, y: 2420,
		connects: ["Automation V"],
	},
	"Everything Boost I": {
		cost: [D(1), "infinityPoints"],
		reward: "x3 all previous stats.",
		x: 400, y: 0,
		connects: false,
	},
	"Everything Boost II": {
		cost: [D(1), "infinityPoints"],
		reward: "x25 drywall and x2 infinity points.",
		x: 550, y: 220,
		connects: ["Everything Boost I"],
	},
	"Everything Boost III": {
		cost: [D(2), "infinityPoints"],
		reward: "x2 all previous stats and x2 infinity points.",
		x: 250, y: 220,
		connects: ["Everything Boost I"],
	},
	"IP Boost I": {
		cost: [D(3), "infinityPoints"],
		reward: "x2 infinity points and x3 infinity power.",
		x: 400, y: 440,
		connects: ["Everything Boost II", "Everything Boost III"],
	},
	"IP Boost II": {
		cost: [D(100000), "infinityPower"],
		reward: "x2 infinity points and ^1.05 infinity power.",
		x: 400, y: 660,
		connects: ["IP Boost I"],
	},
	"IP Boost III": {
		cost: [D(10000000), "infinityPower"],
		reward: "x2 infinity points and ^1.02 infinity power.",
		x: 250, y: 880,
		connects: ["IP Boost II"],
	},
	"IP Boost IV": {
		cost: [D(10).pow(9), "infinityPower"],
		reward: "x3 infinity points and ^1.02 infinity power.",
		x: 550, y: 880,
		connects: ["IP Boost II"],
	},
	"IP Boost V": {
		cost: [D(10).pow(12), "infinityPower"],
		reward: "x2 infinity points, ^1.1 infinity power.",
		x: 400, y: 1100,
		connects: ["IP Boost III", "IP Boost IV"],
	},
	"IP Self-Boost I": {
		cost: [D(1000), "infinityPoints"],
		reward: "Infinity Power boosted by itself.",
		x: 250, y: 1320,
		connects: ["IP Boost V"],
	},
	"IP Infinity Boost I": {
		cost: [D(10).pow(18), "infinityPower"],
		reward: "Infinity Points boosted by infinities.",
		x: 550, y: 1320,
		connects: ["IP Boost V"],
	},
	"Gamer I": {
		cost: [D(10).pow(25), "infinityPower"],
		reward: "Unlock minigames.",
		x: 400, y: 1540,
		connects: ["IP Self-Boost I", "IP Infinity Boost I"],
	},
	"Gamer II": {
		cost: [D(10).pow(6), "infinityPoints"],
		reward: "Double minigame rewards.",
		x: 250, y: 1760,
		connects: ["Gamer I"],
	},
	"Gamer III": {
		cost: [D(10).pow(30), "infinityPower"],
		reward: "Double minigame rewards.",
		x: 550, y: 1760,
		connects: ["Gamer I"],
	},
	"Gamer IV": {
		cost: [D(10).pow(36), "infinityPower"],
		reward: "Improve gaming exponent (^0.6 --> ^1).",
		x: 400, y: 1980,
		connects: ["Gamer II", "Gamer III"],
	},
	"Gamer V": {
		cost: [D(10).pow(48), "infinityPower"],
		reward: "1.5x minigame rewards.",
		x: 250, y: 2200,
		connects: ["Gamer IV"],
	},
	"Gamer VI": {
		cost: [D(10).pow(54), "infinityPower"],
		reward: "Double minigame rewards.",
		x: 550, y: 2200,
		connects: ["Gamer IV"],
	},
	"IP Self-Boost II": {
		cost: [D(10).pow(70), "infinityPower"],
		reward: "Improve IP Self-Boost I exponent from 0.2 -> 0.3.",
		x: 250, y: 2420,
		connects: ["Gamer V"],
	},
	"IP Infinity Boost II": {
		cost: [D(10).pow(100), "infinityPower"],
		reward: "Improve IP Infinity Boost I exponent from 0.5 -> 0.8.",
		x: 550, y: 2420,
		connects: ["Gamer VI"],
	},
}


const infinityUpgradeNames = [
	"Infinity Power I",
	"Infinity Power II",
	"Drywall I",
	"Drywall/sec I",
	"Skill Points I",
	"Infinities I"
];
const infinityUpgradeCosts = {
	"Infinity Power I": [[D(1), D(1), D(3), D(5), D(8), D(15), D(40), D(100), D(450), D(2000), D(6500), D(35000), D(150000), D(2).times(D(10).pow(6)), D(10).pow(7), D(5).times(D(10).pow(7)), D(1.5).times(D(10).pow(8)), D(4).times(D(10).pow(8)), D(10).pow(9), D(10).pow(10), D(2).times(D(10).pow(10)), D(5).times(D(10).pow(10)), D(10).pow(11), D(3).times(D(10).pow(11)), D(10).pow(12), D(3).times(D(10).pow(12)), D(8).times(D(10).pow(12)), D(5).times(D(10).pow(13)), D(2).times(D(10).pow(14)), D(5).times(D(10).pow(14))], "infinityPoints"],
	"Infinity Power II": [[D(1000), D(10).pow(6), D(10).pow(9), D(10).pow(12), D(10).pow(15), D(10).pow(18), D(10).pow(21), D(10).pow(24), D(10).pow(27), D(10).pow(30), D(10).pow(33), D(10).pow(36), D(10).pow(39), D(10).pow(42), D(10).pow(45), D(10).pow(48), D(10).pow(51), D(10).pow(54), D(10).pow(57), D(10).pow(60)], "infinityPower"],
	"Drywall I": [[D(0.25), D(6), D(25), D(2.5).times(D(10).pow(3)), D(4).times(D(10).pow(9)), D(5).times(D(10).pow(15)), D(8).times(D(10).pow(32)), D(2).times(D(10).pow(38)), D(5).times(D(10).pow(43))], "infinityPower"],
	"Drywall/sec I": [[D(1), D(20), D(1.5).times(D(10).pow(2)), D(4).times(D(10).pow(8)), D(8).times(D(10).pow(14)), D(2.5).times(D(10).pow(30)), D(5).times(D(10).pow(33)), D(1).times(D(10).pow(39)), D(8).times(D(10).pow(43))], "infinityPower"],
	"Skill Points I": [[D(5), D(4).times(D(10).pow(2)), D(5).times(D(10).pow(4)), D(8).times(D(10).pow(14)), D(4).times(D(10).pow(21)), D(1).times(D(10).pow(35)), D(2.5).times(D(10).pow(40)), D(4).times(D(10).pow(44))], "infinityPower"],
	"Infinities I": [[D(10).pow(7)], "infinityPower"],
};

for (let i = 0; i < 250; i += 1) {
	infinityUpgradeCosts["Infinity Power I"][0].push(infinityUpgradeCosts["Infinity Power I"][0][infinityUpgradeCosts["Infinity Power I"][0].length - 1].times(10));
	infinityUpgradeCosts["Infinity Power II"][0].push(infinityUpgradeCosts["Infinity Power II"][0][infinityUpgradeCosts["Infinity Power II"][0].length - 1].times(100));
	infinityUpgradeCosts["Drywall I"][0].push(infinityUpgradeCosts["Drywall I"][0][infinityUpgradeCosts["Drywall I"][0].length - 1].times(3));
	infinityUpgradeCosts["Drywall/sec I"][0].push(infinityUpgradeCosts["Drywall/sec I"][0][infinityUpgradeCosts["Drywall/sec I"][0].length - 1].times(4));
	infinityUpgradeCosts["Skill Points I"][0].push(infinityUpgradeCosts["Skill Points I"][0][infinityUpgradeCosts["Skill Points I"][0].length - 1].times(10));
	infinityUpgradeCosts["Infinities I"][0].push(infinityUpgradeCosts["Infinities I"][0][infinityUpgradeCosts["Infinities I"][0].length - 1].times(1000000));
}

const settingNames = [
	"darkMode", "scientificNotation", "minimalParticles", "autoRebirth", "autoSkillTree", "autoInfinity", "resetStats"
];

const displayNames = {
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
const canvas2 = document.getElementById("infinityCanvas");
const ctx2 = canvas2.getContext("2d");

let deltatime;

const playerTemplate = {
	mylbkey: randomString(12),
	drywall: D(0),
	drywallPS: D(0),
	drywallPC: D(1),
	rebirths: D(0),
	skillPoints: D(0),
	skillUpgrades: [],
	infinities: D(0),
	infinityPoints: D(0),
	infinityPower: D(0),
	infinityUpgrades: Object.fromEntries(infinityUpgradeNames.map(name => [name, 0])),
	infinityTreeUpgrades: [],
	globalToken: null,
	skillBoosts: {},
	areasUnlocked: [],
	boosts: {},
	passive: {},
	settings: {
		darkMode: false,
		scientificNotation: false,
		minimalParticles: false,
		autoRebirth: false,
		autoSkillTree: true,
		autoInfinity: false,
	},
	minigames: {
		geometryDash: {
			completions: [],
			stars: 0,
		},
		flappyBird: {
			best: 0,
		}
	},
	achievements: [],
	stats: {
		playtime: D(0),
		clicks: D(0)
	},
	username: null
};

let player;
function mergeAndFix(template, saved) {
	if (typeof template !== "object" || template === null) return template;

	if (Array.isArray(template)) {
		if (!Array.isArray(saved)) saved = [];

		// Determine type hint from template[0] (could be Decimal, object, primitive)
		const typeHint = template[0];

		return saved.map(item => {
			if (typeHint instanceof Decimal) return D(item);
			if (typeof typeHint === "object" && typeHint !== null) return mergeAndFix(typeHint, item);
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

	if (player.username === player.mylbkey && elts.usernamePopup) {
		elts.usernamePopup.style.display = "block";
	}
}

resetPlayer(false);

// Setup
let lastSave = 0;
let lastUpdate = Date.now();
let myInterval = setInterval(tick, (1/10));

let leaderboards = {};
let lastLeaderboardUpdate = Date.now();
let supabaseLib = window.supabase.createClient(
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
	}, 5000)
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

// add text to regular upgrades
for (let i = 0; i < upgrades.length; i += 1) {
	elts.upgrades.push(document.getElementById("upgrade" + (i + 1)));
	elts.upgrades[i].innerHTML = abbrevNum(upgrades[i].cost[0]) + " " + displayNames[upgrades[i].cost[1]] + " → +" + abbrevNum(upgrades[i].reward[0]) + displayNames[upgrades[i].reward[1]];
}

// add text to skill tree upgrades
for (let i = 0; i < Object.keys(skillUpgrades).length; i += 1) {
	let upgrade = document.createElement("button");
	let upg = skillUpgrades[Object.keys(skillUpgrades)[i]];
	if (typeof skillUpgrades[Object.keys(skillUpgrades)[i]].reward == "string") {
		upgrade.innerHTML = upg.reward + "<br><br>" + abbrevNum(upg.cost[0]) + displayNames[upg.cost[1]];
	} else {
		if (upg.reward.length == 2) {
			upgrade.innerHTML = "x" + abbrevNum(upg.reward[0]) + displayNames[upg.reward[1]] + "<br><br>" + abbrevNum(upg.cost[0]) + displayNames[upg.cost[1]];
		} else {
			upgrade.innerHTML = "^" + abbrevNum(upg.reward[0]) + displayNames[upg.reward[1]] + "<br><br>" + abbrevNum(upg.cost[0]) + displayNames[upg.cost[1]];
		}
	}
	upgrade.classList.add("skillUpgrade");
	upgrade.style.position = "absolute";
	upgrade.style.left = "calc(50vw + " + (skillUpgrades[Object.keys(skillUpgrades)[i]].x - 75) + "px)";
	upgrade.style.top = (skillUpgrades[Object.keys(skillUpgrades)[i]].y + 650 - 75) + "px";
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
	if (typeof infinityTreeUpgrades[Object.keys(infinityTreeUpgrades)[i]].reward == "string") {
		descriptionElt.innerHTML = upg.reward;
	}
	if (player.infinityTreeUpgrades.includes(name)) {
		costElt.innerHTML = "Bought!";
	} else {
		costElt.innerHTML = abbrevNum(upg.cost[0]) + displayNames[upg.cost[1]];
	}
	upgrade.classList.add("infinityUpgrade");
	upgrade.style.position = "absolute";
	upgrade.style.left = "calc(50% + " + (infinityTreeUpgrades[Object.keys(infinityTreeUpgrades)[i]].x - 125) + "px)";
	upgrade.style.top = (infinityTreeUpgrades[Object.keys(infinityTreeUpgrades)[i]].y - 90) + "px";
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
})

document.getElementById("geometryDashButton").addEventListener("click", () => {
	document.getElementById("gdCanvas").style.display = "block";
	document.getElementById("fbCanvas").style.display = "none";
});

document.getElementById("flappyBirdButton").addEventListener("click", () => {
	document.getElementById("fbCanvas").style.display = "block";
	document.getElementById("gdCanvas").style.display = "none";
});

// msg box
elts.globalMessageBox.onclick = function() {
	console.log(true);
	elts.globalMessageBox.classList.remove("showGlobal");
}

// title screen
elts.playButton.onclick = function() {
	elts.titleScreen.classList.add("fadeOut");
	elts.titleScreen.style.pointerEvents = "none";
	setTimeout(function() {
		elts.titleScreen.style.display = "none";
	}, 1000);
}

elts.changelogButton.onclick = function() {
	if (elts.changelogContainer.classList.contains("open")) {
		elts.changelogContainer.classList.remove("open");
	} else {
		elts.changelogContainer.classList.add("open");
		awardAchievement("Informed Voter");
	}
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
	if (player.drywall.gte(D(10).pow(18))) {
		player.skillPoints = player.skillPoints.plus(getSkillPoints());
		player.drywall = D(0);
		player.drywallPS = D(0);
		player.drywallPC = D(1);
		player.rebirths = D(0);
	}
}

// normal upgrades
for (let i = 0; i < upgrades.length; i += 1) {
	let upg = upgrades[i];
	let upgElt = elts.upgrades[i];
	upgElt.onclick = function() {
		if (Date.now() - clickDebounce >= clickDebounceTime) {
			clickDebounce = Date.now();
			if (player[upg.cost[1]].gte(upg.cost[0])) {
				player[upg.cost[1]] = player[upg.cost[1]].minus(upg.cost[0]);
				player[upg.reward[1]] = player[upg.reward[1]].plus(upg.reward[0].times(player.boosts[upg.reward[1]].multiplier).pow(player.boosts[upg.reward[1]].exponent));
				if (player.skillUpgrades.includes("Full Circle I") && upg.reward[1] == "drywallPS") {
					player.drywallPC = player.drywallPC.plus(upg.reward[0].times(player.boosts[upg.reward[1]].multiplier).pow(player.boosts[upg.reward[1]].exponent).times(0.1));
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
		if (player[upg.cost[1]].gte(upg.cost[0])) {
			if (!player.skillUpgrades.includes(Object.keys(skillUpgrades)[i])) {
				player[upg.cost[1]] = player[upg.cost[1]].minus(upg.cost[0]);
				player.skillUpgrades.push(Object.keys(skillUpgrades)[i]);
				redrawUpgradeLines();
			}
		}
	}
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
	let upgCost = infinityUpgradeCosts[upgName]
	elt.onclick = function() {
		let upgLevel = player.infinityUpgrades[upgName];
		if (player[upgCost[1]].gte(upgCost[0][upgLevel])) {
			player.infinityUpgrades[upgName] += 1;
			player[upgCost[1]] = player[upgCost[1]].minus(upgCost[0][upgLevel]);
		}
	}
}

for (let i = 0; i < Object.keys(infinityTreeUpgrades).length; i += 1) {
	let upgName = Object.keys(infinityTreeUpgrades)[i];
	let upg = infinityTreeUpgrades[upgName];
	let upgCost = upg.cost;
	let elt = elts.infinityTreeUpgrades[upgName];

	elt.onclick = function() {
		console.log(upgName);
		if (upg.connects) {
			let connections = 0;
			for (let i = 0; i < Object.keys(player.infinityTreeUpgrades).length; i += 1) {
				if (upg.connects.includes(player.infinityTreeUpgrades[i])) {
					connections += 1;
				}
			}
			if (connections !== upg.connects.length) {
				return;
			}
		}
		if (player[upgCost[1]].gte(D(upgCost[0])) && !(player.infinityTreeUpgrades.includes(upgName))) {
			player.infinityTreeUpgrades.push(upgName);
			player[upgCost[1]] = player[upgCost[1]].minus(D(upgCost[0]));
			console.log(upgCost[0]);
			elt.querySelector("h4").textContent = "Bought!";
			redrawUpgradeLines();
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
let clickDebounce = Date.now();
for (let i = 0; i < elts.areas.length; i += 1) {
	const bg = elts.areas[i].getElementsByClassName("areaBackground")[0];
	if (!bg) continue;

	const rect = bg.getBoundingClientRect();
	bg.onclick = function(e) {
		if (Date.now() - clickDebounce >= clickDebounceTime) {
			player.drywall = player.drywall.plus(D(player.drywallPC).times(player.boosts.drywall.multiplier).pow(player.boosts.drywall.exponent));
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

function getInfinityPoints() {
	checkBoosts(true);

	let infinityBar = checkInfinityProgress();
	let ipMult = 1;
	if (player.infinityTreeUpgrades.includes("Break Infinity")) ipMult = D(10).pow(Math.max(0, infinityBar.iteration + infinityBar.progress));
	return player.boosts.infinityPoints.multiplier.times(ipMult).pow(player.boosts.infinityPoints.exponent).times(player.boosts.infinities.multiplier.pow(player.boosts.infinities.exponent));
}

function infinity() {
	checkBoosts(true);

	let infProg = checkInfinityProgress();

	let ipMult = 1;
	if (player.infinityTreeUpgrades.includes("Break Infinity")) ipMult = D(10).pow(Math.max(0, (infProg.iteration - 1) + infProg.progress));

	player.infinities = player.infinities.plus(D(1).times(player.boosts.infinities.multiplier).pow(player.boosts.infinities.exponent));
	player.infinityPoints = player.infinityPoints.plus(getInfinityPoints());

	player.drywall = D(0);
	player.drywallPC = D(1);
	player.drywallPS = D(0);
	player.rebirths = D(0);
	player.skillPoints = D(0);
	player.skillUpgrades = [];
	redrawUpgradeLines();

	elts.screenOverlay.classList.add("playFlash");
	setTimeout(function() {
		elts.screenOverlay.classList.remove("playFlash");
	}, 5000);
}

function updateAllText() {
	for (let i = 0; i < upgrades.length; i += 1) {
		elts.upgrades[i].innerHTML = abbrevNum(upgrades[i].cost[0]) + " " + displayNames[upgrades[i].cost[1]] + " → +" + abbrevNum(upgrades[i].reward[0]) + displayNames[upgrades[i].reward[1]];
	}
	updateSkillTreeElements();
	updateInfinityTreeElements();
}

function getRebirthCost(amt, rebirths = player.rebirths) {
	if (typeof rebirths !== "number") {
		rebirths = rebirths.toNumber();
	}
	let base = D(1e6)
	let start = rebirths
	let end = rebirths + amt

	let total = D(0)

	if (start < 1000) {
		let a = start
		let b = Math.min(end, 1000)

		let first = base.mul(D(2).pow(a))
		let count = b - a

		let sum = first.mul(
			D(2).pow(count).sub(1)
		).div(1)

		total = total.add(sum)
	}

	if (end > 1000) {
		let a = Math.max(start, 1000)
		let b = end

		let first = base.mul(D(2).pow(1000)).mul(
			D(3).pow(a - 1000)
		)

		let count = b - a

		let sum = first.mul(
			D(3).pow(count).sub(1)
		).div(2)

		total = total.add(sum)
	}

	return total
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
	return D(player.drywall).div(D(10).pow(18)).pow(D(0.1)).times(player.boosts.skillPoints.multiplier).toNumber();
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

function roundToSigFigs(num, sigFigs, padding = false) {
	num = D(num);
	if (num.eq(0)) return "0";

	const d = num.exponent + 1;				// digits before decimal
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
		if (val.gte(infinityThreshold) && !player.infinityTreeUpgrades.includes("Break Infinity")) {
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
}


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
	player.boosts.infinityPower.multiplier = player.boosts.infinityPower.multiplier.times(D(10).pow(player.infinityUpgrades["Infinity Power I"]));
	player.boosts.infinityPower.multiplier = player.boosts.infinityPower.multiplier.times(D(2).pow(player.infinityUpgrades["Infinity Power II"]));

	player.boosts.drywall.multiplier = player.boosts.drywall.multiplier.times(D(3).pow(player.infinityUpgrades["Drywall I"]));
	player.boosts.drywallPS.multiplier = player.boosts.drywallPS.multiplier.times(D(2).pow(player.infinityUpgrades["Drywall/sec I"]));
	player.boosts.skillPoints.multiplier = player.boosts.skillPoints.multiplier.times(D(2).pow(player.infinityUpgrades["Skill Points I"]));
	player.boosts.infinities.multiplier = player.boosts.infinities.multiplier.times(D(2).pow(player.infinityUpgrades["Infinities I"]));

	// Boost path
	if (player.infinityTreeUpgrades.includes("Everything Boost I")) {
		player.boosts.drywall.multiplier = player.boosts.drywall.multiplier.times(3);
		player.boosts.drywallPS.multiplier = player.boosts.drywallPS.multiplier.times(3);
		player.boosts.drywallPC.multiplier = player.boosts.drywallPC.multiplier.times(3);
		player.boosts.skillPoints.multiplier = player.boosts.skillPoints.multiplier.times(3);
	}
	if (player.infinityTreeUpgrades.includes("Everything Boost II")) {
		player.boosts.drywall.multiplier = player.boosts.drywall.multiplier.times(25);
		player.boosts.infinityPoints.multiplier = player.boosts.infinityPoints.multiplier.times(2);
	}
	if (player.infinityTreeUpgrades.includes("Everything Boost III")) {
		player.boosts.drywall.multiplier = player.boosts.drywall.multiplier.times(2);
		player.boosts.drywallPS.multiplier = player.boosts.drywallPS.multiplier.times(2);
		player.boosts.drywallPC.multiplier = player.boosts.drywallPC.multiplier.times(2);
		player.boosts.skillPoints.multiplier = player.boosts.skillPoints.multiplier.times(2);
		player.boosts.infinityPoints.multiplier = player.boosts.infinityPoints.multiplier.times(2);
	}
	if (player.infinityTreeUpgrades.includes("IP Boost I")) {
		player.boosts.infinityPoints.multiplier = player.boosts.infinityPoints.multiplier.times(2);
		player.boosts.infinityPower.multiplier = player.boosts.infinityPower.multiplier.times(3);
	}
	if (player.infinityTreeUpgrades.includes("IP Boost II")) {
		player.boosts.infinityPoints.multiplier = player.boosts.infinityPoints.multiplier.times(2);
		player.boosts.infinityPower.exponent *= 1.05;
	}
	if (player.infinityTreeUpgrades.includes("IP Boost III")) {
		player.boosts.infinityPoints.multiplier = player.boosts.infinityPoints.multiplier.times(2);
		player.boosts.infinityPower.exponent *= 1.02;
	}
	if (player.infinityTreeUpgrades.includes("IP Boost IV")) {
		player.boosts.infinityPoints.multiplier = player.boosts.infinityPoints.multiplier.times(3);
		player.boosts.infinityPower.exponent *= 1.02;
	}
	if (player.infinityTreeUpgrades.includes("IP Boost V")) {
		player.boosts.infinityPoints.multiplier = player.boosts.infinityPoints.multiplier.times(2);
		player.boosts.infinityPower.exponent *= 1.1;
	}
	if (player.infinityTreeUpgrades.includes("IP Self-Boost I")) {
		const mult = D(player.infinityPower).div(1000000).pow(ipOneExp).max(1);
		player.boosts.infinityPower.multiplier = player.boosts.infinityPower.multiplier.times(mult);

		const upgName = "IP Self-Boost I";
		let upgElt = elts.infinityTreeUpgrades[upgName];
		if (upgElt) {
			upgElt = upgElt.querySelector("p");
			upgElt.textContent = infinityTreeUpgrades[upgName].reward + " (x" + abbrevNum(mult.toNumber()) + ")";
		}
	}
	if (player.infinityTreeUpgrades.includes("IP Infinity Boost I")) {
		const mult = D(player.infinities).div(2).pow(ipTwoExp).max(1);
		player.boosts.infinityPoints.multiplier = player.boosts.infinityPoints.multiplier.times(mult);

		const upgName = "IP Infinity Boost I";
		let upgElt = elts.infinityTreeUpgrades[upgName];
		if (upgElt) {
			upgElt = upgElt.querySelector("p");
			upgElt.textContent = infinityTreeUpgrades[upgName].reward + " (x" + abbrevNum(mult.toNumber()) + ")";
		}
	}

	player.boosts.minigames.exponent = 0.6;
	if (player.infinityTreeUpgrades.includes("Gamer II")) player.boosts.minigames.multiplier = player.boosts.minigames.multiplier.times(2);
	if (player.infinityTreeUpgrades.includes("Gamer III")) player.boosts.minigames.multiplier = player.boosts.minigames.multiplier.times(2);
	if (player.infinityTreeUpgrades.includes("Gamer IV")) player.boosts.minigames.exponent = 1;
	if (player.infinityTreeUpgrades.includes("Gamer V")) player.boosts.minigames.multiplier = player.boosts.minigames.multiplier.times(1.5);
	if (player.infinityTreeUpgrades.includes("Gamer VI")) player.boosts.minigames.multiplier = player.boosts.minigames.multiplier.times(2);
	if (player.infinityTreeUpgrades.includes("Gamer VII")) player.boosts.minigames.exponent = 1.4;

	if (player.infinityTreeUpgrades.includes("Gamer I")) {
		elts.gameDiv.style.display = "block";

		let infBoost = D(player.minigames.geometryDash.stars).div(gameQuotient).pow(player.boosts.minigames.exponent).plus(1).times(player.boosts.minigames.multiplier);
		let ipBoost = D(player.minigames.flappyBird.best).div(gameQuotient.times(1.5)).pow(player.boosts.minigames.exponent).plus(1).times(player.boosts.minigames.multiplier);

		player.boosts.infinities.multiplier = player.boosts.infinities.multiplier.times(infBoost);
		player.boosts.infinityPoints.multiplier = player.boosts.infinityPoints.multiplier.times(ipBoost);

		elts.minigameInfinityBonus.textContent = "x" + abbrevNum(infBoost.toNumber()) + " Infinities (from " + player.minigames.geometryDash.stars + " stars)";
		elts.minigameIPBonus.textContent = "x" + abbrevNum(ipBoost.toNumber()) + " Infinity Points (from " + player.minigames.flappyBird.best + " score)";
	} else {
		elts.gameDiv.style.display = "none";
	}

	// Automation path
	if (player.infinityTreeUpgrades.includes("Automation I")) {
		player.boosts.skillPoints.multiplier = player.boosts.skillPoints.multiplier.times(2);
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
		let ca = skillUpgrades[a].cost
		let cb = skillUpgrades[b].cost
		return D(ca[0]).cmp(cb[0])
	});
	let bought = false;
	if (player.settings.autoSkillTree) {
		for (let i = 0; i < player.passive.skillUpgrades; i += 1) {
			let k = sortedSkillKeys[i];
			let upg = skillUpgrades[k];
			let cost = upg.cost;

			if (D(player[cost[1]]).gte(cost[0]) && !player.skillUpgrades.includes(k)) {
				player[cost[1]] = D(player[cost[1]]).minus(cost[0]);
				player.skillUpgrades.push(k);
				bought = true;
			}
		}
	}
	if (bought) {
		redrawUpgradeLines();
	}

	if (player.infinityTreeUpgrades.includes("Automation IV") && player.settings.autoInfinity && player.drywall.gte(infinityThreshold) && !dontCall) {
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
			player.boosts[reward.type].multiplier = player.boosts[reward.type].multiplier.times(reward.amount);
		}
	}
}

function checkBoosts(dontCall) {
	// Reset
	for (var i = 0; i < Object.keys(player).length; i += 1) {
		player.boosts[Object.keys(player)[i]] = {multiplier: D(1), exponent: 1};
		player.passive[Object.keys(player)[i]] = 0;
	}

	checkInfinityUpgrades(dontCall);

	player.boosts.skillPoints.multiplier = player.boosts.skillPoints.multiplier.times(
		D(player.achievements.length).div(100).plus(1)
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
				player.boosts.drywallPS.multiplier = player.boosts.drywallPS.multiplier.times(boost);
			}
			else if (player.skillUpgrades[i] == "Arthritis IV") {
				let boost = D(player.skillPoints).div(arthritisDen).pow(arthritisExp);
				player.boosts.drywallPC.multiplier = player.boosts.drywallPC.multiplier.times(boost);
			}
			else if (player.skillUpgrades[i] == "Self-boost I") {
				let expBoost = D(player.drywall).plus(1).pow(selfBoostExp);
				player.boosts.drywall.exponent *= Math.min(1.15, expBoost.toNumber());
			}
		}
		else {
			if (skillUpg.reward.length == 3) {
				player.boosts[skillUpg.reward[1]].exponent *= skillUpg.reward[0];
			}
			else {
				player.boosts[skillUpg.reward[1]].multiplier = player.boosts[skillUpg.reward[1]].multiplier.times(skillUpg.reward[0]);
			}
		}
	}

	let rebirthBoost = D(1.5).pow(player.rebirths);
	player.boosts.drywall.multiplier = player.boosts.drywall.multiplier.times(rebirthBoost);
}


function saveData(key, data) {
	const now = Date.now();
	if (now - lastSave > 1000) { // 1 second limit
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
	return {bestCols: bestCols, bestSize: bestSize};
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

	elts.achievementsTitle.textContent = "Achievements (" + player.achievements.length + "/" + count + ")";
	elts.achievementsBoost.textContent = "These achievements give a boost of +" + player.achievements.length + "% skill points.";
}

let grid;
grid = updateAchievementGrid(true);

setInterval(function() {
	grid = updateAchievementGrid(false);
}, 1000)

setInterval(updateAchievementImages, 2000);

const container = document.getElementById("achievementsContainer");
const children = container.children;
const keys = Object.keys(achievements);

setTimeout(function() {
	for (let i = 0; i < children.length && i < keys.length; i++) {
		const box = children[i];
		const key = keys[i];
		const a = achievements[key];

		box.addEventListener("mouseover", function() {
			elts.achievementHover.style.display = "block";
			const rect = box.getBoundingClientRect();
			let top = (rect.top + grid.bestSize);
			if (top > window.innerHeight - 200) {
				top -= 200 + grid.bestSize;
			} else {
				console.log(top, window.innerHeight);
			}

			elts.achievementHover.style.left = (rect.left - grid.bestSize) + "px";
			elts.achievementHover.style.top = top + "px";
			elts.achievementHoverName.textContent = key;
			if (player.achievements.includes(key)) {
				elts.achievementHoverDescription.innerHTML = a.description;

				if (a.reward) {
					elts.achievementHoverReward.innerHTML = "x" + a.reward.amount + displayNames[a.reward.type];
				} else {
					elts.achievementHoverReward.innerHTML = "";
				}
			} else {
				elts.achievementHoverDescription.innerHTML = "???";
				elts.achievementHoverReward.innerHTML = "???";
			}

			console.log("hovered", key);
		});
		box.addEventListener("mouseleave", function() {
			elts.achievementHover.style.display = "none";
		})
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
			skillUpgUnlocked = skillUpg.connects.every(item => player.skillUpgrades.includes(item));
		}

		if (player.skillUpgrades.includes(upgName)) {
			skillUpgElt.classList.remove("unlocked");
			skillUpgElt.classList.remove("branch");
			skillUpgElt.classList.add("bought");
			skillUpgElt.classList.remove("hidden");
			if (typeof skillUpg.reward === "string") {
				if (upgName === "Conversion I") {
					skillUpgElt.innerHTML = skillUpg.reward + "<br><br>Bought. (x" + abbrevNum(D(player.drywallPC).pow(convExp)) + ")";
				} else if (upgName === "Arthritis IV") {
					skillUpgElt.innerHTML = skillUpg.reward + "<br><br>Bought. (x" + abbrevNum(D(player.skillPoints).div(arthritisDen).pow(arthritisExp)) + ")";
				} else if (upgName === "Self-boost I") {
					skillUpgElt.innerHTML = skillUpg.reward + "<br><br>Bought. (^" + abbrevNum(Math.min(1.15, D(player.drywall).plus(1).pow(selfBoostExp))) + ")";
				} else {
					skillUpgElt.innerHTML = skillUpg.reward + "<br><br>Bought.";
				}
			} else {
				if (skillUpg.reward.length === 3) {
					skillUpgElt.innerHTML = "^" + abbrevNum(skillUpg.reward[0]) + displayNames[skillUpg.reward[1]] + "<br><br>Bought.";
				} else {
					skillUpgElt.innerHTML = "x" + abbrevNum(skillUpg.reward[0]) + displayNames[skillUpg.reward[1]] + "<br><br>Bought.";
				}
			}
		} else {
			if (skillConnections[upgName].visible || upgName == "Drywall Efficiency I") {
				if (skillUpgUnlocked) {
					skillUpgElt.classList.add("unlocked");
					skillUpgElt.classList.remove("branch");
					skillUpgElt.classList.remove("bought");
					skillUpgElt.classList.remove("hidden");
					if (typeof skillUpgrades[Object.keys(skillUpgrades)[i]].reward == "string") {
						skillUpgElt.innerHTML = skillUpg.reward + "<br><br>" + abbrevNum(skillUpg.cost[0]) + displayNames[skillUpg.cost[1]];
					} else {
						if (skillUpg.reward.length == 2) {
							skillUpgElt.innerHTML = "x" + abbrevNum(skillUpg.reward[0]) + displayNames[skillUpg.reward[1]] + "<br><br>" + abbrevNum(skillUpg.cost[0]) + displayNames[skillUpg.cost[1]];
						} else {
							skillUpgElt.innerHTML = "^" + abbrevNum(skillUpg.reward[0]) + displayNames[skillUpg.reward[1]] + "<br><br>" + abbrevNum(skillUpg.cost[0]) + displayNames[skillUpg.cost[1]];
						}
					}
				} else {
					skillUpgElt.classList.remove("unlocked");
					skillUpgElt.classList.add("branch");
					skillUpgElt.classList.remove("bought");
					skillUpgElt.classList.remove("hidden");
					skillUpgElt.innerHTML = "???<br><br>" + abbrevNum(skillUpg.cost[0]) + displayNames[skillUpg.cost[1]];
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
	let connections = getConnections(infinityTreeUpgrades, player.infinityTreeUpgrades);

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
			infinityUpgUnlocked = infinityUpg.connects.every(item => player.infinityTreeUpgrades.includes(item));
		}

		nameElt.textContent = upgName;

		if (player.infinityTreeUpgrades.includes(upgName)) {
			infinityUpgElt.classList.remove("unlocked");
			infinityUpgElt.classList.remove("branch");
			infinityUpgElt.classList.add("bought");
			infinityUpgElt.classList.remove("hidden");
			costElt.textContent = "Bought.";
		} else {
			costElt.textContent = abbrevNum(infinityUpg.cost[0]) + displayNames[infinityUpg.cost[1]];
			if (connections[upgName].visible || ["Automation I", "Everything Boost I"].includes(upgName)) {
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
	const { data, error } = await supabaseLib
		.from("leaderboard")
		.select("key, displayName, drywall, rebirths, skill_points, infinities, achievements");

	if (error) {
		console.error("Error loading leaderboard:", error.message);
		return {};
	}

	const leaderboardTypes = ["drywall", "rebirths", "skill_points", "infinities", "achievements"];
	
	// Reset or initialize leaderboards object
	let leaderboards = {};

	for (const type of leaderboardTypes) {
		leaderboards[type] = data
			.filter(entry => entry[type] !== null && entry[type] !== undefined)
			.map(entry => {
				const raw = entry[type];

				if (raw === null || raw === undefined || raw === "") return null;

				return {
					key: entry.key,
					displayName: entry.displayName,
					value: D(raw.toString())
				};
			})
			.filter(x => x !== null)
			.sort((a, b) => b.value.cmp(a.value)) 
			.slice(0, 10);
	}

	return leaderboards;
}

async function saveDataToLeaderboard() {
	let playerName = player.mylbkey;

	// Basic validation
	if (!playerName || player.drywall === undefined || player.username === "ICodeBugs (indev)") return;

	// 1. Convert Break Infinity Decimals to String for storage
	// We do not need to check for Infinity limits manually; D(x).toString() handles it.
	let leaderboardPayload = {
		key: player.mylbkey,
		drywall: D(player.drywall).toString(),         // Stores "1.23e450"
		rebirths: D(player.rebirths).toString(),
		skill_points: D(player.skillPoints).toString(),
		infinities: D(player.infinities).toString(),
		achievements: player.achievements.length,      // Standard number is fine here
		flagged: false,
		displayName: player.username || player.mylbkey,
	};

	let { error } = await supabaseLib.from("leaderboard").upsert(
		leaderboardPayload,
		{ onConflict: "key" }
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
			...data.connectsTo
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
		if (neighbors.some(n => bought.has(n))) {
			updated[name].visible = true;
			continue;
		}

		// 3. connected to an upgrade which is connected to a bought upgrade
		if (
			neighbors.some(n =>
				getNeighbors(n).some(nn => bought.has(nn))
			)
		) {
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
		let upgs = getConnections(infinityTreeUpgrades, player.infinityTreeUpgrades);
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
			if (player.infinityTreeUpgrades.length === Object.keys(infinityTreeUpgrades).length) {
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
	console.log("Showing " + name + ", Tier: " + a.tier)
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
		elts.achievementReward.innerHTML = "x" + a.reward.amount + displayNames[a.reward.type];
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
	let iteration = Math.ceil(Math.max(0, player.drywall.exponent - 400) / intervalSize);
	let req = 400 + (intervalSize * iteration);
	let oldReq = iteration === 0 ? 308 : 400 + (intervalSize * (iteration - 1));
	let prog = (D(player.drywall).log10() - oldReq) / (req - oldReq);
	return {iteration: iteration, progress: prog};
}

function update(dt) {
	updateMinigameStats();
	checkBoosts();

	player.drywall = player.drywall.plus(D(player.drywallPS).times(player.boosts.drywall.multiplier).pow(player.boosts.drywall.exponent).times(dt).div(1000));
	
	if (player.skillUpgrades.includes("Time-saver II") && player.settings.autoRebirth) {
		rebirth(1);
		rebirth(10);
	}

	checkAllAchievements(true);
	player.infinityPower = D(player.infinityPower).plus(D(player.boosts.infinityPower.multiplier).pow(player.boosts.infinityPower.exponent).times(dt).div(1000));
	if (D(player.passive.skillPoints) !== D(0)) {
		player.skillPoints = D(player.skillPoints).plus(D(getSkillPoints()).times(player.passive.skillPoints).times(dt).div(1000));
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
		return abbrevNum(player[name]) + (player.boosts[name].multiplier === 1 ? "" : " (x" + abbrevNum(player.boosts[name].multiplier) + ")");
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

window.addEventListener("resize", function() {
	redrawUpgradeLines();
})
redrawUpgradeLines();

function checkAreaUnlocks() {
	if (player.drywall.gte(D(10).pow(6))) {
		if (!player.areasUnlocked.includes("High-rise")) player.areasUnlocked.push("High-rise");
	}
	if (player.drywall.gte(D(10).pow(45))) {
		if (!player.areasUnlocked.includes("Luxury")) player.areasUnlocked.push("Luxury");
	}
	if (player.infinityTreeUpgrades.includes("Break Infinity")) {
		if (!player.areasUnlocked.includes("Bungalow")) player.areasUnlocked.push("Bungalow");
	}
	if (player.drywall.gte(D(10).pow(15))) {
		if (!player.areasUnlocked.includes("Skill Tree")) player.areasUnlocked.push("Skill Tree");
	}
	if (player.drywall.gte(D(10).pow(300)) || player.infinities.gte(1)) {
		if (!player.areasUnlocked.includes("Infinity")) player.areasUnlocked.push("Infinity");
	}
}

function render(dt) {
	// stats
	elts.drywallStat.textContent = "Drywall: " + getStatText("drywall", true);
	elts.drywallPCStat.textContent = "Drywall/click: " + getStatText("drywallPC", true);
	elts.drywallPSStat.textContent = "Drywall/sec: " + getStatText("drywallPS", true)
	elts.rebirthsStat.textContent = abbrevNum(D(player.rebirths)) + " rebirths";
	elts.skillPointsStat.textContent = "Skill Points: " + getStatText("skillPoints", true)
	elts.infinityPointsStat.textContent = "Infinity Points: " + getStatText("infinityPoints", true)
	elts.infinityPowerStat.textContent = "Infinity Power: " + getStatText("infinityPower", true)
	elts.infinityStat.textContent = "Infinities: " + getStatText("infinities", true)
	elts.clicksStat.textContent = "Clicks: " + abbrevNum(player.stats.clicks);
	elts.playtimeStat.textContent = "Playtime: " + formatMillis(player.stats.playtime);

	// break infinity bar
	let infinityBar = checkInfinityProgress();
	
	elts.breakInfinityLabel.textContent = roundToSigFigs(infinityBar.progress * 100, 3, true) + "% to x10 infinity points";
	elts.breakInfinityProgressBar.style.width = infinityBar.progress * 100 + "%";
	elts.breakInfinityBar.style.display = player.drywall.gte(infinityThreshold) && player.infinityTreeUpgrades.includes("Break Infinity") ? "block" : "none";

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
			upg.children[1].textContent = abbrevNum(upgCost[0][player.infinityUpgrades[infinityUpgradeNames[i]]]) + displayNames[upgCost[1]];
		} else {
			upg.children[1].textContent = "Max level!"
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
	elts.rebirthButton1.textContent = "Rebirth for " + abbrevNum(getRebirthCost(1));
	elts.rebirthButton2.textContent = "Rebirth TWICE for " + abbrevNum(getRebirthCost(2));
	elts.rebirthButton3.textContent = "Rebirth FOUR TIMES for " + abbrevNum(getRebirthCost(4));
	
	// skill reset button
	if (D(player.drywall).gte(D(10).pow(18))) {
		elts.skillResetButton.textContent = "Reset for +" + abbrevNum(getSkillPoints()) + " skill points";
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
	if (player.infinityTreeUpgrades.includes("Automation II") || player.infinityTreeUpgrades.includes("Automation III")) {
		elts.autoSkillTreeSetting.parentElement.parentElement.style.display = "";
	} else {
		elts.autoSkillTreeSetting.parentElement.parentElement.style.display = "none";
	}

	// leaderboards
	elts.leaderboard1Div.querySelector("p").innerHTML = getLeaderboardText("drywall");
	elts.leaderboard2Div.querySelector("p").innerHTML = getLeaderboardText("infinities");
	elts.leaderboard3Div.querySelector("p").innerHTML = getLeaderboardText("achievements");

	// draw upgrade trees
	updateSkillTreeElements();
	updateInfinityTreeElements();
}