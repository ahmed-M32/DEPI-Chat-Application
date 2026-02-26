import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
	{
		members: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
	
	},
	{ timestamps: true }
);

chatSchema.index({ members: 1, updatedAt: -1 });

const Chat = mongoose.model("Chat", chatSchema);


export default Chat;
