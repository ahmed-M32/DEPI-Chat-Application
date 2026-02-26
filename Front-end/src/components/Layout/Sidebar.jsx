/* eslint-disable react/prop-types */
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/user-context";
import {
	createNewChat,
	createNewGroup,
	markChatRead,
	markGroupRead,
} from "../../api/message-api";
import { useSocketConnection } from "../../context/socket-context";
import useChatsData from "../../hooks/useChatsData";
import useChatSocketSync from "../../hooks/useChatSocketSync";
import useMergedChats from "../../hooks/useMergedChats";
import ChatList, { getChatDisplay } from "../common/ChatList";
import Profile from "../common/Profile";
import InputField from "../common/InputField";
import NewConversationModal from "./NewConversationModal";
import styles from "./Sidebar.module.css";

const Sidebar = ({ onChatSelect, selectedChat, isOpen, onClose }) => {
	const navigate = useNavigate();
	const { user, logout, users } = useUser();
	const [searchQuery, setSearchQuery] = useState("");
	const [showModal, setShowModal] = useState(false);
	const { socket } = useSocketConnection();
	const { activeChats, setActiveChats, loading, fetchChats } = useChatsData();
	const selectedChatIdRef = useRef(null);

	const userList = Array.isArray(users) ? users : users?.data ?? [];

	useEffect(() => {
		selectedChatIdRef.current = selectedChat?._id ?? null;
	}, [selectedChat?._id]);

	useEffect(() => {
		if (!user) {
			navigate("/login");
			return;
		}
		fetchChats();
	}, [user, navigate, fetchChats]);

	useChatSocketSync({
		socket,
		setActiveChats,
		fetchChats,
		selectedChatIdRef,
	});

	const allChats = useMergedChats(activeChats);

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

	const closeModal = () => setShowModal(false);

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
				closeModal();
				return true;
			}
		} catch (err) {
			console.error("Create chat failed", err);
		}
		return false;
	};

	const handleCreateGroup = async (payload) => {
		try {
			const res = await createNewGroup(payload);
			if (res.success) {
				const newGroup = res.data.data;
				setActiveChats((prev) => ({
					...prev,
					userGroups: [...prev.userGroups, newGroup],
				}));
				onChatSelect(newGroup);
				closeModal();
				return true;
			}
		} catch (err) {
			console.error("Create group failed", err);
		}
		return false;
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

			<NewConversationModal
				isOpen={showModal}
				onClose={closeModal}
				currentUserId={user?._id}
				userList={userList}
				onCreateChat={handleCreateChat}
				onCreateGroup={handleCreateGroup}
			/>
		</>
	);
};

export default Sidebar;
