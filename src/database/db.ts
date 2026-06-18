import mongoose from "mongoose";
import logger from "../logging";

const connectDB = async (): Promise<void> => {
    try {
        const connect = await mongoose.connect(process.env.MONGO_URI as string);
        logger.info(`MongoDB connected: ${connect.connection.host}`);
    } catch (err) {
        logger.error(`MongoDB connection Error : ${err}`);
        process.exit(1);
    }
};
export default connectDB;