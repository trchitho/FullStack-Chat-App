import Friendship from "../models/friendship.model.js";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import { io } from "../lib/socket.js";

const pairQuery = (firstUserId, secondUserId) => ({
    $or: [
        { requester: firstUserId, recipient: secondUserId },
        { requester: secondUserId, recipient: firstUserId },
    ],
});

export const getRelationship = async (req, res) => {
    const relationship = await Friendship.findOne(pairQuery(req.user._id, req.params.userId)).lean();
    if (!relationship) return res.status(200).json({ status: "none" });
    const direction = String(relationship.requester) === String(req.user._id) ? "outgoing" : "incoming";
    res.status(200).json({ ...relationship, direction });
};

export const sendFriendRequest = async (req, res) => {
    const recipientId = req.params.userId;
    if (String(recipientId) === String(req.user._id)) {
        return res.status(400).json({ message: "You cannot add yourself" });
    }
    if (!await User.exists({ _id: recipientId })) {
        return res.status(404).json({ message: "User not found" });
    }
    const existing = await Friendship.findOne(pairQuery(req.user._id, recipientId));
    if (existing?.status === "accepted") return res.status(409).json({ message: "Already friends" });
    if (existing?.status === "blocked") return res.status(403).json({ message: "Friend request unavailable" });
    if (existing) {
        existing.requester = req.user._id;
        existing.recipient = recipientId;
        existing.status = "pending";
        await existing.save();
        return res.status(200).json(existing);
    }
    const request = await Friendship.create({ requester: req.user._id, recipient: recipientId });
    const notification = await Notification.create({
        ownerId: recipientId,
        senderId: req.user._id,
        type: "friend_request",
    });
    io.to(`user:${recipientId}`).emit("newNotification", {
        ...notification.toObject(),
        senderId: {
            _id: req.user._id,
            fullName: req.user.fullName,
            profilePic: req.user.profilePic,
        },
    });
    res.status(201).json(request);
};

export const respondToFriendRequest = async (req, res) => {
    const request = await Friendship.findOne({
        _id: req.params.requestId,
        recipient: req.user._id,
        status: "pending",
    });
    if (!request) return res.status(404).json({ message: "Friend request not found" });
    const action = req.body.action;
    if (!["accept", "decline"].includes(action)) {
        return res.status(400).json({ message: "Invalid friend request action" });
    }
    request.status = action === "accept" ? "accepted" : "rejected";
    await request.save();
    res.status(200).json(request);
};

export const removeFriendship = async (req, res) => {
    const relationship = await Friendship.findOne(pairQuery(req.user._id, req.params.userId));
    if (!relationship) return res.status(404).json({ message: "Friendship not found" });
    await relationship.deleteOne();
    res.status(200).json({ success: true });
};

export const listFriends = async (req, res) => {
    const relationships = await Friendship.find({
        status: "accepted",
        $or: [{ requester: req.user._id }, { recipient: req.user._id }],
    }).lean();
    const friendIds = relationships.map((item) =>
        String(item.requester) === String(req.user._id) ? item.recipient : item.requester
    );
    const friends = await User.find({ _id: { $in: friendIds } })
        .select("fullName username profilePic bio currentCity")
        .sort({ fullName: 1 })
        .lean();
    res.status(200).json(friends);
};

const acceptedFriendIds = async (userId) => {
    const relationships = await Friendship.find({
        status: "accepted",
        $or: [{ requester: userId }, { recipient: userId }],
    }).lean();
    return relationships.map((item) =>
        String(item.requester) === String(userId) ? String(item.recipient) : String(item.requester)
    );
};

export const listFriendSuggestions = async (req, res) => {
    const currentUserId = String(req.user._id);
    const relationships = await Friendship.find({
        $or: [{ requester: req.user._id }, { recipient: req.user._id }],
    }).lean();
    const relatedIds = new Set([currentUserId]);
    relationships.forEach((item) => {
        relatedIds.add(String(item.requester) === currentUserId ? String(item.recipient) : String(item.requester));
    });
    const ownFriendIds = await acceptedFriendIds(req.user._id);
    const users = await User.find({ _id: { $nin: [...relatedIds] } })
        .select("fullName username profilePic bio currentCity updatedAt")
        .lean();
    const suggestions = await Promise.all(users.map(async (user) => {
        const friendIds = await acceptedFriendIds(user._id);
        return { ...user, mutualFriendsCount: friendIds.filter((id) => ownFriendIds.includes(id)).length };
    }));
    suggestions.sort((a, b) =>
        b.mutualFriendsCount - a.mutualFriendsCount || a.fullName.localeCompare(b.fullName)
    );
    res.status(200).json(suggestions);
};

export const listUserFriends = async (req, res) => {
    const userId = req.params.userId === "me" ? req.user._id : req.params.userId;
    if (!await User.exists({ _id: userId })) {
        return res.status(404).json({ message: "User not found" });
    }
    const relationships = await Friendship.find({
        status: "accepted",
        $or: [{ requester: userId }, { recipient: userId }],
    }).lean();
    const friendIds = relationships.map((item) =>
        String(item.requester) === String(userId) ? item.recipient : item.requester
    );
    const friends = await User.find({ _id: { $in: friendIds } })
        .select("fullName username profilePic bio currentCity")
        .sort({ fullName: 1 })
        .lean();
    res.status(200).json(friends);
};

export const listFriendRequests = async (req, res) => {
    const [incoming, outgoing] = await Promise.all([
        Friendship.find({ recipient: req.user._id, status: "pending" })
            .populate("requester", "fullName username profilePic bio")
            .sort({ createdAt: -1 }),
        Friendship.find({ requester: req.user._id, status: "pending" })
            .populate("recipient", "fullName username profilePic bio")
            .sort({ createdAt: -1 }),
    ]);
    res.status(200).json({ incoming, outgoing });
};
