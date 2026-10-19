/**
 * Shared mutable game state.
 *
 * This module provides a single object that modules can import and mutate
 * at runtime.  Because ES module exports are live bindings, every module
 * that imports `gameState` sees the same object reference, so mutations
 * performed by one module are visible to all others.
 */

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
  lastLeaderboardUpdate: Date.now(),
  deltatime: 0,

  // Achievement notification queue
  achievementQueue: [],

  // Infinity-tree line-drawing cache
  drawnFromInfinities: [],

  // Achievement grid layout info
  grid: null,

  // Game-loop interval handle
  myInterval: null,
};
