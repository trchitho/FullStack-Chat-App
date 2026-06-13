import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import {
    getNotifications,
    markNotificationsRead,
    markSenderNotificationsRead,
} from "../controllers/notification.controller.js";

const router = express.Router();

router.get("/", protectRoute, getNotifications);
router.patch("/read", protectRoute, markNotificationsRead);
router.patch("/read/:senderId", protectRoute, markSenderNotificationsRead);

export default router;
