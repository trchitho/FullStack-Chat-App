import cloudinary from "../lib/cloudinary.js";
import {io} from "../lib/socket.js";
import { uploadFileToR2 } from "../lib/r2.js";
import Conversation from "../models/conversation.model.js";
import Friendship from "../models/friendship.model.js";
import Message from "../models/message.model.js";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

const normalizeAttachment = (attachment) => {
    if (!attachment || typeof attachment !== "object") return undefined;
    const { url, key, name, type, size, storage, duration } = attachment;
    if (!url) return undefined;
    return { url, key, name, type, size, storage, duration };
};

const normalizeCall = (call) => {
    if (!call || typeof call !== "object") return undefined;
    const { type, status, duration } = call;
    if (!type || !status) return undefined;
    return { type, status, duration };
};

const notificationTypeForMessage = (message) =>
    ["missed", "no_answer", "unreachable"].includes(message.call?.status) ? "call_missed" : "message";

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

const cloudinaryResourceType = (mimeType = "") => {
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("video/") || mimeType.startsWith("audio/")) return "video";
    return "raw";
};

const directKeyFor = (firstId, secondId) =>
    [String(firstId), String(secondId)].sort().join(":");

const areFriends = (firstId, secondId) => Friendship.exists({
    status: "accepted",
    $or: [
        { requester: firstId, recipient: secondId },
        { requester: secondId, recipient: firstId },
    ],
});

export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } })
            .select("-password -conversationSettings")
            .lean();
        const userIds = filteredUsers.map((user) => user._id);
        const currentUser = await User.findById(loggedInUserId).select("conversationSettings").lean();
        const settingsByPeer = new Map(
            (currentUser?.conversationSettings || []).map((item) => [String(item.peerId), item])
        );
        const unreadCounts = await Message.aggregate([
            { $match: { receiverId: loggedInUserId, "seenBy.user": { $ne: loggedInUserId } } },
            { $group: { _id: "$senderId", unreadCount: { $sum: 1 } } },
        ]);
        const unreadByUser = new Map(unreadCounts.map((item) => [String(item._id), item.unreadCount]));
        const latestMessages = await Message.aggregate([
            { $match: { $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }] } },
            { $sort: { createdAt: -1 } },
            { $addFields: { chatUserId: { $cond: [{ $eq: ["$senderId", loggedInUserId] }, "$receiverId", "$senderId"] } } },
            { $match: { chatUserId: { $in: userIds } } },
            { $group: { _id: "$chatUserId", lastMessage: { $first: "$$ROOT" }, lastMessageAt: { $first: "$createdAt" } } },
        ]);
        const latestByUser = new Map(latestMessages.map((item) => [String(item._id), {
            lastMessageAt: item.lastMessageAt,
            lastMessageText: messagePreview(item.lastMessage, loggedInUserId),
        }]));
        const conversations = await Conversation.find({
            type: "direct",
            participants: loggedInUserId,
        }).select("participants theme quickEmoji").lean();
        const conversationByPeer = new Map(conversations.map((conversation) => {
            const peerId = conversation.participants.find((id) => String(id) !== String(loggedInUserId));
            return [String(peerId), { conversationId: conversation._id, theme: conversation.theme, quickEmoji: conversation.quickEmoji }];
        }));
        const incomingRequests = await Conversation.find({
            type: "direct",
            participants: loggedInUserId,
            requestStatus: "pending",
            requestedBy: { $ne: loggedInUserId },
        }).select("requestedBy").lean();
        const requestedByIds = new Set(incomingRequests.map((item) => String(item.requestedBy)));
        const sortedUsers = filteredUsers
            .filter((user) =>
                latestByUser.has(String(user._id)) && !requestedByIds.has(String(user._id))
            )
            .map((user) => ({
                ...user,
                ...latestByUser.get(String(user._id)),
                ...conversationByPeer.get(String(user._id)),
                ...settingsByPeer.get(String(user._id)),
                unreadCount: unreadByUser.get(String(user._id)) || 0,
            }))
            .sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0));

        res.status(200).json(sortedUsers);
    } catch (error) {
        console.log("Error in getUsersForSidebar: ", error.message);
        res.status(500).json({error: "Internal Server Error"});
    }
}

export const getMessages = async (req, res) => {
    try {
        const { id:userToChatId } = req.params;
        const myId = req.user._id;
        const conversation = await Conversation.findOne({
            directKey: directKeyFor(myId, userToChatId),
        }).select("requestStatus requestedBy").lean();
        if (conversation?.requestStatus === "deleted") {
            return res.status(404).json({ message: "Conversation not found" });
        }
        const isIncomingRequest = conversation?.requestStatus === "pending"
            && String(conversation.requestedBy) !== String(myId);
        if (isIncomingRequest) {
            return res.status(403).json({
                message: "Accept this message request before opening the conversation",
            });
        }

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId }
            ]
        })

        res.status(200).json(messages);
    } catch (error) {
        console.log("Error in getMessages: ", error.message);
        res.status(500).json({error: "Internal Server Error"});
    }
}

export const sendMessage = async (req, res) => {
    try {
        const { id:receiverId } = req.params;
        const senderId = req.user._id;
        const { text, image, replyTo, attachment, call } = req.body;
        if (String(senderId) === receiverId) {
            return res.status(400).json({ message: "Cannot message yourself" });
        }
        const receiverExists = await User.exists({ _id: receiverId });
        if (!receiverExists) {
            return res.status(404).json({ message: "Recipient not found" });
        }
        const friendshipExists = Boolean(await areFriends(senderId, receiverId));
        const directKey = directKeyFor(senderId, receiverId);
        const conversation = await Conversation.findOneAndUpdate(
            { directKey },
            {
                $setOnInsert: {
                    type: "direct",
                    directKey,
                    participants: [senderId, receiverId],
                    createdBy: senderId,
                    requestedBy: friendshipExists ? null : senderId,
                },
                $set: friendshipExists
                    ? { requestStatus: "accepted", acceptedAt: new Date() }
                    : {},
            },
            { upsert: true, new: true }
        );
        const normalizedAttachment = normalizeAttachment(attachment);
        const normalizedCall = normalizeCall(call);

        let imageUrl;

        if (image) {
            // Save image to cloudinary
            const uploadedResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadedResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            conversationId: conversation._id,
            text,
            image: imageUrl,
            attachment: normalizedAttachment,
            replyTo,
            call: normalizedCall
        });

        await newMessage.save();
        conversation.lastMessageAt = newMessage.createdAt;
        await conversation.save();

        const receiver = await User.findById(receiverId).select("conversationSettings").lean();
        const setting = receiver?.conversationSettings?.find((item) => String(item.peerId) === String(senderId));
        const isMuted = setting?.mutedUntil && new Date(setting.mutedUntil) > new Date();
        const notification = isMuted ? null : await Notification.create({
                ownerId: receiverId,
                senderId,
                messageId: newMessage._id,
                conversationId: conversation._id,
                type: notificationTypeForMessage(newMessage),
            });

        // real-time messaging using socket.io
        io.to(`user:${receiverId}`).emit("newMessage", newMessage);
        if (notification) {
            io.to(`user:${receiverId}`).emit("newNotification", {
                ...notification.toObject(),
                senderId: {
                    _id: req.user._id,
                    fullName: req.user.fullName,
                    profilePic: req.user.profilePic,
                },
            });
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.log("Error in sendMessage: ", error.message);
        res.status(500).json({error: "Internal Server Error"});
    }
}

export const searchUsers = async (req, res) => {
    try {
        const query = req.query.q?.trim();
        const excludedIds = [req.user._id];
        if (req.query.excludeExistingConversations === "true") {
            const conversations = await Conversation.find({
                type: "direct",
                participants: req.user._id,
                lastMessageAt: { $ne: null },
                requestStatus: { $ne: "deleted" },
            }).select("participants").lean();
            conversations.forEach((conversation) => {
                conversation.participants.forEach((id) => excludedIds.push(id));
            });
        }
        const filter = { _id: { $nin: excludedIds } };
        if (query) {
            filter.$or = [
                { fullName: { $regex: query, $options: "i" } },
                { username: { $regex: query, $options: "i" } },
                { email: { $regex: query, $options: "i" } },
            ];
        }
        const users = await User.find(filter)
            .select("fullName username email profilePic bio")
            .sort({ fullName: 1 })
            .limit(50)
            .lean();
        res.status(200).json(users);
    } catch {
        res.status(500).json({ message: "Could not search users" });
    }
};

export const uploadMessageAttachment = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        let attachment;
        try {
            attachment = await uploadFileToR2(req.file);
        } catch (storageError) {
            const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
            const uploaded = await cloudinary.uploader.upload(dataUri, {
                resource_type: cloudinaryResourceType(req.file.mimetype),
                folder: "pingme/attachments",
                use_filename: true,
                unique_filename: true,
            });
            attachment = {
                key: uploaded.public_id,
                url: uploaded.secure_url,
                name: req.file.originalname,
                type: req.file.mimetype,
                size: req.file.size,
                storage: "cloudinary",
            };
        }
        res.status(201).json({ attachment });
    } catch (error) {
        console.log("Error in uploadMessageAttachment: ", error.message);
        res.status(503).json({ message: "File storage is unavailable" });
    }
}

export const markMessageDelivered = async (req, res) => {
    try {
        const message = await Message.findOneAndUpdate(
            { _id: req.params.messageId, receiverId: req.user._id, "deliveredTo.user": { $ne: req.user._id } },
            { $push: { deliveredTo: { user: req.user._id, at: new Date() } } },
            { new: true }
        );
        if (!message) return res.status(404).json({ message: "Message not found" });
        io.to(`user:${message.senderId}`).emit("messageDeliveredUpdate", message);
        res.status(200).json(message);
    } catch (error) {
        res.status(500).json({ message: "Could not mark message delivered" });
    }
};

export const markConversationSeen = async (req, res) => {
    try {
        const peerId = req.params.userId;
        const seenAt = new Date();
        await Message.updateMany(
            { senderId: peerId, receiverId: req.user._id, "deliveredTo.user": { $ne: req.user._id } },
            { $push: { deliveredTo: { user: req.user._id, at: seenAt } } }
        );
        await Message.updateMany(
            { senderId: peerId, receiverId: req.user._id, "seenBy.user": { $ne: req.user._id } },
            { $push: { seenBy: { user: req.user._id, at: seenAt } } }
        );
        await User.updateOne(
            { _id: req.user._id, "conversationSettings.peerId": peerId },
            { $set: { "conversationSettings.$.manuallyUnread": false } }
        );
        io.to(`user:${peerId}`).emit("conversationSeenUpdate", { userId: req.user._id, seenAt });
        res.status(200).json({ success: true, seenAt });
    } catch (error) {
        res.status(500).json({ message: "Could not mark conversation seen" });
    }
};

export const setMessagePinned = async (req, res) => {
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });
    const userId = String(req.user._id);
    const isDirect = [String(message.senderId), String(message.receiverId)].includes(userId);
    const isGroup = message.conversationId
        ? await Conversation.exists({ _id: message.conversationId, participants: req.user._id })
        : false;
    if (!isDirect && !isGroup) return res.status(403).json({ message: "Message access denied" });
    message.pinned = Boolean(req.body.pinned);
    message.pinnedAt = message.pinned ? new Date() : null;
    message.pinnedBy = message.pinned ? req.user._id : null;
    await message.save();
    const participantIds = message.conversationId
        ? (await Conversation.findById(message.conversationId).select("participants").lean())?.participants || []
        : [message.senderId, message.receiverId];
    participantIds.forEach((participantId) => {
        io.to(`user:${participantId}`).emit("messagePinnedUpdate", message);
    });
    res.status(200).json(message);
};

export const getPinnedDirectMessages = async (req, res) => {
    const peerId = req.params.userId;
    const messages = await Message.find({
        pinned: true,
        $or: [
            { senderId: req.user._id, receiverId: peerId },
            { senderId: peerId, receiverId: req.user._id },
        ],
    }).sort({ pinnedAt: -1, createdAt: -1 }).populate("senderId", "fullName profilePic").lean();
    res.status(200).json(messages);
};

export const updateConversationSetting = async (req, res) => {
    try {
        const peerId = req.params.userId;
        const allowed = ["mutedUntil", "manuallyUnread", "archived", "theme"];
        const changes = Object.fromEntries(
            Object.entries(req.body).filter(([key]) => allowed.includes(key))
        );
        const user = await User.findById(req.user._id);
        const setting = user.conversationSettings.find((item) => String(item.peerId) === peerId);
        if (setting) {
            Object.assign(setting, changes);
        } else {
            user.conversationSettings.push({ peerId, ...changes });
        }
        await user.save();
        const updated = user.conversationSettings.find((item) => String(item.peerId) === peerId);
        res.status(200).json(updated);
    } catch (error) {
        res.status(400).json({ message: "Could not update conversation settings" });
    }
};

export const updateDirectConversationTheme = async (req, res) => {
    const directKey = directKeyFor(req.user._id, req.params.userId);
    const conversation = await Conversation.findOne({ directKey, participants: req.user._id });
    if (!conversation) return res.status(404).json({ message: "Conversation not found" });
    if (Object.prototype.hasOwnProperty.call(req.body, "theme")) {
        conversation.theme = String(req.body.theme || "").trim();
    }
    if (Object.prototype.hasOwnProperty.call(req.body, "quickEmoji")) {
        conversation.quickEmoji = String(req.body.quickEmoji || "👍").trim();
    }
    await conversation.save();
    conversation.participants.forEach((participantId) =>
        io.to(`user:${participantId}`).emit("conversationThemeUpdated", {
            peerId: String(req.user._id) === String(participantId) ? req.params.userId : req.user._id,
            conversationId: conversation._id,
            theme: conversation.theme,
            quickEmoji: conversation.quickEmoji,
        })
    );
    res.status(200).json({ theme: conversation.theme, quickEmoji: conversation.quickEmoji });
};

export const downloadMessageAttachment = async (req, res) => {
    try {
        const message = await Message.findById(req.params.messageId).lean();
        if (!message?.attachment?.url) return res.status(404).json({ message: "Attachment not found" });
        const userId = String(req.user._id);
        const isDirectParticipant = [String(message.senderId), String(message.receiverId)].includes(userId);
        const isGroupParticipant = message.conversationId
            ? await Conversation.exists({ _id: message.conversationId, participants: req.user._id })
            : false;
        if (!isDirectParticipant && !isGroupParticipant) {
            return res.status(403).json({ message: "Attachment access denied" });
        }
        const upstream = await fetch(message.attachment.url);
        if (!upstream.ok) return res.status(502).json({ message: "Attachment storage unavailable" });
        const buffer = Buffer.from(await upstream.arrayBuffer());
        const safeName = (message.attachment.name || "download").replace(/[\r\n"]/g, "_");
        const asciiName = safeName.normalize("NFD").replace(/[^\x20-\x7E]/g, "_");
        res.setHeader("Content-Type", message.attachment.type || "application/octet-stream");
        res.setHeader("Content-Length", String(buffer.length));
        res.setHeader("Content-Disposition", `attachment; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(safeName)}`);
        res.status(200).send(buffer);
    } catch (error) {
        res.status(500).json({ message: "Could not download attachment" });
    }
};

