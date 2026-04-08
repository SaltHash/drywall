// Web config in web.js

// Helpers
function randomString(length) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Settings
const dustSpawnDebounceTime = false;
const clickDebounceTime = 65;

const achievements = {
  // drywall achievements
  "Welcome!": {
    requirement: { amount: D(1), type: ["drywall"] },
    description: "Your first drywall, we all start somewhere.",
    tier: 1,
  },
  Millionaire: {
    requirement: { amount: D(10).pow(6), type: ["drywall"] },
    reward: { amount: D(1.1), type: "drywall" },
    description: "Reach 1 million drywall. Still poor btw.",
    tier: 1,
  },
  Billionaire: {
    requirement: { amount: D(10).pow(9), type: ["drywall"] },
    reward: { amount: D(1.2), type: "drywall" },
    description: "Wow a billion? Thats enough for a big mac!",
    tier: 1,
  },
  Trillionaire: {
    requirement: { amount: D(10).pow(12), type: ["drywall"] },
    reward: { amount: D(1.2), type: "drywall" },
    description: "Reach 1 trillion drywall. I ran out of corny jokes.",
    tier: 1,
  },
  Decillionaire: {
    requirement: { amount: D(10).pow(33), type: ["drywall"] },
    reward: { amount: D(1.3), type: "drywall" },
    description:
      "Reach 1 decillion drywall. A big gap, but you made it, right?",
    tier: 2,
  },
  Vigintillionaire: {
    requirement: { amount: D(10).pow(63), type: ["drywall"] },
    reward: { amount: D(1.3), type: "drywall" },
    description:
      "Reach 1 vigintillion drywall. You almost beat the game! nah jk",
    tier: 2,
  },
  "Scrooge Mc. Duck": {
    requirement: { amount: D(2.5).times(D(10).pow(135)), type: ["drywall"] },
    reward: { amount: D(1.3), type: "drywall" },
    description:
      "Reach 2.5e135 drywall. Thats enough to buy the final drywall upgrade! Well, for now at least.",
    tier: 2,
  },
  "THATS A LOT OF DRYWALL": {
    requirement: { amount: D(10).pow(1000), type: ["drywall"] },
    reward: { amount: D(1000), type: "drywall" },
    description: "Reach 1e1000 drywall. Not a jump at all :D",
  },

  // playtime achievements
  Fulfillment: {
    requirement: {
      amount: D(10).times(60).times(1000),
      type: ["stats", "playtime"],
    },
    reward: { amount: D(1.1), type: "drywallPS" },
    description: "Play for 10 minutes.",
    tier: 1,
  },
  Enjoyment: {
    requirement: {
      amount: D(60).times(60).times(1000),
      type: ["stats", "playtime"],
    },
    reward: { amount: D(1.2), type: "drywallPS" },
    description: "Play for an hour. Starting to have fun now?",
    tier: 1,
  },
  Dedication: {
    requirement: {
      amount: D(5).times(60).times(60).times(1000),
      type: ["stats", "playtime"],
    },
    reward: { amount: D(1.3), type: "drywallPS" },
    description: "Play for 5 hours.",
    tier: 2,
  },
  Connoisseur: {
    requirement: {
      amount: D(24).times(60).times(60).times(1000),
      type: ["stats", "playtime"],
    },
    reward: { amount: D(1.5), type: "drywallPS" },
    description: "Play for a day (24 hours). Still enjoying it?",
    tier: 2,
  },
  "Beyond no-life": {
    requirement: {
      amount: D(7).times(24).times(60).times(60).times(1000),
      type: ["stats", "playtime"],
    },
    reward: { amount: D(5), type: "drywallPS" },
    description:
      "Play for a whole week (168 hours). Go touch grass or something.",
    tier: 3,
  },

  // click achievements
  "Beginner Clicker": {
    requirement: { amount: D(10).pow(2), type: ["stats", "clicks"] },
    reward: { amount: D(1.1), type: "drywallPC" },
    description: "Click 100 times.",
    tier: 1,
  },
  "Mouse Abuse": {
    requirement: { amount: D(10).pow(3), type: ["stats", "clicks"] },
    reward: { amount: D(1.3), type: "drywallPC" },
    description: "Click a thousand times.",
    tier: 1,
  },
  "Nuclear Clicker": {
    requirement: { amount: D(10).pow(4), type: ["stats", "clicks"] },
    reward: { amount: D(1.5), type: "drywallPC" },
    description:
      "Click 10 thousand times. Fun fact: you can click at most once every 65 milliseconds (~15 cps).",
    tier: 2,
  },
  Supernova: {
    requirement: { amount: D(10).pow(5), type: ["stats", "clicks"] },
    reward: { amount: D(3), type: "drywallPC" },
    description:
      "Click 100 THOUSAND times. 1.8 hours of nonstop clicking. Ya done yet?",
    tier: 2,
  },
  "Godly Clicker": {
    requirement: { amount: D(10).pow(6), type: ["stats", "clicks"] },
    reward: { amount: D(2), type: "infinityPower" },
    description:
      "Click one MILLION times. That takes at LEAST 18 hours, just why...",
    tier: 3,
  },

  // infinity achievements
  Infinity: {
    requirement: { amount: D(1), type: ["infinities"] },
    reward: { amount: D(1.5), type: "drywall" },
    description:
      "Hit ~1.79e308 drywall and perform the infinity reset. Welcome to the big leagues, I guess.",
    tier: 1,
  },
  "Deca-infinity": {
    requirement: { amount: D(10), type: ["infinities"] },
    reward: { amount: D(2), type: "drywallPS" },
    description: "Reach 10 infinities. ",
    tier: 2,
  },
  "Infinity Centipede": {
    requirement: { amount: D(100), type: ["infinities"] },
    reward: { amount: D(1.5), type: "infinityPower" },
    description: "Reach 100 infinities",
    tier: 2,
  },
  "Need. More. Infinities.": {
    requirement: { amount: D(1000), type: ["infinities"] },
    reward: { amount: D(1.5), type: "drywall" },
    description:
      "Reach one THOUSAND infinities. It only gets crazier from here.",
    tier: 2,
  },
  "The Gap": {
    requirement: { amount: D(10000), type: ["infinities"] },
    reward: { amount: D(1.5), type: "drywall" },
    description:
      "Reach 10 thousand infinities. Now its time to max out every part of the game. Getting to the next milestone won't be easy.",
    tier: 2,
  },
  "Particle Accelerator": {
    requirement: { amount: D(1000000), type: ["infinities"] },
    reward: { amount: D(5), type: "infinityPower" },
    description: "Reach one MILLION infinities. You're almost there...",
    tier: 3,
  },

  // infinity power
  potato: {
    requirement: { amount: D(100), type: ["infinityPower"] },
    reward: { amount: D(1.1), type: "infinityPower" },
    description:
      "<span style='color: #eee; font-weight: 700; font-family: &quot;Comic Neue&quot;, &quot;Comic Sans MS&quot;, &quot;Comic Sans&quot;, cursive;'>make 100 infinity power 🥔</span>",
    tier: 1,
  },
  Megajoule: {
    requirement: { amount: D(10).pow(6), type: ["infinityPower"] },
    reward: { amount: D(1.2), type: "infinityPower" },
    description:
      "Generate 1 million infinity power. *insert energy buzzing sound*",
    tier: 2,
  },
  "Power Enthusiast": {
    requirement: { amount: D(10).pow(9), type: ["infinityPower"] },
    reward: { amount: D(1.5), type: "infinityPower" },
    description: "Generate 1 billion infinity power. Having fun?",
    tier: 2,
  },
  "Trillionaire pt. 2": {
    requirement: { amount: D(10).pow(12), type: ["infinityPower"] },
    reward: { amount: D(2), type: "infinityPower" },
    description: "Generate 1 trillion infinity power. I am SO proud of you.",
    tier: 2,
  },
  "Suspicious amounts of power": {
    requirement: { amount: D(10).pow(18), type: ["infinityPower"] },
    reward: { amount: D(10), type: "drywallPC" },
    description:
      "Generate 1 quintillion infinity power. Where did you even get this power?",
    tier: 3,
  },
  "Nuclear reactor": {
    requirement: { amount: D(10).pow(33), type: ["infinityPower"] },
    reward: { amount: D(2), type: "infinities" },
    description: "Generate 1 DECILLION infinity power. Too. Much. Power.",
    tier: 3,
  },
  "Dyson sphere": {
    requirement: { amount: D(10).pow(63), type: ["infinityPower"] },
    reward: { amount: D(3), type: "infinities" },
    description:
      "Generate 1 VIGINTILLION infinity power. Are you almost done with the infinity tree? nah prolly not",
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
    reward: { amount: D(1.11), type: "drywall" },
    tier: 1,
    description: "Read the changelog.",
  },
  "Infinity Tree Completionist": {
    reward: { amount: D(10), type: "infinityPower" },
    description: "Buy every single upgrade in the infinity tree.",
    tier: 3,
  },

  "EZ Rebirth": {
    reward: { amount: D(1.5), type: "drywall" },
    description: "Rebirth in 10 clicks (ALL clicks) or less!",
    tier: 1,
  },
  "EZ Skill Reset": {
    reward: { amount: D(1.5), type: "skillPoints" },
    description: "Skill reset in 10 clicks (ALL clicks) or less!",
    tier: 2,
  },
  "EZ Infinity": {
    reward: { amount: D(1.5), type: "infinityPoints" },
    description:
      "Infinity in 10 clicks (ALL clicks) or less! Must. Keep. Pushing.",
    tier: 3,
  },
};

const upgrades = [
  {
    cost: [D(25), "drywall"],
    reward: [D(1), "drywallPC"],
  },
  {
    cost: [D(600), "drywall"],
    reward: [D(10), "drywallPC"],
  },
  {
    cost: [D(165000), "drywall"],
    reward: [D(850), "drywallPC"],
  },
  {
    cost: [D(50), "drywall"],
    reward: [D(10), "drywallPS"],
  },
  {
    cost: [D(35000), "drywall"],
    reward: [D(700), "drywallPS"],
  },
  {
    cost: [D(8).times(D(10).pow(6)), "drywall"],
    reward: [D(80000), "drywallPS"],
  },
  {
    cost: [D(1).times(D(10).pow(9)), "drywall"],
    reward: [D(75000), "drywallPC"],
  },
  {
    cost: [D(150).times(D(10).pow(15)), "drywall"],
    reward: [D(20).times(D(10).pow(6)), "drywallPC"],
  },
  {
    cost: [D(5).times(D(10).pow(24)), "drywall"],
    reward: [D(800).times(D(10).pow(6)), "drywallPC"],
  },
  {
    cost: [D(3.5).times(D(10).pow(12)), "drywall"],
    reward: [D(6).times(D(10).pow(6)), "drywallPS"],
  },
  {
    cost: [D(850).times(D(10).pow(18)), "drywall"],
    reward: [D(900).times(D(10).pow(6)), "drywallPS"],
  },
  {
    cost: [D(2.5).times(D(10).pow(27)), "drywall"],
    reward: [D(85).times(D(10).pow(9)), "drywallPS"],
  },
  {
    cost: [D(10).times(D(10).pow(45)), "drywall"],
    reward: [D(160).times(D(10).pow(9)), "drywallPC"],
  },
  {
    cost: [D(10).times(D(10).pow(69)), "drywall"],
    reward: [D(18).times(D(10).pow(12)), "drywallPC"],
  },
  {
    cost: [D(100).times(D(10).pow(108)), "drywall"],
    reward: [D(55).times(D(10).pow(15)), "drywallPC"],
  },
  {
    cost: [D(2.5).times(D(10).pow(54)), "drywall"],
    reward: [D(15).times(D(10).pow(12)), "drywallPS"],
  },
  {
    cost: [D(1.5).times(D(10).pow(84)), "drywall"],
    reward: [D(50).times(D(10).pow(15)), "drywallPS"],
  },
  {
    cost: [D(2.5).times(D(10).pow(135)), "drywall"],
    reward: [D(85).times(D(10).pow(18)), "drywallPS"],
  },
  {
    cost: [D(1).times(D(10).pow(400)), "drywall"],
    reward: [D(1).times(D(10).pow(40)), "drywallPC"],
  },
  {
    cost: [D(8).times(D(10).pow(650)), "drywall"],
    reward: [D(3).times(D(10).pow(55)), "drywallPC"],
  },
  {
    cost: [D(5).times(D(10).pow(1000)), "drywall"],
    reward: [D(1).times(D(10).pow(100)), "drywallPC"],
  },
  {
    cost: [D(2.5).times(D(10).pow(540)), "drywall"],
    reward: [D(3).times(D(10).pow(28)), "drywallPS"],
  },
  {
    cost: [D(1.5).times(D(10).pow(845)), "drywall"],
    reward: [D(2).times(D(10).pow(35)), "drywallPS"],
  },
  {
    cost: [D(1).times(D(10).pow(1200)), "drywall"],
    reward: [D(6.5).times(D(10).pow(55)), "drywallPS"],
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
    reward:
      "x2 skill points, generate skill points at a rate of 1%/sec, keep auto and no-cost rebirth.",
    x: -400,
    y: 0,
    connects: false,
  },
  "Automation II": {
    cost: [D(150), "infinityPoints"],
    reward: "Gain +19 skill tree autobuyers.",
    x: -550,
    y: 220,
    connects: ["Automation I"],
  },
  "Automation III": {
    cost: [D(600), "infinityPoints"],
    reward: "Gain +10 skill tree autobuyers.",
    x: -250,
    y: 220,
    connects: ["Automation I"],
  },
  "Automation IV": {
    cost: [D(2500), "infinityPoints"],
    reward: "Unlock auto-infinity.",
    x: -400,
    y: 440,
    connects: ["Automation II", "Automation III"],
  },
  "Automation V": {
    cost: [D(10).pow(4), "infinityPoints"],
    reward: "Generate skill points at a rate of 100%/sec.",
    x: -400,
    y: 1100,
    connects: ["Automation IV"],
  },
  "Break Infinity": {
    cost: [D(4).times(D(10).pow(9)), "infinityPoints"],
    reward: "Break infinity.",
    x: -400,
    y: 1980,
    connects: ["Automation V"],
  },
  "Automation VI": {
    cost: [D(10).pow(27), "infinityPoints"],
    reward: "Gain +4 skill tree autobuyers.",
    x: -400,
    y: 2420,
    connects: ["Automation V"],
  },
  "Everything Boost I": {
    cost: [D(1), "infinityPoints"],
    reward: "x3 all previous stats.",
    x: 400,
    y: 0,
    connects: false,
  },
  "Everything Boost II": {
    cost: [D(1), "infinityPoints"],
    reward: "x25 drywall and x2 infinity points.",
    x: 550,
    y: 220,
    connects: ["Everything Boost I"],
  },
  "Everything Boost III": {
    cost: [D(2), "infinityPoints"],
    reward: "x2 all previous stats and x2 infinity points.",
    x: 250,
    y: 220,
    connects: ["Everything Boost I"],
  },
  "IP Boost I": {
    cost: [D(3), "infinityPoints"],
    reward: "x2 infinity points and x3 infinity power.",
    x: 400,
    y: 440,
    connects: ["Everything Boost II", "Everything Boost III"],
  },
  "IP Boost II": {
    cost: [D(100000), "infinityPower"],
    reward: "x2 infinity points and ^1.05 infinity power.",
    x: 400,
    y: 660,
    connects: ["IP Boost I"],
  },
  "IP Boost III": {
    cost: [D(10000000), "infinityPower"],
    reward: "x2 infinity points and ^1.02 infinity power.",
    x: 250,
    y: 880,
    connects: ["IP Boost II"],
  },
  "IP Boost IV": {
    cost: [D(10).pow(9), "infinityPower"],
    reward: "x3 infinity points and ^1.02 infinity power.",
    x: 550,
    y: 880,
    connects: ["IP Boost II"],
  },
  "IP Boost V": {
    cost: [D(10).pow(12), "infinityPower"],
    reward: "x2 infinity points, ^1.1 infinity power.",
    x: 400,
    y: 1100,
    connects: ["IP Boost III", "IP Boost IV"],
  },
  "IP Self-Boost I": {
    cost: [D(1000), "infinityPoints"],
    reward: "Infinity Power boosted by itself.",
    x: 250,
    y: 1320,
    connects: ["IP Boost V"],
  },
  "IP Infinity Boost I": {
    cost: [D(10).pow(18), "infinityPower"],
    reward: "Infinity Points boosted by infinities.",
    x: 550,
    y: 1320,
    connects: ["IP Boost V"],
  },
  "Gamer I": {
    cost: [D(10).pow(25), "infinityPower"],
    reward: "Unlock minigames.",
    x: 400,
    y: 1540,
    connects: ["IP Self-Boost I", "IP Infinity Boost I"],
  },
  "Gamer II": {
    cost: [D(10).pow(6), "infinityPoints"],
    reward: "Double minigame rewards.",
    x: 250,
    y: 1760,
    connects: ["Gamer I"],
  },
  "Gamer III": {
    cost: [D(10).pow(30), "infinityPower"],
    reward: "Double minigame rewards.",
    x: 550,
    y: 1760,
    connects: ["Gamer I"],
  },
  "Gamer IV": {
    cost: [D(10).pow(36), "infinityPower"],
    reward: "Improve gaming exponent (^0.6 --> ^1).",
    x: 400,
    y: 1980,
    connects: ["Gamer II", "Gamer III"],
  },
  "Gamer V": {
    cost: [D(10).pow(48), "infinityPower"],
    reward: "1.5x minigame rewards.",
    x: 250,
    y: 2200,
    connects: ["Gamer IV"],
  },
  "Gamer VI": {
    cost: [D(10).pow(54), "infinityPower"],
    reward: "Double minigame rewards.",
    x: 550,
    y: 2200,
    connects: ["Gamer IV"],
  },
  "IP Self-Boost II": {
    cost: [D(10).pow(70), "infinityPower"],
    reward: "Improve IP Self-Boost I exponent from 0.2 -> 0.3.",
    x: 250,
    y: 2420,
    connects: ["Gamer V"],
  },
  "IP Infinity Boost II": {
    cost: [D(10).pow(100), "infinityPower"],
    reward: "Improve IP Infinity Boost I exponent from 0.5 -> 0.8.",
    x: 550,
    y: 2420,
    connects: ["Gamer VI"],
  },
};

const infinityUpgradeNames = [
  "Infinity Power I",
  "Infinity Power II",
  "Drywall I",
  "Drywall/sec I",
  "Skill Points I",
  "Infinities I",
];
const infinityUpgradeCosts = {
  "Infinity Power I": [
    [
      D(1),
      D(1),
      D(3),
      D(5),
      D(8),
      D(15),
      D(40),
      D(100),
      D(450),
      D(2000),
      D(6500),
      D(35000),
      D(150000),
      D(2).times(D(10).pow(6)),
      D(10).pow(7),
      D(5).times(D(10).pow(7)),
      D(1.5).times(D(10).pow(8)),
      D(4).times(D(10).pow(8)),
      D(10).pow(9),
      D(10).pow(10),
      D(2).times(D(10).pow(10)),
      D(5).times(D(10).pow(10)),
      D(10).pow(11),
      D(3).times(D(10).pow(11)),
      D(10).pow(12),
      D(3).times(D(10).pow(12)),
      D(8).times(D(10).pow(12)),
      D(5).times(D(10).pow(13)),
      D(2).times(D(10).pow(14)),
      D(5).times(D(10).pow(14)),
    ],
    "infinityPoints",
  ],
  "Infinity Power II": [
    [
      D(1000),
      D(10).pow(6),
      D(10).pow(9),
      D(10).pow(12),
      D(10).pow(15),
      D(10).pow(18),
      D(10).pow(21),
      D(10).pow(24),
      D(10).pow(27),
      D(10).pow(30),
      D(10).pow(33),
      D(10).pow(36),
      D(10).pow(39),
      D(10).pow(42),
      D(10).pow(45),
      D(10).pow(48),
      D(10).pow(51),
      D(10).pow(54),
      D(10).pow(57),
      D(10).pow(60),
    ],
    "infinityPower",
  ],
  "Drywall I": [
    [
      D(0.25),
      D(6),
      D(25),
      D(2.5).times(D(10).pow(3)),
      D(4).times(D(10).pow(9)),
      D(5).times(D(10).pow(15)),
      D(8).times(D(10).pow(32)),
      D(2).times(D(10).pow(38)),
      D(5).times(D(10).pow(43)),
    ],
    "infinityPower",
  ],
  "Drywall/sec I": [
    [
      D(1),
      D(20),
      D(1.5).times(D(10).pow(2)),
      D(4).times(D(10).pow(8)),
      D(8).times(D(10).pow(14)),
      D(2.5).times(D(10).pow(30)),
      D(5).times(D(10).pow(33)),
      D(1).times(D(10).pow(39)),
      D(8).times(D(10).pow(43)),
    ],
    "infinityPower",
  ],
  "Skill Points I": [
    [
      D(5),
      D(4).times(D(10).pow(2)),
      D(5).times(D(10).pow(4)),
      D(8).times(D(10).pow(14)),
      D(4).times(D(10).pow(21)),
      D(1).times(D(10).pow(35)),
      D(2.5).times(D(10).pow(40)),
      D(4).times(D(10).pow(44)),
    ],
    "infinityPower",
  ],
  "Infinities I": [[D(10).pow(7)], "infinityPower"],
};

for (let i = 0; i < 250; i += 1) {
  infinityUpgradeCosts["Infinity Power I"][0].push(
    infinityUpgradeCosts["Infinity Power I"][0][
      infinityUpgradeCosts["Infinity Power I"][0].length - 1
    ].times(10),
  );
  infinityUpgradeCosts["Infinity Power II"][0].push(
    infinityUpgradeCosts["Infinity Power II"][0][
      infinityUpgradeCosts["Infinity Power II"][0].length - 1
    ].times(100),
  );
  infinityUpgradeCosts["Drywall I"][0].push(
    infinityUpgradeCosts["Drywall I"][0][
      infinityUpgradeCosts["Drywall I"][0].length - 1
    ].times(3),
  );
  infinityUpgradeCosts["Drywall/sec I"][0].push(
    infinityUpgradeCosts["Drywall/sec I"][0][
      infinityUpgradeCosts["Drywall/sec I"][0].length - 1
    ].times(4),
  );
  infinityUpgradeCosts["Skill Points I"][0].push(
    infinityUpgradeCosts["Skill Points I"][0][
      infinityUpgradeCosts["Skill Points I"][0].length - 1
    ].times(10),
  );
  infinityUpgradeCosts["Infinities I"][0].push(
    infinityUpgradeCosts["Infinities I"][0][
      infinityUpgradeCosts["Infinities I"][0].length - 1
    ].times(1000000),
  );
}

const settingNames = [
  "darkMode",
  "scientificNotation",
  "minimalParticles",
  "autoRebirth",
  "autoSkillTree",
  "autoInfinity",
  "resetStats",
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
  "",
  "k",
  "m",
  "b",
  "t",
  "qa",
  "qn",
  "sx",
  "sp",
  "oc",
  "no",
  "de",
  "ude",
  "dde",
  "tde",
  "qade",
  "qnde",
  "sxde",
  "spde",
  "ocde",
  "nvde",
  "vg",
  "uvg",
  "dvg",
  "tvg",
  "qavg",
  "qnvg",
  "sxvg",
  "spvg",
  "ocvg",
  "nvvg",
  "tg",
  "utg",
  "dtg",
  "ttg",
  "qatg",
  "qntg",
  "sxtg",
  "sptg",
  "octg",
  "nvtg",
  "qag",
  "uqag",
  "dqag",
  "tqag",
  "qaqag",
  "qnqag",
  "sxqag",
  "spqag",
  "ocqag",
  "nvqag",
  "qng",
  "uqng",
  "dqng",
  "tqng",
  "qaqng",
  "qnqng",
  "sxqng",
  "spqng",
  "ocqng",
  "nvqng",
  "sxg",
  "usxg",
  "dsxg",
  "tsxg",
  "qasxg",
  "qnsxg",
  "sxsxg",
  "spsxg",
  "ocsxg",
  "nvsxg",
  "spg",
  "uspg",
  "dspg",
  "tspg",
  "qasp",
  "qnspg",
  "sxspg",
  "spspg",
  "ocspg",
  "nvspg",
  "ocg",
  "uocg",
  "docg",
  "tocg",
  "qaocg",
  "qnocg",
  "sxocg",
  "spocg",
  "ococg",
  "nvocg",
  "nvg",
  "unvg",
  "dnvg",
  "tnvg",
  "qanvg",
  "qnnvg",
  "sxnvg",
  "spnvg",
  "ocnvg",
  "nvnvg",
  "tgnt",
  "tgnde",
  "tgng",
  "tgntg",
  "tgnqg",
  "tgnsxg",
  "tgnspg",
  "tgnocg",
  "tgnnvg",
];

// Automatically add all other elements with an id
document.querySelectorAll("[id]").forEach((el) => {
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
  infinityUpgrades: Object.fromEntries(
    infinityUpgradeNames.map((name) => [name, 0]),
  ),
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
    },
  },
  achievements: [],
  stats: {
    playtime: D(0),
    clicks: D(0),
  },
  username: null,
};
