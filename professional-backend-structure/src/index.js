import dotenv from 'dotenv';
import { createServer } from 'http';
import { connectDB } from "./db/index.js";
import { app } from './app.js';
import { initializeSocket } from './socket.js';
import { startReminderScheduler } from './services/reminder.service.js';

dotenv.config({ path: '.env' });

const server = createServer(app);

connectDB()
    .then(() => {
        initializeSocket(server);
        startReminderScheduler();
        const port = process.env.PORT || 8000;
        server.listen(port, () => console.log(`Server running on port ${port} 🔥`));
    })
    .catch((err) => {
        console.log('MongoDB connection failed', err);
        process.exit(1);
    });
