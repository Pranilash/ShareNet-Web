import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { Message } from "./models/message.model.js";
import { Transaction } from "./models/transaction.model.js";

let io;

export const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CORS_ORIGIN,
            credentials: true
        }
    });

    // Authentication middleware
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token || 
                          socket.handshake.headers.authorization?.replace("Bearer ", "");
            
            if (!token) {
                return next(new Error("Authentication required"));
            }

            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            socket.userId = decoded._id;
            next();
        } catch (error) {
            next(new Error("Invalid token"));
        }
    });

    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.userId}`);

        // Join transaction room
        socket.on("join-transaction", async (transactionId) => {
            try {
                const transaction = await Transaction.findById(transactionId);
                if (!transaction) {
                    socket.emit("error", { message: "Transaction not found" });
                    return;
                }

                // Verify user is participant
                const isParticipant = 
                    transaction.owner.toString() === socket.userId ||
                    transaction.requester.toString() === socket.userId;

                if (!isParticipant) {
                    socket.emit("error", { message: "Not authorized" });
                    return;
                }

                // Check transaction status allows chat
                if (!['ACCEPTED', 'AGREEMENT_PROPOSED', 'ACTIVE', 'RETURN_PENDING', 'DISPUTED'].includes(transaction.status)) {
                    socket.emit("error", { message: "Chat not available for this transaction status" });
                    return;
                }

                socket.join(`transaction:${transactionId}`);
                socket.emit("joined", { transactionId });
            } catch (error) {
                socket.emit("error", { message: "Failed to join transaction" });
            }
        });

        // Send message
        socket.on("send-message", async ({ transactionId, content }) => {
            try {
                const transaction = await Transaction.findById(transactionId);
                if (!transaction) {
                    socket.emit("error", { message: "Transaction not found" });
                    return;
                }

                const isParticipant = 
                    transaction.owner.toString() === socket.userId ||
                    transaction.requester.toString() === socket.userId;

                if (!isParticipant) {
                    socket.emit("error", { message: "Not authorized" });
                    return;
                }

                const message = await Message.create({
                    transaction: transactionId,
                    sender: socket.userId,
                    content
                });

                const populatedMessage = await Message.findById(message._id)
                    .populate("sender", "fullName avatar");

                io.to(`transaction:${transactionId}`).emit("new-message", populatedMessage);
            } catch (error) {
                socket.emit("error", { message: "Failed to send message" });
            }
        });

        // Leave transaction room
        socket.on("leave-transaction", (transactionId) => {
            socket.leave(`transaction:${transactionId}`);
        });

        // Typing indicators
        socket.on("typing", ({ transactionId }) => {
            socket.to(`transaction:${transactionId}`).emit("user-typing", { userId: socket.userId });
        });

        socket.on("stop-typing", ({ transactionId }) => {
            socket.to(`transaction:${transactionId}`).emit("user-stop-typing", { userId: socket.userId });
        });

        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.userId}`);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized");
    }
    return io;
};

// Helper to emit notifications
export const emitNotification = (userId, notification) => {
    if (io) {
        io.to(`user:${userId}`).emit("notification", notification);
    }
};
