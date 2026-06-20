import { CollageRequestModel } from "../modules/collage/collage.model";
import { CollageStatus } from "../modules/collage/collage.types";
import { StorageService } from "./storage.services";

export class CleanupService {
    private storageService = new StorageService();

    async cleanupOldRequests(): Promise<void> {
        const cutoffDate = new Date(Date.now() - 1 * 60 * 1000);

        console.log("Cutoff date:", cutoffDate);

        const oldRequests = await CollageRequestModel.find({});

        console.log("Found requests:", oldRequests.length);

        for (const request of oldRequests) {
            // delete uploaded images
            for (const image of request.images) {
                await this.storageService.deleteFile(image.key);
            }

            // delete generated collage
            if (request.resultImageKey) {
                await this.storageService.deleteFile(request.resultImageKey);
            }

            await request.deleteOne();
        }

        console.log(`Cleaned ${oldRequests.length} old requests`);
    }
}
