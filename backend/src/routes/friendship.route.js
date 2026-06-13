import express from "express";
import {
    getRelationship,
    listFriendRequests,
    listFriends,
    removeFriendship,
    respondToFriendRequest,
    sendFriendRequest,
} from "../controllers/friendship.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();
router.use(protectRoute);

router.get("/", listFriends);
router.get("/requests", listFriendRequests);
router.get("/relationship/:userId", getRelationship);
router.post("/request/:userId", sendFriendRequest);
router.patch("/requests/:requestId", respondToFriendRequest);
router.delete("/:userId", removeFriendship);

export default router;
