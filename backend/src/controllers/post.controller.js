import Friendship from "../models/friendship.model.js";
import Post from "../models/post.model.js";

const populatePost = (query) => query
    .populate("author", "fullName username profilePic")
    .populate("comments.author", "fullName profilePic")
    .populate("comments.replies.author", "fullName profilePic");

const getFriendIds = async (userId) => {
    const relationships = await Friendship.find({
        status: "accepted",
        $or: [{ requester: userId }, { recipient: userId }],
    }).lean();
    return relationships.map((item) =>
        String(item.requester) === String(userId) ? item.recipient : item.requester
    );
};

export const createPost = async (req, res) => {
    const { content = "", media = [], audience = "friends" } = req.body;
    if (!content.trim() && !media.length) {
        return res.status(400).json({ message: "Post content or media is required" });
    }
    const post = await Post.create({ author: req.user._id, content: content.trim(), media, audience });
    await post.populate("author", "fullName username profilePic");
    res.status(201).json(post);
};

export const getTimeline = async (req, res) => {
    const friendIds = await getFriendIds(req.user._id);
    const posts = await populatePost(Post.find({
        $or: [
            { author: req.user._id },
            { author: { $in: friendIds }, audience: { $in: ["public", "friends"] } },
        ],
    }).sort({ isPinned: -1, createdAt: -1 }).limit(100)).lean();
    res.status(200).json(posts);
};

export const getUserPosts = async (req, res) => {
    const ownerId = req.params.userId === "me" ? req.user._id : req.params.userId;
    const isOwner = String(ownerId) === String(req.user._id);
    const isFriend = isOwner || await Friendship.exists({
        status: "accepted",
        $or: [
            { requester: req.user._id, recipient: ownerId },
            { requester: ownerId, recipient: req.user._id },
        ],
    });
    const audiences = isOwner ? ["public", "friends", "private"] : isFriend ? ["public", "friends"] : ["public"];
    const posts = await populatePost(Post.find({ author: ownerId, audience: { $in: audiences } })
        .sort({ isPinned: -1, createdAt: -1 })).lean();
    res.status(200).json(posts);
};
