/**
 * Shared mutable game state.
 *
 * This module provides a single object that modules can import and mutate
 * at runtime.  Because ES module exports are live bindings, every module
 * that imports `gameState` sees the same object reference, so mutations
 * performed by one module are visible to all others.
 */

// The leaderboard upload schedule is anchored to wall-clock time and stored
// outside the player save so a page reload does not restart the 60s timer.
const LEADERBOARD_UPDATE_KEY = "DRYWALL_LAST_LEADERBOARD_UPDATE";

// Moderation: a removed player is remembered permanently in this browser, so
// the ban survives save resets and cannot be undone by clearing the save.
const LEADERBOARD_BANNED_KEY = "DRYWALL_LEADERBOARD_BANNED";

/** Reads the persisted time of the last leaderboard upload, if any. */
function readLastLeaderboardUpdate() {
  try {
    const stored = Number(localStorage.getItem(LEADERBOARD_UPDATE_KEY));
    if (Number.isFinite(stored) && stored > 0) return stored;
  } catch {
    // localStorage can be unavailable (e.g. private mode); fall back to now.
  }
  return Date.now();
}

/** Reads the permanent "removed from leaderboard" flag for this device. */
function readLeaderboardBanned() {
  try {
    return localStorage.getItem(LEADERBOARD_BANNED_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * Records whether this device has been removed from the leaderboard.
 *
 * This is a one-way latch in the client: once set, it is never cleared, which
 * mirrors the server-side `leaderboard_banned` column.
 */
export function setLeaderboardBanned(value) {
  gameState.leaderboardBanned = value === true;
  try {
    if (value) localStorage.setItem(LEADERBOARD_BANNED_KEY, "1");
  } catch {
    // Best effort; the in-memory flag still holds for this session.
  }
}

/**
 * Records the time of a leaderboard upload, persisting it so the 60-second
 * cadence resumes from the same point after a page reload.
 *
 * @param {number} [time] - Upload time in ms since epoch (defaults to now)
 */
export function setLastLeaderboardUpdate(time = Date.now()) {
  gameState.lastLeaderboardUpdate = time;
  try {
    localStorage.setItem(LEADERBOARD_UPDATE_KEY, String(time));
  } catch {
    // Persisting is best-effort; the in-memory value still holds.
  }
}

export const gameState = {
  // Player data — populated by resetPlayer() in game/save.js
  player: null,

  // DOM element references — populated by initDOM() in core/init.js
  elts: {},

  // Canvas contexts for the skill-tree and infinity-tree canvases
  canvas: null,
  ctx: null,
  canvas2: null,
  ctx2: null,

  // Timing
  lastSave: 0,
  lastUpdate: Date.now(),
  lastLeaderboardUpdate: readLastLeaderboardUpdate(),
  deltatime: 0,

  // Cloud-save indicator state (surfaced in Settings > Cloud Save)
  lastCloudSave: 0,
  cloudSaveStatus: "idle",

  // Moderation state
  leaderboardBanned: readLeaderboardBanned(),
  devMode: false,
  // Pending acknowledgements sent with the next cloud push (see sync.js).
  resetAck: false,
  statsAckRev: 0,

  // Achievement notification queue
  achievementQueue: [],

  // Infinity-tree line-drawing cache
  drawnFromInfinities: [],

  // Achievement grid layout info
  grid: null,

  // Game-loop interval handle
  myInterval: null,
};
