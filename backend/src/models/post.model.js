import mongoose from "mongoose";

const reactionSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        type: {
            type: String,
            enum: ["like", "love", "haha", "wow", "sad", "angry"],
            required: true,
        },
    },
    { _id: false, timestamps: true }
);

const replySchema = new mongoose.Schema(
    {
        author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        content: { type: String, required: true, trim: true, maxlength: 2000 },
        reactions: { type: [reactionSchema], default: [] },
    },
    { timestamps: true }
);

const commentSchema = new mongoose.Schema(
    {
        author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        content: { type: String, required: true, trim: true, maxlength: 2000 },
        reactions: { type: [reactionSchema], default: [] },
        replies: { type: [replySchema], default: [] },
    },
    { timestamps: true }
);

const mediaSchema = new mongoose.Schema(
    {
        url: { type: String, required: true },
        key: String,
        type: { type: String, enum: ["image", "video"], required: true },
        mimeType: String,
        size: Number,
    },
    { _id: false }
);

const postSchema = new mongoose.Schema(
    {
        author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
        content: { type: String, trim: true, maxlength: 10000, default: "" },
        media: { type: [mediaSchema], default: [] },
        audience: {
            type: String,
            enum: ["public", "friends", "private"],
            default: "friends",
            index: true,
        },
        reactions: { type: [reactionSchema], default: [] },
        comments: { type: [commentSchema], default: [] },
        isPinned: { type: Boolean, default: false },
        originalPost: { type: mongoose.Schema.Types.ObjectId, ref: "Post", default: null },
        shareComment: { type: String, trim: true, maxlength: 5000, default: "" },
        shareCount: { type: Number, default: 0 },
    },
    { timestamps: true }
);

postSchema.index({ author: 1, createdAt: -1 });

const Post = mongoose.model("Post", postSchema);

export default Post;
