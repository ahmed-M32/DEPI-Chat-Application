import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
	{
		members: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
	
	},
	{ timestamps: true }
);

const Chat = mongoose.model("Chat", chatSchema);

:!git push origin main
export default Chat;
