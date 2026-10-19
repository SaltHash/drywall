/**
 * Global message delivery.
 *
 * Polls the Worker for the current announcement and renders it in the existing
 * `#globalMessageBox` when a new one appears. Delivery uses the Worker's
 * Durable Object (see src/global-message.js), so it never touches the player
 * database.
 */

import { gameState } from "../core/state.js";

const POLL_INTERVAL_MS = 15_000;

// sentAt of the last message we displayed, so we only animate once per message.
let lastSeenSentAt = parseInt(localStorage.getItem("drywallLastMsgSentAt") || "0", 10);

/** Formats a timestamp as "h:mm:ss am/pm" to match the message box. */
function formatClock(date) {
  let hours = date.getHours();
  const suffix = hours < 12 ? "am" : "pm";
  hours = hours % 12 || 12;
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${hours}:${minutes}:${seconds} ${suffix}`;
}

/** Shows a message in the global message box, restarting its animation. */
export function showGlobalMessage(message) {
  const elts = gameState.elts;
  const box = elts.globalMessageBox;
  if (!box || !message) return;

  if (elts.globalMessageLabel) {
    elts.globalMessageLabel.textContent = message.label || "Global";
  }
  if (elts.globalMessageText) {
    elts.globalMessageText.textContent = message.text;
  }
  if (elts.globalMessageTime) {
    elts.globalMessageTime.textContent = formatClock(
      new Date(message.sentAt || Date.now()),
    );
  }

  // Remove + reflow + re-add so the CSS animation replays for the new message.
  box.classList.remove("showGlobal");
  void box.offsetWidth;
  box.classList.add("showGlobal");
}

/** Fetches the current announcement and shows it if it is new. */
export async function checkGlobalMessage() {
  try {
    const res = await fetch("/api/global-message");
    if (!res.ok) return;
    const { message } = await res.json();
    if (!message || !message.sentAt || message.sentAt === lastSeenSentAt) return;
    lastSeenSentAt = message.sentAt;
    localStorage.setItem("drywallLastMsgSentAt", String(message.sentAt));
    showGlobalMessage(message);
  } catch {
    // Offline: retry on the next poll.
  }
}

/** Starts polling for global messages. Safe to call once at startup. */
export function initGlobalMessages() {
  checkGlobalMessage();
  setInterval(checkGlobalMessage, POLL_INTERVAL_MS);
}
