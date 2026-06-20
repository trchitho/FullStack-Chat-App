import crypto from "crypto";

export const securityHeaders = (req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(self), microphone=(self), geolocation=()");
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
    next();
};

export const requestContext = (req, res, next) => {
    req.id = req.get("x-request-id") || crypto.randomUUID();
    res.setHeader("X-Request-Id", req.id);
    next();
};
