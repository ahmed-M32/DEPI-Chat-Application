import express, { Router } from "express";
import { checkAuthentication } from "../middleware/auth.middleware";

const messageRouter = express.Router();

messageRouter.post("/send/:id", checkAuthentication, sendChatMessage);
messageRouter.get("/get-users", checkAuthentication, getUsers);
messageRouter.get("/:chatId", checkAuthentication, getMessages);
messageRouter.get("/chat", checkAuthentication, getChat);

export default messageRouter;
