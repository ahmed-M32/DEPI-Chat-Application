import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useUser } from './user-context.jsx';

const SocketContext = createContext();

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const [typingUsers, setTypingUsers] = useState(new Map());
    const { user, token } = useUser();

    useEffect(() => {
        if (!user || !token) {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
            return;
        }

        // Initialize socket connection
        const newSocket = io('https://depi-back-production-fb68.up.railway.app/', {
            // Socket.io will automatically include cookies when withCredentials is true
            withCredentials: true,
            // Also include token in auth parameter as a fallback
            auth: {
                token: `Bearer ${token}`
            },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        // Socket event handlers
        newSocket.on('connect', () => {
            console.log('Connected to socket server');
        });

        newSocket.on('disconnect', () => {
            console.log('Disconnected from socket server');
            setOnlineUsers(new Set());
            setTypingUsers(new Map());
        });

        newSocket.on('users_online', (users) => {
            console.log('Users online:', users);
            setOnlineUsers(new Set(users));
        });

        newSocket.on('user_connected', (userId) => {
            console.log('User connected:', userId);
            setOnlineUsers(prev => new Set([...prev, userId]));
        });

        newSocket.on('user_disconnected', (userId) => {
            console.log('User disconnected:', userId);
            setOnlineUsers(prev => {
                const updated = new Set(prev);
                updated.delete(userId);
                return updated;
            });
        });

        newSocket.on('user_typing', ({ userId, isTyping, chatId }) => {
            setTypingUsers(prev => {
                const updated = new Map(prev);
                if (isTyping) {
                    updated.set(chatId, userId);
                } else {
                    updated.delete(chatId);
                }
                return updated;
            });
        });

        newSocket.on('message_read_by', ({ userId, messageId, chatId }) => {
            // Handle message read status
            console.log(`Message ${messageId} read by ${userId} in chat ${chatId}`);
        });

        newSocket.on('connect_error', (error) => {
            console.error('Socket connection error:', error.message);
            if (error.message === 'Authentication error') {
                console.log('Socket authentication failed');
            }
        });

        setSocket(newSocket);

        return () => {
            if (newSocket) {
                newSocket.disconnect();
                setSocket(null);
            }
        };
    }, [user, token]);

    const joinChat = (chatId) => {
        if (socket) {
            socket.emit('join_chat', { chatId });
        }
    };

    const leaveChat = (chatId) => {
        if (socket) {
            socket.emit('leave_chat', { chatId });
        }
    };

    const emitTyping = (chatId, isTyping) => {
        if (socket) {
            socket.emit('typing', { chatId, isTyping });
        }
    };

    const markMessageAsRead = (chatId, messageId) => {
        if (socket) {
            socket.emit('message_read', { chatId, messageId });
        }
    };

    const value = {
        socket,
        onlineUsers,
        typingUsers,
        joinChat,
        leaveChat,
        emitTyping,
        markMessageAsRead,
        isOnline: (userId) => onlineUsers.has(userId),
        isTyping: (chatId) => typingUsers.has(chatId)
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};
