const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");
const { ExpressPeerServer } = require("peer");
const admin = require('firebase-admin');

const dotenv = require("dotenv");
dotenv.config();


// Importing Database connection
require("./database/database");


// Initialize Firebase Admin SDK
// const serviceAccount = require('./notificationService/test-notification-83b73-firebase-adminsdk-czuur-082057f50c.json'); // Replace with your service account key
const serviceAccount = {
  "type": "service_account",
  "project_id": "test-notification-83b73",
  "private_key_id": process.env.FIREBASE_KEY_ID,
  "private_key": process.env.FIREBASE_KEY.replace(/\\n/g, '\n'),
  "client_email": "firebase-adminsdk-czuur@test-notification-83b73.iam.gserviceaccount.com",
  "client_id": "105793570775823189629",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-czuur%40test-notification-83b73.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // Add any additional configuration if needed
});

// Importing routes
const route_client = require("./routers/clientroute");
const route_admin = require("./routers/adminroute");
const route_conversation = require("./routers/conversations");
const route_message = require("./routers/messages");
const route_profileView = require("./routers/clientProfileViewroute");
const route_subscription = require("./routers/subscription");
const image_upload = require("./middlewares/imageupload");
const {
  createMessage,
  getPrivateMessages,
} = require("./chatService/chat-service");
const { verifyClient, socketAuthencation } = require("./middlewares/auth");

const app = express();
const server = http.createServer(app);

process.on("uncaughtException", function (err) {
  console.log(err);
});
// app.post("/upload", image_upload.single('image'), async (req, res) => {
//   try {
//     // Validate the uploaded file
//     if (!req.file) {
//       return res.status(400).send("No file uploaded");
//     }

//     // Call the function to upload file to S3
//     const uploadResult = await uploadImage(req.file);
//     if (uploadResult) {
//       res.status(200).send("File uploaded successfully");
//     } else {
//       throw new Error("Failed to upload file to S3"); // Re-throw for generic error handling
//     }
//   } catch (error) {
//     console.error("Error uploading file to S3:", error);
//     res.status(500).send("Internal server error");
//   }
// });


const io = socketIo(server, { cors: "*" });

const onlineUsers = new Map();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "uploads")));

// app.use(route_admin);
// app.use(verifyClient);
app.use(route_client);

app.use("/conversations", route_conversation);
app.use("/messages", route_message);
app.use("/subscription", route_subscription);

app.use(route_profileView);

// Socket.IO Middleware
io.use((socket, next) => {
  socketAuthencation(socket, next);
});

io.on("connection", async (socket) => {
  console.log(socket, "scoket");
  const userId = socket.userId;
  console.log("userId", userId);
  onlineUsers.set(userId, socket.id);

  // Emit the online users to all connected users
  io.emit("user-online", onlineUsers);

  socket.on("room:join", (data) => {
    const { userId, room } = data;
    socket.join(room);
    io.to(room).emit("user:joined", { userId, room });
  });

  socket.on("disconnect", () => {
    console.log(`${socket.id} disconnected socket`);
    onlineUsers.delete(userId);

    // Emit the offline users to all connected users
    io.emit("user-offline", onlineUsers);
  });

  // Handle chat messages
  socket.on("chat", async (data) => {
    console.log(data)
    try {
      const { senderId, receiverId, message } = data;
      console.log(senderId, receiverId, message, "data");
      const savedMessage = await createMessage(senderId, receiverId, message);
      if (savedMessage) {
        const senderSocketId = onlineUsers.get(userId);
        let receiverSocketId;
        for (const [key, value] of onlineUsers) {
          if (value === senderSocketId) {
            continue;
          }
          receiverSocketId = value;
          break;
        }
        const reponseData = {
          senderId,
          receiverId,
          message,
        };

        io.to(receiverSocketId).emit("chat", reponseData);
      }
    } catch (err) {
      io.emit("error", err);
    }
  });

  // Handle video call events
  socket.on("user:call:video", ({ to, offer }) => {
    io.to(to).emit("incoming:call:video", { from: socket.id, offer });
  });

  socket.on("user:call:audio", ({ to, offer }) => {
    io.to(to).emit("incoming:call:audio", { from: socket.id, offer });
  });

  socket.on("call:accepted", ({ to, ans }) => {
    io.to(to).emit("call:accepted", { from: socket.id, ans });
  });

  socket.on("peer:nego:needed", ({ to, offer }) => {
    console.log("peer:nego:needed", offer);
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    console.log("peer:nego:done", ans);
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });
});


// Endpoint to send notification to device using FCM
app.post('/send-notification', (req, res) => {
  const { token, title, body } = req.body;

  const message = {
    notification: {
      title: title,
      body: body,
    },
    token: token,
  };

  // Send the message to the device token
  admin.messaging().send(message)
    .then((response) => {
      console.log('Notification sent successfully:', response);
      res.status(200).send('Notification sent successfully');
    })
    .catch((error) => {
      console.error('Error sending notification:', error);
      res.status(500).send('Error sending notification');
    });
});

// var admin = require("firebase-admin");



// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });
// // Endpoint to send notification
// app.post('/send-notification', (req, res) => {
//   const message = {
//     notification: {
//       title: req.body.title,
//       body: req.body.body,
//     },
//     token: req.body.token, // Token received from the Flutter app
//   };

//   admin.messaging().send(message)
//     .then((response) => {
//       console.log('Successfully sent message:', response);
//       res.status(200).send('Notification sent successfully');
//     })
//     .catch((error) => {
//       console.error('Error sending message:', error);
//       res.status(500).send('Error sending notification');
//     });
// });
const port = process.env.PORT || 4000;

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
