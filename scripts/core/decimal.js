/**
 * Decimal wrapper and shared numeric constants.
 * Provides a safe `D()` constructor around break_infinity.js's Decimal.
 */

// The threshold at which drywall is considered "infinite" (2^1024)
export const infinityThreshold = new Decimal(2).pow(1024);

/**
 * Wraps a value in a Decimal instance, guarding against invalid input.
 * @param {*} x - The value to wrap
 * @returns {Decimal} A Decimal instance
 */
export const D = (x) => {
  if (x instanceof Decimal) return x;

  if (typeof x !== "number" && typeof x !== "string") {
    return new Decimal(0);
  }

  if (x === Infinity || x === "Infinity") return infinityThreshold;
  if (x === -Infinity || x === "-Infinity") return new Decimal(0);

  const n = Number(x);
  if (!Number.isFinite(n)) return new Decimal(0);

  return new Decimal(n);
};
