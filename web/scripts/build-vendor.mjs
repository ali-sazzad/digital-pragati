// Refreshes the animation libraries in ../static-site/vendor/ from node_modules.
// The static site has no build step (GitHub Pages publishes it as is), so the
// output is committed. Run after upgrading gsap or motion: `npm run vendor`.
//   gsap.min.js, ScrollTrigger.min.js  copied from the gsap package
//   motion.min.js                      a small IIFE bundle exposing window.Motion
//                                      with only the functions fx.js uses
import { copyFileSync, mkdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const webDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.resolve(webDir, "..", "static-site", "vendor");
const pkg = (name) => JSON.parse(readFileSync(path.join(webDir, "node_modules", name, "package.json"), "utf8")).version;
mkdirSync(out, { recursive: true });

for (const file of ["gsap.min.js", "ScrollTrigger.min.js"])
  copyFileSync(path.join(webDir, "node_modules", "gsap", "dist", file), path.join(out, file));

await build({
  stdin: {
    contents: 'export { animate } from "motion/mini"; export { hover, press, spring, stagger } from "motion";',
    resolveDir: webDir,
  },
  bundle: true,
  minify: true,
  format: "iife",
  globalName: "Motion",
  target: "es2020",
  banner: { js: `/* Motion ${pkg("motion")} (motion.dev), MIT License. Subset: animate, hover, press, spring, stagger. */` },
  outfile: path.join(out, "motion.min.js"),
});

for (const file of ["gsap.min.js", "ScrollTrigger.min.js", "motion.min.js"])
  console.log(`build-vendor: ${file} ${(statSync(path.join(out, file)).size / 1024).toFixed(1)} KB`);
console.log(`build-vendor: gsap ${pkg("gsap")}, motion ${pkg("motion")} -> ${out}`);
