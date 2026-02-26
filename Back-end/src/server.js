import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import { initializeSocket } from './socket/socket.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = createServer(app);

const io = initializeSocket(server);

app.use(cors({
    origin: ['https://depi-front-delta.vercel.app','http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));
app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

import userRoutes from './routes/user.route.js';
import messageRoutes from './routes/message.route.js';

// API routes
app.use('/api/auth', userRoutes); 
app.use('/api/message', messageRoutes);
app.use('/api/users', userRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        message: 'Something went wrong!' 
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
