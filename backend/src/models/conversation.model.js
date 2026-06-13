import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
    {
        type: { type: String, enum: ["group"], default: "group" },
        name: { type: String, trim: true, maxlength: 120 },
        participants: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        }],
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        lastMessageAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

conversationSchema.index({ participants: 1, lastMessageAt: -1 });

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
