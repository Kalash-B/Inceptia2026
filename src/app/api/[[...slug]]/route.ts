import { connect } from '@/dbConfig/dbConfig'
import Participant from '@/models/participant'
import Elysia from 'elysia'
import seedData from "@/data/values.json"

const scan = new Elysia({ prefix: "/scan" })
    .get("/", async ({ set }: any) => {
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
    .post("/", async ({ body, set }: any) => {
        try {
            await connect()
            const { token, digit } = body as { token: string, digit: number }

            if (!token || digit === undefined) {
                set.status = 400
                return { success: false, error: "Missing token or digit" }
            }

            const participant = await Participant.findOne({ token })
            if (!participant) {
                set.status = 404
                return { success: false, error: "Participant not found in Hogwarts registry" }
            }

            const targetDigit = Number(digit)
            if (participant.counter >= targetDigit) {
                return {
                    success: false,
                    status: 'already_scanned',
                    message: `${participant.name} has already claimed food up to Counter ${participant.counter}`,
                    participant
                }
            }

            participant.counter = targetDigit
            await participant.save()

            return {
                success: true,
                status: 'ok',
                message: `Food ration approved for ${participant.name} at Counter ${targetDigit}!`,
                participant
            }
        } catch (error: any) {
            console.error("[API] Error processing scan:", error)
            set.status = 500
            return { success: false, error: error.message || "Failed to process scan" }
        }
    })

const AVATAR_MAP: Record<number, string> = {
  1: "/profiles_char/harry.png",
  2: "/profiles_char/hermoine.png",
  3: "/profiles_char/ron.png",
  4: "/profiles_char/sirius.png",
  5: "/profiles_char/snape.png",
  6: "/profiles_char/voldemort.png",
}

const login = new Elysia({ prefix: "/login" })
    .post("/", async ({ body, set }: any) => {
        try {
            await connect()

            const { email, pass } = body as { email: string, pass: string }

            if (!pass || !email) {
                set.status = 400
                return { success: false, error: "Missing email or password" }
            }

            const participant = await Participant.findOne({ email: email.trim().toLowerCase() })
            
            if (!participant) {
                set.status = 404
                return {
                    success: false,
                    status: "not_found",
                    error: "No participant found with this email in the Marauder's Map"
                }
            }

            if (pass !== participant.password) {
                set.status = 401
                return {
                    success: false,
                    status: "invalid_password",
                    error: "Invalid magical passphrase"
                }
            }

            // Assign random avatar (1 to 6) if not already set
            if (!participant.avatar) {
                const randomDigit = Math.floor(Math.random() * 6) + 1;
                participant.avatar = AVATAR_MAP[randomDigit] || AVATAR_MAP[1];
                await participant.save();
            }

            return {
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
            }
        } catch (error: any) {
            console.log("Error connecting to DB:", error)
            set.status = 500
            return { success: false, error: error.message || "Failed to authenticate" }
        }
    })

const participantRoute = new Elysia({ prefix: "/participant" })
    .get("/", async ({ query, set }: any) => {
        try {
            await connect()
            const email = query?.email as string
            const token = query?.token as string

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

const app = new Elysia({ prefix: '/api' })
    .use(scan)
    .use(login)
    .use(participantRoute)

export const GET = app.fetch
export const POST = app.fetch

export type App = typeof app