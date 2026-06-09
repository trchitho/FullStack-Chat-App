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
