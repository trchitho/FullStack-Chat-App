import AuditLog from "../models/auditLog.model.js";

export const logAuditEvent = async ({ req, userId, action, status, metadata = {} }) => {
    try {
        const ip = req?.ip || req?.headers?.["x-forwarded-for"] || "";
        const userAgent = req?.headers?.["user-agent"] || "";
        const requestId = req?.id || "";

        await AuditLog.create({
            userId: userId || null,
            action,
            ip,
            userAgent,
            requestId,
            status,
            metadata: new Map(Object.entries(metadata)),
        });
    } catch (error) {
        console.error("Audit log creation failed:", error.message);
    }
};
