import Message from "../models/message.model.js";
import { Conversation } from "../models/converasation.schema.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { io, getSocketId, userSocketMap } from "../socket/socket.js";

const sendMessage = asyncHandler(async (req, res) => {
  const senderId = req.user._id;
  const recieverId = req.params.recieverId;
  const message = req.body.message;

  if (!senderId || !recieverId || !message) {
    throw new ApiError(400, "All fields are required");
  }

  let conversation = await Conversation.findOne({
    members: { $all: [senderId, recieverId] },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      members: [senderId, recieverId], 
    });
  }

  const newMessage = await Message.create({
    senderId,
    recieverId,
    message,
  });
  const currentTime = new Date();
  if (newMessage) {
    conversation.messages.push(newMessage._id);
    conversation.lastMessageAt = currentTime;
    conversation.lastMessage.text = message;
    conversation.lastMessage.senderId = senderId;
    conversation.hasOpened.senderId=true
    conversation.hasOpened.recieverId=false
    await conversation.save();
  }

  // socket io
  const socketId = getSocketId(recieverId);
  io.to(socketId).emit("newMessage", newMessage);

  const data = {
    savedMessage: newMessage.message,
    recieverId, 
    senderId, 
    lastUpdated: new Date(),
  };

  if (userSocketMap[senderId]) {
    io.to(userSocketMap[senderId]).emit("messageSent", data);
  }

  if (userSocketMap[recieverId]) {
    io.to(userSocketMap[recieverId]).emit("messageReceived", data);
  }

  return res.status(200).json(new ApiResponse(200, null, newMessage));
});

const getMessages = asyncHandler(async (req, res) => {
  const myId = req.user._id;
  const otherParticipantId = req.params.otherParticipantId;

  if (!myId || !otherParticipantId) {
    throw new ApiError(400, "All fields are required");
  }

  let conversation = await Conversation.findOne({
    members: { $all: [myId, otherParticipantId] },
  }).populate({
    path: "messages",
    options: { sort: { createdAt: 1 } }, 
  });
  
  return res
    .status(200)
    .json(new ApiResponse(200, "messages fetched successfully", conversation));
});

export { sendMessage, getMessages };
