import { Worker } from "bullmq";
import { connection } from "./redis";
import { CleanupService } from "../services/cleanup.services";

const cleanupService = new CleanupService();

export const cleanupWorker = new Worker(
    "cleanup",
    async (job) => {
        if (job.name === "cleanup") {
            await cleanupService.cleanupOldRequests();
        }
    },
    {
        connection,
    },
);

console.log("Cleanup worker running...");
