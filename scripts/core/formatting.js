/**
 * Number formatting utilities and display-name lookup tables.
 *
 * These functions convert Decimal values into human-readable strings and
 * provide the suffix/scientific-notation logic used throughout the game.
 */

import { D, infinityThreshold } from "./decimal.js";
import { gameState } from "./state.js";

// Display names for game resources (used in upgrade labels, stat text, etc.)
export const displayNames = {
  drywall: " drywall",
  drywallPC: " drywall/click",
  drywallPS: " drywall/sec",
  rebirths: " rebirths",
  skillPoints: " skill points",
  infinities: " Infinities",
  infinityPoints: " Infinity Points",
  infinityPower: " Infinity Power",
};

// Short scale suffixes for large numbers (k, m, b, t, ...)
export const suffixes = [
  "", "k", "m", "b", "t", "qa", "qn", "sx", "sp", "oc", "no", "de",
  "ude", "dde", "tde", "qade", "qnde", "sxde", "spde", "ocde", "nvde",
  "vg", "uvg", "dvg", "tvg", "qavg", "qnvg", "sxvg", "spvg", "ocvg",
  "nvvg", "tg", "utg", "dtg", "ttg", "qatg", "qntg", "sxtg", "sptg",
  "octg", "nvtg", "qag", "uqag", "dqag", "tqag", "qaqag", "qnqag",
  "sxqag", "spqag", "ocqag", "nvqag", "qng", "uqng", "dqng", "tqng",
  "qaqng", "qnqng", "sxqng", "spqng", "ocqng", "nvqng", "sxg", "usxg",
  "dsxg", "tsxg", "qasxg", "qnsxg", "sxsxg", "spsxg", "ocsxg", "nvsxg",
  "spg", "uspg", "dspg", "tspg", "qasp", "qnspg", "sxspg", "spspg",
  "ocspg", "nvspg", "ocg", "uocg", "docg", "tocg", "qaocg", "qnocg",
  "sxocg", "spocg", "ococg", "nvocg", "nvg", "unvg", "dnvg", "tnvg",
  "qanvg", "qnnvg", "sxnvg", "spnvg", "ocnvg", "nvnvg", "tgnt",
  "tgnde", "tgng", "tgntg", "tgnqg", "tgnsxg", "tgnspg", "tgnocg",
  "tgnnvg",
];

/**
 * Rounds a Decimal to a fixed number of significant figures.
 * @param {Decimal|number|string} num - The number to round
 * @param {number} sigFigs - Number of significant figures
 * @param {boolean} padding - Whether to keep trailing zeros
 * @returns {string} The formatted string
 */
export function roundToSigFigs(num, sigFigs, padding = false) {
  num = D(num);
  if (num.eq(0)) return "0";

  const d = num.exponent + 1; // digits before decimal
  const power = sigFigs - d;

  const magnitude = D(10).pow(power);
  const rounded = num.mul(magnitude).round().div(magnitude);

  const decimals = Math.max(sigFigs - d, 0);

  let str = rounded.toFixed(decimals);

  if (!padding) {
    str = str.replace(/(\.\d*?[1-9])0+$/, "$1");
    str = str.replace(/\.0*$|\.?$/, "");
  }

  return str;
}

/**
 * Abbreviates a number into a short string (e.g. 1.23M, 1.23e45).
 * @param {Decimal|number|string} val - The value to abbreviate
 * @returns {string} The abbreviated string
 */
export function abbrevNum(val) {
  const player = gameState.player;

  if (val instanceof Decimal) {
    if (
      val.gte(infinityThreshold) &&
      player &&
      !player.infinityTreeUpgrades.includes("Break Infinity")
    ) {
      return "Infinity";
    }
  } else if (val === Infinity) {
    console.warn("Real infinity input into abbrevNum. This should not happen.");
    return "Infinity";
  }

  val = D(val);
  if (val.lt(1000)) return roundToSigFigs(val, 3);

  if (player?.settings?.scientificNotation || val.gte(D(10).pow(300))) {
    return roundToSigFigs(val.mantissa, 3) + "e" + val.exponent;
  } else {
    let exp = Math.floor(val.exponent / 3);
    if (!(exp >= 0)) exp = 0;
    return (
      roundToSigFigs(val.div(D(10).pow(exp * 3)), 3) + suffixes[exp]
    );
  }
}

/**
 * Formats a duration in milliseconds as a compact string (e.g. "1h 23m 45s").
 * @param {number} ms - Milliseconds to format
 * @returns {string} Formatted duration
 */
export function formatMillis(ms) {
  let seconds = Math.floor(ms / 1000);
  const days = Math.floor(seconds / 86400);
  seconds %= 86400;
  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  const minutes = Math.floor(seconds / 60);
  seconds %= 60;

  const parts = [];
  if (days) parts.push(`${days}d`);
  if (hours || days) parts.push(`${hours}h`);
  if (minutes || hours || days) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);

  return parts.join(" ");
}

/**
 * Formats a Unix timestamp as a 12-hour time string (e.g. "1:23pm").
 * @param {number} unixMs - Unix epoch milliseconds
 * @returns {string} Formatted time
 */
export function formatTime(unixMs) {
  const date = new Date(unixMs);
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  if (hours === 0) hours = 12;

  const minStr = minutes.toString().padStart(2, "0");
  const secStr = seconds.toString().padStart(2, "0");

  return `${hours}:${minStr}:${secStr}${ampm}`;
}

/** Natural-logarithm with arbitrary base. */
export function logBaseX(val, base) {
  return Math.log(val) / Math.log(base);
}
