import app from "./app";
import connectDB from "./database/db";
import logger from "./logging";
import dotenv from "dotenv";
dotenv.config();
import { CollageProcessorService } from "./services/collageProcessor.service";
const collageProcessor = new CollageProcessorService();

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
    app.listen(PORT, () => {
        logger.info(`Server is running on http://localhost:${PORT}`);

        setInterval(async () => {
            await collageProcessor.processNextRequest();
        }, 5000);
    });
});
