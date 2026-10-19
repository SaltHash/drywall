/**
 * Applies db/schema.sql to the Neon database referenced by DATABASE_URL.
 *
 * Usage:
 *   npm run db:migrate        # reads DATABASE_URL from .env
 *
 * The schema is plain DDL with no function bodies, so it can be split on
 * semicolons and executed statement-by-statement over Neon's HTTP driver.
 */

import { readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;

if (!url) {
  console.error(
    "DATABASE_URL is not set. Add it to .env before running this migration.",
  );
  process.exit(1);
}

const sql = neon(url);

const source = await readFile(new URL("./schema.sql", import.meta.url), "utf8");

// Drop full-line comments, then split into individual statements.
const statements = source
  .replace(/^\s*--.*$/gm, "")
  .split(";")
  .map((statement) => statement.trim())
  .filter((statement) => statement.length > 0);

for (const statement of statements) {
  await sql.query(statement);
}

const [row] = await sql.query(
  "select to_regclass('public.players') is not null as present",
);

console.log(`Migration complete. players table present: ${row?.present === true}`);
