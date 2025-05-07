/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Sidebar.css";
import { useUser } from "../../context/user-context";
import { getChats, createNewChat, createNewGroup } from "../../api/message-api";
import { useSocket } from "../../context/socket-context";
import { convertImageToBase64 } from "../../utils/cloudinary";

const Sidebar = ({ onChatSelect }) => {
	const navigate = useNavigate();
	const { user, logout, users } = useUser();
	const [searchQuery, setSearchQuery] = useState("");
	const [loading, setLoading] = useState(true);
	const [showNewChatPopup, setShowNewChatPopup] = useState(false);
	const [popupMode, setPopupMode] = useState('chat'); // 'chat' | 'group'
	const [selectedUsers, setSelectedUsers] = useState([]);
	const [groupName, setGroupName] = useState('');
	const [groupImage, setGroupImage] = useState('');
	const [uploadingImage, setUploadingImage] = useState(false);
	const { socket } = useSocket();
	const [activeChats, setActiveChats] = useState({
		userChats: [],
		userGroups: [],
	});
	const [allChats, setAllChats] = useState([]);
	const [currentChat, setCurrentChat] = useState(null);

	const fetchChats = async () => {
		try {
			const response = await getChats();
			if (response.success) {
				setActiveChats(response.data.data);
                setLoading(false);
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
	}, [user, socket, navigate]);

	const handleSearch = (e) => {
		setSearchQuery(e.target.value);
	};

	const filteredChats = allChats.filter((chat) =>
		chat.members[1]?.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const handleLogout = () => {
		logout();
		navigate("/login");
	};

	useEffect(() => {
		const userChats = (activeChats.userChats || []).map((chat) => ({
			...chat,
			isGroup: false,
		}));
		const userGroups = (activeChats.userGroups || []).map((group) => ({
			...group,
			isGroup: true,
		}));
		setAllChats([...userChats, ...userGroups]);
	}, [activeChats]);

	const resetPopupState = () => {
        setPopupMode('chat');
        setSelectedUsers([]);
        setGroupName('');
        setGroupImage('');
        setShowNewChatPopup(false);
    };

    const handleCreateChat = async (targetUserId) => {
        try {
            const res = await createNewChat(targetUserId);
            if (res.success) {
                const newChat = res.data.data;
                // Update active chats state
                setActiveChats(prev => ({
                    ...prev,
                    userChats: [...prev.userChats, newChat],
                }));
                // Immediately select the new chat
                onChatSelect(newChat);
                resetPopupState();
            }
        } catch (error) {
            console.error('Create chat failed', error);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploadingImage(true);
        const result = await convertImageToBase64(file);
        setUploadingImage(false);
        if (result.success) {
            setGroupImage(result.url); // This is now a base64 string
        } else {
            alert('Image conversion failed: ' + result.error);
        }
    };

    const toggleSelectUser = (id) => {
        setSelectedUsers(prev => prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id]);
    };

    const handleCreateGroup = async () => {
        if (!groupName.trim() || selectedUsers.length === 0) {
            alert('Enter group name and select members');
            return;
        }
        try {
            const payload = { groupName: groupName.trim(), members: selectedUsers };
            if (groupImage) payload.groupImg = groupImage;
            const res = await createNewGroup(payload);
            if (res.success) {
                const newGroup = res.data.data;
                // Update active chats state with the new group
                setActiveChats(prev => ({
                    ...prev,
                    userGroups: [...prev.userGroups, newGroup],
                }));
                // Immediately select the new group
                onChatSelect(newGroup);
                resetPopupState();
            }
        } catch (error) {
            console.error('Create group failed', error);
        }
    };

	return (
		<div className="sidebar">
			<div className="sidebar-header">
				<div className="sidebar-profile">
					<div
						className="profile-info"
						onClick={() => navigate("/profile-picture")}>
						<img
							src={user?.profilePicture || "/default-avatar.svg"}
							alt="Profile"
							className="profile-pic"
						/>
						<div className="profile-text">
							<h3>{user?.fullName}</h3>
							<p>{user?.email}</p>
						</div>
					</div>
					<button onClick={handleLogout} className="logout-button">
						<i className="fas fa-sign-out-alt"></i>
					</button>
				</div>
				<div className="search-container">
					<i className="fas fa-search search-icon"></i>
					<input
						type="text"
						placeholder="Search chats..."
						value={searchQuery}
						onChange={handleSearch}
						className="search-input"
					/>
				</div>
			</div>

			<div className="chats-container">
				{loading ? (
					<div className="loading-chats">
						<i className="fas fa-spinner fa-spin"></i>
						<span>Loading chats...</span>
					</div>
				) : filteredChats.length > 0 ? (
					filteredChats.map((chat) => (
						<div
							key={chat._id}
							className="chat-item"
							onClick={() => onChatSelect(chat)}>
							<img
								src={
									chat.isGroup
										? chat.groupImg|| "/default-avatar.svg"
										: chat.members[1]?.profilePicture || "/default-avatar.svg"
								}
								alt={chat.groupName}
								className="chat-pic"
							/>
							<div className="chat-info">
								<h4>{chat.isGroup?chat.groupName:chat.members[1]?.fullName}</h4>
								<p className="last-message">{chat.lastMessage?.content || "No messages yet"}</p>
							</div>
						</div>
					))
				) : (
					<div className="no-chats">
						<i className="fas fa-comments"></i>
						<p>No chats found</p>
					</div>
				)}
			</div>

			<button
				className="new-chat-button"
				onClick={() => setShowNewChatPopup(true)}>
				<i className="fas fa-plus"></i>
				New Chat
			</button>

			{showNewChatPopup && (
                <div className="popup-overlay">
                    <div className="chat-popup">
                        <div className="mode-switch">
                            <button className={popupMode==='chat'?'active':''} onClick={() => setPopupMode('chat')}>Chat</button>
                            <button className={popupMode==='group'?'active':''} onClick={() => setPopupMode('group')}>Group</button>
                            <button className="close-button" onClick={resetPopupState}>&times;</button>
                        </div>

                        {popupMode === 'chat' && (
                            <div>
                                <h4>Select user</h4>
                                <div className="popup-body">
                                    {users.data.filter(u=>u._id!==user._id).map(u => (
                                        <div key={u._id} className="user-select-item chat-item" onClick={() => handleCreateChat(u._id)}>
                                            <img src={u.profilePicture || '/default-avatar.svg'} className="chat-pic" />
                                            <span>{u.fullName}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {popupMode === 'group' && (
                            <div>
                                <input
                                    type="text"
                                    placeholder="Group name"
                                    className="group-name-input"
                                    value={groupName}
                                    onChange={e=>setGroupName(e.target.value)}
                                />
                                <div className="file-upload-container">
                                    <label className="file-upload-label">
                                        <i className="fas fa-image"></i> Upload Group Image
                                        <input type="file" accept="image/*" onChange={handleImageUpload} style={{display: 'none'}} />
                                    </label>
                                </div>
                                {uploadingImage && <p>Uploading image...</p>}
                                {groupImage && <img src={groupImage} alt="group" style={{width:'60px',borderRadius:'8px',margin:'6px 0'}} />}
                                <h4>Select members</h4>
                                <div className="popup-body">
                                    {users.data.filter(u=>u._id!==user._id).map(u => (
                                        <label key={u._id} className="user-select-item chat-item" style={{display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)'}}>
                                            <input type="checkbox" checked={selectedUsers.includes(u._id)} onChange={()=>toggleSelectUser(u._id)} /> {u.fullName}
                                        </label>
                                    ))}
                                </div>
                                <div className="popup-actions">
                                    <button onClick={handleCreateGroup} className="new-chat-button" style={{margin:0}}>Create</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
		</div>
	);
};

export default Sidebar;
