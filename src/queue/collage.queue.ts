import { Queue } from "bullmq";
import { connection } from "./redis";

export const collageQueue = new Queue("collage", {
    connection,
});