import sharp from "sharp";
import { CollageRequestModel } from "../modules/collage/collage.model";
import { CollageStatus } from "../modules/collage/collage.types";
import { StorageService } from "./storage.services";

export class CollageProcessorService {
    private storageService = new StorageService();

    async processRequestById(requestId: string) {
        const request = await CollageRequestModel.findOneAndUpdate(
            {
                _id: requestId,
                status: CollageStatus.PENDING,
            },
            {
                $set: { status: CollageStatus.PROCESSING },
            },
            { new: true },
        );

        if (!request) {
            console.log(`Request ${requestId} not available`);
            return;
        }

        const safeColor = request.borderColor || "#ffffff";

        if (!request.images.length) {
            throw new Error("No images provided");
        }

        request.logs.push({
            step: "START",
            message: "Processing started",
            timestamp: new Date(),
        });

        await request.save();

        try {
            // 1. Download
            const imageBuffers = await Promise.all(
                request.images.map((img) =>
                    this.storageService.downloadFile(img.key),
                ),
            );

            // 2. Metadata
            const metadata = await Promise.all(
                imageBuffers.map((b) => sharp(b).metadata()),
            );

            if (metadata.some((m) => !m.width || !m.height)) {
                throw new Error("Invalid image metadata");
            }

            // 3. Resize
            let resizedImages: Buffer[];

            if (request.orientation === "HORIZONTAL") {
                const targetHeight = Math.min(
                    ...metadata.map((m) => m.height!),
                );

                resizedImages = await Promise.all(
                    imageBuffers.map((b) =>
                        sharp(b)
                            .resize({ height: targetHeight })
                            .jpeg()
                            .toBuffer(),
                    ),
                );
            } else {
                const targetWidth = Math.min(...metadata.map((m) => m.width!));

                resizedImages = await Promise.all(
                    imageBuffers.map((b) =>
                        sharp(b)
                            .resize({ width: targetWidth })
                            .jpeg()
                            .toBuffer(),
                    ),
                );
            }

            // 4. resized metadata
            const resizedMetadata = await Promise.all(
                resizedImages.map((b) => sharp(b).metadata()),
            );

            const borderSize = request.borderSize;

            // 5. canvas size
            let collageWidth = 0;
            let collageHeight = 0;

            if (request.orientation === "HORIZONTAL") {
                collageWidth =
                    resizedMetadata.reduce((s, i) => s + (i.width || 0), 0) +
                    borderSize * (resizedImages.length + 1);

                collageHeight =
                    (resizedMetadata[0].height || 0) + borderSize * 2;
            } else {
                collageWidth = (resizedMetadata[0].width || 0) + borderSize * 2;

                collageHeight =
                    resizedMetadata.reduce((s, i) => s + (i.height || 0), 0) +
                    borderSize * (resizedImages.length + 1);
            }

            // 6. composite
            const composites: sharp.OverlayOptions[] = [];

            if (request.orientation === "HORIZONTAL") {
                let left = borderSize;

                resizedImages.forEach((img, i) => {
                    composites.push({
                        input: img,
                        left,
                        top: borderSize,
                    });

                    left += (resizedMetadata[i].width || 0) + borderSize;
                });
            } else {
                let top = borderSize;

                resizedImages.forEach((img, i) => {
                    composites.push({
                        input: img,
                        left: borderSize,
                        top,
                    });

                    top += (resizedMetadata[i].height || 0) + borderSize;
                });
            }

            // 7. generate
            const collageBuffer = await sharp({
                create: {
                    width: collageWidth,
                    height: collageHeight,
                    channels: 3,
                    background: safeColor,
                },
            })
                .composite(composites)
                .jpeg()
                .toBuffer();

            // 8. upload
            const resultKey = `results/${request._id}.jpg`;

            await this.storageService.uploadBuffer(collageBuffer, resultKey);

            // 9. final update
            request.resultImageKey = resultKey;
            request.status = CollageStatus.COMPLETED;

            request.logs.push({
                step: "DONE",
                message: "Collage created successfully",
                timestamp: new Date(),
            });

            await request.save();

            console.log(`Request ${requestId} completed`);
        } catch (err) {
            request.status = CollageStatus.FAILED;

            request.logs.push({
                step: "ERROR",
                message: (err as Error).message,
                timestamp: new Date(),
            });

            await request.save();
            throw err;
        }
    }
}
