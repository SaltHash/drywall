/**
 * Developer / moderation access.
 *
 * Access is granted only to the account whose public id is DEV_ID *and* whose
 * secret key hashes to DEV_SECRET_HASH. Only the hash is committed — the secret
 * itself never appears in the repository, and it is never sent anywhere except
 * the Worker, which re-checks the hash server-side.
 */

export const DEV_ID = "LEjhD29f3W9A";

export const DEV_SECRET_HASH =
  "99f1d666ff7ddabd2bc956cf168178cf026ed4efd5bc4584b32772408a0e6e64";

/** Hex-encoded SHA-256 of a string, using the Web Crypto API. */
export async function sha256Hex(value) {
  // crypto.subtle is only available in secure contexts; fail closed elsewhere.
  if (!globalThis.crypto?.subtle) return "";
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/** Whether a player object belongs to the developer account. */
export async function isDevAccount(player) {
  if (!player) return false;

  // The DB `permissions` column is the source of truth. A player with
  // 'owner' or 'moderator' gets the dev button regardless of their id.
  if (player.permissions === "owner" || player.permissions === "moderator") {
    return true;
  }

  // Legacy fallback: the fixed bootstrap dev id + secret hash.
  if (player.mylbkey !== DEV_ID) return false;
  if (typeof player.editKey !== "string" || player.editKey.length === 0) {
    return false;
  }
  try {
    return (await sha256Hex(player.editKey)) === DEV_SECRET_HASH;
  } catch {
    return false;
  }
}
