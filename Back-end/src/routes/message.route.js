import express from "express";
import { checkAuthentication } from "../middleware/auth.middleware.js";
import { 
    getUsers, 
    searchUsersByUsername,
    getUserChats, 
    getMessages, 
    sendMessage, 
    sendGroupMessage,
    markChatRead,
    markGroupRead,
    createChat, 
    createGroup 
} from "../controllers/message.controller.js";

const messageRouter = express.Router();

// User and chat management
messageRouter.get("/users", checkAuthentication, getUsers);
messageRouter.get("/users/search", checkAuthentication, searchUsersByUsername);
messageRouter.get("/chats", checkAuthentication, getUserChats);
messageRouter.post("/chat", checkAuthentication, createChat);
messageRouter.post("/group", checkAuthentication, createGroup);

// Messages
messageRouter.get("/:chatId", checkAuthentication, getMessages);
messageRouter.post("/send/:chatId", checkAuthentication, sendMessage);
messageRouter.post("/group/send/:groupId", checkAuthentication, sendGroupMessage);

// Read receipts
messageRouter.post("/chat/:chatId/read", checkAuthentication, markChatRead);
messageRouter.post("/group/:groupId/read", checkAuthentication, markGroupRead);

export default messageRouter;
