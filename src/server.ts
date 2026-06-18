import app from "./app"
import connectDB from "./database/db";
import logger from "./logging";

const PORT = process.env.PORT || 3000

connectDB().then(() => {
    app.listen(PORT, () => {
        logger.info(`Server is running in http://localhost:${PORT}`);
    });
});