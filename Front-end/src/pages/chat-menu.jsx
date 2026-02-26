import React from "react";
import { useUser } from "../context/user-context.jsx";
import ChatWindow from "../components/Chat/ChatWindow.jsx";

const Chats = ({ selectedChat, toggleSidebar }) => {
	const { user } = useUser();

	return (
		<ChatWindow
			chat={selectedChat ?? null}
			currentUser={user}
			toggleSidebar={toggleSidebar}
		/>
	);
};

export default Chats;
