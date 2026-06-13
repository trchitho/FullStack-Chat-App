import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId } from "../lib/socket.js";
import {io} from "../lib/socket.js";
import { uploadFileToR2 } from "../lib/r2.js";
import Message from "../models/message.model.js";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

const normalizeAttachment = (attachment) => {
    if (!attachment || typeof attachment !== "object") return undefined;
    const { url, key, name, type, size, storage } = attachment;
    if (!url) return undefined;
    return { url, key, name, type, size, storage };
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
        const latestMessages = await Message.aggregate([
            { $match: { $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }] } },
            { $sort: { createdAt: -1 } },
            { $addFields: { chatUserId: { $cond: [{ $eq: ["$senderId", loggedInUserId] }, "$receiverId", "$senderId"] } } },
            { $match: { chatUserId: { $in: userIds } } },
            { $group: { _id: "$chatUserId", lastMessageAt: { $first: "$createdAt" }, lastMessageText: { $first: "$text" } } },
        ]);
        const latestByUser = new Map(latestMessages.map((item) => [String(item._id), item]));
        const sortedUsers = filteredUsers
            .map((user) => ({ ...user, ...latestByUser.get(String(user._id)) }))
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

        // real-time messaging using socket.io
        const receiverSocketId = getReceiverSocketId(receiverId);
        if(receiverSocketId) {
            io.to(receiverSocketId).emit('newMessage', newMessage);
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

