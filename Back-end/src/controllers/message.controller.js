import Message from "../models/message.model.js";
import { User } from "../models/user.model.js";
import Chat from "../models/chat.model.js";
import Group from "../models/group.model.js";
import { emitToChat, emitToUser } from "../socket/socket.js";
import { decrypt, encrypt } from "../lib/crypto.js";
import { v2 } from "cloudinary";

export const getUsers = async (req, res) => {
	try {
		const currentUser = req.user._id;
		const users = await User.find({ _id: { $ne: currentUser } });
		res.json({ success: true, data: users });
	} catch (error) {
		console.error("Can't get users:", error.message);
		res.status(500).json({ success: false, message: "Internal server error" });
	}
};
export const getMessages = async (req, res) => {
	try {
		const { chatId } = req.params;
		const userId = req.user._id;

		const chat =
			(await Chat.findOne({
				_id: chatId,
				members: { $elemMatch: { $eq: userId } },
			})) ||
			(await Group.findOne({
				_id: chatId,
				members: { $elemMatch: { $eq: userId } },
			}));

		if (!chat) {
			return res.status(404).json({
				success: false,
				message: "Chat not found or you are not a member",
			});
		}

		let messages = [];
		if (chat instanceof Chat) {
			messages = await Message.find({ chat: chatId })
				.populate("sender", "fullName profilePicture")
				.populate("receiver", "fullName profilePicture")
				.sort({ createdAt: 1 });
		} else if (chat instanceof Group) {
			messages = await Message.find({ group: chatId })
				.populate("sender", "fullName profilePicture")
				.sort({ createdAt: 1 });
		}

		const lastMessage =
			messages.length > 0 ? messages[messages.length - 1] : null;

		messages = messages.map((message) => {
			const messageObj = message.toObject();
			if (messageObj.content && typeof messageObj.content === "object") {
				try {
					const decrypted = decrypt({
						encryptedData: messageObj.content.encryptedData,
						iv: messageObj.content.iv,
						authTag: messageObj.content.authTag,
					});
					messageObj.content = decrypted;
				} catch (error) {
					console.error("Error decrypting message:", error);
					messageObj.content = "Message could not be decrypted";
				}
			}

			messageObj.time = new Date(messageObj.createdAt).toLocaleTimeString(
				"en-US",
				{
					hour: "2-digit",
					minute: "2-digit",
				}
			);

			return messageObj;
		});

		let decryptedLastMessage = null;
		if (lastMessage) {
			decryptedLastMessage = lastMessage.toObject();
			if (
				decryptedLastMessage.content &&
				typeof decryptedLastMessage.content === "object"
			) {
				try {
					const decrypted = decrypt({
						encryptedData: decryptedLastMessage.content.encryptedData,
						iv: decryptedLastMessage.content.iv,
						authTag: decryptedLastMessage.content.authTag,
					});
					decryptedLastMessage.content = decrypted;
				} catch (error) {
					console.error("Error decrypting last message:", error);
					decryptedLastMessage.content = "Message could not be decrypted";
				}
			}
			decryptedLastMessage.time = new Date(
				decryptedLastMessage.createdAt
			).toLocaleTimeString("en-US", {
				hour: "2-digit",
				minute: "2-digit",
			});
		}

		res.json({
			success: true,
			data: {
				messages,
				lastMessage: decryptedLastMessage,
			},
		});
	} catch (error) {
		console.error("Error in getMessages:", error);
		res.status(500).json({
			success: false,
			message: "Error retrieving messages",
		});
	}
};

export const getUserChats = async (req, res) => {
	try {
		const userId = req.user._id.toString();

		const [chats, groups] = await Promise.all([
			Chat.find({ members: userId }).populate(
				"members",
				"fullName profilePicture"
			),
			Group.find({ members: userId }).populate(
				"members",
				"fullName profilePicture"
			),
		]);

		const getLastMessage = async (chatId) => {
			const message = await Message.findOne({
				$or: [{ chat: chatId }, { group: chatId }],
			}).sort({ createdAt: -1 });

			if (!message) return null;

			let content = message.content;
			if (content && typeof content === "object" ) {
				try {
					content = decrypt({
								encryptedData: content.encryptedData,
								iv: content.iv,
								authTag: content.authTag,
						  })
						;
				} catch (error) {
					console.error("Error decrypting message:", error);
					content = "Message could not be decrypted";
				}
			}
			if (message.image) {
				content = "image";
			}
			return {
				_id: message._id,
				content,
				sender: message.sender,
				createdAt: message.createdAt,
				time: new Date(message.createdAt).toLocaleTimeString("en-US", {
					hour: "2-digit",
					minute: "2-digit",
				}),
			};
		};

		const reorderMembers = async (items) => {
			const result = [];
			for (const item of items) {
				const members = item.members.map((m) => m.toObject?.() || m);
				const currentUser = members.find((m) => m._id.toString() === userId);
				const others = members.filter((m) => m._id.toString() !== userId);

				// Get last message for this chat/group
				const lastMessage = await getLastMessage(item._id);

				result.push({
					...item.toObject(),
					members: [currentUser, ...others],
					lastMessage,
				});
			}
			return result;
		};

		const [userChats, userGroups] = await Promise.all([
			reorderMembers(chats),
			reorderMembers(groups),
		]);

		res.json({
			success: true,
			data: {
				userChats,
				userGroups,
			},
		});
	} catch (error) {
		console.error("Error fetching chats:", error);
		res.status(500).json({ success: false, message: "Internal server error" });
	}
};

export const sendMessage = async (req, res) => {
	try {
		const { content, receiver } = req.body;
		const { chatId } = req.params;
		const senderId = req.user._id;

		const chat = await Chat.findById(chatId);
		if (!chat) {
			return res
				.status(404)
				.json({ success: false, message: "Chat not found" });
		}

		let messageContent;
		let decryptedContentForResponse = content; // Store original content for response
		let upload;
		if (req.body.image) {
			upload = await v2.uploader.upload(req.body.image);
			console.log(upload);
		}

		const { encryptedData, iv, authTag } = content
			? encrypt(content)
			: { encryptedData: "", iv: "", authTag: "" };
		messageContent = { encryptedData, iv, authTag };

		const newMessage = new Message({
			chat: chatId,
			sender: senderId,
			receiver: receiver,
			content: messageContent,
			image: upload?.secure_url || "",
		});

		await newMessage.save();
		await newMessage.populate("sender", "fullName profilePicture");

		// Add timestamp for frontend and prepare response
		const messageWithTime = {
			...newMessage.toObject(),
			content: decryptedContentForResponse, // Use original unencrypted content for response
			time: new Date(newMessage.createdAt).toLocaleTimeString("en-US", {
				hour: "2-digit",
				minute: "2-digit",
			}),
		};

		// Emit to all chat participants
		emitToChat(chatId, "new_message", {
			message: messageWithTime,
			chatId,
		});

		// Send notifications to other participants
		chat.members.forEach((memberId) => {
			if (memberId.toString() !== senderId.toString()) {
				emitToUser(memberId, "message_notification", {
					message: messageWithTime,
					chatId,
				});
			}
		});

		res.json({ success: true, data: messageWithTime });
	} catch (error) {
		console.error("Failed to send message:", error);
		res.status(500).json({ success: false, message: "Internal server error" });
	}
};

export const sendGroupMessage = async (req, res) => {
	try {
		const { content } = req.body;
		const { groupId } = req.params;
		const senderId = req.user._id;

		const group = await Group.findById(groupId);
		if (!group) {
			return res
				.status(404)
				.json({ success: false, message: "Group not found" });
		}

		if (!group.members.includes(senderId)) {
			return res.status(403).json({
				success: false,
				message: "You are not a member of this group",
			});
		}

		let messageContent = null; // Initialize as null
		let decryptedContentForResponse = content || ""; // Default to empty string
		let upload;

		if (req.body.image) {
			upload = await v2.uploader.upload(req.body.image);
			console.log(upload);
		}

		// Only encrypt content if it exists
		const { encryptedData, iv, authTag } = content
			? encrypt(content)
			: { encryptedData: "", iv: "", authTag: "" };
		messageContent = { encryptedData, iv, authTag };

		const newMessage = new Message({
			sender: senderId,
			content: messageContent,
			group: groupId,
			image: upload?.secure_url || "",
		});

		await newMessage.save();
		await newMessage.populate("sender", "fullName profilePicture");

		const messageWithTime = {
			...newMessage.toObject(),
			content: decryptedContentForResponse,
			time: new Date(newMessage.createdAt).toLocaleTimeString("en-US", {
				hour: "2-digit",
				minute: "2-digit",
			}),
		};

		emitToChat(groupId, "new_group_message", {
			message: messageWithTime,
			groupId,
		});

		group.members.forEach((memberId) => {
			if (memberId.toString() !== senderId.toString()) {
				emitToUser(memberId, "group_message_notification", {
					message: messageWithTime,
					groupId,
					groupName: group.groupName,
				});
			}
		});

		res.json({ success: true, data: messageWithTime });
	} catch (error) {
		console.error("Failed to send group message:", error);
		res.status(500).json({ success: false, message: "Internal server error" });
	}
};
export const createChat = async (req, res) => {
	try {
		const userId = req.body.member;
		const currentUserId = req.user._id;

		const existingChat = await Chat.findOne({
			members: { $all: [currentUserId, userId], $size: 2 },
		});

		if (existingChat) {
			return res.json({ success: true, data: existingChat });
		}

		const newChat = new Chat({
			members: [currentUserId, userId],
		});

		await newChat.save();
		res.json({ success: true, data: newChat });
	} catch (error) {
		console.error("Failed to create chat:", error);
		res.status(500).json({ success: false, message: "Internal server error" });
	}
};

export const createGroup = async (req, res) => {
	try {
		const { groupName, members, image } = req.body;
		const currentUserId = req.user._id;
		let finalGroupImg = image;

		// Handle image upload if provided as base64
		if (req.body.image) {
			try {
				const upload = await v2.uploader.upload(req.body.image);
				finalGroupImg = upload.secure_url;
			} catch (uploadError) {
				console.error("Image upload failed:", uploadError);
				// Continue with default or empty image
			}
		}

		const newGroup = new Group({
			groupName,
			members: [...members, currentUserId],
			groupImg: finalGroupImg || "",
		});

		await newGroup.save();

		// Populate members to get their details
		await newGroup.populate("members", "fullName profilePicture");

		// Notify all members about the new group
		newGroup.members.forEach((member) => {
			emitToUser(member._id, "new_group", { group: newGroup });
		});

		res.json({ success: true, data: newGroup });
	} catch (error) {
		console.error("Failed to create group:", error);
		res.status(500).json({ success: false, message: "Internal server error" });
	}
};
