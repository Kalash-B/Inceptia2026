import { createHmac, timingSafeEqual } from "crypto"

// Admin session max age: 8 hours
const ADMIN_SESSION_MAX_AGE_MS = 8 * 60 * 60 * 1000

// ---------------------------------------------------------------------------
// Admin-key guard
// Used by /scan (GET + POST) — developer backdoor and scanner endpoint.
// The key lives in process.env.AUTH and is sent via the X-Admin-Key header.
// ---------------------------------------------------------------------------

export function requireAdminKey(headers: Headers): Response | null {
  const key = headers.get("x-admin-key")
  const expected = process.env.AUTH

  if (!expected) {
    // Auth secret not configured — fail closed
    return new Response(
      JSON.stringify({ success: false, error: "Server misconfiguration: AUTH secret not set" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }

  if (!key) {
    return new Response(
      JSON.stringify({ success: false, error: "Unauthorized: X-Admin-Key header required" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    )
  }

  // Constant-time comparison to prevent timing attacks
  const keyBuf = Buffer.from(key)
  const expBuf = Buffer.from(expected)
  const match =
    keyBuf.length === expBuf.length &&
    timingSafeEqual(keyBuf, expBuf)

  if (!match) {
    return new Response(
      JSON.stringify({ success: false, error: "Forbidden: Invalid admin key" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    )
  }

  return null // key is valid — caller should proceed
}

// ---------------------------------------------------------------------------
// HMAC nonce helpers
// Used by /login to prevent direct API abuse and replay attacks.
//
// Nonce format:  "<timestamp>.<hmac-hex>"
//   timestamp  = Date.now() (ms since epoch)
//   hmac-hex   = HMAC-SHA256(timestamp, AUTH_SECRET)
//
// The nonce is issued by GET /api/login, consumed by POST /api/login.
// It is valid for 5 minutes (configurable via NONCE_MAX_AGE_MS).
// ---------------------------------------------------------------------------

const NONCE_MAX_AGE_MS = 5 * 60 * 1000 // 5 minutes

export function generateNonce(secret: string): string {
  const ts = String(Date.now())
  const sig = createHmac("sha256", secret).update(ts).digest("hex")
  return `${ts}.${sig}`
}

export function verifyNonce(
  nonce: string | undefined,
  secret: string
): { valid: boolean; reason?: string } {
  if (!nonce) return { valid: false, reason: "Missing nonce" }

  const parts = nonce.split(".")
  if (parts.length !== 2) return { valid: false, reason: "Malformed nonce" }

  const [ts, sig] = parts
  const timestamp = Number(ts)

  if (isNaN(timestamp)) return { valid: false, reason: "Invalid nonce timestamp" }

  // Check freshness
  const age = Date.now() - timestamp
  if (age < 0 || age > NONCE_MAX_AGE_MS) {
    return { valid: false, reason: "Nonce expired or from the future" }
  }

  // Verify signature
  const expectedSig = createHmac("sha256", secret).update(ts).digest("hex")
  const sigBuf = Buffer.from(sig, "hex")
  const expBuf = Buffer.from(expectedSig, "hex")

  if (sigBuf.length !== expBuf.length) return { valid: false, reason: "Invalid nonce signature" }

  const match = timingSafeEqual(sigBuf, expBuf)
  if (!match) return { valid: false, reason: "Invalid nonce signature" }

  return { valid: true }
}

// ---------------------------------------------------------------------------
// Session-cookie guard
// Used by /participant — verifies the caller has a valid browser session OR
// is using the admin key.
// ---------------------------------------------------------------------------

export function requireSessionOrAdminKey(
  headers: Headers,
  requestedIdentifier: string | null
): Response | null {
  // Admin key takes priority
  const adminCheck = requireAdminKey(headers)
  if (adminCheck === null) return null // admin key valid

  // Check for session cookies
  const cookieHeader = headers.get("cookie") || ""
  const cookies = parseCookies(cookieHeader)

  const sessionRaw =
    cookies["hogwarts_session"] ||
    cookies["hogwarts_user"] ||
    cookies["currentUser"] ||
    cookies["session"]

  if (!sessionRaw) {
    return new Response(
      JSON.stringify({ success: false, error: "Unauthorized: Session required" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    )
  }

  // Optionally verify the session matches the requested resource
  if (requestedIdentifier) {
    try {
      const session = JSON.parse(decodeURIComponent(sessionRaw))
      // Support both new schema (mail) and legacy (email) session shapes
      const sessionMail: string = session?.mail || session?.email || ""
      const sessionToken: string = session?.token || ""

      const match =
        sessionMail.toLowerCase() === requestedIdentifier.toLowerCase() ||
        sessionToken === requestedIdentifier

      if (!match) {
        return new Response(
          JSON.stringify({ success: false, error: "Forbidden: Session does not match requested resource" }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        )
      }
    } catch {
      // If session is malformed, deny access
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized: Malformed session" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      )
    }
  }

  return null // session valid
}

// ---------------------------------------------------------------------------
// Admin session guard
// Used by /admin-login/check and POST /scan — verifies the admin_session
// cookie set by POST /api/admin-login.
// Cookie format: "<timestamp>.<hmac-hex>" signed with AUTH + "admin." prefix.
// ---------------------------------------------------------------------------

export function verifyAdminSession(headers: Headers): Response | null {
  const secret = process.env.AUTH
  if (!secret) {
    return new Response(
      JSON.stringify({ success: false, error: "Server misconfiguration: AUTH secret not set" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }

  const cookieHeader = headers.get("cookie") || ""
  const cookies = parseCookies(cookieHeader)
  const sessionToken = cookies["admin_session"]

  if (!sessionToken) {
    return new Response(
      JSON.stringify({ success: false, error: "Unauthorized: Admin session required" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    )
  }

  const parts = sessionToken.split(".")
  if (parts.length !== 2) {
    return new Response(
      JSON.stringify({ success: false, error: "Unauthorized: Malformed admin session" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    )
  }

  const [ts, sig] = parts
  const timestamp = Number(ts)

  if (isNaN(timestamp)) {
    return new Response(
      JSON.stringify({ success: false, error: "Unauthorized: Invalid session timestamp" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    )
  }

  const age = Date.now() - timestamp
  if (age < 0 || age > ADMIN_SESSION_MAX_AGE_MS) {
    return new Response(
      JSON.stringify({ success: false, error: "Unauthorized: Admin session expired" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    )
  }

  const expectedSig = createHmac("sha256", secret).update(`admin.${ts}`).digest("hex")
  const sigBuf = Buffer.from(sig, "hex")
  const expBuf = Buffer.from(expectedSig, "hex")

  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
    return new Response(
      JSON.stringify({ success: false, error: "Forbidden: Invalid admin session signature" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    )
  }

  return null // session is valid
}

function parseCookies(cookieHeader: string): Record<string, string> {
  return cookieHeader.split(";").reduce<Record<string, string>>((acc, part) => {
    const [key, ...rest] = part.trim().split("=")
    if (key) acc[key.trim()] = rest.join("=").trim()
    return acc
  }, {})
}

// ---------------------------------------------------------------------------
// Register-key guard
// Used by /checkin (GET + POST) — registrar scanner endpoint.
// The key lives in process.env.NEXT_PUBLIC_REGISTER_KEY and is sent via the
// X-Register-Key header.
// ---------------------------------------------------------------------------

export function requireRegisterKey(headers: Headers): Response | null {
  const key = headers.get("x-register-key")
  const expected = process.env.NEXT_PUBLIC_REGISTER_KEY

  if (!expected) {
    return new Response(
      JSON.stringify({ success: false, error: "Server misconfiguration: REGISTER_KEY secret not set" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }

  if (!key) {
    return new Response(
      JSON.stringify({ success: false, error: "Unauthorized: X-Register-Key header required" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    )
  }

  const keyBuf = Buffer.from(key)
  const expBuf = Buffer.from(expected)
  const match =
    keyBuf.length === expBuf.length &&
    timingSafeEqual(keyBuf, expBuf)

  if (!match) {
    return new Response(
      JSON.stringify({ success: false, error: "Forbidden: Invalid register key" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    )
  }

  return null
}

// ---------------------------------------------------------------------------
// Register session guard
// Used by /register-login/check and POST /checkin — verifies the
// register_session cookie set by POST /api/register-login.
// Cookie format: "<timestamp>.<hmac-hex>" signed with AUTH + "register." prefix.
// ---------------------------------------------------------------------------

export function verifyRegisterSession(headers: Headers): Response | null {
  const secret = process.env.AUTH
  if (!secret) {
    return new Response(
      JSON.stringify({ success: false, error: "Server misconfiguration: AUTH secret not set" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }

  const cookieHeader = headers.get("cookie") || ""
  const cookies = parseCookies(cookieHeader)
  const sessionToken = cookies["register_session"]

  if (!sessionToken) {
    return new Response(
      JSON.stringify({ success: false, error: "Unauthorized: Register session required" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    )
  }

  const parts = sessionToken.split(".")
  if (parts.length !== 2) {
    return new Response(
      JSON.stringify({ success: false, error: "Unauthorized: Malformed register session" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    )
  }

  const [ts, sig] = parts
  const timestamp = Number(ts)

  if (isNaN(timestamp)) {
    return new Response(
      JSON.stringify({ success: false, error: "Unauthorized: Invalid session timestamp" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    )
  }

  const age = Date.now() - timestamp
  if (age < 0 || age > ADMIN_SESSION_MAX_AGE_MS) {
    return new Response(
      JSON.stringify({ success: false, error: "Unauthorized: Register session expired" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    )
  }

  const expectedSig = createHmac("sha256", secret).update(`register.${ts}`).digest("hex")
  const sigBuf = Buffer.from(sig, "hex")
  const expBuf = Buffer.from(expectedSig, "hex")

  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
    return new Response(
      JSON.stringify({ success: false, error: "Forbidden: Invalid register session signature" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    )
  }

  return null
}
