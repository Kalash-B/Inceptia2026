import mongoose from 'mongoose'

const teamMemberSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        default: 'Unknown'
    },
    mail: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        default: 'trial'
    },
    token: {
        type: String,
        default: ''
    },
    position: {
        type: String,
        enum: ['Lead', 'Member'],
        required: true
    },
    counter: {
        type: Number,
        default: 0
    },
    avatar: {
        type: String,
        default: ''
    },
    checkedIn: {
        type: Boolean,
        default: false
    },
    checkedInAt: {
        type: Date,
        default: null
    }
})

const teamSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            default: 'Unknown'
        },
        domain: {
            type: String,
            required: true,
            default: "Unknown"
        },
        team: {
            type: [teamMemberSchema],
            default: []
        }
    },
    { timestamps: true }
)

const Team = mongoose.models.teams || mongoose.model('teams', teamSchema)

export default Team