import { connect } from '@/dbConfig/dbConfig'
import Participant from '@/models/participant'
import Elysia from 'elysia'
import seedData from "@/data/values.json"

const scan = new Elysia({ prefix: "/scan" })
    .get("/", async ({ set }: any) => {
        try {
            await connect()
            
            for (const item of (seedData as any).participants) {
                const exists = await Participant.findOne({ sellerId: `seed-${item.productId}` })
                if (!exists) {
                    await Participant.create({
                        name: item.name,
                        team: item.team,
                        counter: item.counter,
                        token: item.token
                    })
                }
            }

            const all = (await Participant.find({}))
            return { participats: all }


        } catch (error: any) {
            console.log("[API] Error connecting to the database")
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
                return { success: false, error: "Participant not found" }
            }

            const targetDigit = Number(digit)
            if (participant.counter === targetDigit) {
                return {
                    success: false,
                    status: 'already_scanned',
                    message: `Participant has already scanned`,
                    participant
                }
            }

            participant.counter = targetDigit
            await participant.save()

            return {
                success: true,
                status: 'ok',
                message: `SUCCESS!`,
                participant
            }
        } catch (error: any) {
            console.error("[API] Error processing scan:", error)
            set.status = 500
            return { success: false, error: error.message || "Failed to process scan" }
        }
    })


const app = new Elysia({ prefix: '/api' })
    .use(scan)

export const GET = app.fetch
export const POST = app.fetch

export type App = typeof app