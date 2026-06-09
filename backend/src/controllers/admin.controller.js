import jwt from "jsonwebtoken";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

const adminCredentials = () => ({
  username: process.env.ADMIN_USERNAME || "admin123",
  password: process.env.ADMIN_PASSWORD || "123456",
});

export const adminLogin = (req, res) => {
  const { username, password } = req.body;
  const expected = adminCredentials();
  if (username !== expected.username || password !== expected.password) {
    return res.status(401).json({ message: "Thông tin admin không hợp lệ" });
  }

  const token = jwt.sign({ role: "admin", username }, process.env.JWT_SECRET, { expiresIn: "12h" });
  res.cookie("admin_jwt", token, {
    maxAge: 12 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV !== "development",
  });
  return res.status(200).json({ username, role: "admin" });
};

export const adminLogout = (_req, res) => {
  res.clearCookie("admin_jwt");
  return res.status(200).json({ message: "Đã đăng xuất admin" });
};

export const adminCheck = (req, res) => res.status(200).json({ username: req.admin.username, role: "admin" });

export const getAdminOverview = async (_req, res) => {
  const [totalUsers, totalMessages, attachmentMessages, callMessages] = await Promise.all([
    User.countDocuments(),
    Message.countDocuments(),
    Message.countDocuments({ attachment: { $exists: true, $ne: null } }),
    Message.countDocuments({ call: { $exists: true, $ne: null } }),
  ]);
  res.status(200).json({ totalUsers, totalMessages, attachmentMessages, callMessages });
};

export const getAdminUsers = async (_req, res) => {
  const users = await User.find().select("fullName email profilePic createdAt updatedAt").sort({ createdAt: -1 }).lean();
  const counts = await Message.aggregate([
    { $group: { _id: "$senderId", sentMessages: { $sum: 1 }, lastActivityAt: { $max: "$createdAt" } } },
  ]);
  const byUser = new Map(counts.map((item) => [String(item._id), item]));
  res.status(200).json(users.map((user) => ({ ...user, ...(byUser.get(String(user._id)) || { sentMessages: 0 }) })));
};
