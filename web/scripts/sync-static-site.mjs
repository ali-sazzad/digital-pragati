// Copies the static site (../static-site, the single source of truth that
// GitHub Pages publishes) into public/ so Next.js serves the same files.
// Runs automatically before `npm run dev` and `npm run build`.
import { cpSync, existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const webDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.resolve(webDir, "..", "static-site");
const target = path.join(webDir, "public");

if (!existsSync(path.join(source, "index.html"))) {
  console.error(`sync-static-site: ${path.join(source, "index.html")} not found.`);
  console.error("The static site is the source of the home page; nothing was copied.");
  process.exit(1);
}

cpSync(source, target, { recursive: true, force: true });

const entries = readdirSync(source, { recursive: true, withFileTypes: true }).filter((e) => e.isFile());
console.log(`sync-static-site: copied ${entries.length} files from ${source} to ${target}`);
