const mongoose = require("mongoose");

const SubscriptionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    pricing: [
      {
        duration: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      }
    ],
    features: [{ type: String, required: true }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subscription", SubscriptionSchema);
