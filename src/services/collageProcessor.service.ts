import sharp from "sharp";
import { CollageRequestModel } from "../modules/collage/collage.model";
import { CollageStatus } from "../modules/collage/collage.types";
import { StorageService } from "./storage.services";

export class CollageProcessorService {
    private storageService = new StorageService();

    async processNextRequest(): Promise<void> {
        const request = await CollageRequestModel.findOne({
            status: CollageStatus.PENDING,
        }).sort({
            createdAt: 1,
        });

        if (!request) {
            return;
        }

        request.status = CollageStatus.PROCESSING;
        await request.save();

        try {
            console.log(`Processing request ${request._id}`);

            request.status = CollageStatus.COMPLETED;
            await request.save();
        } catch (error) {
            request.status = CollageStatus.FAILED;
            await request.save();

            throw error;
        }
    }
}