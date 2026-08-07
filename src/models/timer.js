import mongoose from 'mongoose'

const timerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      default: 'main_24h_timer'
    },
    startTime: {
      type: Date,
      default: null
    },
    endTime: {
      type: Date,
      default: null
    },
    durationMs: {
      type: Number,
      default: 24 * 60 * 60 * 1000 // 24 Hours in milliseconds
    },
    isRunning: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
)

const Timer = mongoose.models.timers || mongoose.model('timers', timerSchema)

export default Timer
