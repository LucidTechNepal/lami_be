const router = require("express").Router();
const subscriptionDTO = require("../dto/subscriptionDto");
const Subscription = require("../models/subscription");
const UserSubscription = require("../models/userSubscription");

const UserSubscriptionStatus = {
  NOTSTARTED: 'NOTSTARTED',
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  CANCELED: 'CANCELED',
};

const PaymentStatus = {
  SUCCESS: 'SUCCESS',
  PENDING: 'PENDING',
  CANCELED: 'CANCELED',
};


router.post("/", async (req, res) => {
  const { error, value } = subscriptionDTO.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const pricing = value.duration.map((duration) => {
      let calculatedPrice;
      if (duration === 1) {
        calculatedPrice = value.price;
      } else if (duration === 12) {
        calculatedPrice = duration * value.price;
      } 

      return {
        duration: duration,
        price: calculatedPrice,
      };
    })
    console.log(pricing,"pricing")
    const newSubscription = Subscription.create({
      name: value.name,
      description: value.description,
      price: value.price,
      duration: value.duration,
      pricing: pricing,
      features: value.features,
    });
    res.status(201).json({
      message: "Subscription package created successfully",
      subscription: newSubscription,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// fetch all package

router.get("/", async (req, res) => {
  try {
    const subscriptions = await Subscription.find();
    res.status(200).json({
      message: "Subscriptions retrieved successfully",
      subscriptions: subscriptions,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// get package by id
router.get("/:id", async (req, res) => {
  const subscriptionId = req.params.id;

  try {
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
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// api for subscribe
router.post("/subscribe", async (req, res) => {
  try {
    const { userId, packageId , paymentDetails, duration } =
      req.body;
    
    const startDate = new Date();
    let endDate;
    if(duration === 1) {
      endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (packageDuration === 12) {
      endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      throw new Error("Invalid package duration");
    }
    const status = UserSubscriptionStatus.ACTIVE;
    const paymentStatus = PaymentStatus.SUCCESS;


    // Create a new UserSubscription instance
    const userSubscription = new UserSubscription({
      userId,
      packageId,
      startDate,
      endDate,
      status,
      paymentDetails: {
        ...paymentDetails,
        paymentStatus: paymentStatus
      },
    });

    // Save the UserSubscription to the database
    const savedUserSubscription = await userSubscription.save();

    res.status(201).json({
      message: "Subscription successful",
      data: savedUserSubscription,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
