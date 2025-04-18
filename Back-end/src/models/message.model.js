import mongoose from "mongoose";

const messageSchema = mongoose.Schema(
  {
    sender: { type: mongoose.Schema.ObjectId, required: true, ref: "User" },
    receiver: { type: mongoose.Schema.ObjectId, required: true, ref: "User" },
    content: {
      type: {
        encryptedData: { type: String, required: true },
        iv: { type: String, required: true },
        authTag: { type: String, required: true },
      },
      required: true, // Make the content object mandatory
    },
    image: { type: String },
    chat: { type: mongoose.Schema.ObjectId, required: true, ref: "Chat" },
    group: { type: mongoose.Schema.ObjectId, ref: "Group", required: false },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
