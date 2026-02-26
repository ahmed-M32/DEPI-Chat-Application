import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io;
const onlineUsers = new Map(); 

// ─── Helpers ────────────────────────────────────────────────────────────────

const toStr = (v) => (v == null ? '' : String(v));

export const getIO = () => {
    if (!io) throw new Error('Socket.io not initialized');
    return io;
};

export const emitToUser = (userId, event, data) => {
    const socketId = onlineUsers.get(toStr(userId));
    if (socketId) getIO().to(socketId).emit(event, data);
};

export const emitToChat = (chatId, event, data) => {
    getIO().to(chatId).emit(event, data);
};

export const isUserOnline = (userId) => {
    return onlineUsers.has(toStr(userId));
};

// ─── Auth Middleware ─────────────────────────────────────────────────────────

const authenticateSocket = (socket, next) => {
    try {
        let token = socket.handshake.auth.token;
        if (token?.startsWith('Bearer ')) token = token.slice(7);

        if (!token && socket.handshake.headers.cookie) {
            const cookies = socket.handshake.headers.cookie
                .split(';')
                .map((c) => c.trim())
                .reduce((acc, c) => {
                    const [key, value] = c.split('=');
                    acc[key] = value;
                    return acc;
                }, {});
            token = cookies.jwt;
        }

        if (!token) {
            return next(new Error('Authentication error: No token provided'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded?.userId) {
            return next(new Error('Authentication error: Invalid token'));
        }

        socket.userId = decoded.userId;
        next();
    } catch (error) {
        console.error('Socket authentication error:', error.message);
        next(new Error('Authentication error: ' + error.message));
    }
};

// ─── Connection Handler ──────────────────────────────────────────────────────

const handleConnection = (socket) => {
    const userId = toStr(socket.userId);
    console.log('User connected:', userId);

    onlineUsers.set(userId, socket.id);
    socket.broadcast.emit('user_connected', userId);

    socket.emit('users_online', Array.from(onlineUsers.keys()));

    socket.join(userId);

    // ── Chat Room Events ───────────────────────────────────────────────────

    socket.on('join_chat', ({ chatId }) => {
        socket.join(chatId);
        console.log(`User ${userId} joined chat ${chatId}`);
    });

    socket.on('leave_chat', ({ chatId }) => {
        socket.leave(chatId);
        console.log(`User ${userId} left chat ${chatId}`);
    });

    socket.on('typing', ({ chatId, isTyping }) => {
        socket.to(chatId).emit('user_typing', { userId, isTyping, chatId });
    });

    socket.on('message_read', ({ chatId, messageId }) => {
        socket.to(chatId).emit('message_read_by', { userId, messageId, chatId });
    });

    // ── Disconnect ─────────────────────────────────────────────────────────

    socket.on('disconnect', () => {
        console.log('User disconnected:', userId);
        onlineUsers.delete(userId);
        io.emit('user_disconnected', userId);
        io.emit('users_online', Array.from(onlineUsers.keys()));
    });
};

// ─── Initialize ──────────────────────────────────────────────────────────────

export const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:5173',
            methods: ['GET', 'POST'],
            credentials: true,
        },
        transports: ['websocket', 'polling'],
    });

    io.use(authenticateSocket);
    io.on('connection', handleConnection);

    return io;
};
