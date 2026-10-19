/**
 * Achievement definitions.
 *
 * Each achievement may have a `requirement` (checked automatically),
 * a `reward` (applied as a boost), a `description`, and a `tier`
 * (0 = hidden event, 1-5 = visual tiers).
 */

import { D } from "../core/decimal.js";

export const achievements = {
  // === Drywall achievements ===
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
    description: "Reach 1 decillion drywall. A big gap, but you made it, right?",
    tier: 2,
  },
  Vigintillionaire: {
    requirement: { amount: D(10).pow(63), type: ["drywall"] },
    reward: { amount: D(1.3), type: "drywall" },
    description: "Reach 1 vigintillion drywall. You almost beat the game! nah jk",
    tier: 2,
  },
  "Scrooge Mc. Duck": {
    requirement: { amount: D(2.5).times(D(10).pow(135)), type: ["drywall"] },
    reward: { amount: D(1.3), type: "drywall" },
    description: "Reach 2.5e135 drywall. Thats enough to buy the final drywall upgrade! Well, for now at least.",
    tier: 2,
  },
  "THATS A LOT OF DRYWALL": {
    requirement: { amount: D(10).pow(1000), type: ["drywall"] },
    reward: { amount: D(1000), type: "drywall" },
    description: "Reach 1e1000 drywall. Not a jump at all :D",
  },

  // === Playtime achievements ===
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
    description: "Play for a whole week (168 hours). Go touch grass or something.",
    tier: 3,
  },

  // === Click achievements ===
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

  // === Infinity achievements ===
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

  // === Infinity Power achievements ===
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

  // === Hidden / event achievements ===
  "Alpha Tester": {
    description: "Play before the v0.5.0 release of the game.",
    tier: 0,
    // Event badge: no longer obtainable once the game moves past this version.
    maxVersion: "0.5.0",
  },
  "Beta Tester": {
    description: "Play on version v1.0.0 or before.",
    tier: 0,
    // Event badge: awarded while the running build is v1.0.0 or older.
    maxVersion: "1.0.0",
  },
  "Informed Voter": {
    reward: { amount: D(1), type: "drywall" },
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
