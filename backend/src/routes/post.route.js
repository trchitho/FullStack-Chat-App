import express from "express";
import {
    addComment,
    addCommentReply,
    createPost,
    deletePost,
    getTimeline,
    getUserPosts,
    reactToComment,
    reactToPost,
} from "../controllers/post.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();
const handle = (controller) => (req, res, next) =>
    Promise.resolve(controller(req, res, next)).catch(next);
router.use(protectRoute);

router.get("/timeline", handle(getTimeline));
router.get("/user/:userId", handle(getUserPosts));
router.post("/", handle(createPost));
router.patch("/:postId/reaction", handle(reactToPost));
