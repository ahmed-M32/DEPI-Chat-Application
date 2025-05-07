import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io;
const onlineUsers = new Map(); // Store online users with their socket IDs

export const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"],
            credentials: true
        },
        transports: ['websocket', 'polling']
    });

    io.use((socket, next) => {
        try {
            // Try to get token from auth header first
            let token = socket.handshake.auth.token;
            if (token && token.startsWith('Bearer ')) {
                token = token.slice(7);
            }

            // If no token in auth header, try cookies
            if (!token && socket.handshake.headers.cookie) {
                const cookies = socket.handshake.headers.cookie.split(';')
                    .map(cookie => cookie.trim())
                    .reduce((acc, cookie) => {
                        const [key, value] = cookie.split('=');
                        acc[key] = value;
                        return acc;
                    }, {});
                token = cookies.jwt;
            }

            if (!token) {
                return next(new Error('Authentication error: No token provided'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (!decoded || !decoded.userId) {
                return next(new Error('Authentication error: Invalid token'));
            }

            socket.userId = decoded.userId;
            next();
        } catch (error) {
            console.error('Socket authentication error:', error.message);
            return next(new Error('Authentication error: ' + error.message));
        }
    });

    io.on('connection', (socket) => {
        console.log('User connected:', socket.userId);
        
        // Add user to online users
        onlineUsers.set(socket.userId, socket.id);
        
        // Notify others that user is online
        socket.broadcast.emit('user_connected', socket.userId);
        
        // Send list of online users to the newly connected user
        socket.emit('users_online', Array.from(onlineUsers.keys()));

        // Join user's own room for private messages
        socket.join(socket.userId);

        // Handle chat room events
        socket.on('join_chat', ({ chatId }) => {
            socket.join(chatId);
            console.log(`User ${socket.userId} joined chat ${chatId}`);
        });

        socket.on('leave_chat', ({ chatId }) => {
            socket.leave(chatId);
            console.log(`User ${socket.userId} left chat ${chatId}`);
        });

        socket.on('typing', ({ chatId, isTyping }) => {
            socket.to(chatId).emit('user_typing', {
                userId: socket.userId,
                isTyping,
                chatId
            });
        });

        socket.on('message_read', ({ chatId, messageId }) => {
            socket.to(chatId).emit('message_read_by', {
                userId: socket.userId,
                messageId,
                chatId
            });
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.userId);
            onlineUsers.delete(socket.userId);
            io.emit('user_disconnected', socket.userId);
            io.emit('users_online', Array.from(onlineUsers.keys()));
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

export const emitToUser = (userId, event, data) => {
    const socketId = onlineUsers.get(userId);
    if (socketId) {
        getIO().to(socketId).emit(event, data);
    }
};

export const emitToChat = (chatId, event, data) => {
    getIO().to(chatId).emit(event, data);
};

export const isUserOnline = (userId) => {
    return onlineUsers.has(userId);
};
