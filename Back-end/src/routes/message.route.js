import express, { Router } from "express";
import { checkAuthentication } from "../middleware/auth.middleware.js";
import { createChat, createGroup, sendChatMessage } from "../controllers/message.controller.js";
import { getUsers } from "../controllers/message.controller.js";
import { getMessages } from "../controllers/message.controller.js";
import { getUserChats } from "../controllers/message.controller.js";
const messageRouter = express.Router();

messageRouter.post("/send/:id", checkAuthentication, sendChatMessage);
messageRouter.get("/get-users", checkAuthentication, getUsers);
messageRouter.get("/chat", checkAuthentication, getUserChats);
messageRouter.post("/add-chat" ,checkAuthentication,createChat);
messageRouter.post("/add-group",checkAuthentication,createGroup);



messageRouter.get("/:chatId", checkAuthentication, getMessages);

export default messageRouter;
