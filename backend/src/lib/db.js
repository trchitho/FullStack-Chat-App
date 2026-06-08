import mongoose from 'mongoose';

let connectionPromise = null;

export async function connectDB() {
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    if (connectionPromise) {
        return connectionPromise;
    }

    try {
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is not configured");
        }

        connectionPromise = mongoose.connect(process.env.MONGODB_URI);
        const conn = await connectionPromise;
        console.log("MongoDB connected");
        return conn.connection;
    } catch (error) {
        connectionPromise = null;
        console.error("MongoDB connection error:", error);
        throw error;
    }
}
