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
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        default: "sammytried"
    },
    token: {
        type: String,
        required: true
    },
    counter: {
        type: Number,
        default: 0
    },
    avatar: {
        type: String,
        default: ""
    }
})

const Participant = mongoose.models.participant || mongoose.model("participant", participantSchema)

export default Participant