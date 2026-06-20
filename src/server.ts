import app from "./app";
import connectDB from "./database/db";
import logger from "./logging";
import dotenv from "dotenv";
dotenv.config();
import "./middleware/scheduler"
import "./queue/collage.worker";

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
    app.listen(PORT, () => {
        logger.info(`Server is running on http://localhost:${PORT}`);
    });
});