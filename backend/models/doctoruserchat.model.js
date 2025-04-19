const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    sender_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    sender_type: {
      type: String,
      enum: ["doctor", "user"],
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    delivery_status: {
      type: String,
      enum: ["sent", "delivered", "failed"],
      default: "sent",
    },
  },
  { timestamps: true }
);

const doctorUserChatSchema = new mongoose.Schema(
  {
    doctor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    messages: [messageSchema],
    is_active: {
      type: Boolean,
      default: true,
    },
    last_message_at: {
      type: Date,
      default: Date.now,
    },
    connection_status: {
      type: String,
      enum: ["connected", "disconnected", "idle"],
      default: "disconnected",
    },
    last_activity: {
      type: Date,
      default: Date.now,
    },
    session_timeout: {
      type: Number,
      default: 1800000, // 30 minutes in milliseconds
    },
    meetingDetails: meetingDetailsSchema,
  },
  { timestamps: true }
);

// Create a compound index for doctor_id and user_id
doctorUserChatSchema.index({ doctor_id: 1, user_id: 1 }, { unique: true });

// Add index for performance
doctorUserChatSchema.index({ last_activity: 1, connection_status: 1 });

module.exports = mongoose.model("DoctorUserChat", doctorUserChatSchema);
