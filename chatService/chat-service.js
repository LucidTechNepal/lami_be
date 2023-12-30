const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const { Clients } = require("../models/client");

const createMessage = async (senderId, receiverId, message) => {
  try {
    const newConversation = new Conversation({
      members: [senderId, receiverId],
    });
    const savedConversation = await newConversation.save();
    const newMessage = new Message({
      conversationId: savedConversation._id,
      sender: senderId,
      receiver: receiverId,
      text: message,
    });
    const savedMessage = await newMessage.save();
    return savedMessage;
  } catch (err) {
    throw err;
  }
};

const getPrivateMessages = async (userId) => {
  try {
    const messages = await Message.find({
      $or: [{ receiver: userId }, { sender: userId }],
    })
      .populate("sender", ["name", "image"])
      .populate("receiver", ["name", "image"])
      .sort({ createdAt: -1 });

    const messageDetails = await Promise.all(
      messages.map(async (message) => {
        const senderUser = await Clients.findOne({ _id: message.sender });
        const receiverUser = await Clients.findOne({ _id: message.receiver });
        return {
          senderName: senderUser.full_name,
          senderImage: senderUser.image,
          receiverName: receiverUser.full_name,
          receiverImage: receiverUser.image,
          lastMessage: message.text,
          lastMessageDate: message.createdAt,
          seen: message.seen,
        };
      })
    );

    return messageDetails;
  } catch (err) {
    throw err;
  }
};

module.exports = {
  createMessage,
  getPrivateMessages,
};
