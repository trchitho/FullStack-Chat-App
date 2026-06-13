import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

const ensureParticipant = (conversation, userId) =>
    conversation.participants.some((participant) => String(participant._id || participant) === String(userId));

export const createGroupConversation = async (req, res) => {
    try {
        const participantIds = [...new Set([String(req.user._id), ...(req.body.participantIds || []).map(String)])];
        if (participantIds.length < 3) return res.status(400).json({ message: "A group needs at least three members" });
        const existingUsers = await User.countDocuments({ _id: { $in: participantIds } });
        if (existingUsers !== participantIds.length) return res.status(400).json({ message: "Invalid group participants" });
        const conversation = await Conversation.create({
            name: req.body.name?.trim() || "Nhóm mới",
            participants: participantIds,
            createdBy: req.user._id,
        });
        await conversation.populate("participants", "fullName profilePic email");
        res.status(201).json(conversation);
    } catch {
        res.status(500).json({ message: "Could not create group conversation" });
    }
};
