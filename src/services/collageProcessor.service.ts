import sharp from "sharp";
import { CollageRequestModel } from "../modules/collage/collage.model";
import { CollageStatus } from "../modules/collage/collage.types";
import { StorageService } from "./storage.services";

export class CollageProcessorService {
    private storageService = new StorageService();

    async processNextRequest(): Promise<void> {
        // const request = await CollageRequestModel.findOneAndUpdate(
        //     { status: CollageStatus.PENDING },
        //     { $set: { status: CollageStatus.PROCESSING } },
        //     { sort: { createdAt: 1 }, new: true },
        // );

        const request = await CollageRequestModel.findOneAndUpdate(
            { status: CollageStatus.PENDING },
            { $set: { status: CollageStatus.PROCESSING } },
            {
                sort: { createdAt: 1 },
                returnDocument: "after",
            },
        );

        // ✅ Guard against null
        if (!request) {
            return; // No pending request, exit early
        }

        // Now TypeScript knows request is not null

        try {
            const imageBuffers = await Promise.all(
                request.images.map((image) =>
                    this.storageService.downloadFile(image.key),
                ),
            );

            const metadata = await Promise.all(
                imageBuffers.map((buffer) => sharp(buffer).metadata()),
            );
            let resizedImages: Buffer[];

            console.log(metadata);
            if (request.orientation === "HORIZONTAL") {
                const targetHeight = Math.min(
                    ...metadata.map((m) => m.height || 0),
                );

                resizedImages = await Promise.all(
                    imageBuffers.map((buffer) =>
                        sharp(buffer)
                            .resize({
                                height: targetHeight,
                            })
                            .jpeg()
                            .toBuffer(),
                    ),
                );
            } else {
                const targetWidth = Math.min(
                    ...metadata.map((m) => m.width || 0),
                );

                resizedImages = await Promise.all(
                    imageBuffers.map((buffer) =>
                        sharp(buffer)
                            .resize({
                                width: targetWidth,
                            })
                            .jpeg()
                            .toBuffer(),
                    ),
                );
            }
            const resizedMetadata = await Promise.all(
                resizedImages.map((buffer) => sharp(buffer).metadata()),
            );

            console.log(resizedMetadata);
            const borderSize = request.borderSize;

            let collageWidth = 0;
            let collageHeight = 0;

            if (request.orientation === "HORIZONTAL") {
                collageWidth =
                    resizedMetadata.reduce(
                        (sum, image) => sum + (image.width || 0),
                        0,
                    ) +
                    borderSize * (resizedImages.length + 1);

                collageHeight =
                    (resizedMetadata[0].height || 0) + borderSize * 2;
            } else {
                collageWidth = (resizedMetadata[0].width || 0) + borderSize * 2;

                collageHeight =
                    resizedMetadata.reduce(
                        (sum, image) => sum + (image.height || 0),
                        0,
                    ) +
                    borderSize * (resizedImages.length + 1);
            }

            console.log({
                collageWidth,
                collageHeight,
            });

            const collageCanvas = sharp({
                create: {
                    width: collageWidth,
                    height: collageHeight,
                    channels: 3,
                    background: request.borderColor,
                },
            });

            const composites: sharp.OverlayOptions[] = [];
            if (request.orientation === "HORIZONTAL") {
                let currentLeft = borderSize;

                resizedImages.forEach((image, index) => {
                    composites.push({
                        input: image,
                        left: currentLeft,
                        top: borderSize,
                    });

                    currentLeft +=
                        (resizedMetadata[index].width || 0) + borderSize;
                });
            } else {
                let currentTop = borderSize;

                resizedImages.forEach((image, index) => {
                    composites.push({
                        input: image,
                        left: borderSize,
                        top: currentTop,
                    });

                    currentTop +=
                        (resizedMetadata[index].height || 0) + borderSize;
                });
            }
            console.log(composites);

            const collageBuffer = await collageCanvas
                .composite(composites)
                .jpeg()
                .toBuffer();

            const resultKey = `results/${request._id}.jpg`;

            await this.storageService.uploadBuffer(collageBuffer, resultKey);

            console.log("Uploaded collage:", resultKey);

            console.log("Collage generated:", collageBuffer.length);

            const collageMetadata = await collageCanvas.metadata();

            console.log(collageMetadata);

            request.resultImageKey = resultKey;

            request.status = CollageStatus.COMPLETED;
            await request.save();
        } catch (error) {
            request.status = CollageStatus.FAILED;
            await request.save();

            throw error;
        }
    }
}
