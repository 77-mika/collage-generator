import { cleanupQueue } from "../queue/cleanup.queue";

export async function registerCleanupJob() {
    await cleanupQueue.add(
        "cleanup",
        {},
        {
            repeat: {
                pattern: "0 0 * * *", // daily midnight
            },
            jobId: "daily-cleanup",
        }
    );
}