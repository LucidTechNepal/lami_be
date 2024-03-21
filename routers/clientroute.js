const express = require("express");
const bodyParser = require("body-parser");
const { sendOTPEmail } = require("../emailService");

//Exporting the route
const client_route = express.Router();

//Importing the client Table as client
const { Clients, ConnectionRequests } = require("../models/client");


const bcrypt = require("bcryptjs");
const image_upload = require("../middlewares/imageupload");
const jwt = require("jsonwebtoken");

//Importing otp generator
const otpGenerator = require("otp-generator");
const crypto = require("crypto");
const key = "otp-secret-key";

const { verifyClient } = require("../middlewares/auth");

const axios = require("axios");
const { sendSms, verifyOtp } = require("../twilio/twilio");
JWT_SECRET="evN1R9Pt9ew6YLpKybUfYdjzoO0/bA8rvdYd9XwBLuE="

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
    const { phone, email } = req.body;

    console.log(req);

    if (phone) {


      const sendOtp = await sendSms(phone);
    if (sendOtp) {
      res.status(200).json({ message: "Otp send to registered phone number" });
    }

      // const otp = otpGenerator.generate(4, {
      //   digits: true,
      //   alphabets: false,
      //   upperCaseAlphabets: false,
      //   specialChars: false,
      //   lowerCaseAlphabets: false,
      // });
      // // Set TTL for OTPalp
      // const ttl = 60 * 60 * 1000;
      // const expires = Date.now() + ttl;
      // console.log(expires, "while creating expires");

      // // Create data string
      // const data = `${phone}.${otp}.${expires}`;

      // // Create hash using HMAC-SHA256 algorithm
      // const hash = crypto.createHmac("sha256", key).update(data).digest("hex");
      // const fullHash = `${hash}.${expires}`;

      // // Log OTP
      // // const sendOtp = sendOTPEmail(email, otp);
      // console.log(`Your OTP is ${otp}`);

      // // Return response with OTP and fullHash as JSON along with a status code
      // res.status(200).json({ message: "Sucess", data: fullHash });
      // // const { countryCode, phoneNumber } = parsePhone(phone);
      // // const sendOtp = await sendSms({ phone: phoneNumber, countryCode });
      // // if (sendOtp) {
      // //   return res.status(200).json({ message: "Success", data: sendOtp });
      // // }
    }

    if (email) {
      const otp = otpGenerator.generate(4, {
        digits: true,
        alphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
        lowerCaseAlphabets: false,
      });
      // Set TTL for OTPalp
      const ttl = 60 * 60 * 1000;
      const expires = Date.now() + ttl;
      console.log(expires, "while creating expires");

      // Create data string
      const data = `${email}.${otp}.${expires}`;

      // Create hash using HMAC-SHA256 algorithm
      const hash = crypto.createHmac("sha256", key).update(data).digest("hex");
      const fullHash = `${hash}.${expires}`;

      // Log OTP
      sendOTPEmail(email, otp);
      console.log(`Your OTP is ${otp}`);

      // Return response with OTP and fullHash as JSON along with a status code
      res.status(200).json({ message: "Sucess", data: fullHash });
    }

    return res.status(400).json({ error: "Invalid request" });
  } catch (error) {
    console.error("Error generating OTP:", error);
    return res.status(500).json({ error: "Failed to generate OTP" });
  }
});

// Utility function to parse phone number
const parsePhone = (phone) => {
  const countryCode = phone.slice(0, 3);
  const phoneNumber = phone.slice(3, 14);
  return { countryCode, phoneNumber };
};

// client_route.post("/verifyOtp", async (req, res) => {
//   try {
//     const { phone, otp, hash, email, fcmToken } = req.body;
//     console.log(req.body);

//     let data;

//     if (phone && otp && hash) {
//       const { hash, phone, otp } = req.body;
//       const [hashValue, expires] = hash.split(".");
//       const now = Date.now();
//       if (now > parseInt(expires)) {
//         return res.status(400).json({ error: "OTP expired" });
//       }
//       const loginData = `${phone}.${otp}.${expires}`;
//       const newCalculateHash = crypto
//         .createHmac("sha256", key)
//         .update(loginData)
//         .digest("hex");
//       if (newCalculateHash === hashValue) {
//         data = await Clients.findOne({ phone });

//         if (!data) {
//           return res.status(403).json({ message: "Invalid credential" });
//         }
//       } else {
//         return res.status(403).json({ message: "Invalid OTP or hash" });
//       }
//     }

//     if (email && otp && hash) {
//       const { hash, email, otp } = req.body;
//       const [hashValue, expires] = hash.split(".");
//       const now = Date.now();
//       if (now > parseInt(expires)) {
//         return res.status(400).json({ error: "OTP expired" });
//       }
//       const loginData = `${email}.${otp}.${expires}`;
//       const newCalculateHash = crypto
//         .createHmac("sha256", key)
//         .update(loginData)
//         .digest("hex");
//       if (newCalculateHash === hashValue) {
//         data = await Clients.findOne({ email });

//         if (!data) {
//           return res.status(403).json({ message: "Invalid credential" });
//         }
//       } else {
//         return res.status(403).json({ message: "Invalid OTP or hash" });
//       }
//     }

//     if (data) {
//       const token = jwt.sign({ clientID: data._id }, "anysecretkey");

//       const { _id: userID, full_name, email, image } = data;

//       return res.status(200).json({
//         message: "Success",
//         data: { token, userID, full_name, email, image },
//       });
//     } else {
//       return res.status(403).json({ message: "Invalid OTP" });
//     }
//   } catch (error) {
//     console.error("Error during OTP verification:", error);
//     return res.status(500).json({ error: "Failed to verify OTP" });
//   }
// });
client_route.post("/verifyOtp", async (req, res) => {
  try {
    const { phone, otp, hash, email, fcmToken } = req.body;
    console.log(req.body);

    let data;

    if (phone && otp ) {
      const verifiedPhoneNumber = await verifyOtp(phone, otp);
      console.log(verifiedPhoneNumber)

      if (verifiedPhoneNumber) {
        data = await Clients.findOne({ phone: verifiedPhoneNumber });

        if (!data) {
          return res.status(403).json({ message: "Invalid credential" });
        }
      }
    }

    if (email && otp && hash) {
      const { hash, email, otp } = req.body;
      const [hashValue, expires] = hash.split(".");
      const now = Date.now();
      if (now > parseInt(expires)) {
        return res.status(400).json({ error: "OTP expired" });
      }
      const loginData = `${email}.${otp}.${expires}`;
      const newCalculateHash = crypto
        .createHmac("sha256", key)
        .update(loginData)
        .digest("hex");
      if (newCalculateHash === hashValue) {
        data = await Clients.findOne({ email });

        if (!data) {
          return res.status(403).json({ message: "Invalid credential" });
        }
      } else {
        return res.status(403).json({ message: "Invalid OTP or hash" });
      }
    }

    if (data) {
      // Add fcmToken to the client document if provided
      if (fcmToken) {
        await Clients.updateOne({ _id: data._id }, { $set: { fcmToken } });
      }

      const token = jwt.sign({ clientID: data._id }, "anysecretkey");

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

// client_route.post("/verifyOtp", (req, res) => {
//   try {
//     // Split the hash value and expiration timestamp from the request
//     const { hash, phone, otp,email } = req.body;
//     console.log("Received hash:", hash);
//     const [hashValue, expires] = hash.split(".");

//     console.log("Hash value:", hashValue);
//     console.log("Expires:", expires);

//     // Get the current timestamp
//     const now = Date.now();
//     console.log("Current timestamp:", now);

//     // Check if OTP has expired
//     if (now > parseInt(expires)) {
//       return res.status(400).json({ error: "OTP expired" });
//     }

//     // Construct the data string
//     const data = `${req.phone}.${otp}.${expires}`;
//     console.log("This is the data: ", data);

//     // Calculate the hash of the data string
//     const newCalculateHash = crypto
//       .createHmac("sha256", key)
//       .update(data)
//       .digest("hex");

//     console.log("This is the new calculated hash: ", newCalculateHash);

//     // Compare the calculated hash with the hash value from the request
//     if (newCalculateHash === hashValue) {
//       // If the OTP is verified successfully, find the user data by phone number
//       Clients.findOne({ phone: phone })
//         .then(function (data) {
//           if (data == null) {
//             return res.status(403).json({ message: "Invalid credential" });
//           }

//           // Generate a JWT token with the user ID
//           const token = jwt.sign({ clientID: data._id }, "anysecretkey");
//           const userID = data._id;
//           const full_name = data.full_name;
//           const email = data.email;
//           const image = data.image;

//           // Return the token and user data as part of the response
//           return res.status(200).json({
//             message: "Sucess",
//             data: { token, userID, full_name, email, image },
//           });
//         })
//         .catch((error) => {
//           console.error("Error fetching user data:", error);
//           return res.status(500).json({ error: "Failed to fetch user data" });
//         });
//     } else {
//       // If the hashes don't match, return an error
//       return res.status(400).json({ error: "Invalid OTP" });
//     }
//   } catch (error) {
//     console.error("Error verifying OTP:", error);
//     return res.status(500).json({ error: "Failed to verify OTP" });
//   }
// });

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

client_route.post('/uploadBulkImage', image_upload.array('image', 4),     (req, res) => {
  res.send(req.files)
}, (error, req, res, next) => {
   res.status(400).send({ error: error.message })
})

//Route for Client Registration
client_route.post("/signup",image_upload.single('image'), function (req, res) {
  const full_name = req.body.full_name;
  const email = req.body.email;
  // const birthDate= req.body.birthDate;
  const phone = req.body.phone;
  const image=req.file.filename;
  const gender=req.body.gender;

  console.log(req);
  //using bcrypt module to encrypt client password

 
    var client_data = new Clients({
      full_name: full_name,
      email: email,
      gender:gender,
      phone: phone,
      image:image,
      // birthDate:birthDate,
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


//To get all the data of users

client_route.get("/showall", verifyClient, async function (req, res) {
  try {
    const requestedUser = req.user;

    if (!requestedUser) {
      return res.status(400).json({ message: "No user found" });
    }

    const requestedUserDetails = await Clients.findOne({
      _id: requestedUser._id,
    });
    if (!requestedUserDetails) {
      return res.status(404).json({ message: "User details not found" });
    }

    const genderToMatch =
      requestedUserDetails.gender === "male" ? "female" : "male";
    const filteredClients = await Clients.find({
      _id: { $ne: requestedUserDetails._id },
      gender: genderToMatch,
    });

    if (!filteredClients || filteredClients.length === 0) {
      return res.status(404).json({ message: "No matching users found" });
    }

    const clientIds = filteredClients.map((client) => client._id);

    const friendRequests = await ConnectionRequests.find({
      $or: [
        {
          fromUser: requestedUserDetails._id,
          toUser: { $in: clientIds },
          isFriend: true,
        },
        {
          toUser: requestedUserDetails._id,
          fromUser: { $in: clientIds },
          isFriend: true,
        },
      ],
    });

    const friendIds = [];
    friendRequests.forEach((request) => {
      friendIds.push(request.fromUser.toString());
      friendIds.push(request.toUser.toString());
    });
    const filteredClientsExcludingFriends = filteredClients.filter(
      (client) => !friendIds.includes(client._id.toString())
    );

    res
      .status(200)
      .json({ success: true, data: filteredClientsExcludingFriends });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});



// client_route.get("/showall", verifyClient, async function (req, res) {
//   const requestedUser = req.user;
// console.log(requestedUser);

// try {
//   if (!requestedUser) {
//     return res.status(400).json({ message: "No user found" });
//   }

//   const requestedUserDetails = await Clients.findOne({ _id: requestedUser._id });

//   if (!requestedUserDetails) {
//     return res.status(404).json({ message: "User details not found" });
//   }

//   const filter = {
//   _id: { $ne: requestedUserDetails._id.toString() },
//   gender: requestedUserDetails.gender === "male" ? "female" : "male",
// };

//   console.log(filter);

//   const filteredClients = await Clients.find(filter);

//   console.log(filteredClients)

//   if (!filteredClients) {
//     return res.status(404).json({ message: "User details not found" });
//   }

//   res.status(200).json({ success: true, data: filteredClients });
// } catch (e) {
//   res.status(500).json({ message: e.message });
// }

// });

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

client_route.post("/checkEmail", async (req, res) => {
  try {
    const email = req.body.email;
    const client = await Clients.findOne({ email });
    if (client) {
      return res.status(200).json({
        message: "Email exists in the database",
        data: email 

        // data: {
        //   email: client.email,
        //   // phone: client.phone,
        // },
      });
    } else {
      console.log("Email does not exist in the database");
      return res.status(404).json({
        message: "Email does not exist in the database",
        data: email,
      });
    }
  } catch (error) {
    console.error("Error while checking phone number:", error);
    res
      .status(500)
      .json({ message: "An error occurred while checking phone number" });
  }
});
client_route.post("/checkPhoneNumber", async (req, res) => {
  try {
    const phone = req.body.phone;

    // Find client with phone number (assuming an index exists on the phone field)
    const client = await Clients.findOne({ phone });

    if (client) {
      return res
        .status(200)
        .json({ message: "Phone number exists", data: phone });
    } else {
      console.log("Phone number not found");
      return res.status(404).json({ message: "Phone number not found",  data:phone});
    }
  } catch (error) {
    // Check for Mongoose timeout error (optional)
    
      console.error("Error while checking phone number:", error);
      res
        .status(500)
        .json({ message: "An error occurred while checking phone number" });
    
  }
});


// fetch all connected users for particular users
client_route.get("/getConnection", verifyClient, async (req, res) => {
  const loginUserId = req.user;
  try {
    const connectedUser = await ConnectionRequests.find({
      toUser: loginUserId,
      status: "accepted",
      isFriend: true,
    });

    const result = await Promise.all(
      connectedUser.map(async (request) => {
        const user = await Clients.findOne({ _id: request.fromUser });
        return {
          user,
          acceptedDate: request.updateAt,
        };
      })
    );
    result.forEach((item, index) => {
      result[index].acceptedDate = connectedUser[index].updatedAt;
    });
    res.status(200).json({
      status: 200,
      message: "Connected connection request fetched successfully",
      result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// api to insert prefences
client_route.put("/user/preferences", async (req, res) => {
  try {
    const {
      id,
      minAge,
      maxAge,
      religion,
      location,
      dietPreferences,
      minHeight,
      maxHeight,
      minWeight,
      maxWeight,
    } = req.body;

    // Construct the preferences object
    const preferences = {
      minAge,
      maxAge,
      religion,
      location,
      dietPreferences,
      minHeight,
      maxHeight,
      minWeight,
      maxWeight,
    };

    // Update the user's preferences using $set
    const updatedUser = await Clients.findByIdAndUpdate(
      id,
      { $set: { preferences } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User preferences updated", user: updatedUser });
  } catch (error) {
    console.error("Error updating user preferences:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = client_route;
