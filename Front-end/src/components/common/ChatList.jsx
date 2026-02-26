/* eslint-disable react/prop-types */
import React from "react";
import styles from "./ChatList.module.css";

/**
 * Get display name and avatar for a chat (direct or group).
 * Handles both populated members and raw IDs; current user is typically at index 0 from API.
 */
function getChatDisplay(chat, currentUserId) {
	const isGroup = chat.isGroup;
	if (isGroup) {
		return {
			name: chat.groupName || "Group",
			avatar: chat.groupImg || "/default-avatar.svg",
			alt: chat.groupName || "Group",
		};
	}
	const other = chat.members?.find(
		(m) => (m._id || m).toString() !== (currentUserId || "").toString()
	);
	const name = other?.fullName ?? "Unknown";
	const avatar = other?.profilePicture || "/default-avatar.svg";
	return { name, avatar, alt: name };
}

const ChatList = ({
	chats,
	selectedChatId,
	onSelectChat,
	currentUserId,
	loading,
	emptyMessage = "No chats yet",
	emptyIcon = "fa-comments",
}) => {
	if (loading) {
		return (
			<div className={styles.state} role="status" aria-live="polite">
				<span className={styles.spinner} aria-hidden />
				<span>Loading chats…</span>
			</div>
		);
	}

	if (!chats?.length) {
		return (
			<div className={styles.state} role="status">
				<i className={`fas ${emptyIcon} ${styles.emptyIcon}`} aria-hidden />
				<p>{emptyMessage}</p>
			</div>
		);
	}

	return (
		<ul className={styles.list} role="list">
			{chats.map((chat) => {
				const { name, avatar, alt } = getChatDisplay(chat, currentUserId);
				const isSelected = chat._id === selectedChatId;
				const lastMsg = chat.lastMessage?.content || "No messages yet";
				const unreadCount = chat.unreadCount ?? 0;
				const hasUnread = unreadCount > 0;

				return (
					<li key={chat._id} className={styles.item}>
						<button
							type="button"
							className={`${styles.card} ${isSelected ? styles.active : ""} ${
								hasUnread ? styles.unread : ""
							}`}
							onClick={() => onSelectChat(chat)}
							aria-pressed={isSelected}
							aria-label={`Chat with ${name}${hasUnread ? `, ${unreadCount} unread` : ""}. Last message: ${lastMsg}`}
						>
							<img
								src={avatar}
								alt=""
								className={styles.avatar}
								loading="lazy"
								decoding="async"
								width={48}
								height={48}
							/>
							<div className={styles.info}>
								<span className={styles.name}>{name}</span>
								<span className={styles.preview}>{lastMsg}</span>
							</div>
							{hasUnread && (
								<span className={styles.badge} aria-hidden>
									{unreadCount > 99 ? "99+" : unreadCount}
								</span>
							)}
						</button>
					</li>
				);
			})}
		</ul>
	);
};

export default ChatList;
export { getChatDisplay };
