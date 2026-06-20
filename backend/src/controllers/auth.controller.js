import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import Friendship from "../models/friendship.model.js";
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";

const googleConfig = () => ({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL,
    frontendUrl: process.env.FRONTEND_URL || process.env.CLIENT_URL || "http://localhost:5173",
});

const createUniqueUsername = async (email) => {
    const base = email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "") || `user${Date.now()}`;
    if (!(await User.exists({ username: base }))) return base;
    return `${base}${Date.now().toString().slice(-6)}`;
};

const addSeedFriends = async (userId) => {
    const seedUsers = await User.find({ isSeedUser: true }).select("_id").lean();
    if (!seedUsers.length) return;
    await Friendship.bulkWrite(seedUsers.map((seedUser) => ({
        updateOne: {
            filter: { requester: seedUser._id, recipient: userId },
            update: { $setOnInsert: { status: "accepted" } },
            upsert: true,
        },
    })));
};

export const signup = async (req, res) => {
    const {email, fullName, password} = req.body;

    try {
        if(!email || !fullName || !password) {
            return res.status(400).json({message: 'All fields are required'});
        }

        if(password.length < 6) {
            return res.status(400).json({message: 'Password must be at least 6 characters long'});
        }

        const user = await User.findOne({email});
        if(user) return res.status(400).json({message: 'User already exists'});

        // hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const usernameBase = email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "");
        let username = usernameBase || `user${Date.now()}`;
        if (await User.exists({ username })) username = `${username}${Date.now().toString().slice(-5)}`;

        const newUser = new User({
            email,
            fullName,
            password: hashedPassword,
            username,
        });

        if(newUser){
            // generate jwt token
            generateToken(newUser._id, res);
            await newUser.save();
            await addSeedFriends(newUser._id);
            return res.status(201).json({
                _id: newUser._id,
                email: newUser.email,
                fullName: newUser.fullName,
                username: newUser.username,
            });
        }
        else{
            return res.status(400).json({message: 'Failed to create new user'});
        }

    } catch (error) {
        return res.status(500).json({message: 'Something went wrong, please try again'});
    }
};

export const login = async (req, res) => {
    const {email, password} = req.body;

    try {
        const user = await User.findOne({email});
        if(!user) return res.status(400).json({message: 'Invalid credentials'});

        if (!user.password) {
            return res.status(400).json({ message: "Please sign in with Google" });
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if(!isPasswordMatch) return res.status(400).json({message: 'Invalid credentials'});

        // generate jwt token
        generateToken(user._id, res);

        return res.status(200).json({
            _id: user._id,
            email: user.email,
            fullName: user.fullName,
            profilePic: user.profilePic
        });

    } catch (error) {
        console.error("Login failed:", error.message);
        return res.status(500).json({message: 'Internal server error'});
    }
};

export const googleLogin = (req, res) => {
    const config = googleConfig();
    if (!config.clientId || !config.clientSecret || !config.callbackUrl) {
        return res.status(503).json({ message: "Google OAuth is not configured" });
    }
    const state = jwt.sign({ purpose: "google-oauth" }, process.env.JWT_SECRET, { expiresIn: "10m" });
    const params = new URLSearchParams({
        client_id: config.clientId, redirect_uri: config.callbackUrl,
        response_type: "code", scope: "openid email profile", state,
    });
    res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
};

const fetchGoogleProfile = async (code, config) => {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            code, client_id: config.clientId, client_secret: config.clientSecret,
            redirect_uri: config.callbackUrl, grant_type: "authorization_code",
        }),
    });
    if (!tokenResponse.ok) throw new Error("Google token exchange failed");
    const tokens = await tokenResponse.json();
    const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    if (!profileResponse.ok) throw new Error("Google profile request failed");
    return profileResponse.json();
};

const findOrCreateGoogleUser = async (profile) => {
    let user = await User.findOne({ $or: [{ googleId: profile.sub }, { email: profile.email }] });
    if (user) {
        if (!user.googleId) user.googleId = profile.sub;
        if (!user.profilePic && profile.picture) user.profilePic = profile.picture;
        await user.save();
        return user;
    }
    user = await User.create({
        googleId: profile.sub,
        email: profile.email,
        fullName: profile.name || profile.email.split("@")[0],
        username: await createUniqueUsername(profile.email),
        profilePic: profile.picture || "",
        isSeedUser: false,
    });
    await addSeedFriends(user._id);
    return user;
};

export const googleCallback = async (req, res) => {
    const config = googleConfig();
    const failureUrl = `${config.frontendUrl}/login?oauth=error`;
    try {
        const state = jwt.verify(String(req.query.state || ""), process.env.JWT_SECRET);
        if (state.purpose !== "google-oauth" || !req.query.code) return res.redirect(failureUrl);
        const profile = await fetchGoogleProfile(req.query.code, config);
        if (!profile.email || !profile.email_verified) return res.redirect(failureUrl);
        const user = await findOrCreateGoogleUser(profile);
        generateToken(user._id, res);
        return res.redirect(`${config.frontendUrl}/login?oauth=success`);
    } catch {
        return res.redirect(failureUrl);
    }
};

export const logout = async (req, res) => {
    try {
        res.clearCookie('jwt');
        return res.status(200).json({message: 'Logged out successfully'});
    } catch (error) {
        return res.status(500).json({message: 'Internal server error'});
    }
};

export const updateProfile = async (req, res) => {
    try {
        const {profilePic} = req.body;
        const userId= req.user._id

        if(!profilePic) return res.status(400).json({message: 'Profile picture is required'});

        const uploadResponse = await cloudinary.uploader.upload(profilePic);

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {profilePic: uploadResponse.secure_url},
            {new: true}
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Profile image update failed:", error.message);
        return res.status(500).json({message: 'Internal server error'});   
    }

}

export const checkAuth =  (req, res) => {
    try {
        return res.status(200).json(req.user);
    } catch (error) {
        console.error("Auth check failed:", error.message);
        return res.status(500).json({message: 'Internal server error'});
    }
}
