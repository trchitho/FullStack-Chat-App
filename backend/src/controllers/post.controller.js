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
