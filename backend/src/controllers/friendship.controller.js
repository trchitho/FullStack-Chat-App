import Friendship from "../models/friendship.model.js";
import User from "../models/user.model.js";

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
    res.status(201).json(request);
};
