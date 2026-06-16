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

    socket.on("callInvite", ({ recipientId, type }) => {
        if (!recipientId || !["voice", "video"].includes(type)) return;
        io.to(`user:${recipientId}`).emit("incomingCall", {
            callerId: userId,
            type,
            startedAt: new Date().toISOString(),
        });
    });

    socket.on("callAnswer", ({ callerId, accepted }) => {
        if (!callerId) return;
        io.to(`user:${callerId}`).emit("callAnswer", {
            responderId: userId,
            accepted: Boolean(accepted),
            answeredAt: new Date().toISOString(),
        });
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
