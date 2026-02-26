import Message from "../models/message.model.js";
import { User } from "../models/user.model.js";
import Chat from "../models/chat.model.js";
import Group from "../models/group.model.js";
import MessageRead from "../models/messageRead.model.js";
import { emitToChat, emitToUser } from "../socket/socket.js";
import { decrypt, encrypt } from "../lib/crypto.js";
import v2 from "../lib/cloudinary.js";

const escapeRegex = (value = "") => {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

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

export const searchUsersByUsername = async (req, res) => {
	try {
		const currentUserId = req.user._id;
		const qRaw = typeof req.query.q === "string" ? req.query.q : "";
		const q = qRaw.trim();
		console.log(req);
		

		const limitRaw = parseInt(req.query.limit, 10);
		const limit = Math.min(Math.max(limitRaw || 10, 1), 20);

		if (!q) {
			return res.json({ success: true, data: [] });
		}

		const safe = escapeRegex(q);
		const regex = new RegExp(safe, "i");

		const users = await User.find({
			_id: { $ne: currentUserId },
			fullName: { $regex: regex },
		})
			.select("fullName profilePicture email")
			.limit(limit);

		return res.json({ success: true, data: users });
	} catch (error) {
		console.error("Can't search users:", error.message);
		return res
			.status(500)
			.json({ success: false, message: "Internal server error" });
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

		const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
		const limitRaw = parseInt(req.query.limit, 10);
		const limit = Math.min(Math.max(limitRaw || 20, 1), 100);
		const skip = (page - 1) * limit;

		const isGroupChat = chat instanceof Group;
		const messageFilter = isGroupChat ? { group: chatId } : { chat: chatId };

		let messagesQuery = Message.find(messageFilter).populate(
			"sender",
			"fullName profilePicture"
		);

		if (!isGroupChat) {
			messagesQuery = messagesQuery.populate(
				"receiver",
				"fullName profilePicture"
			);
		}

		messagesQuery = messagesQuery.sort({ createdAt: 1 }).skip(skip).limit(limit);

		let lastMessageQuery = Message.findOne(messageFilter)
			.sort({ createdAt: -1 })
			.populate("sender", "fullName profilePicture");

		if (!isGroupChat) {
			lastMessageQuery = lastMessageQuery.populate(
				"receiver",
				"fullName profilePicture"
			);
		}

		const [messageDocs, lastMessageDoc] = await Promise.all([
			messagesQuery,
			lastMessageQuery,
		]);

		const messages = messageDocs.map((message) => {
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

		let lastMessage = null;
		if (lastMessageDoc) {
			lastMessage = lastMessageDoc.toObject();
			if (lastMessage.content && typeof lastMessage.content === "object") {
				try {
					const decrypted = decrypt({
						encryptedData: lastMessage.content.encryptedData,
						iv: lastMessage.content.iv,
						authTag: lastMessage.content.authTag,
					});
					lastMessage.content = decrypted;
				} catch (error) {
					console.error("Error decrypting last message:", error);
					lastMessage.content = "Message could not be decrypted";
				}
			}
			lastMessage.time = new Date(lastMessage.createdAt).toLocaleTimeString(
				"en-US",
				{
					hour: "2-digit",
					minute: "2-digit",
				}
			);
		}

		res.json({
			success: true,
			data: {
				messages,
				lastMessage,
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
		const userObjectId = req.user._id;
		const userId = userObjectId.toString();

		const [chats, groups] = await Promise.all([
			Chat.find({ members: userObjectId }).populate(
				"members",
				"fullName profilePicture"
			),
			Group.find({ members: userObjectId }).populate(
				"members",
				"fullName profilePicture"
			),
		]);

		const chatIds = chats.map((chat) => chat._id);
		const groupIds = groups.map((group) => group._id);

		const [chatReads, groupReads] = await Promise.all([
			chatIds.length
				? MessageRead.find({ user: userObjectId, chat: { $in: chatIds } }).select(
					"chat lastReadAt"
				  )
				: [],
			groupIds.length
				? MessageRead.find({ user: userObjectId, group: { $in: groupIds } }).select(
					"group lastReadAt"
				  )
				: [],
		]);

		const lastReadAtByChatId = new Map(
			chatReads.map((r) => [r.chat.toString(), r.lastReadAt])
		);
		const lastReadAtByGroupId = new Map(
			groupReads.map((r) => [r.group.toString(), r.lastReadAt])
		);

		const minDate = (dates, fallback) => {
			if (!dates.length) return fallback;
			return new Date(Math.min(...dates.map((d) => new Date(d).getTime())));
		};

		const chatMinLastReadAt = minDate(
			Array.from(lastReadAtByChatId.values()),
			new Date(0)
		);
		const groupMinLastReadAt = minDate(
			Array.from(lastReadAtByGroupId.values()),
			new Date(0)
		);

		const [recentChatMsgs, recentGroupMsgs] = await Promise.all([
			chatIds.length
				? Message.find({
					chat: { $in: chatIds },
					sender: { $ne: userObjectId },
					createdAt: { $gt: chatMinLastReadAt },
				  }).select("chat createdAt")
				: [],
			groupIds.length
				? Message.find({
					group: { $in: groupIds },
					sender: { $ne: userObjectId },
					createdAt: { $gt: groupMinLastReadAt },
				  }).select("group createdAt")
				: [],
		]);

		const unreadCountByChatId = new Map();
		recentChatMsgs.forEach((m) => {
			const id = m.chat?.toString();
			if (!id) return;
			const lastReadAt = lastReadAtByChatId.get(id) || new Date(0);
			if (new Date(m.createdAt).getTime() > new Date(lastReadAt).getTime()) {
				unreadCountByChatId.set(id, (unreadCountByChatId.get(id) || 0) + 1);
			}
		});
		const unreadCountByGroupId = new Map();
		recentGroupMsgs.forEach((m) => {
			const id = m.group?.toString();
			if (!id) return;
			const lastReadAt = lastReadAtByGroupId.get(id) || new Date(0);
			if (new Date(m.createdAt).getTime() > new Date(lastReadAt).getTime()) {
				unreadCountByGroupId.set(id, (unreadCountByGroupId.get(id) || 0) + 1);
			}
		});

		const buildLastMessageSummary = (message) => {
			if (!message) return null;

			const msg = message.toObject ? message.toObject() : message;
			let content = msg.content;

			if (content && typeof content === "object") {
				try {
					content = decrypt({
						encryptedData: content.encryptedData,
						iv: content.iv,
						authTag: content.authTag,
					});
				} catch (error) {
					console.error("Error decrypting message:", error);
					content = "Message could not be decrypted";
				}
			}

			if (msg.image) {
				content = "image";
			}

			return {
				_id: msg._id,
				content,
				sender: msg.sender,
				createdAt: msg.createdAt,
				time: new Date(msg.createdAt).toLocaleTimeString("en-US", {
					hour: "2-digit",
					minute: "2-digit",
				}),
			};
		};

		const [chatLastMessages, groupLastMessages] = await Promise.all([
			chatIds.length
				? Message.aggregate([
						{ $match: { chat: { $in: chatIds } } },
						{ $sort: { createdAt: -1 } },
						{ $group: { _id: "$chat", doc: { $first: "$$ROOT" } } },
				  ])
				: [],
			groupIds.length
				? Message.aggregate([
						{ $match: { group: { $in: groupIds } } },
						{ $sort: { createdAt: -1 } },
						{ $group: { _id: "$group", doc: { $first: "$$ROOT" } } },
				  ])
				: [],
		]);

		const lastMessagesByChatId = new Map(
			chatLastMessages.map((entry) => [
				entry._id.toString(),
				buildLastMessageSummary(entry.doc),
			])
		);

		const lastMessagesByGroupId = new Map(
			groupLastMessages.map((entry) => [
				entry._id.toString(),
				buildLastMessageSummary(entry.doc),
			])
		);

		const reorderMembers = (items, isGroup) =>
			items.map((item) => {
				const members = item.members.map((m) => m.toObject?.() || m);
				const currentUser = members.find((m) => m._id.toString() === userId);
				const others = members.filter((m) => m._id.toString() !== userId);

				const lastMessageMap = isGroup
					? lastMessagesByGroupId
					: lastMessagesByChatId;
				const lastMessage =
					lastMessageMap.get(item._id.toString()) || null;

				const unreadMap = isGroup ? unreadCountByGroupId : unreadCountByChatId;
				const unreadCount = unreadMap.get(item._id.toString()) ?? 0;

				return {
					...item.toObject(),
					members: [currentUser, ...others],
					lastMessage,
					unreadCount,
				};
			});

		const userChats = reorderMembers(chats, false);
		const userGroups = reorderMembers(groups, true);

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

export const markChatRead = async (req, res) => {
	try {
		const userId = req.user._id;
		const { chatId } = req.params;

		const chat = await Chat.findOne({ _id: chatId, members: userId });
		if (!chat) {
			return res
				.status(404)
				.json({ success: false, message: "Chat not found" });
		}

		const latest = await Message.findOne({ chat: chatId })
			.sort({ createdAt: -1 })
			.select("_id createdAt");

		await MessageRead.findOneAndUpdate(
			{ user: userId, chat: chatId },
			{
				$set: {
					lastReadMessage: latest?._id,
					lastReadAt: latest?.createdAt || new Date(),
				},
			},
			{ upsert: true, new: true }
		);

		await Message.updateMany(
			{ chat: chatId, receiver: userId, isRead: false },
			{ $set: { isRead: true } }
		);

		return res.json({ success: true });
	} catch (error) {
		console.error("Failed to mark chat read:", error);
		return res
			.status(500)
			.json({ success: false, message: "Internal server error" });
	}
};

export const markGroupRead = async (req, res) => {
	try {
		const userId = req.user._id;
		const { groupId } = req.params;

		const group = await Group.findOne({ _id: groupId, members: userId });
		if (!group) {
			return res
				.status(404)
				.json({ success: false, message: "Group not found" });
		}

		const latest = await Message.findOne({ group: groupId })
			.sort({ createdAt: -1 })
			.select("_id createdAt");

		await MessageRead.findOneAndUpdate(
			{ user: userId, group: groupId },
			{
				$set: {
					lastReadMessage: latest?._id,
					lastReadAt: latest?.createdAt || new Date(),
				},
			},
			{ upsert: true, new: true }
		);

		return res.json({ success: true });
	} catch (error) {
		console.error("Failed to mark group read:", error);
		return res
			.status(500)
			.json({ success: false, message: "Internal server error" });
	}
};

export const sendMessage = async (req, res) => {
	try {
		let { content, receiver } = req.body;
		const { chatId } = req.params;
		const senderId = req.user._id;
		const chat = await Chat.findById(chatId);
		if (!chat) {
			return res
				.status(404)
				.json({ success: false, message: "Chat not found" });
		}

		// For direct chats, require receiver; derive from chat members if missing
		if (!receiver && chat.members?.length === 2) {
			receiver = chat.members.find(
				(m) => m.toString() !== senderId.toString()
			);
		}
		if (!receiver) {
			return res.status(400).json({
				success: false,
				message: "Receiver is required for direct messages",
			});
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

		let existingChat = await Chat.findOne({
			members: { $all: [currentUserId, userId], $size: 2 },
		}).populate("members", "fullName profilePicture");

		if (existingChat) {
			const members = (existingChat.members || []).map(
				(m) => m.toObject?.() || m
			);
			const currentUser = members.find(
				(m) => m._id.toString() === currentUserId.toString()
			);
			const others = members.filter(
				(m) => m._id.toString() !== currentUserId.toString()
			);
			return res.json({
				success: true,
				data: {
					...existingChat.toObject(),
					members: [currentUser, ...others],
					lastMessage: null,
					unreadCount: 0,
				},
			});
		}

		const newChat = new Chat({
			members: [currentUserId, userId],
		});

		await newChat.save();
		await newChat.populate("members", "fullName profilePicture");

		const members = (newChat.members || []).map((m) => m.toObject?.() || m);
		const currentUser = members.find(
			(m) => m._id.toString() === currentUserId.toString()
		);
		const others = members.filter(
			(m) => m._id.toString() !== currentUserId.toString()
		);

		res.json({
			success: true,
			data: {
				...newChat.toObject(),
				members: [currentUser, ...others],
				lastMessage: null,
				unreadCount: 0,
			},
		});
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

		if (req.body.image) {
			try {
				const upload = await v2.uploader.upload(req.body.image);
				finalGroupImg = upload.secure_url;
			} catch (uploadError) {
				console.error("Image upload failed:", uploadError);
			}
		}

		const newGroup = new Group({
			groupName,
			members: [...members, currentUserId],
			groupImg: finalGroupImg || "",
		});

		await newGroup.save();

		await newGroup.populate("members", "fullName profilePicture");

		newGroup.members.forEach((member) => {
			emitToUser(member._id, "new_group", { group: newGroup });
		});

		res.json({ success: true, data: newGroup });
	} catch (error) {
		console.error("Failed to create group:", error);
		res.status(500).json({ success: false, message: "Internal server error" });
	}
};