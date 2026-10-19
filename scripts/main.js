/**
 * Game entry point (ES module).
 *
 * This module orchestrates the full game initialisation sequence:
 *  1. Populate gameState.elts with DOM references  (core/init.js)
 *  2. Load / create the player save                  (game/save.js)
 *  3. Compute initial boosts                         (game/boosts.js)
 *  4. Build upgrade button labels                    (game/render.js)
 *  5. Create skill-tree & infinity-tree buttons     (game/trees.js)
 *  6. Wire up all DOM event listeners               (game/events.js)
 *  7. Initialise the achievement grid               (game/achievements.js)
 *  8. Fetch leaderboard data (async, non-blocking)  (services/leaderboard.js)
 *  9. Create p5 minigame instances                  (minigames/*.js)
 * 10. Start the main game loop                       (game/loop.js)
 *
 * The script must be loaded AFTER the CDN scripts for p5, Decimal
 * (break_infinity.js) and Supabase so that their globals are available.
 */

import { gameState } from "./core/state.js";
import { initDOM } from "./core/init.js";
import { resetPlayer } from "./game/save.js";
import { checkBoosts } from "./game/boosts.js";
import { setupUpgradeButtons, render } from "./game/render.js";
import {
  setupSkillTreeButtons,
  setupInfinityTreeButtons,
} from "./game/trees.js";
import { setupEventListeners } from "./game/events.js";
import { initAchievementGrid } from "./game/achievements.js";
import { loadLeaderboard } from "./services/leaderboard.js";
import { tick } from "./game/loop.js";
import { initGeometryDash } from "./minigames/geometrydash.js";
import { initFlappyBird } from "./minigames/flappybird.js";

// ── 1. DOM initialisation ───────────────────────────────────────────
initDOM();

// ── 2. Player save load / reset ───────────────────────────────────────
resetPlayer(false);

// ── 3. Compute initial boosts ────────────────────────────────────────
checkBoosts();

// ── 4. Upgrade button labels ────────────────────────────────────────
setupUpgradeButtons();

// ── 5. Skill-tree & infinity-tree buttons ───────────────────────────
setupSkillTreeButtons();
setupInfinityTreeButtons();

// ── 6. Event listeners ──────────────────────────────────────────────
setupEventListeners();

// ── 7. Achievement grid ─────────────────────────────────────────────
initAchievementGrid();

// ── 8. Leaderboard (async, non-blocking) ────────────────────────────
loadLeaderboard().catch((err) => {
  console.error("Failed to load leaderboard:", err);
});

// ── 9. Minigame p5 instances ────────────────────────────────────────
// Creates the canvas elements and starts the p5 draw loop for each
// minigame.  Both canvases start hidden (CSS: .minigameCanvas { display: none })
// and are toggled via the minigame buttons in the Infinity area.
initGeometryDash();
initFlappyBird();

// ── 10. Game loop ───────────────────────────────────────────────────
// The interval is 0.1 ms (1/10) – preserved from the original code.
gameState.myInterval = setInterval(tick, 1 / 10);
