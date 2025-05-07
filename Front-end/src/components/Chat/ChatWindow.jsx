/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import { useSocket } from "../../context/socket-context";
import Message from "./Message";
import "./ChatWindow.css";
import {
	sendMessage,
	sendGroupMessage,
	getMessages,
} from "../../api/message-api";
import { convertImageToBase64 } from "../../utils/cloudinary";

const ChatWindow = ({ chat, currentUser }) => {
	const [messages, setMessages] = useState([]);
	const [newMessage, setNewMessage] = useState("");
	const [loading, setLoading] = useState(false);
	const [selectedImage, setSelectedImage] = useState(null);
	const [uploadingImage, setUploadingImage] = useState(false);
	const messagesEndRef = useRef(null);
	const typingTimeout = useRef(null);
	const fileInputRef = useRef(null);
	const {
		socket,
		joinChat,
		leaveChat,
		emitTyping,
		isOnline,
		isTyping,
		typingUsers,
	} = useSocket();

	useEffect(() => {
		if (chat?._id) {
			loadMessages();
			joinChat(chat._id);
		}

		return () => {
			if (chat?._id) {
				leaveChat(chat._id);
			}
		};
	}, [chat?._id]);

	useEffect(() => {
		if (socket) {
			const handleNewMessage = ({ message, chatId }) => {
				if (chatId === chat?._id) {
					setMessages((prev) => [...prev, message]);
				}
			};

			const handleNewGroupMessage = ({ message, groupId }) => {
				if (chat?.isGroup && groupId === chat?._id) {
					setMessages((prev) => [...prev, message]);
				}
			};

			socket.on("new_message", handleNewMessage);
			socket.on("new_group_message", handleNewGroupMessage);

			return () => {
				socket.off("new_message", handleNewMessage);
				socket.off("new_group_message", handleNewGroupMessage);
			};
		}
	}, [socket, chat?._id]);

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	const loadMessages = async () => {
		try {
			setLoading(true);
			const response = await getMessages(chat._id);
			if (response.success) {
				setMessages(response.data.data.messages);
			}
		} catch (error) {
			console.error("Error loading messages:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleInputChange = (e) => {
		setNewMessage(e.target.value);
		if (!chat?._id) return;

		emitTyping(chat._id, true);

		if (typingTimeout.current) clearTimeout(typingTimeout.current);
		typingTimeout.current = setTimeout(() => {
			emitTyping(chat._id, false);
		}, 1500);
	};

	const handleImageSelect = async (e) => {
		const file = e.target.files[0];
		if (!file) return;

		setUploadingImage(true);
		try {
			const result = await convertImageToBase64(file);
			if (result.success) {
				setSelectedImage(result.url); // just store, don't send
				if (fileInputRef.current) fileInputRef.current.value = "";
			} else {
				console.error("Image conversion failed:", result.error);
				alert("Failed to process image: " + result.error);
			}
		} catch (error) {
			console.error("Error processing image:", error);
			alert("Error uploading image");
		} finally {
			setUploadingImage(false);
		}
	};

	const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() && !selectedImage) return;
    
        try {
            const payload = {};
            
            // Only include content if it exists
            if (newMessage.trim()) {
                payload.content = newMessage.trim();
            }
    
            if (selectedImage) {
                payload.image = selectedImage;
            }
    
            let response;
    
            if (chat.isGroup) {
                response = await sendGroupMessage(chat._id, payload);
            } else {
                response = await sendMessage(chat._id, {
                    ...payload,
                    receiver: chat.members[1]._id,
                });
            }
    
            if (response.success) {
                setNewMessage("");
                setSelectedImage(null);
            }
        } catch (error) {
            console.error("Error sending message:", error);
            alert("Failed to send message");
        }
    };
	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	if (!chat) {
		return (
			<div className="chat-window empty-chat">
				<i className="fas fa-comments"></i>
				<h2>Select a chat to start messaging</h2>
			</div>
		);
	}

	const getTypingIndicator = () => {
		if (!chat.isGroup && isTyping(chat._id)) {
			const typingUserId = typingUsers.get(chat._id);
			const typingUser = chat.members.find((m) => m._id === typingUserId);
			return typingUser
				? `${typingUser.fullName} is typing...`
				: "Someone is typing...";
		}
		return null;
	};

	return (
		<div className="chat-window">
			<div className="chat-header">
				<div className="chat-info">
					<img
						src={
							chat.isGroup
								? chat.groupImg || "/default-avatar.svg"
								: chat.members[1]?.profilePicture || "/default-avatar.svg"
						}
						alt={chat.isGroup ? chat.groupName : chat.members[1]?.fullName}
						className="chat-avatar"
					/>
					<div className="chat-header-text">
						<h3>{chat.isGroup ? chat.groupName : chat.members[1]?.fullName}</h3>
						{!chat.isGroup && (
							<span
								className={`chat-status ${
									isOnline(chat.members[1]?._id) ? "online" : "offline"
								}`}>
								<i className="fas fa-circle"></i>
								{isOnline(chat.members[1]?._id) ? "Online" : "Offline"}
							</span>
						)}
						{chat.isGroup && (
							<span className="chat-members-count">
								{chat.members.length} members
							</span>
						)}
					</div>
				</div>
				<div className="chat-actions">
					<button className="icon-button">
						<i className="fas fa-video"></i>
					</button>
					<button className="icon-button">
						<i className="fas fa-phone"></i>
					</button>
					<button className="icon-button">
						<i className="fas fa-ellipsis-v"></i>
					</button>
				</div>
			</div>

			<div className="messages-container">
				{loading ? (
					<div className="loading">
						<i className="fas fa-spinner fa-spin"></i>
						<span>Loading messages...</span>
					</div>
				) : (
					messages.map((message) => (
						<Message
							key={message._id}
							message={message}
							isOwnMessage={message.sender._id === currentUser._id}
							sender={message.sender}
						/>
					))
				)}
				{getTypingIndicator() && (
					<div className="typing-indicator">
						<div className="typing-dot"></div>
						<div className="typing-dot"></div>
						<div className="typing-dot"></div>
						<span className="typing-text">{getTypingIndicator()}</span>
					</div>
				)}
				<div ref={messagesEndRef} />
			</div>
			{selectedImage && (
				<div className="image-preview">
					<img
						src={selectedImage}
						alt="Preview"
						style={{ maxHeight: "150px", marginBottom: "10px" }}
					/>
					<button
						type="button"
						className="icon-button"
						onClick={() => setSelectedImage(null)}
						title="Remove image">
						<i className="fas fa-times"></i>
					</button>
				</div>
			)}

			<form className="message-input-container" onSubmit={handleSend}>
				<button type="button" className="icon-button">
					<i className="fas fa-smile"></i>
				</button>
				<button
					type="button"
					className="icon-button"
					onClick={() => fileInputRef.current.click()}
					disabled={uploadingImage}
					title="Upload image">
					<i
						className={`fas ${
							uploadingImage ? "fa-spinner fa-spin" : "fa-image"
						}`}></i>
				</button>
				<input
					type="file"
					ref={fileInputRef}
					onChange={handleImageSelect}
					accept="image/*"
					style={{ display: "none" }}
				/>
				<input
					type="text"
					value={newMessage}
					onChange={handleInputChange}
					placeholder="Type a message..."
					className="message-input"
					disabled={uploadingImage}
				/>
				<button
					type="submit"
					className="send-button"
					disabled={(!newMessage.trim() && !selectedImage) || uploadingImage}>
					<i className="fas fa-paper-plane send"></i>
				</button>
			</form>
		</div>
	);
};

export default ChatWindow;
