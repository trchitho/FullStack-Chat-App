import cloudinary from "../lib/cloudinary.js";
import Friendship from "../models/friendship.model.js";
import User from "../models/user.model.js";

const publicProfileFields = [
    "email", "fullName", "username", "profilePic", "coverPhoto", "bio", "introText",
    "currentCity", "hometown", "birthday", "relationshipStatus", "gender", "phone",
    "address", "nickname", "quote", "aboutMe", "work", "education", "hobbies",
    "interests", "placesVisited", "favoriteDestination", "languages", "skills",
    "links", "profileVisibility", "createdAt",
].join(" ");

export const getProfile = async (req, res) => {
    const userId = req.params.userId === "me" ? req.user._id : req.params.userId;
    const user = await User.findById(userId).select(publicProfileFields).lean();
    if (!user) return res.status(404).json({ message: "Profile not found" });
    const friendCount = await Friendship.countDocuments({
        status: "accepted",
        $or: [{ requester: userId }, { recipient: userId }],
    });
    res.status(200).json({ ...user, friendCount, isOwner: String(userId) === String(req.user._id) });
};

const editableFields = new Set([
    "fullName", "username", "bio", "introText", "currentCity", "hometown",
    "birthday", "relationshipStatus", "gender", "phone", "address", "nickname",
    "quote", "aboutMe", "work", "education", "hobbies", "interests",
    "placesVisited", "favoriteDestination", "languages", "skills", "links",
    "profileVisibility",
]);

export const updateMyProfile = async (req, res) => {
    const changes = Object.fromEntries(
        Object.entries(req.body).filter(([key]) => editableFields.has(key))
    );
    if (!Object.keys(changes).length) {
        return res.status(400).json({ message: "No editable profile fields supplied" });
    }
    const updated = await User.findByIdAndUpdate(req.user._id, changes, {
        new: true,
        runValidators: true,
    }).select(publicProfileFields);
    res.status(200).json(updated);
};
