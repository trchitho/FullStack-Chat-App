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
            const seedUsers = await User.find({ isSeedUser: true }).select("_id").lean();
            if (seedUsers.length) {
                await Friendship.bulkWrite(seedUsers.map((seedUser) => ({
                    updateOne: {
                        filter: { requester: seedUser._id, recipient: newUser._id },
                        update: { $setOnInsert: { status: "accepted" } },
                        upsert: true,
                    },
                })));
            }
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
        console.log("Error in login controller" , error.message);
        return res.status(500).json({message: 'Internal server error'});
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

        console.log("Updating profile for userId:", userId);

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
        console.log("Error in updateProfile controller" , error.message);
        return res.status(500).json({message: 'Internal server error'});   
    }

}

export const checkAuth =  (req, res) => {
    try {
        return res.status(200).json(req.user);
    } catch (error) {
        console.log("Error in checkAuth controller" , error.message);
        return res.status(500).json({message: 'Internal server error'});
    }
}
