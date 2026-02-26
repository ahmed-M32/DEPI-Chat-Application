/* eslint-disable react/prop-types */
import React, { useMemo, useState } from "react";
import InputField from "../common/InputField";
import { convertImageToBase64 } from "../../utils/cloudinary";
import useUserSearch from "../../hooks/useUserSearch";
import styles from "./Sidebar.module.css";

const NewConversationModal = ({
	isOpen,
	onClose,
	currentUserId,
	userList,
	onCreateChat,
	onCreateGroup,
}) => {
	const [popupMode, setPopupMode] = useState("chat");
	const [userSearchQuery, setUserSearchQuery] = useState("");
	const [groupName, setGroupName] = useState("");
	const [selectedUsers, setSelectedUsers] = useState([]);
	const [groupImage, setGroupImage] = useState("");
	const [uploadingImage, setUploadingImage] = useState(false);

	const enabledSearch = isOpen && popupMode === "chat";
	const { results: userSearchResults, loading: userSearchLoading } = useUserSearch({
		query: userSearchQuery,
		limit: 10,
		enabled: enabledSearch,
		excludeUserId: currentUserId,
	});

	const resetAndClose = () => {
		setPopupMode("chat");
		setUserSearchQuery("");
		setGroupName("");
		setSelectedUsers([]);
		setGroupImage("");
		setUploadingImage(false);
		onClose?.();
	};

	const canCreateGroup = groupName.trim() && selectedUsers.length > 0;

	const handleCreateChatClick = async (userId) => {
		const ok = await onCreateChat?.(userId);
		if (ok) resetAndClose();
	};

	const handleImageUpload = async (e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		setUploadingImage(true);
		try {
			const result = await convertImageToBase64(file);
			if (result.success) setGroupImage(result.url);
			else alert("Image conversion failed: " + result.error);
		} finally {
			setUploadingImage(false);
		}
	};

	const handleCreateGroupClick = async () => {
		if (!canCreateGroup) {
			alert("Enter group name and select at least one member.");
			return;
		}
		const payload = { groupName: groupName.trim(), members: selectedUsers };
		if (groupImage) payload.groupImg = groupImage;
		const ok = await onCreateGroup?.(payload);
		if (ok) resetAndClose();
	};

	const groupMembersList = useMemo(() => {
		const list = Array.isArray(userList) ? userList : [];
		return list.filter((u) => u._id !== currentUserId);
	}, [userList, currentUserId]);

	if (!isOpen) return null;

	return (
		<div
			className={styles.overlay}
			onClick={resetAndClose}
			onKeyDown={(e) => e.key === "Escape" && resetAndClose()}
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
						onClick={resetAndClose}
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
							<p className={styles.sectionTitle}>Search by username</p>
							<InputField
								type="search"
								value={userSearchQuery}
								onChange={setUserSearchQuery}
								placeholder="Type a name…"
								ariaLabel="Search users"
								className={styles.searchInputBox}
								leadingIcon={<i className="fas fa-search" />}
							/>
							<div className={styles.userList}>
								{userSearchLoading && (
									<div className={styles.state} role="status" aria-live="polite">
										<span>Searching…</span>
									</div>
								)}
								{!userSearchLoading &&
									!userSearchResults.length &&
									userSearchQuery.trim() && (
										<div className={styles.state} role="status">
											<span>No users found</span>
										</div>
									)}
								{userSearchResults.map((u) => (
									<button
										key={u._id}
										type="button"
										className={styles.userItem}
										onClick={() => handleCreateChatClick(u._id)}
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
								{groupMembersList.map((u) => (
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
							onClick={handleCreateGroupClick}
							disabled={!canCreateGroup}
						>
							Create group
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default NewConversationModal;
