import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
        senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        messageId: { type: mongoose.Schema.Types.ObjectId, ref: "Message", default: null },
        conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", default: null },
        type: { type: String, enum: ["message", "call_missed", "friend_request"], default: "message" },
        preview: { type: String, default: "" },
        readAt: { type: Date, default: null },
    },
    { timestamps: true }
);

notificationSchema.index({ ownerId: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
