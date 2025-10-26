import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import { sendMessage, getMessages, getAllChats } from "../controllers/messageControllers.js";

const router = express.Router();

router.post("/", isAuth, sendMessage);
router.get("/", isAuth, getMessages);
router.get("/chats", isAuth, getAllChats);



export default router;  