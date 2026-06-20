import { CleanupService } from "../services/cleanup.services";

const cleanupService = new CleanupService();

setInterval(async () => {
    try {
        await cleanupService.cleanupOldRequests();
    } catch (err) {
        console.error(err);
    }
}, 10 * 1000);