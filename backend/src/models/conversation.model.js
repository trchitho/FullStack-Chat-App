import mongoose from "mongoose";

const participantNicknameSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    nickname: { type: String, default: "", trim: true, maxlength: 50 },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    updatedAt: { type: Date, default: Date.now },
}, { _id: false });

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
        theme: { type: String, default: "", trim: true },
        quickEmoji: { type: String, default: "👍", trim: true },
        participantNicknames: { type: [participantNicknameSchema], default: [] },
    },
    { timestamps: true }
);

conversationSchema.index({ participants: 1, lastMessageAt: -1 });

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
