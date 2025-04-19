import dotenv from "dotenv";

import express from "express";
import http from "http";
import { Server } from "socket.io";
import { connectDatabase } from "./src/lib/DB.js";
import router from "./src/routes/user.route.js";
import messageRouter from "./src/routes/message.route.js";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});
app.set("io" ,io);



app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", router);
app.use("/api/message", messageRouter);




app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);

	console.log("Calling connectDatabase()...");
	connectDatabase();
});
