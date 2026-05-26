import {Server} from 'socket.io';
import {createServer} from 'http';
import express from 'express';

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

export function getReceiverSocketId(userId) {
    return userSocketMap[userId];
}

// used to store online users
const userSocketMap = {}  // {userId: socketId}


io.on('connection', (socket) => {
    console.log('A user connected');

    const userId = socket.handshake.query.userId;
    if(userId) userSocketMap[userId] = socket.id;

    // io.emit is used to send events to all connected clients..(send online users to all clients)
    io.emit('getOnlineUsers', Object.keys(userSocketMap));

    socket.on('disconnect', () => {
        console.log('A user disconnected');
        delete userSocketMap[userId];
        io.emit('getOnlineUsers', Object.keys(userSocketMap));
    })
    
})

export {app, io, httpServer};
