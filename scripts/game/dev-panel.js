/**
 * Developer / moderation panel.
 *
 * Only built for the developer account (see config/dev.js). Everything the
 * panel does talks to the Worker's /api/dev/* routes, which re-verify the
 * caller's secret hash server-side, so hiding the UI is a convenience, not the
 * security boundary.
 */

import { gameState } from "../core/state.js";
import { isDevAccount } from "../config/dev.js";
import { loadLeaderboard } from "../services/leaderboard.js";
import {
  devSendGlobalMessage,
  devLookupPlayer,
  devRemovePlayer,
  devRestorePlayer,
  devResetPlayer,
  devAddStats,
} from "../services/dev.js";

const DELTA_FIELDS = [
  ["drywall", "Drywall"],
  ["drywallPS", "Drywall/sec"],
  ["drywallPC", "Drywall/click"],
  ["rebirths", "Rebirths"],
  ["skillPoints", "Skill points"],
  ["infinities", "Infinities"],
  ["infinityPoints", "Infinity points"],
  ["infinityPower", "Infinity power"],
  ["playtime", "Playtime (ms)"],
  ["clicks", "Clicks"],
];

// The player currently selected in the lookup results.
let selected = null;

/** The dev secret is simply the dev account's own key. */
function devSecret() {
  return gameState.player?.editKey ?? "";
}

/** Builds a small confirm dialog and resolves true when confirmed. */
function confirmDialog(message) {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "devConfirmOverlay";
    overlay.innerHTML = `
      <div class="devConfirmBox">
        <p class="devConfirmText"></p>
        <div class="devConfirmActions">
          <button class="devConfirmCancel inlineButton">Cancel</button>
          <button class="devConfirmOk inlineButton dangerButton">Confirm</button>
        </div>
      </div>`;
    overlay.querySelector(".devConfirmText").textContent = message;
    const close = (value) => {
      overlay.remove();
      resolve(value);
    };
    overlay.querySelector(".devConfirmCancel").onclick = () => close(false);
    overlay.querySelector(".devConfirmOk").onclick = () => close(true);
    document.body.appendChild(overlay);
  });
}

/** Renders the panel's static structure into its container. */
function buildPanel(panel) {
  panel.innerHTML = `
    <div id="devPanelHeader">
      <h2>Dev Panel</h2>
      <button id="devPanelClose" class="inlineButton">Close</button>
    </div>
    <p id="devStatus" class="devStatus"></p>

    <h3>Global message</h3>
    <div class="devRow">
      <input id="devMessageLabel" type="text" maxlength="40" placeholder="Label (default: Global)">
    </div>
    <textarea id="devMessageText" maxlength="500" placeholder="Message to broadcast to every player..."></textarea>
    <button id="devMessageSend" class="inlineButton wideButton">Send global message</button>

    <h3>Player lookup</h3>
    <div class="devRow">
      <input id="devLookupQuery" type="text" placeholder="Player id or display name">
      <button id="devLookupButton" class="inlineButton">Search</button>
    </div>
    <div id="devLookupResults" class="devResults"></div>

    <h3>Selected player</h3>
    <div id="devPlayerInfo" class="devPlayerInfo">No player selected.</div>
    <div class="devRow">
      <button id="devRemoveButton" class="inlineButton dangerButton">Remove from leaderboard</button>
      <button id="devRestoreButton" class="inlineButton">Restore</button>
      <button id="devResetButton" class="inlineButton dangerButton">Reset save</button>
    </div>

    <h3>Add stats (applied once)</h3>
    <div id="devStatsGrid" class="devStatsGrid"></div>
    <button id="devApplyStats" class="inlineButton wideButton">Queue stat deltas</button>

    <h3>Utilities</h3>
    <div class="devRow">
      <button id="devRefreshBoard" class="inlineButton">Refresh leaderboard</button>
      <button id="devCopyId" class="inlineButton">Copy selected id</button>
    </div>
  `;

  const grid = panel.querySelector("#devStatsGrid");
  for (const [key, label] of DELTA_FIELDS) {
    const field = document.createElement("label");
    field.className = "devStatField";
    field.innerHTML = `<span>${label}</span>
      <input type="text" data-stat="${key}" placeholder="+delta">`;
    grid.appendChild(field);
  }
}

/**
 * Sets up the dev panel for the current player. Does nothing (and leaves the
 * panel hidden) for every other account.
 */
export async function initDevPanel() {
  const button = document.getElementById("devPanelButton");
  const panel = document.getElementById("devPanel");
  if (!button || !panel) return;

  const dev = await isDevAccount(gameState.player);
  if (!dev) {
    button.style.display = "none";
    panel.style.display = "none";
    return;
  }

  gameState.devMode = true;
  buildPanel(panel);
  button.style.display = "block";

  const status = panel.querySelector("#devStatus");
  const setStatus = (text, isError = false) => {
    status.textContent = text;
    status.classList.toggle("devError", isError);
  };

  const results = panel.querySelector("#devLookupResults");
  const info = panel.querySelector("#devPlayerInfo");

  const renderSelected = () => {
    if (!selected) {
      info.textContent = "No player selected.";
      return;
    }
    const pending = Object.entries(selected.pendingStats || {})
      .map(([key, value]) => `${key} ${value}`)
      .join(", ");
    const lines = [
      `${selected.displayName || "(no name)"} — ${selected.id}`,
      `opt-in: ${selected.leaderboardOptIn}  |  removed: ${selected.leaderboardBanned}`,
      `force reset pending: ${selected.forceReset}`,
      `last save: ${new Date(selected.saveUpdatedAt || 0).toLocaleString()}`,
    ];
    if (pending) lines.push(`queued deltas: ${pending}`);
    info.innerHTML = lines.map((line) => `<div>${line}</div>`).join("");
  };

  const runLookup = async () => {
    const query = panel.querySelector("#devLookupQuery").value.trim();
    if (!query) return;
    setStatus("Searching...");
    try {
      const { players } = await devLookupPlayer(devSecret(), query);
      results.innerHTML = "";
      if (!players || players.length === 0) {
        setStatus("No players matched.", true);
        return;
      }
      for (const player of players) {
        const item = document.createElement("button");
        item.className = "devResultItem inlineButton";
        item.textContent = `${player.displayName || "(no name)"} — ${player.id}`;
        item.onclick = () => {
          selected = player;
          renderSelected();
          setStatus(`Selected ${player.id}.`);
        };
        results.appendChild(item);
      }
      setStatus(`${players.length} match(es).`);
    } catch (err) {
      setStatus(err.message, true);
    }
  };

  const requireSelected = () => {
    if (!selected) {
      setStatus("Select a player first.", true);
      return false;
    }
    return true;
  };

  // --- Wiring ---
  panel.querySelector("#devPanelClose").onclick = () => {
    panel.style.display = "none";
  };

  const messageText = panel.querySelector("#devMessageText");
  panel.querySelector("#devMessageSend").onclick = async () => {
    const text = messageText.value.trim();
    if (!text) {
      setStatus("Write a message first.", true);
      return;
    }
    setStatus("Sending...");
    try {
      await devSendGlobalMessage(
        devSecret(),
        text,
        panel.querySelector("#devMessageLabel").value.trim(),
      );
      messageText.value = "";
      setStatus("Global message sent.");
    } catch (err) {
      setStatus(err.message, true);
    }
  };

  panel.querySelector("#devLookupButton").onclick = runLookup;
  panel.querySelector("#devLookupQuery").addEventListener("keydown", (e) => {
    if (e.key === "Enter") runLookup();
  });

  panel.querySelector("#devRemoveButton").onclick = async () => {
    if (!requireSelected()) return;
    if (!(await confirmDialog(`Remove ${selected.id} from the leaderboard? They keep playing but can never rejoin.`))) {
      return;
    }
    try {
      await devRemovePlayer(devSecret(), selected.id);
      selected.leaderboardBanned = true;
      selected.leaderboardOptIn = false;
      renderSelected();
      setStatus("Player removed.");
    } catch (err) {
      setStatus(err.message, true);
    }
  };

  panel.querySelector("#devRestoreButton").onclick = async () => {
    if (!requireSelected()) return;
    try {
      await devRestorePlayer(devSecret(), selected.id);
      selected.leaderboardBanned = false;
      renderSelected();
      setStatus("Player restored.");
    } catch (err) {
      setStatus(err.message, true);
    }
  };

  panel.querySelector("#devResetButton").onclick = async () => {
    if (!requireSelected()) return;
    if (!(await confirmDialog(`Reset ${selected.id}'s save to default? This overrides their local save on next login.`))) {
      return;
    }
    try {
      await devResetPlayer(devSecret(), selected.id);
      selected.forceReset = true;
      renderSelected();
      setStatus("Reset queued.");
    } catch (err) {
      setStatus(err.message, true);
    }
  };

  panel.querySelector("#devApplyStats").onclick = async () => {
    if (!requireSelected()) return;
    const inputs = panel.querySelectorAll("#devStatsGrid input[data-stat]");
    const stats = {};
    for (const input of inputs) {
      const value = input.value.trim();
      if (value) stats[input.dataset.stat] = value;
    }
    if (Object.keys(stats).length === 0) {
      setStatus("Enter at least one delta.", true);
      return;
    }
    try {
      await devAddStats(devSecret(), selected.id, stats);
      for (const input of inputs) input.value = "";
      setStatus("Deltas queued; they apply on the player's next login.");
    } catch (err) {
      setStatus(err.message, true);
    }
  };

  panel.querySelector("#devRefreshBoard").onclick = async () => {
    setStatus("Refreshing leaderboard...");
    try {
      await loadLeaderboard();
      setStatus("Leaderboard refreshed.");
    } catch (err) {
      setStatus(err.message, true);
    }
  };

  panel.querySelector("#devCopyId").onclick = async () => {
    if (!requireSelected()) return;
    try {
      await navigator.clipboard.writeText(selected.id);
      setStatus("Copied id.");
    } catch {
      setStatus("Clipboard blocked.", true);
    }
  };
}
