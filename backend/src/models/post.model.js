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
