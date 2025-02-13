import mongoose from "mongoose";

const messageSchema = mongoose.Schema(
	{
		sender: { type: mongoose.Schema.ObjectId, required: true, ref: "User" },
		reciever: { type: mongoose.Schema.ObjectId, required: true, ref: "User" },
		content: { type: String },
		image: { type: String },
		chat: { type: mongoose.Schema.ObjectId, required: true, ref: "Chat" },
		group: { type: mongoose.Schema.ObjectId, ref: "Group", default: "" },
		isRead: { type: Boolean, default: false },
	},
	{ timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
