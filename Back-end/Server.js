import dotenv from 'dotenv';

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import {connectDatabase}  from './src/lib/DB.js';
import router from './src/routes/user.route.js';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

/*const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});*/

app.use(express.json());
app.use(cookieParser())


app.use('/api/auth', router);

/*io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('message', (data) => {
    console.log('Message received:', data);
    io.emit('message', data);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});
*/
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  
  console.log("Calling connectDatabase()...");
  connectDatabase();
});
