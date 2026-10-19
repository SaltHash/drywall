/**
 * The single source of truth for the current game version.
 *
 * Bump `GAME_VERSION` when releasing. Everything that needs to know which build
 * is running (the title screen, limited-time "event" achievements such as the
 * Alpha/Beta Tester badges) reads the version from here, so it never drifts.
 */

/** Current game version, as a dotted string (e.g. "1.0.0"). */
export const GAME_VERSION = "1.0.0";

/** Splits "1.2.3" into [1, 2, 3]. Missing or invalid parts count as 0. */
function parseVersion(version) {
  return String(version)
    .split(".")
    .map((part) => {
      const value = parseInt(part, 10);
      return Number.isFinite(value) ? value : 0;
    });
}

/**
 * True when `version` is strictly newer than `than`.
 *
 * Parts are compared numerically left to right, so "1.10.0" is correctly newer
 * than "1.9.0".
 */
export function isVersionAfter(version, than) {
  const current = parseVersion(version);
  const other = parseVersion(than);
  const length = Math.max(current.length, other.length);

  for (let i = 0; i < length; i += 1) {
    const left = current[i] ?? 0;
    const right = other[i] ?? 0;
    if (left !== right) return left > right;
  }

  return false;
}

/**
 * Whether a limited-time event badge is still obtainable.
 *
 * A badge stays obtainable until the running build moves *past* the version it
 * closed at. Pass the badge's `maxVersion` (its closing version), e.g. "1.0.0"
 * for a badge that is earned by playing v1.0.0 or earlier.
 */
export function isBadgeObtainable(maxVersion) {
  return !isVersionAfter(GAME_VERSION, maxVersion);
}
