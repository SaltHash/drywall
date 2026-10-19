/**
 * Dev / moderation API client.
 *
 * Every call presents the developer's secret key, which the Worker hashes and
 * compares against the fixed dev hash. These functions therefore only succeed
 * for the developer account.
 */

const FETCH_TIMEOUT_MS = 8000;

/** fetch() with a timeout and JSON error extraction. */
async function postDev(path, body) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  let res;
  try {
    res = await fetch(path, {
      method: "POST",
      signal: controller.signal,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
  } finally {
    clearTimeout(timer);
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message = data?.error || `Request failed (${res.status})`;
    const error = new Error(message);
    error.status = res.status;
    throw error;
  }
  return data;
}

export function devSendGlobalMessage(secret, text, label) {
  return postDev("/api/dev/global-message", { secret, text, label });
}

export function devLookupPlayer(secret, query) {
  return postDev("/api/dev/lookup", { secret, query });
}

export function devRemovePlayer(secret, id) {
  return postDev("/api/dev/remove", { secret, id });
}

export function devRestorePlayer(secret, id) {
  return postDev("/api/dev/restore", { secret, id });
}

export function devResetPlayer(secret, id) {
  return postDev("/api/dev/reset", { secret, id });
}

export function devAddStats(secret, id, stats) {
  return postDev("/api/dev/add-stats", { secret, id, stats });
}
