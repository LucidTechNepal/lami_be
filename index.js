const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");
const bodyParser = require("body-parser");
require("dotenv").config();

// Importing Database connection
require("./database/database");

// Importing routes
const route_client = require("./routers/clientroute");
const route_admin = require("./routers/adminroute");
const route_conversation = require("./routers/conversations");
const route_message = require("./routers/messages");
const route_profileView = require("./routers/clientProfileViewroute");
const route_subscription = require("./routers/subscription");
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
    try {
      const { senderId, receiverId, message } = data;
      console.log(senderId, receiverId, message,"data")
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

  
});

const port = process.env.SERVER_PORT || 4000;


// runnign server
server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
