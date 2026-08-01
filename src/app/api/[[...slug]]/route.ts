import { connect } from '@/dbConfig/dbConfig'
import Team from '@/models/participant'
import Elysia from 'elysia'
import seedData from "@/data/values.json"
import { requireAdminKey, generateNonce, verifyNonce, requireSessionOrAdminKey } from '@/lib/apiAuth'

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

// Serialize a member sub-document into the shape used by all API responses
function serializeMember(teamName: string, member: any) {
    return {
        name: member.name,
        teamName,
        mail: member.mail,
        token: member.token,
        position: member.position,
        counter: member.counter,
        avatar: member.avatar || ""
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

            // Seed teams from values.json if they don't exist yet
            for (const teamEntry of (seedData as any).teams) {
                const exists = await Team.findOne({ name: teamEntry.name })
                if (!exists) {
                    await Team.create({
                        name: teamEntry.name,
                        team: teamEntry.team.map((m: any) => ({
                            name: m.name,
                            mail: m.mail.trim().toLowerCase(),
                            password: m.password,
                            token: m.token,
                            position: m.position,
                            counter: m.counter ?? 0,
                            avatar: m.avatar || ""
                        }))
                    })
                }
            }

            const allTeams = await Team.find({})
            // Flatten all members for the roster view
            const participants = allTeams.flatMap((t: any) =>
                t.team.map((m: any) => serializeMember(t.name, m))
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
                participant: serializeMember(result.teamDoc.name, result.member)
            }
        } catch (error: any) {
            set.status = 500
            return { success: false, error: error.message || "Failed to fetch participant" }
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
    // Admin scanner — admin key required
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
                participant: serializeMember(teamDoc.name, member)
            })
        }

        member.counter = targetDigit
        await teamDoc.save()

        return json({
            success: true,
            status: 'ok',
            message: `Food ration approved for ${member.name} at Counter ${targetDigit}!`,
            participant: serializeMember(teamDoc.name, member)
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
            participant: serializeMember(teamDoc.name, member)
        })
    } catch (error: any) {
        console.log("Error connecting to DB:", error)
        return json({ success: false, error: error.message || "Failed to authenticate" }, 500)
    }
}

// Route POST requests manually — no Elysia involvement
export async function POST(request: Request): Promise<Response> {
    const url = new URL(request.url)
    const pathname = url.pathname

    if (pathname === '/api/scan') return handleScanPost(request)
    if (pathname === '/api/login') return handleLoginPost(request)

    return json({ error: "Not found" }, 404)
}

export type App = typeof app