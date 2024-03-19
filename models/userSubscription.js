const mongoose = require("mongoose");

const paymentDetailsSchema = new mongoose.Schema({
  paymentMethod: {
    type: String,
    required: true,
  },
  referenceId: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['SUCCESS', 'PENDING', 'CANCELED'],
    required: true,
  },
});

const userSubscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['NOTSTARTED', 'ACTIVE', 'EXPIRED', 'CANCELED'],
      required: true,
    },
    paymentDetails: paymentDetailsSchema,
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserSubscription", userSubscriptionSchema);
