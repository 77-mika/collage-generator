import app from "./app";
import connectDB from "./database/db";
import logger from "./logging";
import dotenv from "dotenv";
dotenv.config();
import "./queue/collage.worker";
import "./queue/collage.worker";
import "./queue/cleanup.worker";
import { registerCleanupJob } from "./services/cleanup.scheduler";
import { cleanupQueue } from "./queue/cleanup.queue";

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
    app.listen(PORT, async () => {
        logger.info(`Server is running on http://localhost:${PORT}`);
        await registerCleanupJob();
    });
});
