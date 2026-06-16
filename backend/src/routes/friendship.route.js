import express from "express";
import {
    getRelationship,
    listFriendRequests,
    listFriendSuggestions,
    listFriends,
    listUserFriends,
    removeFriendship,
    respondToFriendRequest,
    sendFriendRequest,
} from "../controllers/friendship.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();
const handle = (controller) => (req, res, next) =>
    Promise.resolve(controller(req, res, next)).catch(next);
router.use(protectRoute);

router.get("/", handle(listFriends));
router.get("/requests", handle(listFriendRequests));
router.get("/suggestions", handle(listFriendSuggestions));
router.get("/user/:userId", handle(listUserFriends));
router.get("/relationship/:userId", handle(getRelationship));
router.post("/request/:userId", handle(sendFriendRequest));
router.patch("/requests/:requestId", handle(respondToFriendRequest));
router.delete("/:userId", handle(removeFriendship));

export default router;
