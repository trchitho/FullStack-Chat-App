import mongoose from "mongoose";

const conversationSettingSchema = new mongoose.Schema(
    {
        peerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        mutedUntil: { type: Date, default: null },
        manuallyUnread: { type: Boolean, default: false },
        archived: { type: Boolean, default: false },
    },
    { _id: false }
);

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
        },
        fullName: {
            type: String,
            required: true,
        },
        username: {
            type: String,
            unique: true,
            sparse: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
            minLength: 6,
        },
        profilePic: {
            type: String,
            default: "",
        },
        coverPhoto: { type: String, default: "" },
        bio: { type: String, default: "", maxlength: 240 },
        introText: { type: String, default: "", maxlength: 500 },
        isSeedUser: { type: Boolean, default: false, index: true },
        currentCity: { type: String, default: "" },
        hometown: { type: String, default: "" },
        birthday: { type: Date, default: null },
        relationshipStatus: { type: String, default: "" },
        gender: { type: String, default: "" },
        phone: { type: String, default: "" },
        address: { type: String, default: "" },
        nickname: { type: String, default: "" },
        quote: { type: String, default: "" },
        aboutMe: { type: String, default: "", maxlength: 2000 },
        conversationSettings: { type: [conversationSettingSchema], default: [] },
    },
    {timestamps: true}
);

const User = mongoose.model("User", userSchema);

export default User;
