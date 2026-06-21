export const logger = {
    info: (event, metadata = {}, requestId = "", userId = "") => {
        console.log(JSON.stringify({
            timestamp: new Date().toISOString(),
            level: "info",
            event,
            requestId,
            userId,
            ...sanitizeMetadata(metadata),
        }));
    },
    warn: (event, metadata = {}, requestId = "", userId = "") => {
        console.warn(JSON.stringify({
            timestamp: new Date().toISOString(),
            level: "warn",
            event,
            requestId,
            userId,
            ...sanitizeMetadata(metadata),
        }));
    },
    error: (event, errorObj = {}, requestId = "", userId = "") => {
        const errorDetail = errorObj instanceof Error 
            ? { message: errorObj.message, stack: process.env.NODE_ENV === "development" ? errorObj.stack : undefined } 
            : errorObj;
        console.error(JSON.stringify({
            timestamp: new Date().toISOString(),
            level: "error",
            event,
            requestId,
            userId,
            error: errorDetail,
        }));
    }
};

function sanitizeMetadata(metadata) {
    if (!metadata || typeof metadata !== "object") return metadata;
    const sanitized = { ...metadata };
    const sensitiveKeys = ["password", "token", "jwt", "cookie", "secret", "key"];
    for (const key of Object.keys(sanitized)) {
        if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
            sanitized[key] = "[REDACTED]";
        }
    }
    return sanitized;
}
