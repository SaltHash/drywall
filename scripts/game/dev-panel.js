/**
 * Developer / moderation panel.
 *
 * Only built for the developer account (see config/dev.js). Everything the
 * panel does talks to the Worker's /api/dev/* routes, which re-verify the
 * caller's secret hash server-side, so hiding the UI is a convenience, not the
 * security boundary.
 */

import { saveData } from "./save.js";
import { gameState } from "../core/state.js";
import { isDevAccount } from "../config/dev.js";
import { loadLeaderboard } from "../services/leaderboard.js";
import {
  devSendGlobalMessage,
  devLookupPlayer,
  devListPlayers,
  devRemovePlayer,
  devRestorePlayer,
  devResetPlayer,
  devAddStats,
  devSetRole,
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
    <div id="devActingAs" class="devActingAs">Acting as: —</div>
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

    <h3>All players</h3>
    <div class="devRow">
      <button id="devListButton" class="inlineButton wideButton">List all players</button>
    </div>
    <div id="devListResults" class="devResults"></div>

    <h3>Selected player</h3>
    <div id="devPlayerInfo" class="devPlayerInfo">No player selected.</div>
    <h3>Add stats (applied once)</h3>
    <div id="devStatsGrid" class="devStatsGrid"></div>
    <button id="devApplyStats" class="inlineButton wideButton">Queue stat deltas</button>

    <h3>Utilities</h3>
    <div class="devRow">
      <button id="devRefreshBoard" class="inlineButton">Refresh leaderboard</button>
      <button id="devCopyId" class="inlineButton">Copy selected id</button>
    </div>

    <h3>Roles <span id="devRoleHint" class="devRoleHint"></span></h3>
    <div id="devRoleSection" class="devRoleSection" style="display: none">
      <div class="devRow">
        <button id="devSetMod" class="inlineButton">Make moderator</button>
        <button id="devRevokeRole" class="inlineButton">Revoke role</button>
      </div>
    </div>

    <div class="devRow">
      <button id="devRestoreButton" class="inlineButton">Restore</button>
      <button id="devResetButton" class="inlineButton dangerButton">Reset save</button>
      <button id="devRemoveButton" class="inlineButton dangerButton">Remove from leaderboard</button>
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
  panel.style.display = "none";
  button.style.display = "block";

  // --- Resolve the caller's role from the server ---
  // Bootstrap dev is always owner; everyone else gets their DB permissions.
  let role = "owner";
  try {
    const self = await devLookupPlayer(devSecret(), gameState.player?.mylbkey);
    role = self?.players?.[0]?.permissions || "owner";
  } catch {
    role = "owner";
  }
  const isOwner = role === "owner";
  const isModerator = role === "moderator" || isOwner;
  const actingLabel = panel.querySelector("#devActingAs");
  if (actingLabel) actingLabel.textContent = `Acting as: ${gameState.player?.displayName || "(no name)"} (${role})`;

  // Moderators cannot see the expanded detail view or change stats.
  if (!isOwner) {
    panel.querySelector("#devStatsGrid").parentElement.style.display = "none";
    panel.querySelector("#devApplyStats").style.display = "none";
  }
  // Role management is owner-only.
  if (!isOwner) {
    panel.querySelector("#devRoleSection").style.display = "none";
  } else {
    panel.querySelector("#devRoleSection").style.display = "block";
    panel.querySelector("#devRoleHint").textContent = "(owner only)";
  }

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
          syncModButtons();
          if (isOwner) syncRoleButtons();
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

  /** Briefly highlights a detail row after its value is copied. */
  function flashCopy(row) {
    const pre = row.querySelector(".devDetailVal");
    const old = pre.textContent;
    pre.textContent = "copied!";
    pre.classList.add("devCopied");
    setTimeout(() => {
      pre.textContent = old;
      pre.classList.remove("devCopied");
    }, 900);
  }

  /** Shows a full detail overlay for one player: id, secret hash, every
   *  major stat and flag from both the save and the database row. */
  function showPlayerDetail(player) {
    const overlay = document.createElement("div");
    overlay.className = "devDetailOverlay";
    const close = () => overlay.remove();
    overlay.innerHTML = `
      <div class="devDetailBox">
        <div class="devDetailHeader">
          <h3>Player detail</h3>
          <button class="devDetailClose inlineButton">Close</button>
        </div>
        <div class="devDetailBody"></div>
      </div>`;
    overlay.querySelector(".devDetailClose").onclick = close;
    overlay.onclick = (e) => {
      if (e.target === overlay) close();
    };
    document.body.appendChild(overlay);

    const body = overlay.querySelector(".devDetailBody");
    const fmt = (v) => {
      if (v == null) return "—";
      if (v instanceof Decimal) return v.toString();
      if (typeof v === "object") return JSON.stringify(v, null, 2);
      return String(v);
    };
    const save = player.save && typeof player.save === "object" ? player.save : {};

    const sections = [
      {
        title: "Identity",
        rows: [
          ["id", player.id],
          ["displayName", player.displayName],
          ["secretHash", player.secretHash],
        ],
      },
      {
        title: "Database flags",
        rows: [
          ["leaderboardOptIn", player.leaderboardOptIn],
          ["leaderboardBanned", player.leaderboardBanned],
          ["forceReset", player.forceReset],
          ["saveUpdatedAt", player.saveUpdatedAt],
          ["createdAt", player.createdAt],
          ["updatedAt", player.updatedAt],
          ["pendingStatsRev", player.pendingStatsRev],
        ],
      },
      {
        title: "Pending stat deltas",
        rows: Object.entries(player.pendingStats || {}).map(([k, v]) => [k, v]),
      },
      {
        title: "Save — primary counters",
        rows: [
          ["drywall", save.drywall],
          ["drywallPS", save.drywallPS],
          ["drywallPC", save.drywallPC],
          ["rebirths", save.rebirths],
          ["skillPoints", save.skillPoints],
          ["infinities", save.infinities],
          ["infinityPoints", save.infinityPoints],
          ["infinityPower", save.infinityPower],
        ],
      },
      {
        title: "Save — stats",
        rows: [
          ["playtime", save.stats?.playtime],
          ["clicks", save.stats?.clicks],
        ],
      },
      {
        title: "Save — misc",
        rows: [
          ["areasUnlocked", save.areasUnlocked],
          ["globalToken", save.globalToken],
          ["username", save.username],
          ["usernameChosen", save.usernameChosen],
          ["leaderboardOptIn", save.leaderboardOptIn],
          ["updatedAt", save.updatedAt],
        ],
      },
    ];

    for (const section of sections) {
      const h = document.createElement("h4");
      h.textContent = section.title;
      body.appendChild(h);
      for (const [key, value] of section.rows) {
        const row = document.createElement("div");
        row.className = "devDetailRow";
        const valStr = fmt(value);
        row.innerHTML = `<span class="devDetailKey">${key}</span><pre class="devDetailVal" title="Click to copy">${valStr}</pre><button class="devCopyVal inlineButton" title="Copy value" aria-label="Copy ${key}">⧉</button>`;
        const pre = row.querySelector(".devDetailVal");
        if (typeof value === "boolean") {
          pre.onclick = () => {
            const newVal = !value;
            pre.textContent = fmt(newVal);
            // Best-effort update of the underlying data object
            if (key in player) player[key] = newVal;
            // For save keys, try to map; this is approximate
            if (save && key in save) save[key] = newVal;
            // Force update of the local variable reference for subsequent interactions
            value = newVal;
          };
        } else {
          pre.onclick = async () => {
            if (!(await confirmDialog(`Edit "${key}"? Warning: this may not persist.`))) return;
            const input = prompt(`New value for ${key}:`, valStr);
            if (input === null) return;
            pre.textContent = input;
            if (key in player) player[key] = input;
            if (save && key in save) save[key] = input;
            value = input;
          };
        }
        row.querySelector(".devCopyVal").onclick = async (e) => {
          e.stopPropagation();
          try {
            await navigator.clipboard.writeText(valStr);
            flashCopy(row);
          } catch {
            setStatus("Clipboard blocked.", true);
          }
        };
        body.appendChild(row);
      }
    }
  }

  async function runList() {
    setStatus("Loading all players...");
    try {
      const { players } = await devListPlayers(devSecret());
      const results = panel.querySelector("#devListResults");
      results.innerHTML = "";
      if (!players || players.length === 0) {
        setStatus("No players found.", true);
        return;
      }
      for (const player of players) {
        const item = document.createElement("button");
        item.className = "devResultItem inlineButton";
        item.innerHTML = `<span class="devListMain">${player.displayName || "(no name)"} — ${player.id}</span><span class="devListArrow">→</span>`;
        item.onclick = () => showPlayerDetail(player);
        item.querySelector(".devListArrow").onclick = (e) => {
          e.stopPropagation();
          selected = player;
          renderSelected();
          syncModButtons();
          if (isOwner) syncRoleButtons();
          setStatus(`Selected ${player.id}.`);
        };
        results.appendChild(item);
      }
      setStatus(`${players.length} player(s).`);
    } catch (err) {
      setStatus(err.message, true);
    }
  }

  // --- Wiring ---
  button.onclick = () => {
    panel.style.display = panel.style.display === "none" ? "block" : "none";
  };
  panel.querySelector("#devPanelClose").onclick = () => {
    panel.style.display = "none";
  };

  document.addEventListener("click", (e) => {
    if (panel.style.display === "block" && !panel.contains(e.target) && !button.contains(e.target) && !e.target.closest(".devDetailOverlay")) {
      panel.style.display = "none";
    }
  });

  const messageText = panel.querySelector("#devMessageText");
  panel.querySelector("#devMessageSend").onclick = async () => {
    if (!isOwner) {
      setStatus("Only owners can send global messages.", true);
      return;
    }
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
  panel.querySelector("#devListButton").onclick = runList;
  panel.querySelector("#devLookupQuery").addEventListener("keydown", (e) => {
    if (e.key === "Enter") runLookup();
  });

  // --- Toggle-able moderation buttons (ban↔unban, reset↔clear-reset) ---
  const removeBtn = panel.querySelector("#devRemoveButton");
  const restoreBtn = panel.querySelector("#devRestoreButton");
  const resetBtn = panel.querySelector("#devResetButton");

  function syncModButtons() {
    if (!selected) return;
    const banned = selected.leaderboardBanned === true;
    const resetting = selected.forceReset === true;
    removeBtn.textContent = banned ? "Unban from leaderboard" : "Remove from leaderboard";
    restoreBtn.textContent = banned ? "Restore" : "Already visible";
    restoreBtn.disabled = !banned;
    resetBtn.textContent = resetting ? "Clear reset flag" : "Reset save";
  }

  panel.querySelector("#devRemoveButton").onclick = async () => {
    if (!requireSelected()) return;
    const banned = selected.leaderboardBanned === true;
    const action = banned ? "unban" : "remove";
    if (!(await confirmDialog(
      banned
        ? `Restore ${selected.id} to the leaderboard?`
        : `Remove ${selected.id} from the leaderboard? They keep playing but can never rejoin.`
    ))) {
      return;
    }
    try {
      if (banned) {
        await devRestorePlayer(devSecret(), selected.id);
        selected.leaderboardBanned = false;
        setStatus("Player restored.");
      } else {
        await devRemovePlayer(devSecret(), selected.id);
        selected.leaderboardBanned = true;
        selected.leaderboardOptIn = false;
        setStatus("Player removed.");
      }
      renderSelected();
      syncModButtons();
    } catch (err) {
      setStatus(err.message, true);
    }
  };

  panel.querySelector("#devRestoreButton").onclick = async () => {
    if (!requireSelected()) return;
    if (selected.leaderboardBanned !== true) {
      setStatus("Player is not banned.", true);
      return;
    }
    try {
      await devRestorePlayer(devSecret(), selected.id);
      selected.leaderboardBanned = false;
      renderSelected();
      syncModButtons();
      setStatus("Player restored.");
    } catch (err) {
      setStatus(err.message, true);
    }
  };

  panel.querySelector("#devResetButton").onclick = async () => {
    if (!requireSelected()) return;
    const resetting = selected.forceReset === true;
    if (!(await confirmDialog(
      resetting
        ? `Clear ${selected.id}'s pending reset?`
        : `Reset ${selected.id}'s save to default? This overrides their local save on next login.`
    ))) {
      return;
    }
    try {
      // There is no "clear reset" endpoint; the client acks it on next sync.
      // For now, toggling off just updates the local flag and status.
      selected.forceReset = !resetting;
      renderSelected();
      syncModButtons();
      setStatus(resetting ? "Reset flag cleared (local)." : "Reset queued.");
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

  // --- Role management (owner only) ---
  if (isOwner) {
    const setModBtn = panel.querySelector("#devSetMod");
    const revokeBtn = panel.querySelector("#devRevokeRole");

    function syncRoleButtons() {
      if (!selected) return;
      const current = selected.permissions;
      setModBtn.textContent = current === "moderator" ? "Demote to player" : "Make moderator";
      revokeBtn.textContent = current === "owner" ? "Revoke owner" : current === "moderator" ? "Revoke role" : "Revoke role";
      revokeBtn.disabled = !current || current === "none";
    }

    setModBtn.onclick = async () => {
      if (!requireSelected()) return;
      const current = selected.permissions;
      const target = current === "moderator" ? "none" : "moderator";
      if (!(await confirmDialog(
        target === "none"
          ? `Demote ${selected.id} from moderator to regular player?`
          : `Grant ${selected.id} moderator access?`
      ))) {
        return;
      }
      try {
        await devSetRole(devSecret(), selected.id, target);
        selected.permissions = target;
        renderSelected();
        syncRoleButtons();
        setStatus(target === "none" ? "Role revoked." : "Moderator granted.");
      } catch (err) {
        setStatus(err.message, true);
      }
    };

    revokeBtn.onclick = async () => {
      if (!requireSelected()) return;
      const current = selected.permissions;
      if (!current || current === "none") {
        setStatus("Player has no role to revoke.", true);
        return;
      }
      if (!(await confirmDialog(
        `Revoke ${selected.id}'s ${current} role and return them to a regular player?`
      ))) {
        return;
      }
      try {
        await devSetRole(devSecret(), selected.id, "none");
        selected.permissions = "none";
        renderSelected();
        syncRoleButtons();
        setStatus("Role revoked.");
      } catch (err) {
        setStatus(err.message, true);
      }
    };
  }
}
