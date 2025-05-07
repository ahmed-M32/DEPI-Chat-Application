import mongoose from "mongoose";

const messageSchema = mongoose.Schema(
  {
    sender: { type: mongoose.Schema.ObjectId, required: true, ref: "User" },

    receiver: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: function () {
        // Require receiver only if it's a private chat (not a group)
        return !this.group;
      },
    },

    content: {
      type: {
        encryptedData: { type: String },
        iv: { type: String },
        authTag: { type: String },
      },
      required: true,
    },

    image: { type: String },

    chat: {
      type: mongoose.Schema.ObjectId,
      ref: "Chat",
      required: function () {
        // Require chat only if it's not a group message
        return !this.group;
      },
    },

    group: {
      type: mongoose.Schema.ObjectId,
      ref: "Group",
      required: false, // group is optional (used for group messages)
    },

    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);


const Message = mongoose.model("Message", messageSchema);

export default Message; 
