const express = require("express");
const router = express.Router();
const subscriptionDTO = require("../dto/subscriptionDto");
const Subscription = require("../models/subscription");
const { Clients } = require("../models/client");
const UserSubscription = require("../models/userSubscription");

const UserSubscriptionStatusEnum = {
  NOTSTARTED: "NOTSTARTED",
  ACTIVE: "ACTIVE",
  EXPIRED: "EXPIRED",
  CANCELED: "CANCELED",
};

const PaymentStatusEnum = {
  SUCCESS: "SUCCESS",
  PENDING: "PENDING",
  CANCELED: "CANCELED",
};

// Create subscription package
router.post("/", async (req, res) => {
  try {
    const { error, value } = subscriptionDTO.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const pricing = value.pricing.map((pricingItem) => ({
      duration: pricingItem.duration,
      price: pricingItem.price,
    }));

    const newSubscription = await Subscription.create({
      name: value.name,
      description: value.description,
      price: value.price,
      pricing: pricing,
      features: value.features,
    });

    res.status(201).json({
      message: "Subscription package created successfully",
      subscription: newSubscription,
    });
  } catch (error) {
    console.error(error.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Fetch all subscription packages
router.get("/", async (req, res) => {
  try {
    const subscriptions = await Subscription.find();
    res.status(200).json({
      message: "Subscriptions retrieved successfully",
      subscriptions: subscriptions,
    });
  } catch (error) {
    console.error(error.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get subscription package by ID
router.get("/:id", async (req, res) => {
  try {
    const subscriptionId = req.params.id;
    const subscription = await Subscription.findById(subscriptionId);

    if (!subscription) {
      return res.status(404).json({
        message: "Subscription not found",
      });
    }

    res.status(200).json({
      message: "Subscription retrieved successfully",
      subscription: subscription,
    });
  } catch (error) {
    console.error(error.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Subscribe to a package
router.post("/subscribe", async (req, res) => {
  try {
    const { userId, packageId, duration, paymentDetails } = req.body;

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + duration);

    if (![1, 12].includes(duration)) {
      throw new Error("Invalid package duration");
    }

    const status = UserSubscriptionStatusEnum.ACTIVE;
    const paymentStatus = PaymentStatusEnum.SUCCESS;

    const userSubscription = new UserSubscription({
      userId,
      packageId,
      startDate,
      endDate,
      status,
      paymentDetails: {
        ...paymentDetails,
        paymentStatus: paymentStatus,
      },
    });

    const savedUserSubscription = await userSubscription.save();

    if (savedUserSubscription) {
      await Clients.findOneAndUpdate(
        { _id: userId },
        { $set: { role: "premium" } },
        { new: true }
      );
    }

    res.status(201).json({ message: "Subscription successful" });
  } catch (error) {
    console.error(error.stack);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/user/:userId/subscriptions", async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Find user subscriptions by user ID
    const userSubscriptions = await UserSubscription.find({ userId }).populate('packageId');

    if (!userSubscriptions || userSubscriptions.length === 0) {
      return res.status(404).json({
        message: "User subscriptions not found",
      });
    }

    res.status(200).json({
      message: "User subscriptions retrieved successfully",
      userSubscriptions: userSubscriptions,
    });
  } catch (error) {
    console.error(error.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


module.exports = router;
