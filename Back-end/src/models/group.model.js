import mongoose from "mongoose";

const groupSchema = mongoose.Schema(
	{
		members: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
		groupName:{type : String, required :true},
		groupImg : {type :String ,default : ""},
	},
	{ Timestamp: true }
);

const Group = mongoose.model("Group", groupSchema);
export default Group;
