import mongoose from "mongoose";

const conversationSettingSchema = new mongoose.Schema(
    {
        peerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        mutedUntil: { type: Date, default: null },
        manuallyUnread: { type: Boolean, default: false },
        archived: { type: Boolean, default: false },
        theme: { type: String, default: "", trim: true },
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
        googleId: {
            type: String,
            unique: true,
            sparse: true,
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
            required: function requirePassword() {
                return !this.googleId;
            },
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
        work: {
            company: { type: String, default: "" },
            position: { type: String, default: "" },
            startDate: { type: Date, default: null },
            endDate: { type: Date, default: null },
            description: { type: String, default: "" },
        },
        education: {
            school: { type: String, default: "" },
            major: { type: String, default: "" },
            degree: { type: String, default: "" },
            startYear: { type: Number, default: null },
            endYear: { type: Number, default: null },
        },
        hobbies: { type: [String], default: [] },
        interests: { type: [String], default: [] },
        placesVisited: { type: [String], default: [] },
        favoriteDestination: { type: String, default: "" },
        languages: { type: [String], default: [] },
        skills: { type: [String], default: [] },
        links: {
            website: { type: String, default: "" },
            github: { type: String, default: "" },
            linkedin: { type: String, default: "" },
            other: { type: [String], default: [] },
        },
        profileVisibility: { type: Map, of: String, default: {} },
        conversationSettings: { type: [conversationSettingSchema], default: [] },
    },
    {timestamps: true}
);

const User = mongoose.model("User", userSchema);

export default User;
