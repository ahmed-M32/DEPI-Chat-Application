import mongoose from "mongoose";

const messageReadSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		chat: {
			type: mongoose.Schema.ObjectId,
			ref: "Chat",
			required: false,
			index: true,
		},
		group: {
			type: mongoose.Schema.ObjectId,
			ref: "Group",
			required: false,
			index: true,
		},
		lastReadMessage: {
			type: mongoose.Schema.ObjectId,
			ref: "Message",
			required: false,
		},
		lastReadAt: {
			type: Date,
			required: true,
			default: Date.now,
			index: true,
		},
	},
	{ timestamps: true }
);

messageReadSchema.index({ user: 1, chat: 1 }, { unique: true, sparse: true });
messageReadSchema.index({ user: 1, group: 1 }, { unique: true, sparse: true });

const MessageRead = mongoose.model("MessageRead", messageReadSchema);

export default MessageRead;
