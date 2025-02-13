import mongoose from "mongoose";

const groupSchema = mongooose.schema(
	{
		members: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
	},
	{ Timestamp: true }
);

const Group = mongoose.model("Group", groupSchema);
export default Group;
