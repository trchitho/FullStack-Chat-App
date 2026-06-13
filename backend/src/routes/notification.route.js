import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import {
    getNotifications,
    markNotificationsRead,
} from "../controllers/notification.controller.js";

const router = express.Router();

router.get("/", protectRoute, getNotifications);
router.patch("/read", protectRoute, markNotificationsRead);

export default router;
