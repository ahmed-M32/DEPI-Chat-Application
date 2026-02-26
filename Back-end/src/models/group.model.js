import mongoose from "mongoose";

const groupSchema = mongoose.Schema(
	{
		members: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
		groupName: { type: String, required: true },
		groupImg: { type: String, default: "" },
	},
	{ timestamps: true }
);

groupSchema.index({ members: 1, updatedAt: -1 });

const Group = mongoose.model("Group", groupSchema);
export default Group;
