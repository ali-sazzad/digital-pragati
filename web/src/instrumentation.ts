// Runs once when the server starts. Opening the database here means no visitor
// waits for it: a brand-new PGlite database takes several seconds to set up.
// Not awaited, so the server still starts at once; early requests share the
// same in-progress connection.
export function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  void import("@/lib/db")
    .then(({ getDb }) => getDb())
    .catch((err) => console.error("Database warm-up failed; it will retry on the first request", err));
}
