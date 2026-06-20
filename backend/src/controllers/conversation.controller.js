import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import { io } from "../lib/socket.js";

const ensureParticipant = (conversation, userId) =>
    conversation.participants.some((participant) => String(participant._id || participant) === String(userId));
const MAX_MESSAGE_LENGTH = 5000;

const messagePreview = (message, viewerId) => {
    const isOwn = String(message.senderId) === String(viewerId);
    const prefix = isOwn ? "Bạn: " : "";
    if (message.call?.status === "missed") return `${prefix}Cuộc gọi nhỡ`;
    if (message.call?.status === "unreachable") return `${prefix}Không liên lạc được`;
    if (message.call?.status === "no_answer") return isOwn ? "Bạn: Không bắt máy" : "Cuộc gọi nhỡ";
    if (message.call?.status === "rejected") return `${prefix}Cuộc gọi bị từ chối`;
    if (message.call?.status === "cancelled") return `${prefix}Đã hủy cuộc gọi`;
    if (message.call) return `${prefix}${message.call.type === "video" ? "Cuộc gọi video" : "Cuộc gọi thoại"}`;
    if (message.attachment?.type?.startsWith("audio/")) return `${prefix}Đã gửi tin nhắn thoại`;
    if (message.image || message.attachment?.type?.startsWith("image/")) return `${prefix}Đã gửi một ảnh`;
    if (message.attachment) return `${prefix}Đã gửi một tệp`;
    return `${prefix}${message.text || "Chưa có tin nhắn"}`;
};

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
        const currentUser = await User.findById(req.user._id)
            .select("conversationSettings")
            .lean();
        const settingsByConversation = new Map(
            (currentUser?.conversationSettings || []).map((item) => [String(item.peerId), item])
        );
        const groups = await Conversation.find({ participants: req.user._id, type: "group" })
            .sort({ lastMessageAt: -1 })
            .populate("participants", "fullName profilePic email")
            .lean();
        const groupIds = groups.map((group) => group._id);
        const latestMessages = await Message.aggregate([
            { $match: { conversationId: { $in: groupIds } } },
            { $sort: { createdAt: -1 } },
            { $group: { _id: "$conversationId", lastMessage: { $first: "$$ROOT" }, lastMessageAt: { $first: "$createdAt" } } },
        ]);
        const latestByGroup = new Map(latestMessages.map((item) => [String(item._id), {
            lastMessageAt: item.lastMessageAt,
            lastMessageText: messagePreview(item.lastMessage, req.user._id),
        }]));
        const unreadCounts = await Message.aggregate([
            {
                $match: {
                    conversationId: { $in: groupIds },
                    senderId: { $ne: req.user._id },
                    "seenBy.user": { $ne: req.user._id },
                },
            },
            { $group: { _id: "$conversationId", unreadCount: { $sum: 1 } } },
        ]);
        const unreadByGroup = new Map(unreadCounts.map((item) => [String(item._id), item.unreadCount]));
        res.status(200).json(groups.map((group) => ({
            ...group,
            ...latestByGroup.get(String(group._id)),
            ...settingsByConversation.get(String(group._id)),
            unreadCount: unreadByGroup.get(String(group._id)) || 0,
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

export const getPinnedGroupMessages = async (req, res) => {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation || !ensureParticipant(conversation, req.user._id)) {
        return res.status(403).json({ message: "Conversation access denied" });
    }
    const messages = await Message.find({ conversationId: conversation._id, pinned: true })
        .sort({ pinnedAt: -1, createdAt: -1 })
        .populate("senderId", "fullName profilePic")
        .lean();
    res.status(200).json(messages);
};

export const updateConversationTheme = async (req, res) => {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation || !ensureParticipant(conversation, req.user._id)) {
        return res.status(403).json({ message: "Conversation access denied" });
    }
    if (Object.prototype.hasOwnProperty.call(req.body, "theme")) {
        conversation.theme = String(req.body.theme || "").trim();
    }
    if (Object.prototype.hasOwnProperty.call(req.body, "quickEmoji")) {
        conversation.quickEmoji = String(req.body.quickEmoji || "👍").trim();
    }
    await conversation.save();
    conversation.participants.forEach((participantId) =>
        io.to(`user:${participantId}`).emit("conversationThemeUpdated", {
            conversationId: conversation._id,
            theme: conversation.theme,
            quickEmoji: conversation.quickEmoji,
        })
    );
    res.status(200).json({ theme: conversation.theme, quickEmoji: conversation.quickEmoji });
};

export const sendGroupMessage = async (req, res) => {
    try {
        const conversation = await Conversation.findById(req.params.id);
        if (!conversation || !ensureParticipant(conversation, req.user._id)) {
            return res.status(403).json({ message: "Conversation access denied" });
        }
        const text = typeof req.body.text === "string" ? req.body.text.trim() : "";
        if (text.length > MAX_MESSAGE_LENGTH) {
            return res.status(400).json({ message: "Message is too long" });
        }
        if (!text && !req.body.attachment && !req.body.call) {
            return res.status(400).json({ message: "Message content is required" });
        }
        const message = await Message.create({
            conversationId: conversation._id,
            senderId: req.user._id,
            text: text || undefined,
            attachment: req.body.attachment,
            replyTo: req.body.replyTo,
            call: req.body.call,
        });
        conversation.lastMessageAt = message.createdAt;
        await conversation.save();
        await message.populate("senderId", "fullName profilePic");
        const recipients = conversation.participants.filter((id) => String(id) !== String(req.user._id));
        for (const recipientId of recipients) {
            const recipient = await User.findById(recipientId).select("conversationSettings").lean();
            const setting = recipient?.conversationSettings?.find(
                (item) => String(item.peerId) === String(conversation._id)
            );
            const isMuted = setting?.mutedUntil && new Date(setting.mutedUntil) > new Date();
            const notification = isMuted ? null : await Notification.create({
                ownerId: recipientId,
                senderId: req.user._id,
                messageId: message._id,
                conversationId: conversation._id,
            });
            io.to(`user:${recipientId}`).emit("newGroupMessage", { conversationId: conversation._id, message });
            if (notification) io.to(`user:${recipientId}`).emit("newNotification", {
                    ...notification.toObject(),
                    senderId: { _id: req.user._id, fullName: req.user.fullName, profilePic: req.user.profilePic },
            });
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
        await User.updateOne(
            { _id: req.user._id, "conversationSettings.peerId": conversation._id },
            { $set: { "conversationSettings.$.manuallyUnread": false } }
        );
        for (const participantId of conversation.participants) {
            io.to(`user:${participantId}`).emit("groupSeenUpdate", {
                conversationId: conversation._id,
                userId: req.user._id,
                seenAt,
            });
        }
        res.status(200).json({ success: true, seenAt });
    } catch {
        res.status(500).json({ message: "Could not mark group conversation seen" });
    }
};

export const getMessageRequests = async (req, res) => {
    const requests = await Conversation.find({
        type: "direct",
        participants: req.user._id,
        requestedBy: { $ne: req.user._id },
        requestStatus: "pending",
    })
        .populate("requestedBy", "fullName username profilePic bio")
        .sort({ lastMessageAt: -1 })
        .lean();
    const conversationIds = requests.map((item) => item._id);
    const previews = await Message.aggregate([
        { $match: { conversationId: { $in: conversationIds } } },
        { $sort: { createdAt: -1 } },
        { $group: { _id: "$conversationId", text: { $first: "$text" }, createdAt: { $first: "$createdAt" } } },
    ]);
    const previewMap = new Map(previews.map((item) => [String(item._id), item]));
    res.status(200).json(requests.map((item) => ({
        ...item,
        preview: previewMap.get(String(item._id)),
    })));
};

export const respondToMessageRequest = async (req, res) => {
    const conversation = await Conversation.findOne({
        _id: req.params.id,
        type: "direct",
        participants: req.user._id,
        requestedBy: { $ne: req.user._id },
        requestStatus: "pending",
    });
    if (!conversation) return res.status(404).json({ message: "Message request not found" });
    if (req.body.action === "accept") {
        conversation.requestStatus = "accepted";
        conversation.acceptedAt = new Date();
        await conversation.save();
        return res.status(200).json(conversation);
    }
    if (req.body.action === "delete") {
        conversation.requestStatus = "deleted";
        await conversation.save();
        return res.status(200).json({ success: true });
    }
    res.status(400).json({ message: "Invalid message request action" });
};
