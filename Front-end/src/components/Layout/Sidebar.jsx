/* eslint-disable react/prop-types */
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/user-context";
import {
	getChats,
	createNewChat,
	createNewGroup,
	markChatRead,
	markGroupRead,
} from "../../api/message-api";
import { useSocketConnection } from "../../context/socket-context";
import { convertImageToBase64 } from "../../utils/cloudinary";
import ChatList, { getChatDisplay } from "../common/ChatList";
import Profile from "../common/Profile";
import InputField from "../common/InputField";
import styles from "./Sidebar.module.css";

const Sidebar = ({ onChatSelect, selectedChat, isOpen, onClose }) => {
	const navigate = useNavigate();
	const { user, logout, users } = useUser();
	const [searchQuery, setSearchQuery] = useState("");
	const [loading, setLoading] = useState(true);
	const [showModal, setShowModal] = useState(false);
	const [popupMode, setPopupMode] = useState("chat");
	const [selectedUsers, setSelectedUsers] = useState([]);
	const [groupName, setGroupName] = useState("");
	const [groupImage, setGroupImage] = useState("");
	const [uploadingImage, setUploadingImage] = useState(false);
	const { socket } = useSocketConnection();
	const [activeChats, setActiveChats] = useState({
		userChats: [],
		userGroups: [],
	});
	const [allChats, setAllChats] = useState([]);
	const selectedChatIdRef = useRef(null);

	const userList = Array.isArray(users) ? users : users?.data ?? [];

	useEffect(() => {
		selectedChatIdRef.current = selectedChat?._id ?? null;
	}, [selectedChat?._id]);

	const fetchChats = async () => {
		try {
			const response = await getChats();
			if (response.success) {
				setActiveChats(response.data.data);
				setLoading(false);
			}
		} catch (err) {
			console.error("Failed to fetch chats:", err);
			setLoading(false);
		}
	};

	useEffect(() => {
		if (!user) {
			navigate("/login");
			return;
		}
		fetchChats();

		if (!socket) return;

		const handleNewChat = ({ chat }) => {
			setActiveChats((prev) => ({
				...prev,
				userChats: [...prev.userChats, chat],
			}));
		};
		const handleNewGroup = ({ group }) => {
			setActiveChats((prev) => ({
				...prev,
				userGroups: [...prev.userGroups, group],
			}));
		};
		const handleChatUpdated = ({ chatId, updates }) => {
			setActiveChats((prev) => ({
				userChats: prev.userChats.map((c) =>
					c._id === chatId ? { ...c, ...updates } : c
				),
				userGroups: prev.userGroups.map((g) =>
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
			const isCurrentlyOpen = selectedChatIdRef.current === chatId;
			setActiveChats((prev) => {
				const list = prev.userChats || [];
				const index = list.findIndex((c) => c._id === chatId);
				if (index === -1) {
					fetchChats();
					return prev;
				}
				const chat = {
					...list[index],
					lastMessage,
					unreadCount: isCurrentlyOpen
						? (prev.userChats[index].unreadCount ?? 0)
						: (prev.userChats[index].unreadCount ?? 0) + 1,
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
			const isCurrentlyOpen = selectedChatIdRef.current === groupId;
			setActiveChats((prev) => {
				const list = prev.userGroups || [];
				const index = list.findIndex((g) => g._id === groupId);
				if (index === -1) return prev;
				const group = {
					...list[index],
					lastMessage,
					unreadCount: isCurrentlyOpen
						? (prev.userGroups[index].unreadCount ?? 0)
						: (prev.userGroups[index].unreadCount ?? 0) + 1,
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
	}, [user, socket, navigate, loading]);

	useEffect(() => {
		const userChats = (activeChats.userChats || []).map((c) => ({
			...c,
			isGroup: false,
		}));
		const userGroups = (activeChats.userGroups || []).map((g) => ({
			...g,
			isGroup: true,
		}));
		const merged = [...userChats, ...userGroups];
		const getSortTime = (item) => {
			if (item.lastMessage?.createdAt)
				return new Date(item.lastMessage.createdAt).getTime();
			if (item.updatedAt) return new Date(item.updatedAt).getTime();
			return 0;
		};
		merged.sort((a, b) => getSortTime(b) - getSortTime(a));
		setAllChats(merged);
	}, [activeChats]);

	const filteredChats = allChats.filter((chat) => {
		const { name } = getChatDisplay(chat, user?._id);
		return name.toLowerCase().includes(searchQuery.toLowerCase().trim());
	});

	const handleSelectChat = async (chat) => {
		const id = chat._id;
		const isGroup = chat.isGroup;
		if ((chat.unreadCount ?? 0) > 0) {
			if (isGroup) {
				await markGroupRead(id);
			} else {
				await markChatRead(id);
			}
			setActiveChats((prev) => ({
				...prev,
				userChats: prev.userChats.map((c) =>
					c._id === id && !isGroup ? { ...c, unreadCount: 0 } : c
				),
				userGroups: prev.userGroups.map((g) =>
					g._id === id && isGroup ? { ...g, unreadCount: 0 } : g
				),
			}));
		}
		onChatSelect(chat);
	};

	const resetModal = () => {
		setPopupMode("chat");
		setSelectedUsers([]);
		setGroupName("");
		setGroupImage("");
		setShowModal(false);
	};

	const handleCreateChat = async (targetUserId) => {
		try {
			const res = await createNewChat(targetUserId);
			if (res.success) {
				const newChat = res.data.data;
				setActiveChats((prev) => ({
					...prev,
					userChats: [...prev.userChats, newChat],
				}));
				onChatSelect(newChat);
				resetModal();
			}
		} catch (err) {
			console.error("Create chat failed", err);
		}
	};

	const handleImageUpload = async (e) => {
		const file = e.target.files[0];
		if (!file) return;
		setUploadingImage(true);
		const result = await convertImageToBase64(file);
		setUploadingImage(false);
		if (result.success) setGroupImage(result.url);
		else alert("Image conversion failed: " + result.error);
	};

	const handleCreateGroup = async () => {
		if (!groupName.trim() || selectedUsers.length === 0) {
			alert("Enter group name and select at least one member.");
			return;
		}
		try {
			const payload = { groupName: groupName.trim(), members: selectedUsers };
			if (groupImage) payload.groupImg = groupImage;
			const res = await createNewGroup(payload);
			if (res.success) {
				const newGroup = res.data.data;
				setActiveChats((prev) => ({
					...prev,
					userGroups: [...prev.userGroups, newGroup],
				}));
				onChatSelect(newGroup);
				resetModal();
			}
		} catch (err) {
			console.error("Create group failed", err);
		}
	};

	return (
		<>
			<aside
				className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}
				aria-label="Chat list"
			>
				<div className={styles.header}>
					<Profile
						user={user}
						onProfileClick={() => navigate("/profile-picture")}
						onLogout={logout}
					/>
					<div className={styles.searchWrap}>
						<InputField
							type="search"
							value={searchQuery}
							onChange={setSearchQuery}
							placeholder="Search chats…"
							ariaLabel="Search chats"
							leadingIcon={<i className="fas fa-search" />}
							className={styles.searchInputBox}
						/>
					</div>
				</div>

				<div className={styles.chatsWrap}>
					<ChatList
						chats={filteredChats}
						selectedChatId={selectedChat?._id}
						onSelectChat={handleSelectChat}
						currentUserId={user?._id}
						loading={loading}
						emptyMessage="No chats yet. Start a new conversation."
					/>
				</div>

				<div className={styles.footer}>
					<button
						type="button"
						className={styles.newChatBtn}
						onClick={() => setShowModal(true)}
						aria-label="New chat or group"
					>
						<i className="fas fa-plus" aria-hidden />
						New chat
					</button>
				</div>
			</aside>

			{showModal && (
				<div
					className={styles.overlay}
					onClick={resetModal}
					onKeyDown={(e) => e.key === "Escape" && resetModal()}
					role="dialog"
					aria-modal="true"
					aria-labelledby="new-chat-title"
				>
					<div className={styles.modal} onClick={(e) => e.stopPropagation()}>
						<div className={styles.modalHeader}>
							<h2 id="new-chat-title" className={styles.modalTitle}>
								New conversation
							</h2>
							<button
								type="button"
								className={styles.modalClose}
								onClick={resetModal}
								aria-label="Close"
							>
								<i className="fas fa-times" />
							</button>
						</div>
						<div className={styles.tabs}>
							<button
								type="button"
								className={`${styles.tab} ${popupMode === "chat" ? styles.active : ""}`}
								onClick={() => setPopupMode("chat")}
								aria-pressed={popupMode === "chat"}
							>
								Chat
							</button>
							<button
								type="button"
								className={`${styles.tab} ${popupMode === "group" ? styles.active : ""}`}
								onClick={() => setPopupMode("group")}
								aria-pressed={popupMode === "group"}
							>
								Group
							</button>
						</div>
						<div className={styles.modalBody}>
							{popupMode === "chat" && (
								<>
									<p className={styles.sectionTitle}>Select a user</p>
									<div className={styles.userList}>
										{userList
											.filter((u) => u._id !== user?._id)
											.map((u) => (
												<button
													key={u._id}
													type="button"
													className={styles.userItem}
													onClick={() => handleCreateChat(u._id)}
												>
													<img
														src={u.profilePicture || "/default-avatar.svg"}
														alt=""
														loading="lazy"
													/>
													<span>{u.fullName}</span>
												</button>
											))}
									</div>
								</>
							)}
							{popupMode === "group" && (
								<div className={styles.groupForm}>
									<label className={styles.sectionTitle} htmlFor="group-name">
										Group name
									</label>
									<input
										id="group-name"
										type="text"
										placeholder="Group name"
										value={groupName}
										onChange={(e) => setGroupName(e.target.value)}
									/>
									<label className={styles.uploadLabel}>
										<i className="fas fa-image" />
										Upload group image
										<input
											type="file"
											accept="image/*"
											onChange={handleImageUpload}
											style={{ display: "none" }}
										/>
									</label>
									{uploadingImage && <p>Uploading…</p>}
									{groupImage && (
										<img
											src={groupImage}
											alt=""
											style={{
												width: 60,
												height: 60,
												objectFit: "cover",
												borderRadius: 8,
											}}
										/>
									)}
									<p className={styles.sectionTitle}>Select members</p>
									<div className={styles.checkboxList}>
										{userList
											.filter((u) => u._id !== user?._id)
											.map((u) => (
												<label key={u._id} className={styles.checkboxItem}>
													<input
														type="checkbox"
														checked={selectedUsers.includes(u._id)}
														onChange={() =>
															setSelectedUsers((prev) =>
																prev.includes(u._id)
																	? prev.filter((id) => id !== u._id)
																	: [...prev, u._id]
															)
														}
													/>
													<span>{u.fullName}</span>
												</label>
											))}
									</div>
								</div>
							)}
						</div>
						{popupMode === "group" && (
							<div className={styles.modalActions}>
								<button
									type="button"
									className={styles.createBtn}
									onClick={handleCreateGroup}
									disabled={!groupName.trim() || selectedUsers.length === 0}
								>
									Create group
								</button>
							</div>
						)}
					</div>
				</div>
			)}
		</>
	);
};

export default Sidebar;
