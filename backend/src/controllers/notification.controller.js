import Notification from "../models/notification.model.js";

export const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ ownerId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50)
            .populate("senderId", "fullName profilePic")
            .lean();
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: "Could not load notifications" });
    }
};

export const markNotificationsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { ownerId: req.user._id, readAt: null },
            { $set: { readAt: new Date() } }
        );
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ message: "Could not update notifications" });
    }
};
