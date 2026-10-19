/**
 * Leaderboard service (Supabase integration).
 *
 * Provides functions to load the global leaderboard, save the player's
 * scores, and generate display text for the leaderboard panel.
 */

import { D } from "../core/decimal.js";
import { gameState } from "../core/state.js";
import { abbrevNum } from "../core/formatting.js";

// Supabase client (uses the global `supabase` from the CDN script)
const supabaseLib = window.supabase.createClient(
  "https://qjoubqfypaaqmysotzfj.supabase.co",
  "sb_publishable_AgIZgAJHS-5jetoeK4k6dA_KbpBCbt2",
);

// In-memory cache of all leaderboards (keyed by stat type)
let leaderboards = {};

/**
 * Loads all leaderboard data from Supabase.
 * @returns {Promise<Object>} The leaderboard data
 */
export async function loadLeaderboard() {
  const { data, error } = await supabaseLib.rpc("load_leaderboard");

  if (error) {
    console.error("Error loading leaderboard:", error.message);
    return {};
  }

  const leaderboardTypes = [
    "drywall",
    "rebirths",
    "skill_points",
    "infinities",
    "achievements",
  ];

  let preLeaderboards = {};

  for (const type of leaderboardTypes) {
    preLeaderboards[type] = Object.values(data)
      .map((entry) => {
        const raw = entry.scores?.[type];
        if (raw === null || raw === undefined || raw === "") return null;

        let val;
        try {
          val = D(raw);
        } catch {
          return null;
        }

        if (val.exponent > 1e9) return null;

        return {
          display_name: entry.display_name,
          value: val,
        };
      })
      .filter((x) => x !== null)
      .sort((a, b) => b.value.cmp(a.value))
      .slice(0, 10);
  }

  leaderboards = preLeaderboards;
  return preLeaderboards;
}

/**
 * Uploads the player's current scores to Supabase.
 */
export async function saveDataToLeaderboard() {
  const player = gameState.player;
  if (!player.mylbkey || player.username === "ICodeBugs (indev)") return;

  const scores = {
    drywall: D(player.drywall).toString(),
    rebirths: D(player.rebirths).toString(),
    skill_points: D(player.skillPoints).toString(),
    infinities: D(player.infinities).toString(),
    achievements: player.achievements.length,
  };

  let { error } = await supabaseLib.rpc("save_scores", {
    p_id: player.mylbkey,
    p_edit_key: player.editKey,
    p_scores: scores,
  });

  if (error) {
    console.error("Error saving score:", error.message);
  } else {
    console.log("Score saved!");
  }
}

/**
 * Generates the innerHTML for a leaderboard display.
 * @param {string} boardType - Which leaderboard to display
 * @returns {string} HTML string of ranked entries
 */
export function getLeaderboardText(boardType) {
  let text = "";

  if (Object.keys(leaderboards).length === 0) {
    return text;
  }

  let lb = leaderboards[boardType];

  if (lb) {
    for (let i of Object.keys(lb)) {
      text += lb[i].display_name + " - " + abbrevNum(lb[i].value) + "<br>";
    }
  } else {
    console.warn(
      "Leaderboard '" + boardType + "' not found (something's broken)",
    );
  }

  return text;
}
