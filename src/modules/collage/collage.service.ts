import { CollageStatus, Orientation } from "./collage.types";
import { CollageRequest } from "./collage.types";
import { CollageRequestModel } from "./collage.model";
import AppError from "../../errors/appError";

export interface CreateCollageRequestInput {
    orientation: Orientation;
    borderSize: number;
    borderColor: string;
}

export class CollageService {
    async createRequest(
        input: CreateCollageRequestInput,
    ): Promise<CollageRequest> {
        if (!input.orientation || !input.borderColor) {
            throw new AppError("Invalid border color format", 400);
        } else if (input.borderSize < 0 || input.borderSize > 100) {
            throw new AppError("Invalid border color format", 400);
        } else if (!Object.values(Orientation).includes(input.orientation)) {
            throw new AppError("Invalid border color format", 400);
        } else if (!/^#([0-9A-F]{3}){1,2}$/i.test(input.borderColor)) {
            throw new AppError("Invalid border color format", 400);
        }
        const document = await CollageRequestModel.create({
            orientation: input.orientation,
            borderSize: input.borderSize,
            borderColor: input.borderColor,
        });
        const collageRequest: CollageRequest = {
            id: document._id.toString(),
            orientation: document.orientation,
            borderSize: document.borderSize,
            borderColor: document.borderColor,
            status: document.status,
            createdAt: document.createdAt,
            updatedAt: document.updatedAt,
        };

        return collageRequest;
    }

    async listRequest(): Promise<CollageRequest[]> {
        const documents = await CollageRequestModel.find().sort({
            createdAt: -1,
        });

        const collageRequests: CollageRequest[] = documents.map((doc) => ({
            id: doc._id.toString(),
            orientation: doc.orientation,
            borderSize: doc.borderSize,
            borderColor: doc.borderColor,
            status: doc.status,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        }));

        return collageRequests;
    }

    async cancelRequest(id: string): Promise<CollageRequest> {
        const document = await CollageRequestModel.findById(id);

        if (!document) {
            throw new AppError("Collage not found", 404);
        }

        if (document.status !== CollageStatus.PENDING) {
            throw new AppError(
                `cannot cancell a ${document.status} , only availbe for peending request`,
                409,
            );
        }

        document.status = CollageStatus.CANCELLED;
        await document.save();
        const collageRequest: CollageRequest = {
            id: document._id.toString(),
            orientation: document.orientation,
            borderSize: document.borderSize,
            borderColor: document.borderColor,
            status: document.status,
            createdAt: document.createdAt,
            updatedAt: document.updatedAt,
        };
        return collageRequest
    }
}
