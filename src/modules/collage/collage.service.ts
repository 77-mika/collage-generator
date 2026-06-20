import { CollageStatus, Orientation } from "./collage.types";
import { CollageRequest } from "./collage.types";
import { CollageRequestModel } from "./collage.model";
import AppError from "../../errors/appError";
import mongoose from "mongoose";
import { StorageService } from "../../services/storage.services";

export interface CreateCollageRequestInput {
    orientation: Orientation;
    borderSize: number;
    borderColor: string;
    images: {
        key: string;
        originalName: string;
    }[];
}
export class CollageService {
    private mapToCollageRequest(document: any): CollageRequest {
        return {
            id: document._id.toString(),
            orientation: document.orientation,
            borderSize: document.borderSize,
            borderColor: document.borderColor,
            images: document.images,
            resultImageKey: document.resultImageKey,
            status: document.status,
            createdAt: document.createdAt,
            updatedAt: document.updatedAt,
        };
    }
    private validateId(id: string): void {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError("Invalid collage id", 400);
        }
    }
    private storageService = new StorageService();
    async createRequest(
        input: CreateCollageRequestInput,
    ): Promise<CollageRequest> {
        if (
            !input.orientation ||
            input.borderSize === undefined ||
            !input.borderColor ||
            !input.images
        ) {
            throw new AppError("Missing required fields", 400);
        } else if (input.borderSize < 0 || input.borderSize > 100) {
            throw new AppError("Border size must be between 0 and 100", 400);
        } else if (!Object.values(Orientation).includes(input.orientation)) {
            throw new AppError("Invalid orientation value", 400);
        } else if (!/^#([0-9A-F]{3}){1,2}$/i.test(input.borderColor)) {
            throw new AppError(
                "Invalid border color format. Expected hex color code.",
                400,
            );
        } else if (input.images.length === 0) {
            throw new AppError("At least one image is required", 400);
        } else if (input.images.length > 3) {
            throw new AppError("Maximum 3 images allowed", 400);
        }
        const document = await CollageRequestModel.create({
            orientation: input.orientation,
            borderSize: input.borderSize,
            borderColor: input.borderColor,
            images: input.images,
        });
        return this.mapToCollageRequest(document);
    }

    async listRequest(): Promise<CollageRequest[]> {
        const documents = await CollageRequestModel.find().sort({
            createdAt: -1,
        });

        return documents.map((doc) => this.mapToCollageRequest(doc));
    }

    async cancelRequest(id: string): Promise<CollageRequest> {
        this.validateId(id);
        const document = await CollageRequestModel.findById(id);

        if (!document) {
            throw new AppError("Collage not found", 404);
        }

        if (document.status !== CollageStatus.PENDING) {
            throw new AppError(
                `Cannot cancel a ${document.status} request. Only PENDING requests can be cancelled.`,
                409,
            );
        }

        document.status = CollageStatus.CANCELLED;
        await document.save();

        return this.mapToCollageRequest(document);
    }

    async getRequest(id: string): Promise<CollageRequest> {
        this.validateId(id);
        const document = await CollageRequestModel.findById(id);

        if (!document) {
            throw new AppError("Collage not found", 404);
        }

        return this.mapToCollageRequest(document);
    }

    async getResultUrl(id: string): Promise<string> {
        this.validateId(id);

        const document = await CollageRequestModel.findById(id);

        if (!document) {
            throw new AppError("Collage not found", 404);
        }

        if (!document.resultImageKey) {
            throw new AppError("Collage not generated yet", 409);
        }

        return this.storageService.getFileUrl(document.resultImageKey);
    }

    
}
