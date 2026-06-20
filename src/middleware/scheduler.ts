import { CollageProcessorService } from "../services/collageProcessor.service";
import { CleanupService } from "../services/cleanup.services";

const collageProcessor = new CollageProcessorService();
const cleanupService = new CleanupService();

// queue worker
setInterval(async () => {
    try {
        await collageProcessor.processNextRequest();
    } catch (err) {
        console.error("Processor error:", err);
    }
}, 5000);

// cleanup worker
setInterval(async () => {
    try {
        await cleanupService.cleanupOldRequests();
    } catch (err) {
        console.error("Cleanup error:", err);
    }
}, 10 * 1000); // every 10 seconds
