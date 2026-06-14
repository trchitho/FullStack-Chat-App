import express from "express";
import {
    getProfile,
    updateMyProfile,
    updateProfileMedia,
} from "../controllers/profile.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();
const handle = (controller) => (req, res, next) =>
    Promise.resolve(controller(req, res, next)).catch(next);

router.use(protectRoute);
router.patch("/me/details", handle(updateMyProfile));
router.patch("/me/media/:field", handle(updateProfileMedia));
router.get("/:userId", handle(getProfile));

export default router;
