import express from "express";
import { sendMessage,listMessages,markRead,deleteMessage } from "../controllers/contactController.js";
import { adminMiddleware } from "../middleware/auth.js";

const contactRouter = express.Router();

contactRouter.post("/send",sendMessage);
contactRouter.get("/list",adminMiddleware,listMessages);
contactRouter.post("/read",adminMiddleware,markRead);
contactRouter.post("/delete",adminMiddleware,deleteMessage);

export default contactRouter;
