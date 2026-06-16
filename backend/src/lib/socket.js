import {Server} from 'socket.io';
import {createServer} from 'http';
import express from 'express';
import jwt from 'jsonwebtoken';
import Conversation from '../models/conversation.model.js';
import Message from '../models/message.model.js';

const app = express();

const httpServer = createServer(app);

const allowedOrigins = process.env.NODE_ENV === "production"
    ? [/\.vercel\.app$/, /\.onrender\.com$/, process.env.CLIENT_URL].filter(Boolean)
    : ["http://localhost:5173"];

const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        credentials: true
    }
});

const userSocketMap = new Map();

export function getReceiverSocketIds(userId) {
    return [...(userSocketMap.get(String(userId)) || [])];
}

export function getReceiverSocketId(userId) {
    return getReceiverSocketIds(userId)[0];
}

const publishOnlineUsers = () => {
    io.emit("getOnlineUsers", [...userSocketMap.keys()]);
};

io.use((socket, next) => {
    try {
        const cookies = Object.fromEntries(
            (socket.request.headers.cookie || "").split(";").filter(Boolean).map((entry) => {
                const separator = entry.indexOf("=");
                return [
                    decodeURIComponent(entry.slice(0, separator).trim()),
                    decodeURIComponent(entry.slice(separator + 1).trim()),
                ];
            })
        );
        const decoded = jwt.verify(cookies.jwt, process.env.JWT_SECRET);
        socket.data.userId = String(decoded.userId);
        next();
    } catch {
        next(new Error("Unauthorized"));
    }
});

io.on('connection', (socket) => {
    console.log('A user connected');

    const userId = socket.data.userId;
    if (userId) {
        const sockets = userSocketMap.get(userId) || new Set();
        sockets.add(socket.id);
        userSocketMap.set(userId, sockets);
        socket.join(`user:${userId}`);
    }
    publishOnlineUsers();

    socket.on("messageDelivered", async ({ messageId }) => {
        const existingMessage = await Message.findById(messageId).lean();
        const isDirectRecipient = String(existingMessage?.receiverId) === String(userId);
        const isGroupParticipant = existingMessage?.conversationId
            ? await Conversation.exists({ _id: existingMessage.conversationId, participants: userId })
            : false;
        if (!isDirectRecipient && !isGroupParticipant) return;
        const message = await Message.findOneAndUpdate(
            { _id: messageId, "deliveredTo.user": { $ne: userId } },
            { $push: { deliveredTo: { user: userId, at: new Date() } } },
            { new: true }
        );
        if (message) {
            io.to(`user:${message.senderId}`).emit("messageDeliveredUpdate", message);
        }
    });

    socket.on("conversationSeen", async ({ peerId }) => {
        const seenAt = new Date();
        await Message.updateMany(
            { senderId: peerId, receiverId: userId, "deliveredTo.user": { $ne: userId } },
            { $push: { deliveredTo: { user: userId, at: seenAt } } }
        );
        await Message.updateMany(
            { senderId: peerId, receiverId: userId, "seenBy.user": { $ne: userId } },
            { $push: { seenBy: { user: userId, at: seenAt } } }
        );
        io.to(`user:${peerId}`).emit("conversationSeenUpdate", { userId, seenAt });
    });

    socket.on("callInvite", ({ recipientId, type, callId }) => {
        if (!recipientId || !["voice", "video"].includes(type)) return;
        if (!getReceiverSocketIds(recipientId).length) {
            socket.emit("call:offline", { recipientId, type, callId });
            return;
        }
        socket.emit("call:ringing", { recipientId, type, callId });
        io.to(`user:${recipientId}`).emit("incomingCall", {
            callerId: userId,
            callId,
            type,
            startedAt: new Date().toISOString(),
        });
    });

    socket.on("callAnswer", ({ callerId, accepted, callId }) => {
        if (!callerId) return;
        io.to(`user:${callerId}`).emit("callAnswer", {
            responderId: userId,
            callId,
            accepted: Boolean(accepted),
            answeredAt: new Date().toISOString(),
        });
    });

    socket.on("call:offer", ({ recipientId, callId, offer }) => {
        if (!recipientId || !offer) return;
        io.to(`user:${recipientId}`).emit("call:offer", { callerId: userId, callId, offer });
    });

    socket.on("call:answer", ({ recipientId, callId, answer }) => {
        if (!recipientId || !answer) return;
        io.to(`user:${recipientId}`).emit("call:answer", { responderId: userId, callId, answer });
    });

    socket.on("call:ice-candidate", ({ recipientId, callId, candidate }) => {
        if (!recipientId || !candidate) return;
        io.to(`user:${recipientId}`).emit("call:ice-candidate", { fromUserId: userId, callId, candidate });
    });

    socket.on("call:end", ({ recipientId, callId, status, duration }) => {
        if (!recipientId) return;
        io.to(`user:${recipientId}`).emit("call:end", { fromUserId: userId, callId, status, duration });
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
        const sockets = userSocketMap.get(userId);
        sockets?.delete(socket.id);
        if (sockets?.size === 0) userSocketMap.delete(userId);
        publishOnlineUsers();
    })
    
})

export {app, io, httpServer};
