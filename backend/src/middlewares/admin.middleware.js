import jwt from "jsonwebtoken";

export const protectAdmin = (req, res, next) => {
  try {
    const token = req.cookies.admin_jwt;
    if (!token) return res.status(401).json({ message: "Admin authentication required" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded?.role !== "admin") return res.status(403).json({ message: "Admin access denied" });

    req.admin = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid admin session" });
  }
};
