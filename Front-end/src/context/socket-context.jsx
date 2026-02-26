import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    useMemo,
} from 'react';
import io from 'socket.io-client';
import { useAuth } from './user-context.jsx';

const SocketConnectionContext = createContext();
const PresenceContext = createContext();

export const useSocketConnection = () => {
    const context = useContext(SocketConnectionContext);
    if (!context) {
        throw new Error('useSocketConnection must be used within a SocketProvider');
    }
    return context;
};

export const usePresence = () => {
    const context = useContext(PresenceContext);
    if (!context) {
        throw new Error('usePresence must be used within a SocketProvider');
    }
    return context;
};

export const useSocket = () => {
    const connection = useSocketConnection();
    const presence = usePresence();
    return { ...connection, ...presence };
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const [typingUsers, setTypingUsers] = useState(new Map());
    const { user } = useAuth();
    const userId = user?._id;

    useEffect(() => {
        if (!userId) {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
            return;
        }

        const newSocket = io('https://next-chatio.fly.dev', {
            withCredentials: true,

            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        newSocket.on('connect', () => {
            console.log('Connected to socket server');

    console.log('SOCKET CONNECTED - new connection'); // how many times does this fire?
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

        newSocket.on('user_connected', (id) => {
            console.log('User connected:', id);
            setOnlineUsers(prev => new Set([...prev, id]));
        });

        newSocket.on('user_disconnected', (id) => {
            console.log('User disconnected global:', id);
            setOnlineUsers(prev => {
                const updated = new Set(prev);
                updated.delete(id);
                return updated;
            });
        });
        newSocket.on('user_left_the_room', ([userId, roomId]) => {

            console.log(`User ${userId} left room ${roomId}`);

        })

        newSocket.on('user_typing', ({ userId: typingUserId, isTyping, chatId }) => {
            setTypingUsers(prev => {
                const updated = new Map(prev);
                if (isTyping) {
                    updated.set(chatId, typingUserId);
                } else {
                    updated.delete(chatId);
                }
                return updated;
            });
        });

        newSocket.on('message_read_by', ({ userId: readerId, messageId, chatId }) => {
            console.log(`Message ${messageId} read by ${readerId} in chat ${chatId}`);
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
    }, [userId]);

    const joinChat = useCallback((chatId) => {
        if (socket) {
            socket.emit('join_chat', { chatId });
        }
    }, [socket]);

    const leaveChat = useCallback((chatId) => {
        if (socket) {
            socket.emit('leave_chat', { chatId });
        }
    }, [socket]);

    const emitTyping = useCallback((chatId, isTyping) => {
        if (socket) {
            socket.emit('typing', { chatId, isTyping });
        }
    }, [socket]);

    const markMessageAsRead = useCallback((chatId, messageId) => {
        if (socket) {
            socket.emit('message_read', { chatId, messageId });
        }
    }, [socket]);

    const connectionValue = useMemo(
        () => ({
            socket,
            joinChat,
            leaveChat,
            emitTyping,
            markMessageAsRead,
        }),
        [socket, joinChat, leaveChat, emitTyping, markMessageAsRead]
    );

    const presenceValue = useMemo(
        () => ({
            onlineUsers,
            typingUsers,
            isOnline: (id) => onlineUsers.has(id),
            isTyping: (chatId) => typingUsers.has(chatId),
        }),
        [onlineUsers, typingUsers]
    );

    return (
        <SocketConnectionContext.Provider value={connectionValue}>
            <PresenceContext.Provider value={presenceValue}>
                {children}
            </PresenceContext.Provider>
        </SocketConnectionContext.Provider>
    );
};
