import { useEffect } from "react";

const useChatSocketSync = ({ socket, setActiveChats, fetchChats, selectedChatIdRef }) => {
	useEffect(() => {
		if (!socket) return;

		const handleNewChat = ({ chat }) => {
			setActiveChats((prev) => ({
				...prev,
				userChats: [...(prev.userChats || []), chat],
			}));
		};

		const handleNewGroup = ({ group }) => {
			setActiveChats((prev) => ({
				...prev,
				userGroups: [...(prev.userGroups || []), group],
			}));
		};

		const handleChatUpdated = ({ chatId, updates }) => {
			setActiveChats((prev) => ({
				userChats: (prev.userChats || []).map((c) =>
					c._id === chatId ? { ...c, ...updates } : c
				),
				userGroups: (prev.userGroups || []).map((g) =>
					g._id === chatId ? { ...g, ...updates } : g
				),
			}));
		};

		const handleNewMessage = ({ message, chatId }) => {
			if (!chatId || !message) return;
			const lastMessage = {
				_id: message._id,
				content: message.content,
				sender: message.sender,
				createdAt: message.createdAt,
				time: message.time,
			};
			const isCurrentlyOpen = selectedChatIdRef?.current === chatId;
			setActiveChats((prev) => {
				const list = prev.userChats || [];
				const index = list.findIndex((c) => c._id === chatId);
				if (index === -1) {
					fetchChats?.();
					return prev;
				}
				const chat = {
					...list[index],
					lastMessage,
					unreadCount: isCurrentlyOpen
						? (list[index].unreadCount ?? 0)
						: (list[index].unreadCount ?? 0) + 1,
				};
				const rest = list.filter((_, i) => i !== index);
				return { ...prev, userChats: [chat, ...rest] };
			});
		};

		const handleNewGroupMessage = ({ message, groupId }) => {
			if (!groupId || !message) return;
			const lastMessage = {
				_id: message._id,
				content: message.content,
				sender: message.sender,
				createdAt: message.createdAt,
				time: message.time,
			};
			const isCurrentlyOpen = selectedChatIdRef?.current === groupId;
			setActiveChats((prev) => {
				const list = prev.userGroups || [];
				const index = list.findIndex((g) => g._id === groupId);
				if (index === -1) return prev;
				const group = {
					...list[index],
					lastMessage,
					unreadCount: isCurrentlyOpen
						? (list[index].unreadCount ?? 0)
						: (list[index].unreadCount ?? 0) + 1,
				};
				const rest = list.filter((_, i) => i !== index);
				return { ...prev, userGroups: [group, ...rest] };
			});
		};

		socket.on("new_chat", handleNewChat);
		socket.on("new_group", handleNewGroup);
		socket.on("chat_updated", handleChatUpdated);
		socket.on("new_message", handleNewMessage);
		socket.on("message_notification", handleNewMessage);
		socket.on("new_group_message", handleNewGroupMessage);
		socket.on("group_message_notification", handleNewGroupMessage);

		return () => {
			socket.off("new_chat", handleNewChat);
			socket.off("new_group", handleNewGroup);
			socket.off("chat_updated", handleChatUpdated);
			socket.off("new_message", handleNewMessage);
			socket.off("message_notification", handleNewMessage);
			socket.off("new_group_message", handleNewGroupMessage);
			socket.off("group_message_notification", handleNewGroupMessage);
		};
	}, [socket, setActiveChats, fetchChats, selectedChatIdRef]);
};

export default useChatSocketSync;
