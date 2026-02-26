import mongoose from "mongoose";

const messageSchema = mongoose.Schema(
  {
    sender: { type: mongoose.Schema.ObjectId, required: true, ref: "User" },

    receiver: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: function () {
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
        return !this.group;
      },
    },

    group: {
      type: mongoose.Schema.ObjectId,
      ref: "Group",
      required: false, 
    },

    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

messageSchema.index({ chat: 1, createdAt: -1 });
messageSchema.index({ group: 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });


const Message = mongoose.model("Message", messageSchema);

export default Message; 
