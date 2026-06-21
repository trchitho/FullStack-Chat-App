import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: "Too many authentication attempts, please try again after 15 minutes",
        code: "RATE_LIMITED"
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 300, // Limit each IP to 300 requests per minute
    message: {
        success: false,
        message: "Too many requests, please slow down",
        code: "RATE_LIMITED"
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export const uploadLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 20, // Limit each IP to 20 uploads per 5 minutes
    message: {
        success: false,
        message: "Too many file uploads, please try again later",
        code: "RATE_LIMITED"
    },
    standardHeaders: true,
    legacyHeaders: false,
});
