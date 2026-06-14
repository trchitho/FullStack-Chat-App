import express from "express";
import {
    createGroupConversation,
    getGroupConversations,
    getGroupMessages,
    getMessageRequests,
    markGroupConversationSeen,
    respondToMessageRequest,
    sendGroupMessage,
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
router.post("/:id/messages", sendGroupMessage);
router.patch("/:id/seen", markGroupConversationSeen);

export default router;
