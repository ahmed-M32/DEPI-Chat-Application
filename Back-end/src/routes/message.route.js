import express from "express";
import { checkAuthentication } from "../middleware/auth.middleware.js";
import { 
    getUsers, 
    getUserChats, 
    getMessages, 
    sendMessage, 
    sendGroupMessage,
    createChat, 
    createGroup 
} from "../controllers/message.controller.js";

const messageRouter = express.Router();

// User and chat management
messageRouter.get("/users", checkAuthentication, getUsers);
messageRouter.get("/chats", checkAuthentication, getUserChats);
messageRouter.post("/chat", checkAuthentication, createChat);
messageRouter.post("/group", checkAuthentication, createGroup);

// Messages
messageRouter.get("/:chatId", checkAuthentication, getMessages);
messageRouter.post("/send/:chatId", checkAuthentication, sendMessage);
messageRouter.post("/group/send/:groupId", checkAuthentication, sendGroupMessage);

export default messageRouter;
