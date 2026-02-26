/* eslint-disable react/prop-types */
import React, { useState, useEffect, useRef } from "react";
import { useSocket } from "../../context/socket-context";
import { getChatDisplay } from "../common/ChatList";
import Message from "./Message";
import styles from "./ChatWindow.module.css";
import {
    sendMessage,
    sendGroupMessage,
    getMessages,
    markChatRead,
    markGroupRead
} from "../../api/message-api";
import { convertImageToBase64 } from "../../utils/cloudinary";

const ChatWindow = ({ chat, currentUser, toggleSidebar }) => {
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
            if (chat.isGroup) {
                markGroupRead(chat?._id);
            } else {
                markChatRead(chat?._id);
            }
        }
        return () => {
            if (chat?._id) leaveChat(chat._id);
        };
    }, [chat?._id, joinChat, leaveChat]);

    useEffect(() => {
        if (!socket) return;
        const handleNewMessage = ({ message, chatId }) => {
            if (chatId === chat?._id) setMessages((prev) => [...prev, message]);
        };
        const handleNewGroupMessage = ({ message, groupId }) => {
            if (chat?.isGroup && groupId === chat?._id)
                setMessages((prev) => [...prev, message]);
        };

        markChatRead(chat?._id); // ✅ auto-mark read when message arrives and you're here
        socket.on("new_message", handleNewMessage);
        socket.on("new_group_message", handleNewGroupMessage);
        return () => {
            socket.off("new_message", handleNewMessage);
            socket.off("new_group_message", handleNewGroupMessage);
        };
    }, [socket, chat?._id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const loadMessages = async () => {
        if (!chat?._id) return;
        try {
            setLoading(true);
            const response = await getMessages(chat._id);
            if (response.success)
                setMessages(response.data.data.messages || []);
        } catch (err) {
            console.error("Error loading messages:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setNewMessage(e.target.value);
        if (!chat?._id) return;
        emitTyping(chat._id, true);
        if (typingTimeout.current) clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => emitTyping(chat._id, false), 1500);
    };

    const handleImageSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploadingImage(true);
        try {
            const result = await convertImageToBase64(file);
            if (result.success) {
                setSelectedImage(result.url);
                if (fileInputRef.current) fileInputRef.current.value = "";
            } else {
                alert("Failed to process image: " + (result.error || ""));
            }
        } catch (err) {
            console.error("Error processing image:", err);
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
            if (newMessage.trim()) payload.content = newMessage.trim();
            if (selectedImage) payload.image = selectedImage;

            let response;
            if (chat.isGroup) {
                response = await sendGroupMessage(chat._id, payload);
            } else {
                const otherMember = chat.isGroup
                    ? null
                    : chat.members?.find(
                        (m) => (m._id || m).toString() !== currentUser._id?.toString()
                    );
                const otherMemberId = otherMember?._id?.toString() || otherMember?.toString(); const receiver = otherMember ? (otherMember._id || otherMember) : null;
                if (!receiver) {
                    alert("Cannot send: receiver unknown");
                    return;
                }
                response = await sendMessage(chat._id, { ...payload, receiver });
            }
            if (response.success) {
                setNewMessage("");
                setSelectedImage(null);
            }
        } catch (err) {
            console.error("Error sending message:", err);
            alert("Failed to send message");
        }
    };

    const getTypingIndicator = () => {
        if (!chat?.isGroup && isTyping(chat?._id)) {
            const typingUserId = typingUsers.get(chat._id);
            const typingUser = chat.members?.find(
                (m) => (m._id || m).toString() === typingUserId
            );
            return typingUser?.fullName
                ? `${typingUser.fullName} is typing…`
                : "Someone is typing…";
        }
        return null;
    };

    if (!chat) {
        return (
            <div className={`${styles.window} ${styles.empty}`} aria-label="No chat selected">
                <i className={`fas fa-comments ${styles.emptyIcon}`} aria-hidden />
                <h2>Select a chat</h2>
                <p>Choose a conversation from the list or start a new one.</p>
            </div>
        );
    }

    const { name, avatar } = getChatDisplay(chat, currentUser?._id);
    const otherMemberId = chat.isGroup
        ? null
        : chat.members?.find(
            (m) => (m._id || m).toString() !== currentUser._id?.toString()
        )?._id || chat.members?.find(
            (m) => (m._id || m).toString() !== currentUser._id?.toString()
        );

    return (
        <div className={styles.window}>
            <header className={styles.header}>
                {toggleSidebar && (
                    <button
                        type="button"
                        className={styles.sidebarToggle}
                        onClick={toggleSidebar}
                        aria-label="Open menu"
                    >
                        <i className="fas fa-bars" aria-hidden />
                    </button>
                )}
                <div className={styles.headerInfo}>
                    <img
                        src={avatar}
                        alt=""
                        className={styles.avatar}
                        loading="lazy"
                        decoding="async"
                    />
                    <div className={styles.headerText}>
                        <h2>{name}</h2>
                        {!chat.isGroup && (
                            <span
                                className={`${styles.status} ${otherMemberId && isOnline(otherMemberId)
                                    ? styles.online
                                    : styles.offline
                                    }`}
                            >
                                <i className="fas fa-circle" aria-hidden />
                                {otherMemberId && isOnline(otherMemberId) ? "Online" : "Offline"}
                            </span>
                        )}
                        {chat.isGroup && (
                            <span className={styles.membersCount}>
                                {chat.members?.length ?? 0} members
                            </span>
                        )}
                    </div>
                </div>
                <div className={styles.actions}>
                    <button type="button" className={styles.iconBtn} aria-label="Video call">
                        <i className="fas fa-video" aria-hidden />
                    </button>
                    <button type="button" className={styles.iconBtn} aria-label="Voice call">
                        <i className="fas fa-phone" aria-hidden />
                    </button>
                    <button type="button" className={styles.iconBtn} aria-label="More options">
                        <i className="fas fa-ellipsis-v" aria-hidden />
                    </button>
                </div>
            </header>

            <div className={styles.messagesArea}>
                {loading ? (
                    <div className={styles.loading} role="status" aria-live="polite">
                        <div data-spinner aria-hidden />
                        <span>Loading messages…</span>
                    </div>
                ) : (
                    <>
                        {messages.map((message) => (
                            <Message
                                key={message._id}
                                message={message}
                                isOwnMessage={
                                    (message.sender?._id || message.sender) === currentUser._id
                                }
                                sender={message.sender}
                            />
                        ))}
                        {getTypingIndicator() && (
                            <div className={styles.typingRow} aria-live="polite">
                                <span className={styles.typingDot} aria-hidden />
                                <span className={styles.typingDot} aria-hidden />
                                <span className={styles.typingDot} aria-hidden />
                                <span className={styles.typingText}>{getTypingIndicator()}</span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {selectedImage && (
                <div className={styles.imagePreview}>
                    <img
                        src={selectedImage}
                        alt="Preview"
                        loading="lazy"
                        decoding="async"
                    />
                    <button
                        type="button"
                        className={styles.iconBtn}
                        onClick={() => setSelectedImage(null)}
                        aria-label="Remove image"
                    >
                        <i className="fas fa-times" aria-hidden />
                    </button>
                </div>
            )}

            <form className={styles.inputRow} onSubmit={handleSend}>
                <div className={styles.inputWrap}>
                    <button
                        type="button"
                        className={styles.iconBtn}
                        aria-label="Emoji"
                        title="Emoji"
                    >
                        <i className="fas fa-smile" aria-hidden />
                    </button>
                    <button
                        type="button"
                        className={styles.iconBtn}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        aria-label="Attach image"
                        title="Attach image"
                    >
                        <i
                            className={`fas ${uploadingImage ? "fa-spinner fa-spin" : "fa-image"}`}
                            aria-hidden
                        />
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageSelect}
                        accept="image/*"
                        style={{ display: "none" }}
                        aria-hidden
                    />
                    <input
                        type="text"
                        value={newMessage}
                        onChange={handleInputChange}
                        placeholder="Type a message…"
                        className={styles.textInput}
                        disabled={uploadingImage}
                        aria-label="Message"
                    />
                </div>
                <button
                    type="submit"
                    className={styles.sendBtn}
                    disabled={
                        (!newMessage.trim() && !selectedImage) || uploadingImage
                    }
                    aria-label="Send message"
                >
                    <i className="fas fa-paper-plane" aria-hidden />
                </button>
            </form>
        </div>
    );
};

export default ChatWindow;
