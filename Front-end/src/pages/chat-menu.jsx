/* eslint-disable react/jsx-key */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
	createNewChat,
	createNewGroup,
	getChats,
} from "../api/message-api.jsx";
import { useUsers } from "../context/user-context.jsx";

const Chats = () => {
	const [chatList, setChatList] = useState([]);
	const [groupList, setGroupList] = useState([]);
	const [modal, setModal] = useState(false);
	const [groupModal, setGroupModal] = useState(false);
	const [selectedUser, setSelectedUser] = useState(null);
	const [groupName, setGroupName] = useState("");
	const [groupImg, setGroupImg] = useState("");
	const [selectedUsers, setSelectedUsers] = useState([]);

	const users = useUsers().users;

	useEffect(() => {
		const fetchChats = async () => {
			try {
				const result = await getChats();
				setChatList(result.data.userChats);
				setGroupList(result.data.userGroups);
				console.log(result);
			} catch (error) {
				console.error("Error fetching users:", error);
			}
		};

		fetchChats();
	}, []);

	// --- Chat Modal Handlers ---
	const openModal = () => setModal(true);
	const closeModal = () => setModal(false);

	// --- Group Modal Handlers ---
	const openGroupModal = () => setGroupModal(true);
	const closeGroupModal = () => setGroupModal(false);

	const handleUserSelect = async (user) => {
		setSelectedUser(user);
		setModal(false);
		const newChat = await createNewChat(user._id);
		if (newChat.success) {
			console.log("chat created");
		}
	};

	const toggleUserSelect = (userId) => {
		if (selectedUsers.includes(userId)) {
			setSelectedUsers(selectedUsers.filter((id) => id !== userId));
		} else {
			setSelectedUsers([...selectedUsers, userId]);
		}
	};

	const handleGroupCreate = async () => {
		if (!groupName.trim() || selectedUsers.length === 0) {
			alert("Please enter a group name and select at least one user.");
			return;
		}
		selectedUsers = []

		const data = {
			groupName,
			groupImg,
			members: selectedUsers,
		};
		console.log(data);
		

		const newGroup = await createNewGroup(data);

		if (newGroup.success) {
			console.log("created new group");
		}
		// Reset state
		setGroupName("");
		setGroupImg("");
		setSelectedUsers([]);
		setGroupModal(false);
	};

	return (
		<div className="chat-page">
			{modal && (
				<div className="modal-list">
					<div>
						{users.map((user) => (
							<div
								className="modal-user"
								onClick={() => handleUserSelect(user)}>
								{user.fullName}
							</div>
						))}
					</div>
					<button className="close" onClick={closeModal}>
						close
					</button>
				</div>
			)}

			{groupModal && (
				<div className="modal-list">
					<h3>Create Group</h3>
					<input
						type="text"
						placeholder="Group Name *"
						value={groupName}
						onChange={(e) => setGroupName(e.target.value)}
					/>
					<input
						type="text"
						placeholder="Image URL (optional)"
						value={groupImg}
						onChange={(e) => setGroupImg(e.target.value)}
					/>
					<div className="user-list">
						{users.map((user) => (
							<label key={user._id}>
								<input
									type="checkbox"
									checked={selectedUsers.includes(user._id)}
									onChange={() => toggleUserSelect(user._id)}
								/>
								{user.fullName}
							</label>
						))}
					</div>
					<button onClick={handleGroupCreate}>Create Group</button>
					<button className="close" onClick={closeGroupModal}>
						Close
					</button>
				</div>
			)}

			{/* Buttons */}
			<div className="new-chat">
				<button onClick={openModal}>Add Chat</button>
				<button onClick={openGroupModal}>Create Group</button>
			</div>

			{/* Chat List */}
			<div className="chats">
				<h3>Chats</h3>
				{chatList.map((chat) => (
					<div className="chat">
						<div className="profPic">
							{chat.members[1].profilePicture ? (
								<div className="u-img"></div>
							) : (
								<img src="imgs/people.png" width="70px" alt="" />
							)}
						</div>
						<div className="username">{chat.members[1].fullName}</div>
					</div>
				))}
			</div>

			{/* Group List */}
			<div className="groups">
				<h3>Groups</h3>
				{groupList.map((group) => (
					<div className="group">
						<div className="profPic">
							{group.groupImg ? (
								<img src={group.groupImg} width="70px" alt="Group" />
							) : (
								<img src="imgs/people.png" width="70px" alt="Group" />
							)}
						</div>
						<div className="group-name">{group.groupName}</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default Chats;
