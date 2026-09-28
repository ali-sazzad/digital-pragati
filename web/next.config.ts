import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PGlite loads its WebAssembly and data files from node_modules at runtime,
  // so it must not be bundled.
  serverExternalPackages: ["@electric-sql/pglite"],
};

export default nextConfig;
