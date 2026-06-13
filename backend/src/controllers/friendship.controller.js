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
