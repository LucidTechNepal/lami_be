const express = require("express");
const bodyParser = require("body-parser");

//Exporting the route
const client_route = express.Router();

//Importing the client Table as client
const { Clients, ConnectionRequests } = require("../models/client");

const bcrypt = require("bcryptjs");
const { upload, uploadToS3 } = require("../middlewares/imageupload");
const jwt = require("jsonwebtoken");

//Importing otp generator
const otpGenerator = require("otp-generator");
const crypto = require("crypto");
const key = "otp-secret-key";

const { verifyClient } = require("../middlewares/auth");

const axios = require("axios");
const { sendSms, verifyOtp } = require("../twilio/twilio");

// Route to retrieve user details using token authentication
client_route.get("/user/detail", verifyClient, async function (req, res) {
  try {
    const clientData = req.user;
    const client = await Clients.findOne({ _id: clientData });
    console.log(clientData);
    res.status(200).json({
      // status: 200,
      // message: "Clients fetched successfully",
      client,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 500,
      message: "Error fetching clients",
    });
  }
});

client_route.post("/createOtp", async (req, res) => {
  try {
    const sendOtp = await sendSms(req.body.phone);
    if (sendOtp) {
      res.status(200).json({ message: "Otp send to registered phone number" });
    }
  } catch (error) {
    console.error("Error generating OTP:", error);
    res.status(500).json({ error: "Failed to generate OTP" });
  }
});

client_route.post("/verifyOtp", async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const verifiedPhoneNumber = await verifyOtp(phone, otp);

    if (verifiedPhoneNumber) {
      const data = await Clients.findOne({ phone: verifiedPhoneNumber });

      if (!data) {
        return res.status(403).json({ message: "Invalid credential" });
      }

      const token = jwt.sign({ clientID: data._id }, process.env.JWT_SECRET);

      const { _id: userID, full_name, email, image } = data;

      return res.status(200).json({
        message: "Success",
        data: { token, userID, full_name, email, image },
      });
    } else {
      return res.status(403).json({ message: "Invalid OTP" });
    }
  } catch (error) {
    console.error("Error during OTP verification:", error);
    return res.status(500).json({ error: "Failed to verify OTP" });
  }
});

// client_route.post("/createOtp", async (req, res) => {
//   const { phone } = req.body;
//   if (phone) {
//     const sendOtp = await sendSms(phone);

//     res.status(200).json({ message: "OTP sent successfully"});
//   } else {
//     res.status(404).json({ message: "phone required" });
//   }
// });

// client_route.post("/verifyOtp", async (req, res) => {
//   const { phone, otp } = req.body;
//   const otpVerificationResult = await verifyOtp(phone, otp);
//   console.log(otpVerificationResult)
//   if (otpVerificationResult) {
//     Clients.findOne({ phone: otpVerificationResult })
//       .then(function (data) {
//         if (data == null) {
//           return res.status(403).json({ message: "Invalid credential" });
//         }

//         // Generate a JWT token with the user ID
//         const token = jwt.sign({ clientID: data._id }, "anysecretkey");

//         const userID = data._id;

//         // Return the token and user data as part of the response
//         return res.status(200).json({
//           message: "Success",
//           data: { token: token, userId: userID },
//         });
//       })
//       .catch((error) => {
//         console.error("Error fetching user data:", error);
//         return res.status(500).json({ error: "Failed to fetch user data" });
//       });
//   } else {
//     // If the OTP verification failed, return an error
//     return res.status(400).json({ error: "Invalid OTP" });
//   }
// });

//Route for Client Registration
/*
client_route.post('/signup',image_upload.single('image'), function (req, res){
    const full_name = req.body.full_name;
    const email = req.body.email;
    const password = req.body.password;
    const gender = req.body.gender;
    const country = req.body.country;
    const phone = req.body.phone;
    const age = req.body.age;
    const religion = req.body.religion;
    const image = req.file.filename;
    console.log(image)

    //using bcrypt module to encrypt client password

    bcrypt.hash(password, 12, function (err, hash12){
        var client_data = new Clients({
            full_name : full_name,
            email : email,
            password : hash12,
            gender : gender,
            country : country,
            phone : phone,
            age : age,
            religion : religion,
            image : image
        })
        console.log ("From client register route")

        client_data.save().then(function (){
            res.status(201).json({ message : "Client has been registered successfully"})
        }).catch(function (e){
            res.status().json({message : e})
        })
    });
})
*/

//Route for Client Registration
client_route.post("/signup", upload.single("image"), function (req, res) {
  const full_name = req.body.full_name;
  const email = req.body.email;

  const birthDate = req.body.birthDate;

  const phone = req.body.phone;
  const image = req.file.filename;
  const gender = req.body.gender;

  console.log(req);
  //using bcrypt module to encrypt client password

  var client_data = new Clients({
    full_name: full_name,
    email: email,
    gender: gender,
    phone: phone,
    image: image,
    birthDate: birthDate,
  });

  console.log("From client register route");

  client_data
    .save()
    .then(function (user) {
      const userEmail = user.email; // Retrieve the user's email from the saved user object

      // Send email to the frontend
      res.status(201).json({
        message: "Client has been registered successfully",
        email: userEmail,
      });
    })
    .catch(function (e) {
      console.log(e);
      res.status(500).json({ message: e });

      var client_data = new Clients({
        full_name: full_name,
        email: email,
        gender: gender,
        phone: phone,
        image: image,
      });

      console.log("From client register route");

      client_data
        .save()
        .then(function (user) {
          const userEmail = user.email; // Retrieve the user's email from the saved user object

          // Send email to the frontend
          res.status(201).json({
            message: "Client has been registered successfully",
            email: userEmail,
          });
        })
        .catch(function (e) {
          console.log(e);
          res.status(500).json({ message: e });
        });
    });
});

// client_route.post("/signup", function (req, res) {
//   console.log(req)
//   const full_name = req.body.full_name;
//   const email = req.body.email;
//   // const password = req.body.password;
//   const phone = req.body.phone;
//   const gender = req.body.gender;
//   const image = req.body.image;

//   var client_data = new Clients({
//     full_name: full_name,
//     email: email,
//     phone: phone,
//     gender: gender,
//     image: image,
//   });

//   console.log("From client register route");

//   client_data
//     .save()
//     .then(function (user) {
//       const userEmail = user.email; // Retrieve the user's email from the saved user object

//       // Send email to the frontend
//       res.status(201).json({
//         message: "Client has been registered successfully",
//         email: userEmail,
//       });
//       console.log("From client register sucessful");
//     })
//     .catch(function (e) {
//       console.log("No image");
//       res.status(500).json({ message: e });
//     });
// });

// commented by m
// client_route.post("/login", function (req, res) {
//   const email = req.body.email;
//   const password = req.body.password;

//   Clients.findOne({ email: email })
//     .then(function (data) {
//       if (data == null) {
//         return res.status(403).json({ message: "Invalid credential" });
//       }

//       bcrypt.compare(password, data.password, function (err, result) {
//         if (result === false) {
//           return res.status(403).json({ message: "Invalide credentials" });
//         }

//         //Token is added use the below commented code during development!!!!!
//         const token = jwt.sign({ clientID: data._id }, "anysecretkey");
//         const userID = data._id;
//         const full_name = data.full_name;
//         const email = data.email;
//         const image = data.image;

//         res.status(200).json({
//           token: token,
//           message: "Login successs!",
//           full_name: full_name,
//           email: email,
//           userID: userID,
//           image: image,
//         });
//       });
//     })
//     .catch();
// });

/*
client_route.post('/login', function (req, res) {
    const email = req.body.email
    const password = req.body.password

    Clients.findOne ({email : email})
        .then (function (data) {
            if (data == null) {
                return res.status(403).json ({ message : "Invalid credential"})
            }

            bcrypt.compare(password, data.password, function (err, result){
                if (result === false) {
                    return res.status(403).json({ message: "Invalide credentials" })
                }
                const userID = data._id
                const full_name = data.full_name
                const email = data.email
                const gender = data.gender
                const country = data.country
                const phone = data.phone
                const age = data.age
                const religion = data.religion

                res.status(200).json({message: "Login successs!", full_name: full_name, email: email, userID : userID,
                gender:gender,country : country, phone : phone, age : age, religion : religion })
            })
    })
    .catch()
})
*/

// to get all new joined suer

// client_route.get("/user/newJoin", function (req, res) {

// })

//To get all the data of users

client_route.get("/showall", verifyClient, async function (req, res) {
  const requestedUser = req.user;
  console.log(requestedUser);

  try {
    if (!requestedUser) {
      return res.status(400).json({ message: "No user found" });
    }

    const requestedUserDetails = await Clients.findOne({
      _id: requestedUser._id,
    });

    if (!requestedUserDetails) {
      return res.status(404).json({ message: "User details not found" });
    }

    const filter = {
      _id: { $ne: requestedUserDetails._id.toString() },
      gender: requestedUserDetails.gender === "male" ? "female" : "male",
    };

    const friendIds = await ConnectionRequest.find({
      $or: [
        { fromUser: requestedUserDetails._id, isFriend: true },
        { toUser: requestedUserDetails._id, isFriend: true },
      ],
    }).distinct("fromUser toUser");

    // Add friend IDs to the filter to exclude them
    filter._id.$nin = friendIds;

    const filteredClients = await Clients.find(filter);

    console.log(filteredClients);

    if (!filteredClients) {
      return res.status(404).json({ message: "User details not found" });
    }

    res.status(200).json({ success: true, data: filteredClients });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

client_route.get("/details/:id", function (req, res) {
  const id = req.params.id;
  Clients.findById({ _id: id })
    .then(function (data) {
      res.status(201).json(data);
    })
    .catch(function (e) {
      res.status(500).json({ message: e });
    });
});

client_route.put("/user/update/:id", function (req, res) {
  const id = req.params.id;
  const { full_name, email, password, gender, country, phone, age, religion } =
    req.body;
  console.log(req.body.full_name);
  Clients.findOneAndUpdate(
    { _id: id },
    {
      $set: {
        full_name,
        email,
        password,
        gender,
        country,
        phone,
        age,
        religion,
      },
    },
    { new: true }
  )

    .then(function (result) {
      res
        .status(201)
        .json({ success: true, message: "Data successfully updated" });
    })
    .catch(function (e) {
      res.status(500).json({ message: e });
    });
});

// Send connection request
client_route.post("/connection-requests", async (req, res) => {
  try {
    console.log(req.body);
    const { fromUser, toUser } = req.body;

    const existingConnection = await ConnectionRequests.findOne({
      where: { fromUser, toUser },
    });

    if (existingConnection) {
      return res.status(400).json({ error: "Connection already exists" });
    }

    const connectionRequest = await ConnectionRequests.create({
      fromUser,
      toUser,
    });
    res.status(201).json(connectionRequest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Accept connection request
client_route.put("/connection-requests/:id/accept", async (req, res) => {
  const userId = req.params.id;
  try {
    const connectionRequest = await ConnectionRequests.findByIdAndUpdate(
      userId,
      { status: "accepted", isFriend: true, updateAt: new Date() },
      { new: true }
    );
    console.log(connectionRequest);

    if (!connectionRequest) {
      return res.status(404).json({ error: "Connection request not found" });
    }

    console.log(connectionRequest);

    res.status(201).json({
      status: 201,
      message: "Connection request accepted",
      user: connectionRequest.toUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// get conenctions details

client_route.get(
  "/check-connection/:friendId",
  verifyClient,
  async (req, res) => {
    const userId = req.user;
    const friendId = req.params.friendId;

    try {
      const connection = await ConnectionRequests.findOne({
        $or: [
          {
            fromUser: friendId,
            toUser: userId,
            status: "accepted",
            isFriend: true,
          },
          {
            fromUser: userId,
            toUser: friendId,
            status: "accepted",
            isFriend: true,
          },
        ],
      }).exec();

      const isConnected = connection !== null;

      res.status(200).json({
        status: 200,
        message: "Connection request fetch",
        isConnected: isConnected,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Get all received connection requests for a user
client_route.get(
  "/received-connection-requests",
  verifyClient,
  async (req, res) => {
    try {
      const userId = req.user;
      const receivedRequests = await ConnectionRequests.find({
        toUser: userId,
        status: "pending",
        isFriend: false,
      });

      const result = await Promise.all(
        receivedRequests.map(async (request) => {
          const user = await Clients.findOne({ _id: request.fromUser });
          return {
            connectionId: request._id,
            user,
          };
        })
      );
      res.status(200).json({
        status: 200,
        message: "Connection request fetched successfully",
        result,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/*
// Delete connection request

client_route.delete("/connection-requests/:id", async (req, res) => {
  try {
    await ConnectionRequests.findByIdAndDelete(req.params.id);
    res.sendStatus(204);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});
*/

// Decline connection request
client_route.put("/connection-requests/:id/decline", async (req, res) => {
  try {
    const connectionRequest = await ConnectionRequests.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    );
    res.json(connectionRequest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

client_route.get("/user/:id", function (req, res) {
  const id = req.params.id;
  console.log(id);
  Clients.findById(id)
    .then(function (data) {
      if (!data) {
        // If no user is found with the given id
        res.status(404).json({ message: "User not found" });
      } else {
        res.status(200).json(data);
      }
    })
    .catch(function (e) {
      res.status(500).json({ message: e });
    });
});

client_route.get("/user/search", (req, res) => {
  const { lookingFor, age, location } = req.query;

  const query = {};

  if (lookingFor) {
    query.fullName = { $regex: lookingFor, $options: "i" };
  }

  if (age) {
    query.age = { $regex: age, $options: "i" };
  }

  if (location) {
    query.$or = [
      { home: { $regex: location, $options: "i" } },
      { gender: "" },
      { country: "" },
      { phone: "" },
      { religion: "" },
    ];
  }

  delete query._id;

  Clients.find(query)
    .then((searchResults) => {
      console.log("hello2");
      res.status(200).json(searchResults);
    })
    .catch((error) => {
      console.error("Failed to perform search:", error);
      res.status(500).json({ error: "Failed to perform search" });
    });
});

client_route.post("/checkPhoneNumber", async (req, res) => {
  try {
    const userPhoneNumber = req.body.phone;
    const client = await Clients.findOne({ phone: userPhoneNumber }, { timeout: 15000 }); // Increased timeout to 15 seconds

    if (client) {
      return res
        .status(200)
        .json({ message: "Phone number exists in the database", data: phone });
    } else {
      console.log("Phone number does not exist in the database");
      return res.status(404).json({
        message: "Phone number does not exist in the database",
        data: phone,
      });
    }
  } catch (error) {
    // Check for Mongoose timeout error
    if (error.name === 'MongoTimeoutError') {
      console.error("Mongoose timeout error: Phone number search timed out.");
      return res.status(500).json({
        message: "Phone number search timed out. Please try again.",
      });
    } else {
      console.error("Error while checking phone number:", error);
      res
        .status(500)
        .json({ message: "An error occurred while checking phone number" });
    }
  }
});


// fetch all connected users for particular users
client_route.get("/getConnection", verifyClient, async (req, res) => {
  try {
    const loginUserId = req.user;

    const connectedUsers = await ConnectionRequests.aggregate([
      {
        $match: {
          $or: [
            { fromUser: loginUserId._id, status: "accepted", isFriend: true },
            { toUser: loginUserId._id, status: "accepted", isFriend: true },
          ],
        },
      },
      {
        $project: {
          _id: 0,
          otherUserId: {
            $cond: {
              if: { $eq: ["$fromUser", loginUserId._id] },
              then: "$toUser",
              else: "$fromUser",
            },
          },
          acceptedDate: 1,
          isFriend: 1,
        },
      },
    ]);

    const userIds = connectedUsers.map((user) => user.otherUserId);
    const otherUserData = await Clients.find({ _id: { $in: userIds } });

    const results = connectedUsers.map((request) => {
      const otherUser = otherUserData.find((user) => user._id.toString() === request.otherUserId.toString());
      return {
        ...otherUser.toObject(),
        isFriend: request.isFriend,
        acceptedDate: request.acceptedDate,
      };
    });

    res.status(200).json({
      status: 200,
      message: "Connected connection request fetched successfully",
      result: results,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});




module.exports = client_route;
