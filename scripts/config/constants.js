/**
 * Gameplay constants and shared configuration values.
 */

// Disable dust (click particle) spawn debouncing — when false, every click spawns particles
export const dustSpawnDebounceTime = false;

// Click debounce in milliseconds (limits click rate to ~15 cps)
export const clickDebounceTime = 65;

// Setting keys — order determines the order they appear in the settings panel
export const settingNames = [
  "darkMode",
  "scientificNotation",
  "minimalParticles",
  "autoRebirth",
  "autoSkillTree",
  "autoInfinity",
  "resetStats",
];

// Stars awarded for completing each Geometry Dash level (indexed by level number)
export const levelStars = [1, 3, 5, 8, 15, 25, 100];
