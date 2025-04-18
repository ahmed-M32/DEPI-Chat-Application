import Message from "../models/message.model.js";
import { User } from "../models/user.model.js";
import Chat from "../models/chat.model.js";
import Group from "../models/group.model.js";
import v2 from "../lib/cloudinary.js";
import { encrypt,decrypt } from "../lib/crypto.js";


export const getUsers = async (req, res) => {
	try {
		const currentUser = req.user._id;
		const users = await User.find({ _id: { $ne: currentUser } });

		res.status(200).json(users);
	} catch (error) {
		console.log("can't get users", error.message);
		res.status(500).json({ error: "internal server error" });
	}
};

export const getMessages = async (req, res) => {
	try {
		const { chatId } = req.params;

		const messages = await Message.find({ chat: chatId })
			.poputlate("sender", "fullName profilePicture")
			.populate("reciever", "fullName profilePicture")
			.sort({ createdAt: 1 }); 

		const fetchedMessages = messages.map((m)=> {
			const {encryptedData ,iv ,authTag} = m.content;
			const decryptedData = decrypt(encryptedData,iv,authTag);
			m.content = decryptedData;
		})

		res.status(200).json(fetchedMessages);
	} catch (error) {
		console.error("Can't get messages:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getUserChats = async (req, res) => {
	try {
		const userId = req.user._id;

		const chats = await Chat.find({ members: { $in: [userId] } }).populate(
			"members",
			"fullName profilePicture"
		);
		const groups = await Group.find({ members: { $in: [userId] } }).populate(
			"members",
			"fullName profilePicture"
		);
		res.status(200).json({ userChats: chats, userGroups: groups });
	} catch (error) {
		console.error("Error fetching chats:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const sendChatMessage = async (req, res) => {
	try {
		const { text, image, chatId } = req.body;
		const { id: recieverId } = req.params;
		const senderId = req.user._id;

		let imageURL;
		if (image) {
			const upload = await v2.uploader.upload(image);
			imageURL = upload.secure_url;
		}

		const { encryptedData, iv, authTag } = encrypt(text);


		const newMessage = new Message({
			sender:senderId,
			receiver:recieverId,
			content :{encryptedData,iv,authTag},
			image: imageURL,
			chat :chatId,
			isRead: true,
		});


		await newMessage.save();

		res.status(200).json(newMessage)
	} catch (error) {
		console.log("cannot send the message", error);
		res.status(500).json("internal server error")
	}
};



export const createGroup = async (req,res) => {
	try{
		const {groupName:gName, image, members:mem} = req.body;


		let imageURL;
		if (image) {
			const upload = await v2.uploader.upload(image);
			imageURL = upload.secure_url;
		}

		const newGroup = new Group({
			groupName  : gName,
			groupImg : imageURL,
			members: mem
		})

		await newGroup.save();
		res.status(200).json(newGroup);



	}catch(error){
		console.log("error during group creation")
		console.log(error)

		res.status(500).json("internal server error");

	}
}
	


export const createChat =async (req, res) => {

	try{
	const receiverId  = req.body.member

	const senderId = req.user._id;
	const chatMembers = [senderId, receiverId]

	const existingChat = await Chat.findOne({ members: { $all: chatMembers, $size: 2 }});

	console.log(senderId,receiverId);
	if(existingChat){
		return res.status(400).json(existingChat)
	}

	const newchat = new Chat({
		members :chatMembers,	
	})
	
	await newchat.save();
		res.status(200).json(newchat)
	} catch(error){
		console.log(error);
		res.status(500).json("internal server erorr");
	}



}
