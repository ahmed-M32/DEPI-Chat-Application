/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getChats } from "../api/message-api.jsx";
import { useUser } from "../context/user-context.jsx";
import { useSocket } from "../context/socket-context.jsx";
import ChatWindow from "../components/Chat/ChatWindow.jsx";
import "./chat-menu.css";

const Chats = ({ selectedChat }) => {
	const navigate = useNavigate();
	const { user } = useUser();
	const { socket } = useSocket();
	const [activeChats, setActiveChats] = useState({
		userChats: [],
		userGroups: [],
	});

	const fetchChats = async () => {
		try {
			const response = await getChats();
			if (response.success) {
				setActiveChats(response.data.data);
			}
		} catch (error) {
			console.error("Failed to fetch chats:", error);
		}
	};

	useEffect(() => {
		if (!user) {
			navigate("/login");
			return;
		}

		fetchChats();

		if (socket) {
			socket.on("new_chat", ({ chat }) => {
				setActiveChats((prev) => ({
					...prev,
					userChats: [...prev.userChats, chat],
				}));
			});

			socket.on("new_group", ({ group }) => {
				setActiveChats((prev) => ({
					...prev,
					userGroups: [...prev.userGroups, group],
				}));
			});

			socket.on("chat_updated", ({ chatId, updates }) => {
				setActiveChats((prev) => ({
					userChats: prev.userChats.map((chat) =>
						chat._id === chatId ? { ...chat, ...updates } : chat
					),
					userGroups: prev.userGroups.map((group) =>
						group._id === chatId ? { ...group, ...updates } : group
					),
				}));
			});
		}

		return () => {
			if (socket) {
				socket.off("new_chat");
				socket.off("new_group");
				socket.off("chat_updated");
			}
		};
	}, [user, socket]);

	return (
		<>
			{selectedChat ? (
				<ChatWindow chat={selectedChat} currentUser={user} />
			) : (
				<div className="no-chat-selected">
					<h2>Select a chat to start messaging</h2>
				</div>
			)}
		</>
	);
};

export default Chats;
