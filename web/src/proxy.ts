import { NextResponse, type NextRequest } from "next/server";

// Password-protects /admin with HTTP Basic auth. Username: ADMIN_USER (default
// "admin"); password: ADMIN_PASSWORD. With no password set, /admin stays closed.

// Compares every character so the time taken doesn't reveal how much matched.
function same(a: string, b: string) {
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

export function proxy(request: NextRequest) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return new NextResponse("Admin is turned off. Set ADMIN_PASSWORD to use it.", { status: 404 });

  const header = request.headers.get("authorization") ?? "";
  if (header.startsWith("Basic ")) {
    let decoded = "";
    try {
      decoded = atob(header.slice(6));
    } catch {
      // Malformed credentials: fall through and ask again.
    }
    const split = decoded.indexOf(":");
    const user = decoded.slice(0, split);
    const pass = decoded.slice(split + 1);
    if (split > 0 && same(user, process.env.ADMIN_USER || "admin") && same(pass, password)) return NextResponse.next();
  }

  return new NextResponse("Sign in to see enquiries.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Pragati admin", charset="UTF-8"' },
  });
}

export const config = { matcher: ["/admin", "/admin/:path*"] };
