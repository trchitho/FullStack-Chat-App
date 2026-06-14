import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
    {
        type: { type: String, enum: ["direct", "group"], default: "group" },
        directKey: { type: String, unique: true, sparse: true },
        name: { type: String, trim: true, maxlength: 120 },
        participants: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        }],
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        requestStatus: {
            type: String,
            enum: ["accepted", "pending", "deleted"],
            default: "accepted",
            index: true,
        },
        requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
        acceptedAt: { type: Date, default: null },
        lastMessageAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

conversationSchema.index({ participants: 1, lastMessageAt: -1 });

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
