import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
        action: { type: String, required: true, index: true },
        ip: { type: String, default: "" },
        userAgent: { type: String, default: "" },
        requestId: { type: String, default: "", index: true },
        status: { type: String, enum: ["success", "failure"], required: true },
        metadata: { type: mongoose.Schema.Types.Map, of: String, default: {} },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

const AuditLog = mongoose.model("AuditLog", auditLogSchema);
export default AuditLog;
