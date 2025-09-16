import mongoose, { Schema, Types } from "mongoose";

const conversationSchema = new Schema(
  {
    members: [
      {
        type: Schema.Types.ObjectId, 
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

    hasOpened:{
      type:Map,
      of:Boolean,
      default:{}
    }
  },
  { timestamps: true }
);

conversationSchema.index({ lastMessageAt: -1 });

export const Conversation = mongoose.model("Conversation", conversationSchema);
