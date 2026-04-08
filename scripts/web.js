let leaderboards = {};
let lastLeaderboardUpdate = Date.now();

let supabaseLib = window.supabase.createClient(
  "https://qjoubqfypaaqmysotzfj.supabase.co",
  "sb_publishable_AgIZgAJHS-5jetoeK4k6dA_KbpBCbt2",
);

// --------------------
// LOAD LEADERBOARD
// --------------------
async function loadLeaderboard() {
  const { data, error } = await supabaseLib.rpc("load_leaderboard");

  if (error) {
    console.error("Error loading leaderboard:", error.message);
    return {};
  }

  // data is now:
  // {
  //   "user_id": {
  //     display_name: "...",
  //     scores: { drywall: "...", rebirths: "...", ... }
  //   }
  // }

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

        if (D(val).exponent > 1e9) return null;

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

// --------------------
// SAVE SCORES
// --------------------
async function saveDataToLeaderboard() {
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

// --------------------
// DISPLAY
// --------------------
function getLeaderboardText(boardType) {
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

setInterval(saveDataToLeaderboard, 60000);
