const router = require("express").Router();
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const { verifyClient } = require("../middlewares/auth");
const { Clients } = require("../models/client");

const getUserDetails = async (userId) => {
  const user = await Clients.findOne({ _id: userId });
  return {
    userId: user._id,
    userName: user.full_name,
    userImage: user.image,
  };
};

// To add a message
router.post("/", async (req, res) => {
  const { senderId, receiverId, message } = req.body;

  try {
    const newConversation = await Conversation.create({
      members: [senderId, receiverId],
    });
    const newMessage = await Message.create({
      conversationId: newConversation._id,
      sender: senderId,
      receiver: receiverId,
      text: message,
    });
    res.status(200).json(newMessage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// To get messages
router.get("/privateMessage", verifyClient, async (req, res) => {
  const senderId = req.query.senderId;
  const receiverId = req.query.receiverId;

  try {
    const messages = await Message.find({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    })
      .populate("sender", ["name", "image"])
      .populate("receiver", ["name", "image"])
      .sort({ createdAt: -1 });

    if (messages.length === 0) {
      return res.status(200).json({
        status: 200,
        message: "No messages found",
        messageDetails: [],
      });
    }

    const messageDetails = await Promise.all(
      messages.map(async (message) => {
        const senderUser = await getUserDetails(message.sender);
        const receiverUser = await getUserDetails(message.receiver);
        return {
          senderId: senderUser.userId,
          senderName: senderUser.userName,
          senderImage: senderUser.userImage,
          receiverId: receiverUser.userId,
          receiverName: receiverUser.userName,
          receiverImage: receiverUser.userImage,
          lastMessage: message.text,
          lastMessageDate: message.createdAt,
          seen: message.seen,
        };
      })
    );

    res.status(200).json({
      status: 200,
      message: "Chat fetch successfully",
      messageDetails,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// To get last message with count
router.get("/allMessage", verifyClient, async (req, res) => {
  const userId = req.user._id.toHexString();

  try {
    // Find the last message from each sender for the specified receiver
    const pipeline = [
      {
        $match: {
          receiver: userId,
        },
      },
      {
        $sort: {
          sender: 1, 
          createdAt: -1, 
        },
      },
      {
        $group: {
          _id: "$sender",
          lastMessage: { $first: "$text" },
          lastMessageDate: { $first: "$createdAt" },
          seen: { $first: "$seen" },
        },
      },
    ];

    const messages = await Message.aggregate(pipeline);

    const messageDetails = await Promise.all(
      messages.map(async (message) => {
        const senderUser = await getUserDetails(message._id);
        return {
          senderId: senderUser.userId,
          senderName: senderUser.userName,
          senderImage: senderUser.userImage,
          lastMessage: message.lastMessage,
          lastMessageDate: message.lastMessageDate,
          seen: message.seen
        };
      })
    );

    res.status(200).json({
      status: 200,
      message: "All messages fetched successfully",
      messageDetails,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
