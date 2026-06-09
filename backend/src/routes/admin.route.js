import express from "express";
import { adminCheck, adminLogin, adminLogout, getAdminOverview, getAdminUsers } from "../controllers/admin.controller.js";
import { protectAdmin } from "../middlewares/admin.middleware.js";

const router = express.Router();

router.post("/login", adminLogin);
router.post("/logout", adminLogout);
router.get("/check", protectAdmin, adminCheck);
router.get("/overview", protectAdmin, getAdminOverview);
router.get("/users", protectAdmin, getAdminUsers);

export default router;
