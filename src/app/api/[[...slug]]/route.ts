import { connect } from '@/dbConfig/dbConfig'
import Participant from '@/models/participant'
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

const app = new Elysia({ prefix: '/api' })
    // GET /api/scan — developer backdoor: seeds DB + returns all participants
    .get("/scan", async ({ request, set }: any) => {
        const authErr = requireAdminKey(request.headers)
        if (authErr) {
            set.status = authErr.status
            return authErr.json()
        }
        try {
            await connect()
            for (const item of (seedData as any).participants) {
                const exists = await Participant.findOne({ email: item.email })
                if (!exists) {
                    await Participant.create({
                        name: item.name,
                        team: item.team,
                        email: item.email,
                        password: item.password,
                        counter: item.counter ?? 0,
                        token: item.token,
                        avatar: item.avatar || ""
                    })
                }
            }
            const all = await Participant.find({})
            return { participants: all }
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
    // GET /api/participant — session or admin-key protected lookup
    .get("/participant", async ({ request, query, set }: any) => {
        const email = query?.email as string | undefined
        const token = query?.token as string | undefined
        const identifier = email || token || null

        const authErr = requireSessionOrAdminKey(request.headers, identifier)
        if (authErr) {
            set.status = authErr.status
            return authErr.json()
        }
        try {
            await connect()
            if (!email && !token) {
                set.status = 400
                return { success: false, error: "Email or token query param required" }
            }
            const filter = email ? { email: email.trim().toLowerCase() } : { token }
            const participant = await Participant.findOne(filter)
            if (!participant) {
                set.status = 404
                return { success: false, error: "Participant not found" }
            }
            return {
                success: true,
                participant: {
                    name: participant.name,
                    team: participant.team,
                    email: participant.email,
                    token: participant.token,
                    counter: participant.counter,
                    avatar: participant.avatar || ""
                }
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
        const participant = await Participant.findOne({ token })
        if (!participant) {
            return json({ success: false, error: "Participant not found in Hogwarts registry" }, 404)
        }

        const targetDigit = Number(digit)
        if (participant.counter >= targetDigit) {
            return json({
                success: false,
                status: 'already_scanned',
                message: `${participant.name} has already claimed food up to Counter ${participant.counter}`,
                participant
            })
        }

        participant.counter = targetDigit
        await participant.save()

        return json({
            success: true,
            status: 'ok',
            message: `Food ration approved for ${participant.name} at Counter ${targetDigit}!`,
            participant
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

    let body: { email?: string; pass?: string; _nonce?: string }
    try {
        body = await request.json()
    } catch {
        return json({ success: false, error: "Invalid JSON body" }, 400)
    }

    const { email, pass, _nonce } = body

    // Verify nonce — ensures the request originated from our login page
    const nonceCheck = verifyNonce(_nonce, secret)
    if (!nonceCheck.valid) {
        console.warn("[API/login] Nonce check failed:", nonceCheck.reason)
        return json({
            success: false,
            error: "Forbidden: Invalid or expired request token. Please refresh the page and try again."
        }, 403)
    }

    if (!pass || !email) {
        return json({ success: false, error: "Missing email or password" }, 400)
    }

    try {
        await connect()
        const participant = await Participant.findOne({ email: email.trim().toLowerCase() })

        if (!participant) {
            return json({
                success: false,
                status: "not_found",
                error: "No participant found with this email in the Marauder's Map"
            }, 404)
        }

        if (pass !== participant.password) {
            return json({
                success: false,
                status: "invalid_password",
                error: "Invalid magical passphrase"
            }, 401)
        }

        if (!participant.avatar) {
            const randomDigit = Math.floor(Math.random() * 6) + 1
            participant.avatar = AVATAR_MAP[randomDigit] || AVATAR_MAP[1]
            await participant.save()
        }

        return json({
            success: true,
            status: "ok",
            message: "Authentication successful! Welcome to the Great Hall.",
            participant: {
                name: participant.name,
                team: participant.team,
                email: participant.email,
                token: participant.token,
                counter: participant.counter,
                avatar: participant.avatar
            }
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