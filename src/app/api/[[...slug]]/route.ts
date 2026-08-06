import { connect } from '@/dbConfig/dbConfig'
import Team from '@/models/participant'
import Elysia from 'elysia'
import seedData from "@/data/team.json"
import participantSeedData from "@/data/values.json"
import { requireAdminKey, generateNonce, verifyNonce, requireSessionOrAdminKey, verifyAdminSession, requireRegisterKey, verifyRegisterSession } from '@/lib/apiAuth'

// ---------------------------------------------------------------------------
// GET routes — handled by Elysia (no body parsing needed)
// ---------------------------------------------------------------------------

const AVATAR_MAP: Record<number, string> = {
    1: "/profiles_char/harry.png",
    2: "/profiles_char/hermoine.png",
    3: "/profiles_char/ron.png",
    4: "/profiles_char/sirius.png",
    5: "/profiles_char/snape.png",
    6: "/profiles_char/voldemort.png",
}

// ---------------------------------------------------------------------------
// Helper: find a team document and the specific member sub-document
// by the member's mail address or token.
// ---------------------------------------------------------------------------

async function findMemberByMail(mail: string) {
    const teamDoc = await Team.findOne({ "team.mail": mail.trim().toLowerCase() })
    if (!teamDoc) return null
    const member = teamDoc.team.find((m: any) => m.mail === mail.trim().toLowerCase())
    return member ? { teamDoc, member } : null
}

async function findMemberByToken(token: string) {
    const teamDoc = await Team.findOne({ "team.token": token.trim() })
    if (!teamDoc) return null
    const member = teamDoc.team.find((m: any) => m.token === token.trim())
    return member ? { teamDoc, member } : null
}

// Serialize a member sub-document into the shape used by all API responses.
// Includes the parent team's name and domain.
function serializeMember(teamName: string, domain: string, member: any) {
    return {
        name: member.name,
        teamName,
        domain,
        mail: member.mail,
        token: member.token,
        position: member.position,
        counter: member.counter,
        avatar: member.avatar || "",
        checkedIn: member.checkedIn ?? false,
        checkedInAt: member.checkedInAt ?? null
    }
}

const app = new Elysia({ prefix: '/api' })
    // GET /api/scan — admin-key protected: seeds DB + returns all teams/members
    .get("/scan", async ({ request, set }: any) => {
        const authErr = requireAdminKey(request.headers)
        if (authErr) {
            set.status = authErr.status
            return authErr.json()
        }
        try {
            await connect()

            const combinedTeams = [
                ...((participantSeedData as any).teams || []),
                ...((seedData as any).teams || [])
            ]

            // Seed or update teams from both values.json and team.json
            for (const teamEntry of combinedTeams) {
                const teamMembers = teamEntry.team.map((m: any) => ({
                    name: m.name,
                    mail: m.mail.trim().toLowerCase(),
                    password: m.password,
                    token: m.token,
                    position: m.position,
                    counter: m.counter ?? 0,
                    avatar: m.avatar || ""
                }))

                await Team.findOneAndUpdate(
                    { name: teamEntry.name },
                    {
                        name: teamEntry.name,
                        domain: teamEntry.domain || "Unknown",
                        team: teamMembers
                    },
                    { upsert: true }
                )
            }

            const allTeams = await Team.find({})
            // Flatten all members for the roster view
            const participants = allTeams.flatMap((t: any) =>
                t.team.map((m: any) => serializeMember(t.name, t.domain || "Unknown", m))
            )
            return { participants }
        } catch (error: any) {
            console.log("[API] Error connecting to the database", error)
            set.status = 500
            return { error: error.message || "Failed to connect to the database" }
        }
    })
    // GET /api/login — issues a fresh HMAC nonce to the browser login page
    .get("/login", async ({ set }: any) => {
        const secret = process.env.AUTH
        if (!secret) {
            set.status = 500
            return { success: false, error: "Server misconfiguration" }
        }
        return { nonce: generateNonce(secret) }
    })
    // GET /api/admin-login — issues a fresh nonce for the admin login page
    .get("/admin-login", async ({ set }: any) => {
        const secret = process.env.AUTH
        if (!secret) {
            set.status = 500
            return { success: false, error: "Server misconfiguration" }
        }
        return { nonce: generateNonce(secret) }
    })
    // GET /api/admin-login/check — validates the admin_session cookie
    .get("/admin-login/check", async ({ request, set }: any) => {
        const err = verifyAdminSession(request.headers)
        if (err) {
            set.status = err.status
            return err.json()
        }
        return { success: true }
    })
    // GET /api/participant — session or admin-key protected member lookup
    .get("/participant", async ({ request, query, set }: any) => {
        const mail = query?.mail as string | undefined
        const token = query?.token as string | undefined
        const identifier = mail || token || null

        const authErr = requireSessionOrAdminKey(request.headers, identifier)
        if (authErr) {
            set.status = authErr.status
            return authErr.json()
        }
        try {
            await connect()
            if (!mail && !token) {
                set.status = 400
                return { success: false, error: "Mail or token query param required" }
            }

            const result = mail
                ? await findMemberByMail(mail)
                : await findMemberByToken(token!)

            if (!result) {
                set.status = 404
                return { success: false, error: "Participant not found" }
            }

            return {
                success: true,
                participant: serializeMember(result.teamDoc.name, result.teamDoc.domain || "Unknown", result.member)
            }
        } catch (error: any) {
            set.status = 500
            return { success: false, error: error.message || "Failed to fetch participant" }
        }
    })
    // GET /api/register-login — issues a fresh nonce for the registrar login page
    .get("/register-login", async ({ set }: any) => {
        const secret = process.env.AUTH
        if (!secret) {
            set.status = 500
            return { success: false, error: "Server misconfiguration" }
        }
        return { nonce: generateNonce(secret) }
    })
    // GET /api/register-login/check — validates the register_session cookie
    .get("/register-login/check", async ({ request, set }: any) => {
        const err = verifyRegisterSession(request.headers)
        if (err) {
            set.status = err.status
            return err.json()
        }
        return { success: true }
    })
    // GET /api/checkin — register-key protected: returns all participants with check-in status
    .get("/checkin", async ({ request, set }: any) => {
        const authErr = requireRegisterKey(request.headers)
        if (authErr) {
            set.status = authErr.status
            return authErr.json()
        }
        try {
            await connect()
            const allTeams = await Team.find({})
            const participants = allTeams.flatMap((t: any) =>
                t.team.map((m: any) => serializeMember(t.name, t.domain || "Unknown", m))
            )
            return { participants }
        } catch (error: any) {
            set.status = 500
            return { error: error.message || "Failed to fetch participants" }
        }
    })

export const GET = app.fetch

// ---------------------------------------------------------------------------
// POST routes — handled natively (Elysia consumes the body stream internally,
// making request.json() fail in Elysia handlers; native handlers have no issue)
// ---------------------------------------------------------------------------

function json(data: unknown, status = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: { "Content-Type": "application/json" },
    })
}

async function handleScanPost(request: Request): Promise<Response> {
    // Admin scanner — requires both a valid admin_session cookie AND the X-Admin-Key header
    const sessionErr = verifyAdminSession(request.headers)
    if (sessionErr) return sessionErr

    const authErr = requireAdminKey(request.headers)
    if (authErr) return authErr

    let body: { token?: string; digit?: number }
    try {
        body = await request.json()
    } catch {
        return json({ success: false, error: "Invalid JSON body" }, 400)
    }

    const { token, digit } = body

    if (!token || digit === undefined) {
        return json({ success: false, error: "Missing token or digit" }, 400)
    }

    try {
        await connect()
        const result = await findMemberByToken(token)
        if (!result) {
            return json({ success: false, error: "Participant not found in Hogwarts registry" }, 404)
        }

        const { teamDoc, member } = result
        const targetDigit = Number(digit)

        if (member.counter >= targetDigit) {
            return json({
                success: false,
                status: 'already_scanned',
                message: `${member.name} has already claimed food up to Counter ${member.counter}`,
                participant: serializeMember(teamDoc.name, teamDoc.domain || "Unknown", member)
            })
        }

        member.counter = targetDigit
        await teamDoc.save()

        return json({
            success: true,
            status: 'ok',
            message: `Food ration approved for ${member.name} at Counter ${targetDigit}!`,
            participant: serializeMember(teamDoc.name, teamDoc.domain || "Unknown", member)
        })
    } catch (error: any) {
        console.error("[API] Error processing scan:", error)
        return json({ success: false, error: error.message || "Failed to process scan" }, 500)
    }
}

async function handleLoginPost(request: Request): Promise<Response> {
    const secret = process.env.AUTH
    if (!secret) {
        return json({ success: false, error: "Server misconfiguration" }, 500)
    }

    let body: { mail?: string; pass?: string; _nonce?: string }
    try {
        body = await request.json()
    } catch {
        return json({ success: false, error: "Invalid JSON body" }, 400)
    }

    const { mail, pass, _nonce } = body

    // Verify nonce — ensures the request originated from our login page
    const nonceCheck = verifyNonce(_nonce, secret)
    if (!nonceCheck.valid) {
        console.warn("[API/login] Nonce check failed:", nonceCheck.reason)
        return json({
            success: false,
            error: "Forbidden: Invalid or expired request token. Please refresh the page and try again."
        }, 403)
    }

    if (!pass || !mail) {
        return json({ success: false, error: "Missing mail or password" }, 400)
    }

    try {
        await connect()
        const result = await findMemberByMail(mail)

        if (!result) {
            return json({
                success: false,
                status: "not_found",
                error: "No participant found with this email in the Marauder's Map"
            }, 404)
        }

        const { teamDoc, member } = result

        if (pass !== member.password) {
            return json({
                success: false,
                status: "invalid_password",
                error: "Invalid magical passphrase"
            }, 401)
        }

        if (!member.avatar) {
            const randomDigit = Math.floor(Math.random() * 6) + 1
            member.avatar = AVATAR_MAP[randomDigit] || AVATAR_MAP[1]
            await teamDoc.save()
        }

        return json({
            success: true,
            status: "ok",
            message: "Authentication successful! Welcome to the Great Hall.",
            participant: serializeMember(teamDoc.name, teamDoc.domain || "Unknown", member)
        })
    } catch (error: any) {
        console.log("Error connecting to DB:", error)
        return json({ success: false, error: error.message || "Failed to authenticate" }, 500)
    }
}

async function handleAdminLoginPost(request: Request): Promise<Response> {
    const secret = process.env.AUTH
    const adminPass = process.env.ADMIN_PASS
    const ADMIN_USERNAME = "Sammy K."

    if (!secret || !adminPass) {
        return json({ success: false, error: "Server misconfiguration" }, 500)
    }

    let body: { username?: string; password?: string; _nonce?: string }
    try {
        body = await request.json()
    } catch {
        return json({ success: false, error: "Invalid JSON body" }, 400)
    }

    const { username, password, _nonce } = body

    // Verify nonce — prevents direct API abuse
    const nonceCheck = verifyNonce(_nonce, secret)
    if (!nonceCheck.valid) {
        console.warn("[API/admin-login] Nonce check failed:", nonceCheck.reason)
        return json({
            success: false,
            error: "Forbidden: Invalid or expired request token. Please refresh the page and try again."
        }, 403)
    }

    if (!username || !password) {
        return json({ success: false, error: "Missing username or password" }, 400)
    }

    if (username !== ADMIN_USERNAME) {
        return json({ success: false, error: "Invalid credentials" }, 401)
    }

    if (password !== adminPass) {
        return json({ success: false, error: "Invalid credentials" }, 401)
    }

    // Issue a signed admin session token (same HMAC nonce pattern, long-lived: 8 hours)
    const { createHmac } = await import("crypto")
    const ts = String(Date.now())
    const sig = createHmac("sha256", secret).update(`admin.${ts}`).digest("hex")
    const sessionToken = `${ts}.${sig}`

    const response = json({
        success: true,
        message: "Admin authentication successful."
    })

    // Set HttpOnly cookie so JS cannot read it (extra security layer)
    const headers = new Headers(response.headers)
    headers.set(
        "Set-Cookie",
        `admin_session=${sessionToken}; Path=/; Max-Age=${8 * 60 * 60}; HttpOnly; SameSite=Strict`
    )

    return new Response(response.body, { status: 200, headers })
}

async function handleRegisterLoginPost(request: Request): Promise<Response> {
    const secret = process.env.AUTH
    const registerPass = process.env.REGISTER_PASS
    const REGISTER_USERNAME = "Registrar"

    if (!secret || !registerPass) {
        return json({ success: false, error: "Server misconfiguration" }, 500)
    }

    let body: { username?: string; password?: string; _nonce?: string }
    try {
        body = await request.json()
    } catch {
        return json({ success: false, error: "Invalid JSON body" }, 400)
    }

    const { username, password, _nonce } = body

    const nonceCheck = verifyNonce(_nonce, secret)
    if (!nonceCheck.valid) {
        console.warn("[API/register-login] Nonce check failed:", nonceCheck.reason)
        return json({
            success: false,
            error: "Forbidden: Invalid or expired request token. Please refresh the page and try again."
        }, 403)
    }

    if (!username || !password) {
        return json({ success: false, error: "Missing username or password" }, 400)
    }

    if (username !== REGISTER_USERNAME) {
        return json({ success: false, error: "Invalid credentials" }, 401)
    }

    if (password !== registerPass) {
        return json({ success: false, error: "Invalid credentials" }, 401)
    }

    const { createHmac } = await import("crypto")
    const ts = String(Date.now())
    const sig = createHmac("sha256", secret).update(`register.${ts}`).digest("hex")
    const sessionToken = `${ts}.${sig}`

    const response = json({ success: true, message: "Registrar authentication successful." })
    const headers = new Headers(response.headers)
    headers.set(
        "Set-Cookie",
        `register_session=${sessionToken}; Path=/; Max-Age=${8 * 60 * 60}; HttpOnly; SameSite=Strict`
    )

    return new Response(response.body, { status: 200, headers })
}

async function handleCheckinPost(request: Request): Promise<Response> {
    const sessionErr = verifyRegisterSession(request.headers)
    if (sessionErr) return sessionErr

    const authErr = requireRegisterKey(request.headers)
    if (authErr) return authErr

    let body: { token?: string }
    try {
        body = await request.json()
    } catch {
        return json({ success: false, error: "Invalid JSON body" }, 400)
    }

    const { token } = body
    if (!token) {
        return json({ success: false, error: "Missing token" }, 400)
    }

    try {
        await connect()
        const result = await findMemberByToken(token)
        if (!result) {
            return json({ success: false, error: "Participant not found in registry" }, 404)
        }

        const { teamDoc, member } = result

        if (member.checkedIn) {
            return json({
                success: false,
                status: 'already_checked_in',
                message: `${member.name} was already checked in at ${new Date(member.checkedInAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })}`,
                participant: serializeMember(teamDoc.name, teamDoc.domain || "Unknown", member)
            })
        }

        member.checkedIn = true
        member.checkedInAt = new Date()
        await teamDoc.save()

        return json({
            success: true,
            status: 'ok',
            message: `${member.name} checked in successfully!`,
            participant: serializeMember(teamDoc.name, teamDoc.domain || "Unknown", member)
        })
    } catch (error: any) {
        console.error("[API] Error processing check-in:", error)
        return json({ success: false, error: error.message || "Failed to process check-in" }, 500)
    }
}

// Route POST requests manually — no Elysia involvement
export async function POST(request: Request): Promise<Response> {
    const url = new URL(request.url)
    const pathname = url.pathname

    if (pathname === '/api/scan') return handleScanPost(request)
    if (pathname === '/api/login') return handleLoginPost(request)
    if (pathname === '/api/admin-login') return handleAdminLoginPost(request)
    if (pathname === '/api/register-login') return handleRegisterLoginPost(request)
    if (pathname === '/api/checkin') return handleCheckinPost(request)

    return json({ error: "Not found" }, 404)
}

export type App = typeof app