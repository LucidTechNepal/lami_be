const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
    },
    sender: {
      type: String,
    },
    receiver: {
      type: String
    },
    text: {
      type: String,
    },
    seen: {
      type: Boolean,
      default:false
    },
    seenAt: {
      type: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", MessageSchema);