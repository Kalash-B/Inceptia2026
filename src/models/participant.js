import mongoose from 'mongoose'

const participantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        default: "Unknown"
    },
    team: {
        type: String,
        required: true,
        default: "Unknown"
    },
    token: {
        type: String,
        required: true
    },
    counter: {
        type: Number,
        default: 0
    }
})

const Participant = mongoose.models.participant || mongoose.model("participant", participantSchema)

export default Participant