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

const canViewPost = async (post, viewerId) => {
    if (String(post.author) === String(viewerId)) return true;
    if (post.audience === "public") return true;
    if (post.audience === "private") return false;
    return Boolean(await Friendship.exists({
        status: "accepted",
        $or: [
            { requester: viewerId, recipient: post.author },
            { requester: post.author, recipient: viewerId },
        ],
    }));
};

const findAccessiblePost = async (postId, viewerId) => {
    const post = await Post.findById(postId);
    if (!post || !await canViewPost(post, viewerId)) return null;
    return post;
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
            { audience: "public" },
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

export const reactToPost = async (req, res) => {
    const post = await findAccessiblePost(req.params.postId, req.user._id);
    if (!post) return res.status(404).json({ message: "Post not found or unavailable" });
    const allowed = ["like", "love", "haha", "wow", "sad", "angry"];
    const type = req.body.type;
    if (type && !allowed.includes(type)) return res.status(400).json({ message: "Invalid reaction" });
    const existingIndex = post.reactions.findIndex((item) => String(item.user) === String(req.user._id));
    if (!type && existingIndex >= 0) post.reactions.splice(existingIndex, 1);
    else if (existingIndex >= 0) post.reactions[existingIndex].type = type;
    else if (type) post.reactions.push({ user: req.user._id, type });
    await post.save();
    res.status(200).json(post.reactions);
};

export const addComment = async (req, res) => {
    const content = req.body.content?.trim();
    if (!content) return res.status(400).json({ message: "Comment is required" });
    const post = await findAccessiblePost(req.params.postId, req.user._id);
    if (!post) return res.status(404).json({ message: "Post not found or unavailable" });
    post.comments.push({ author: req.user._id, content });
    await post.save();
    await post.populate("comments.author", "fullName profilePic");
    res.status(201).json(post.comments.at(-1));
};

export const addCommentReply = async (req, res) => {
    const content = req.body.content?.trim();
    if (!content) return res.status(400).json({ message: "Reply is required" });
    const post = await findAccessiblePost(req.params.postId, req.user._id);
    if (!post) return res.status(404).json({ message: "Post not found or unavailable" });
    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    comment.replies.push({ author: req.user._id, content });
    await post.save();
    await post.populate("comments.replies.author", "fullName profilePic");
    res.status(201).json(comment.replies.at(-1));
};

export const deletePost = async (req, res) => {
    const post = await Post.findOne({ _id: req.params.postId, author: req.user._id });
    if (!post) return res.status(404).json({ message: "Post not found" });
    await post.deleteOne();
    res.status(200).json({ success: true });
};

export const reactToComment = async (req, res) => {
    const post = await findAccessiblePost(req.params.postId, req.user._id);
    if (!post) return res.status(404).json({ message: "Post not found or unavailable" });
    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    const type = req.body.type;
    const allowed = ["like", "love", "haha", "wow", "sad", "angry"];
    if (type && !allowed.includes(type)) return res.status(400).json({ message: "Invalid reaction" });
    const index = comment.reactions.findIndex((item) => String(item.user) === String(req.user._id));
    if (!type && index >= 0) comment.reactions.splice(index, 1);
    else if (index >= 0) comment.reactions[index].type = type;
    else if (type) comment.reactions.push({ user: req.user._id, type });
    await post.save();
    res.status(200).json(comment.reactions);
};
