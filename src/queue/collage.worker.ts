import { Worker } from "bullmq";
import { connection } from "./redis";
import { CollageProcessorService } from "../services/collageProcessor.service";

const processor = new CollageProcessorService();

export const collageWorker = new Worker(
    "collage",
    async (job) => {
        if (job.name === "process-collage") {
            await processor.processRequestById(job.data.requestId);
        }
    },
    {
        connection,
        concurrency: 3,
    }
);