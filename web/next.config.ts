import type { NextConfig } from "next";

// public/index.html, sw.js, manifest.webmanifest and icons/ are copied from
// ../static-site by scripts/sync-static-site.mjs (predev/prebuild).
const revalidate = [{ key: "Cache-Control", value: "public, max-age=0, must-revalidate" }];

const nextConfig: NextConfig = {
  // PGlite loads its WebAssembly and data files from node_modules at runtime,
  // so it must not be bundled.
  serverExternalPackages: ["@electric-sql/pglite"],

  // The home page is the static site. beforeFiles runs before public files and
  // pages are checked, so "/" resolves to public/index.html.
  async rewrites() {
    return {
      beforeFiles: [{ source: "/", destination: "/index.html" }],
      afterFiles: [],
      fallback: [],
    };
  },

  // Always revalidate the page and service worker so deploys reach visitors.
  async headers() {
    return [
      { source: "/", headers: revalidate },
      { source: "/index.html", headers: revalidate },
      { source: "/sw.js", headers: revalidate },
      { source: "/manifest.webmanifest", headers: revalidate },
    ];
  },
};

export default nextConfig;
