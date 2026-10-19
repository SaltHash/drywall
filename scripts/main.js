/**
 * Game entry point (ES module).
 *
 * Orchestration order:
 *  1. Populate gameState.elts with DOM references  (core/init.js)
 *  2. Load / create the player save                  (game/save.js)
 *  3. Reconcile the local save with the cloud copy   (game/sync.js)
 *  4. Compute initial boosts                         (game/boosts.js)
 *  5. Build upgrade button labels                    (game/render.js)
 *  6. Create skill-tree & infinity-tree buttons      (game/trees.js)
 *  7. Wire up all DOM event listeners                (game/events.js)
 *  8. Initialise the achievement grid                (game/achievements.js)
 *  9. Populate + fetch the leaderboard dropdown      (services/leaderboard.js)
 * 10. Create p5 minigame instances                   (minigames/*.js)
 * 11. Start the main game loop                       (game/loop.js)
 *
 * The script must be loaded AFTER the CDN scripts for p5 and Decimal
 * (break_infinity.js) so that their globals are available.
 */

import { gameState } from "./core/state.js";
import { initDOM } from "./core/init.js";
import { GAME_VERSION } from "./config/version.js";
import {
  resetPlayer,
  removalNoticeSeen,
  setRemovedPopupVisible,
  setUsernamePopupVisible,
} from "./game/save.js";
import { checkBoosts } from "./game/boosts.js";
import { setupUpgradeButtons } from "./game/render.js";
import {
  setupSkillTreeButtons,
  setupInfinityTreeButtons,
} from "./game/trees.js";
import { setupEventListeners } from "./game/events.js";
import { initAchievementGrid } from "./game/achievements.js";
import {
  loadLeaderboard,
  initLeaderboardSelect,
} from "./services/leaderboard.js";
import { reconcileSave } from "./game/sync.js";
import { initGlobalMessages } from "./services/global-message.js";
import { initDevPanel } from "./game/dev-panel.js";
import { tick } from "./game/loop.js";
import { initGeometryDash } from "./minigames/geometrydash.js";
import { initFlappyBird } from "./minigames/flappybird.js";

// ── 1. DOM initialisation ───────────────────────────────────────────
initDOM();

// Keep the title-screen version in step with the version constant.
if (gameState.elts.versionLabel) {
  gameState.elts.versionLabel.textContent = "v" + GAME_VERSION;
}

// ── 2. Player save load / reset ───────────────────────────────────────
resetPlayer(false);

// ── 3. Cloud reconcile ────────────────────────────────────────────────
// Runs before the UI is wired up so event handlers see the final save.
// reconcileSave() mutates gameState.player in place and never throws.
await reconcileSave().catch((err) => {
  console.error("Failed to reconcile cloud save:", err);
});

// Note: there is deliberately no eager "insta-save" here. Uploading a brand-new
// profile the moment it is created could be abused (spam new accounts to flood
// the database). New/updated saves are instead uploaded on the 60-second
// periodic sync in game/loop.js, which is anchored across reloads.

// ── 4. Compute initial boosts ────────────────────────────────────────
checkBoosts();

// ── 5. Upgrade button labels ────────────────────────────────────────
setupUpgradeButtons();

// ── 6. Skill-tree & infinity-tree buttons ───────────────────────────
setupSkillTreeButtons();
setupInfinityTreeButtons();

// ── 7. Event listeners ──────────────────────────────────────────────
setupEventListeners();

// ── 7b. Moderation notice ───────────────────────────────────────────
// A removed player is told once, the first time they log in after removal.
// The notice is marked seen when they dismiss it (see game/events.js).
if (gameState.leaderboardBanned && !removalNoticeSeen()) {
  setUsernamePopupVisible(false);
  setRemovedPopupVisible(true);
}

// ── 7c. Global messages + dev panel ─────────────────────────────────
initGlobalMessages();
initDevPanel();

// ── 8. Achievement grid ─────────────────────────────────────────────
initAchievementGrid();

// ── 9. Leaderboard (async, non-blocking) ────────────────────────────
initLeaderboardSelect(gameState.elts.leaderboardSelect);
loadLeaderboard().catch((err) => {
  console.error("Failed to load leaderboard:", err);
});

// ── 10. Minigame p5 instances ───────────────────────────────────────
// Creates the canvas elements and starts the p5 draw loop for each
// minigame. Both canvases start hidden (CSS: .minigameCanvas { display: none })
// and are toggled via the minigame buttons in the Infinity area.
initGeometryDash();
initFlappyBird();

// ── 11. Game loop ───────────────────────────────────────────────────
// The interval is 0.1 ms (1/10) – preserved from the original code.
gameState.myInterval = setInterval(tick, 1 / 10);
