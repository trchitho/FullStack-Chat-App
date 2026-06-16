import express from "express";
import {
    createGroupConversation,
    getGroupConversations,
    getGroupMessages,
    getMessageRequests,
    getPinnedGroupMessages,
    markGroupConversationSeen,
    respondToMessageRequest,
    sendGroupMessage,
    updateConversationTheme,
} from "../controllers/conversation.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();
const handle = (controller) => (req, res, next) =>
    Promise.resolve(controller(req, res, next)).catch(next);

router.use(protectRoute);
router.get("/", getGroupConversations);
router.post("/", createGroupConversation);
router.get("/requests", handle(getMessageRequests));
router.patch("/requests/:id", handle(respondToMessageRequest));
router.get("/:id/messages", getGroupMessages);
router.get("/:id/pinned", handle(getPinnedGroupMessages));
router.patch("/:id/theme", handle(updateConversationTheme));
router.post("/:id/messages", sendGroupMessage);
router.patch("/:id/seen", markGroupConversationSeen);

export default router;
