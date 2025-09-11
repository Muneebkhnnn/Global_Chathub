import mongoose, { Schema, Types } from "mongoose";

const conversationSchema = new Schema(
  {
    members: [
      {
        type: Schema.Types.ObjectId, // it means storing the ObjectId of the User not the whole User object
        ref: "User",
      },
    ],

    messages: [
      {
        type: Schema.Types.ObjectId,
        ref: "Message",
      },
    ],

    lastMessageAt: {
      type: Date,
      default: Date.now,
    },

    lastMessage: {
      text: String,
      senderId:{
        type:Schema.Types.ObjectId,
        ref:"User"
      },
    },
  },
  { timestamps: true }
);

// index for faster sorting by activity
conversationSchema.index({ lastMessageAt: -1 });

export const Conversation = mongoose.model("Conversation", conversationSchema);
