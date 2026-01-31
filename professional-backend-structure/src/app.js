import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser())

// Routes import
import userRoutes from "./routes/user.route.js"
import itemRoutes from "./routes/item.route.js"
import requestRoutes from "./routes/request.route.js"
import transactionRoutes from "./routes/transaction.route.js"
import messageRoutes from "./routes/message.route.js"
import notificationRoutes from "./routes/notification.route.js"
import lostFoundRoutes from "./routes/lostFound.route.js"

// Routes declaration
app.use("/api/v1/users", userRoutes)
app.use("/api/v1/items", itemRoutes)
app.use("/api/v1/requests", requestRoutes)
app.use("/api/v1/transactions", transactionRoutes)
app.use("/api/v1/messages", messageRoutes)
app.use("/api/v1/notifications", notificationRoutes)
app.use("/api/v1/lost-found", lostFoundRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
        errors: err.errors || []
    });
});

export { app }
