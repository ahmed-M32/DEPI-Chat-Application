/* eslint-disable react/jsx-key */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { createNewChat, getChats } from "../api/message-api.jsx";
import { useUsers } from "../context/user-context.jsx";

const Chats = () => {
	const [chatList, setChatList] = useState([]);
	const [modal, setModal] = useState(false);
	const [selectedUser, setSelectedUser] = useState(null);
	const users = useUsers();

	useEffect(() => {
		const fetchChats = async () => {
			try {
				const result = await getChats();
				setChatList(result.data);
				console.log(result);
			} catch (error) {
				console.error("Error fetching users:", error);
			}
		};

		fetchChats();
	}, []);
	const openModal = () => {
		setModal(true);
	};
	const closeModal = () => {
		setModal(false);
	};
	const handleUserSelect = async (user) => {
		setSelectedUser(user);
		setModal(false);
		console.log(user);
		const newChat = await createNewChat(user._id);
		if(newChat.success){
			console.log("chat created");
			
		}
		console.log(`Start chat with: ${user.fullName}`);
	};

	return (
		<div className="chat-page">
			<div className="modal">
				{modal && (
					<div className="modal-list">
						<div>
							{users.map((user) => {
								return (
									<div
										className="modal-user"
										onClick={() => handleUserSelect(user)}>
										{user.fullName}
									</div>
								);
							})}
						</div>
						<button className="close" onClick={closeModal}>
							close
						</button>
					</div>
				)}
				{selectedUser && <p>Chat with: {selectedUser.fullName}</p>}
			</div>
			<div className="new-chat">
				<button onClick={openModal}>add chat</button>
			</div>
			<div className="chats">chats</div>
		</div>
	);
};

export default Chats;
