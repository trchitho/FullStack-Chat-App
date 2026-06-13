import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId } from "../lib/socket.js";
import {io} from "../lib/socket.js";
import { uploadFileToR2 } from "../lib/r2.js";
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

const buildMessagePreview = ({ text, attachment, call }) => {
    if (text) return text.slice(0, 120);
    if (call) return call.type === "video" ? "Cuộc gọi video" : "Cuộc gọi thoại";
    if (attachment?.type?.startsWith("audio/")) return "Tin nhắn thoại";
    if (attachment) return `Tệp: ${attachment.name || "Đính kèm"}`;
    return "Tin nhắn mới";
};

export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select('-password').lean();
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
            { $group: { _id: "$chatUserId", lastMessageAt: { $first: "$createdAt" }, lastMessageText: { $first: "$text" } } },
        ]);
        const latestByUser = new Map(latestMessages.map((item) => [String(item._id), item]));
        const sortedUsers = filteredUsers
            .map((user) => ({
                ...user,
                ...latestByUser.get(String(user._id)),
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
            text,
            image: imageUrl,
            attachment: normalizedAttachment,
            replyTo,
            call: normalizedCall
        });

        await newMessage.save();

        const receiver = await User.findById(receiverId).select("conversationSettings").lean();
        const setting = receiver?.conversationSettings?.find((item) => String(item.peerId) === String(senderId));
        const isMuted = setting?.mutedUntil && new Date(setting.mutedUntil) > new Date();
        const notification = isMuted ? null : await Notification.create({
                ownerId: receiverId,
                senderId,
                messageId: newMessage._id,
                preview: buildMessagePreview(newMessage),
            });

        // real-time messaging using socket.io
        const receiverSocketId = getReceiverSocketId(receiverId);
        if(receiverSocketId) {
            io.to(receiverSocketId).emit('newMessage', newMessage);
            if (notification) io.to(receiverSocketId).emit("newNotification", {
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
                resource_type: "auto",
                folder: "pingme/attachments",
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
        io.to(getReceiverSocketId(message.senderId))?.emit("messageDeliveredUpdate", message);
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
            { senderId: peerId, receiverId: req.user._id, "seenBy.user": { $ne: req.user._id } },
            { $push: { seenBy: { user: req.user._id, at: seenAt } } }
        );
        await User.updateOne(
            { _id: req.user._id, "conversationSettings.peerId": peerId },
            { $set: { "conversationSettings.$.manuallyUnread": false } }
        );
        const senderSocketId = getReceiverSocketId(peerId);
        if (senderSocketId) io.to(senderSocketId).emit("conversationSeenUpdate", { userId: req.user._id, seenAt });
        res.status(200).json({ success: true, seenAt });
    } catch (error) {
        res.status(500).json({ message: "Could not mark conversation seen" });
    }
};

export const updateConversationSetting = async (req, res) => {
    try {
        const peerId = req.params.userId;
        const allowed = ["mutedUntil", "manuallyUnread", "archived"];
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

export const downloadMessageAttachment = async (req, res) => {
    try {
        const message = await Message.findById(req.params.messageId).lean();
        if (!message?.attachment?.url) return res.status(404).json({ message: "Attachment not found" });
        const userId = String(req.user._id);
        if (![String(message.senderId), String(message.receiverId)].includes(userId)) {
            return res.status(403).json({ message: "Attachment access denied" });
        }
        const upstream = await fetch(message.attachment.url);
        if (!upstream.ok) return res.status(502).json({ message: "Attachment storage unavailable" });
        const buffer = Buffer.from(await upstream.arrayBuffer());
        const safeName = (message.attachment.name || "download").replace(/[\r\n"]/g, "_");
        res.setHeader("Content-Type", message.attachment.type || "application/octet-stream");
        res.setHeader("Content-Length", String(buffer.length));
        res.setHeader("Content-Disposition", `attachment; filename="${safeName}"; filename*=UTF-8''${encodeURIComponent(safeName)}`);
        res.status(200).send(buffer);
    } catch (error) {
        res.status(500).json({ message: "Could not download attachment" });
    }
};

