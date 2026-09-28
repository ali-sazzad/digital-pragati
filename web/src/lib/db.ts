import { mkdir } from "node:fs/promises";
import path from "node:path";

// One tiny query interface over two Postgres drivers:
// - DATABASE_URL set (Neon, Supabase, any hosted Postgres): the `postgres` driver.
// - Not set: PGlite, a full Postgres compiled to WebAssembly that runs inside this
//   process and saves to a local folder (PGLITE_DIR, default .data/pglite). Good
//   for development, tests and a single self-hosted server. It does not work on
//   serverless hosts with a read-only disk; set DATABASE_URL there.

type Row = Record<string, unknown>;
export type Db = { query: <T extends Row = Row>(text: string, params?: unknown[]) => Promise<T[]> };

const schema = `
  create table if not exists enquiries (
    id           serial primary key,
    created_at   timestamptz not null default now(),
    source       text not null,
    market       text not null,
    name         text not null,
    business     text not null,
    email        text,
    phone        text,
    need         text,
    message      text,
    email_status text not null default 'pending'
  );
  create index if not exists enquiries_created_at_idx on enquiries (created_at desc);
`;

async function connect(): Promise<Db> {
  const url = process.env.DATABASE_URL;
  if (url) {
    const { default: postgres } = await import("postgres");
    const local = /@(localhost|127\.0\.0\.1)[:/]/.test(url);
    // prepare: false because connection poolers (Neon's, Supabase's, PgBouncer)
    // don't support prepared statements; it's safe on any Postgres.
    const sql = postgres(url, { ssl: local ? false : "require", max: 5, prepare: false, onnotice: () => {} });
    await sql.unsafe(schema);
    return { query: async (text, params = []) => (await sql.unsafe(text, params as never[])) as never };
  }

  const { PGlite } = await import("@electric-sql/pglite");
  // turbopackIgnore: a runtime data folder, not source to trace into the build.
  const dir = path.resolve(/* turbopackIgnore: true */ process.cwd(), process.env.PGLITE_DIR || ".data/pglite");
  await mkdir(dir, { recursive: true }); // PGlite won't create missing parent folders
  const pg = await PGlite.create(dir);
  await pg.exec(schema);
  return { query: async (text, params = []) => (await pg.query(text, params)).rows as never };
}

// Kept on globalThis so dev-mode hot reloads reuse one connection.
const g = globalThis as typeof globalThis & { __pragatiDb?: Promise<Db> };

export function getDb(): Promise<Db> {
  g.__pragatiDb ??= connect().catch((err) => {
    g.__pragatiDb = undefined; // let the next request retry
    throw err;
  });
  return g.__pragatiDb;
}
