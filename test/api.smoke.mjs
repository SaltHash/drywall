/**
 * End-to-end smoke test for the Worker API against the real Neon database.
 *
 * Usage:
 *   npm run db:smoke        # reads DATABASE_URL from .env
 *
 * Creates a synthetic player, exercises every route, then deletes it. Nothing
 * is left behind.
 */

import { neon } from "@neondatabase/serverless";
import worker from "../src/index.js";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is not set. Add it to .env first.");
  process.exit(1);
}

const env = {
  DATABASE_URL,
  ASSETS: { fetch: async () => new Response("not found", { status: 404 }) },
};

const id = "smoke-test-player";
const secret = "smoke-test-secret-key-0123456789abcdef";
const otherSecret = "a-different-secret-key-0123456789abcdef";

let failures = 0;
function check(label, condition, detail = "") {
  if (condition) {
    console.log(`  ok   ${label}`);
  } else {
    failures += 1;
    console.error(`  FAIL ${label}${detail ? ` -> ${detail}` : ""}`);
  }
}

async function call(path, init) {
  const request = new Request(`https://example.com${path}`, init);
  return worker.fetch(request, env);
}

const save = {
  drywall: "1.5e12",
  rebirths: "42",
  skillPoints: "7",
  infinities: "3",
  infinityPower: "9001",
  achievements: ["A", "B", "C"],
  stats: { playtime: "3600000", clicks: "1234" },
  leaderboardOptIn: true,
  editKey: "this-should-never-be-stored",
  settings: { darkMode: true },
};

try {
  console.log("sync (create)");
  let res = await call("/api/sync", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      id,
      secret,
      displayName: "SMOKE TEST",
      save,
      saveUpdatedAt: 1000,
    }),
  });
  check("create returns 200", res.status === 200, `got ${res.status}`);
  const created = await res.json();
  check("create echoes id", created.id === id, JSON.stringify(created));

  console.log("connect");
  res = await call("/api/connect", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ secret }),
  });
  check("connect returns 200", res.status === 200, `got ${res.status}`);
  const connected = await res.json();
  check("connect returns full save", connected.save?.drywall === "1.5e12");
  check("secret stripped from stored save", connected.save?.editKey === undefined);
  check("connect returns id", connected.id === id);

  console.log("connect with unknown secret");
  res = await call("/api/connect", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ secret: otherSecret }),
  });
  check("unknown secret -> 404", res.status === 404, `got ${res.status}`);

  console.log("wrong secret write");
  res = await call("/api/sync", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      id,
      secret: otherSecret,
      displayName: "HACKER",
      save,
      saveUpdatedAt: 5000,
    }),
  });
  check("wrong secret -> 403", res.status === 403, `got ${res.status}`);

  console.log("stale write");
  res = await call("/api/sync", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      id,
      secret,
      displayName: "SMOKE TEST",
      save: { ...save, drywall: "1" },
      saveUpdatedAt: 500,
    }),
  });
  const stale = await res.json();
  check("stale write is ignored", stale.stale === true, JSON.stringify(stale));

  console.log("newer write");
  res = await call("/api/sync", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      id,
      secret,
      displayName: "SMOKE TEST 2",
      save: { ...save, drywall: "2e12" },
      saveUpdatedAt: 9000,
    }),
  });
  const newer = await res.json();
  check("newer write applied", newer.ok === true && !newer.stale);

  console.log("leaderboard");
  res = await call("/api/leaderboard", { method: "GET" });
  check("leaderboard returns 200", res.status === 200, `got ${res.status}`);
  const board = await res.json();
  const entry = board.entries.find((e) => e.stats?.drywall === "2e12");
  check("leaderboard includes the player", Boolean(entry));
  check("leaderboard entry has no private save", entry?.save === undefined);
  check("leaderboard name updated", entry?.name === "SMOKE TEST 2");
  check("leaderboard achievements count", entry?.stats?.achievements === 3);

  console.log("opted-out player stays hidden");
  const optedOutId = "smoke-opted-out";
  await call("/api/sync", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      id: optedOutId,
      secret: "opted-out-secret-key-0123456789abcdefgh",
      displayName: "HIDDEN",
      save: { ...save, drywall: "9.99e99", leaderboardOptIn: false },
      saveUpdatedAt: 1000,
    }),
  });
  res = await call("/api/leaderboard", { method: "GET" });
  const board2 = await res.json();
  check(
    "opted-out player filtered from leaderboard",
    !board2.entries.some((e) => e.name === "HIDDEN"),
  );

  console.log("opting in later reveals the player");
  await call("/api/sync", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      id: optedOutId,
      secret: "opted-out-secret-key-0123456789abcdefgh",
      displayName: "REVEALED",
      save: { ...save, drywall: "9.99e99", leaderboardOptIn: true },
      saveUpdatedAt: 2000,
    }),
  });
  res = await call("/api/leaderboard", { method: "GET" });
  const board3 = await res.json();
  check(
    "opted-in player appears on leaderboard",
    board3.entries.some((e) => e.name === "REVEALED"),
  );

  console.log("opted in but no name yet stays hidden");
  const noNameId = "smoke-noname";
  await call("/api/sync", {
    method: "POST",
    headers: { "content-type": "application/json" },
    // No displayName: the server falls back to the raw id, which must not show.
    body: JSON.stringify({
      id: noNameId,
      secret: "no-name-secret-key-0123456789abcdefghij",
      save: { ...save, drywall: "9.99e99", leaderboardOptIn: true },
      saveUpdatedAt: 3000,
    }),
  });
  res = await call("/api/leaderboard", { method: "GET" });
  const board4 = await res.json();
  check(
    "opted-in player without a name filtered from leaderboard",
    !board4.entries.some((e) => e.name === noNameId),
  );
} finally {
  const sql = neon(DATABASE_URL);
  await sql`delete from public.players where id in (${id}, ${"smoke-opted-out"}, ${"smoke-noname"})`;
  console.log("cleanup done");
}

console.log(failures === 0 ? "\nAll smoke tests passed." : `\n${failures} test(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
