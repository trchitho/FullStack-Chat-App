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
        res.status(201).json({
            ...conversation.toObject(),
            fullName: conversation.name,
            isGroup: true,
        });
    } catch {
        res.status(500).json({ message: "Could not create group conversation" });
    }
};

export const getGroupConversations = async (req, res) => {
    try {
        const groups = await Conversation.find({ participants: req.user._id })
            .sort({ lastMessageAt: -1 })
            .populate("participants", "fullName profilePic email")
            .lean();
        const groupIds = groups.map((group) => group._id);
        const latestMessages = await Message.aggregate([
            { $match: { conversationId: { $in: groupIds } } },
            { $sort: { createdAt: -1 } },
            { $group: { _id: "$conversationId", lastMessageText: { $first: "$text" }, lastMessageAt: { $first: "$createdAt" } } },
        ]);
        const latestByGroup = new Map(latestMessages.map((item) => [String(item._id), item]));
        res.status(200).json(groups.map((group) => ({
            ...group,
            ...latestByGroup.get(String(group._id)),
            fullName: group.name,
            isGroup: true,
        })));
    } catch {
        res.status(500).json({ message: "Could not load group conversations" });
    }
};

export const getGroupMessages = async (req, res) => {
    try {
        const conversation = await Conversation.findById(req.params.id);
        if (!conversation || !ensureParticipant(conversation, req.user._id)) {
            return res.status(403).json({ message: "Conversation access denied" });
        }
        const messages = await Message.find({ conversationId: conversation._id })
            .sort({ createdAt: 1 })
            .populate("senderId", "fullName profilePic")
            .lean();
        res.status(200).json(messages);
    } catch {
        res.status(500).json({ message: "Could not load group messages" });
    }
};

export const sendGroupMessage = async (req, res) => {
    try {
        const conversation = await Conversation.findById(req.params.id);
        if (!conversation || !ensureParticipant(conversation, req.user._id)) {
            return res.status(403).json({ message: "Conversation access denied" });
        }
        const message = await Message.create({
            conversationId: conversation._id,
            senderId: req.user._id,
            text: req.body.text,
            attachment: req.body.attachment,
            replyTo: req.body.replyTo,
            call: req.body.call,
        });
        conversation.lastMessageAt = message.createdAt;
        await conversation.save();
        await message.populate("senderId", "fullName profilePic");
        const recipients = conversation.participants.filter((id) => String(id) !== String(req.user._id));
        for (const recipientId of recipients) {
            const socketId = getReceiverSocketId(recipientId);
            if (socketId) io.to(socketId).emit("newGroupMessage", { conversationId: conversation._id, message });
            await Notification.create({ ownerId: recipientId, senderId: req.user._id, messageId: message._id, preview: message.text || "Tin nhắn nhóm mới" });
        }
        res.status(201).json(message);
    } catch {
        res.status(500).json({ message: "Could not send group message" });
    }
};

export const markGroupConversationSeen = async (req, res) => {
    try {
        const conversation = await Conversation.findById(req.params.id).lean();
        if (!conversation || !ensureParticipant(conversation, req.user._id)) {
            return res.status(403).json({ message: "Conversation access denied" });
        }
        const seenAt = new Date();
        await Message.updateMany(
            {
                conversationId: conversation._id,
                senderId: { $ne: req.user._id },
                "deliveredTo.user": { $ne: req.user._id },
            },
            { $push: { deliveredTo: { user: req.user._id, at: seenAt } } }
        );
        await Message.updateMany(
            {
                conversationId: conversation._id,
                senderId: { $ne: req.user._id },
                "seenBy.user": { $ne: req.user._id },
            },
            { $push: { seenBy: { user: req.user._id, at: seenAt } } }
        );
        for (const participantId of conversation.participants) {
            const socketId = getReceiverSocketId(participantId);
            if (socketId) io.to(socketId).emit("groupSeenUpdate", { conversationId: conversation._id, userId: req.user._id, seenAt });
        }
        res.status(200).json({ success: true, seenAt });
    } catch {
        res.status(500).json({ message: "Could not mark group conversation seen" });
    }
};
