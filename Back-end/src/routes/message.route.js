import express, { Router } from "express";
import { checkAuthentication } from "../middleware/auth.middleware.js";
import { sendChatMessage } from "../controllers/message.controller.js";
import { getUsers } from "../controllers/message.controller.js";
import { getMessages } from "../controllers/message.controller.js";
import { getUserChats } from "../controllers/message.controller.js";
const messageRouter = express.Router();

messageRouter.post("/send/:id", checkAuthentication, sendChatMessage);
messageRouter.get("/get-users", checkAuthentication, getUsers);
messageRouter.get("/:chatId", checkAuthentication, getMessages);
messageRouter.get("/chat", checkAuthentication, getUserChats);

export default messageRouter;
