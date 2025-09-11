import Message from "../models/message.model.js";
import { Conversation } from "../models/converasation.schema.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { io, getSocketId } from "../socket/socket.js";

const sendMessage = asyncHandler(async (req, res) => {
  const senderId = req.user._id;
  const recieverId = req.params.recieverId;
  const message = req.body.message;

  if (!senderId || !recieverId || !message) {
    throw new ApiError(400, "All fields are required");
  }

  let conversation = await Conversation.findOne({
    members: { $all: [senderId, recieverId] }, // whose senderId and recieverId are both in the members array
  });

  if (!conversation) {
    conversation = await Conversation.create({
      members: [senderId, recieverId], // if not then create a new conversation and store thier ids
    });
  }

  const newMessage = await Message.create({
    senderId,
    recieverId,
    message,
  });

  if (newMessage) {
    conversation.messages.push(newMessage._id);
    conversation.lastMessageAt = new Date();
    conversation.lastMessage.text=message
    conversation.lastMessage.senderId=senderId
    await conversation.save();
  }

  // socket io
  const socketId = getSocketId(recieverId);
  io.to(socketId).emit("newMessage", newMessage);

  io.emit("messageSent", {
    senderId,
    recieverId,
  });

  // io.emit("messageReceived", {
  //   senderId,
  //   recieverId,
  // });


  return res.status(200).json(new ApiResponse(200, null, newMessage));
});

const getMessages = asyncHandler(async (req, res) => {
  const myId = req.user._id;
  const otherParticipantId = req.params.otherParticipantId;

  if (!myId || !otherParticipantId) {
    throw new ApiError(400, "All fields are required");
  }

  let conversation = await Conversation.findOne({
    members: { $all: [myId, otherParticipantId] }, // whose senderId and recieverId are both in the members array
  }).populate("messages");

  
  return res
    .status(200)
    .json(new ApiResponse(200, "messages fetched successfully", conversation));
});

export { sendMessage, getMessages };
