import { Queue } from "bullmq";
import { connection } from "./redis";

export const cleanupQueue = new Queue("cleanup", {
    connection,
});