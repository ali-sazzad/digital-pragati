import { parseApiEnquiry } from "@/lib/enquiry";
import { receiveEnquiry } from "@/lib/enquiries";
import { site } from "@/lib/site";

// Public enquiry endpoint for forms hosted elsewhere (the static site).
// POST JSON or URL-encoded form data: name, business, contact (email or phone) or
// email/phone, market ("au" | "np"), need, message, website (honeypot).
//
// Browsers may call it only from this site or an origin listed in
// ENQUIRY_ALLOWED_ORIGINS (comma-separated, e.g. https://www.digitalpragati.com).

const MAX_BYTES = 20_000;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = Number(process.env.ENQUIRY_RATE_LIMIT) || 5;

function allowedOrigins(request: Request) {
  const list = (process.env.ENQUIRY_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim().replace(/\/$/, ""))
    .filter(Boolean);
  return new Set([...list, new URL(request.url).origin]);
}

function corsHeaders(origin: string | null): HeadersInit {
  return origin
    ? {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Accept",
        "Access-Control-Max-Age": "86400",
        Vary: "Origin",
      }
    : {};
}

const json = (body: unknown, status: number, origin: string | null) =>
  Response.json(body, { status, headers: corsHeaders(origin) });

// Best-effort, per server instance: enough to blunt a script hammering the form.
const hits = new Map<string, number[]>();
function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) for (const [key, times] of hits) if (now - times.at(-1)! > WINDOW_MS) hits.delete(key);
  return recent.length > MAX_PER_WINDOW;
}

// Returns the origin to echo back, "blocked" for a disallowed browser origin,
// or null for requests without an Origin header (servers, curl).
function checkOrigin(request: Request): string | null | "blocked" {
  const origin = request.headers.get("origin");
  if (!origin) return null;
  return allowedOrigins(request).has(origin) ? origin : "blocked";
}

export async function OPTIONS(request: Request) {
  const origin = checkOrigin(request);
  if (origin === "blocked") return new Response(null, { status: 403 });
  return new Response(null, { status: 204, headers: corsHeaders(origin) });
}

export async function POST(request: Request) {
  const origin = checkOrigin(request);
  if (origin === "blocked") return json({ ok: false, error: "This site isn't allowed to send enquiries here." }, 403, null);

  if (Number(request.headers.get("content-length") ?? 0) > MAX_BYTES)
    return json({ ok: false, error: "That enquiry is too long." }, 413, origin);

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || request.headers.get("x-real-ip") || "unknown";
  if (rateLimited(ip))
    return json({ ok: false, error: "Too many enquiries from this connection. Try again in 10 minutes." }, 429, origin);

  let body: Record<string, unknown>;
  try {
    const type = request.headers.get("content-type") ?? "";
    const raw = await request.text();
    if (raw.length > MAX_BYTES) return json({ ok: false, error: "That enquiry is too long." }, 413, origin);
    body = type.includes("application/json")
      ? JSON.parse(raw)
      : Object.fromEntries(new URLSearchParams(raw));
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("not an object");
  } catch {
    return json({ ok: false, error: "Send the enquiry as JSON or URL-encoded form data." }, 400, origin);
  }

  // Honeypot: people never see this field, bots fill it in. Pretend it worked.
  if (typeof body.website === "string" && body.website.trim()) return json({ ok: true }, 200, origin);

  const { enquiry, errors } = parseApiEnquiry(body);
  if (Object.keys(errors).length) return json({ ok: false, errors }, 422, origin);

  const { received } = await receiveEnquiry(enquiry);
  if (!received)
    return json(
      { ok: false, error: `We couldn't send your enquiry just now. Try again in a few minutes, or email us at ${site.email}.` },
      502,
      origin,
    );
  return json({ ok: true }, 200, origin);
}
