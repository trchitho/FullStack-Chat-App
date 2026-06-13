import express from "express";
import {
    createGroupConversation,
    getGroupConversations,
    getGroupMessages,
    markGroupConversationSeen,
    sendGroupMessage,
} from "../controllers/conversation.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protectRoute);
router.get("/", getGroupConversations);
router.post("/", createGroupConversation);
router.get("/:id/messages", getGroupMessages);
router.post("/:id/messages", sendGroupMessage);
router.patch("/:id/seen", markGroupConversationSeen);

export default router;
