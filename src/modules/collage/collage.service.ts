import { CollageStatus, Orientation } from "./collage.types";
import { CollageRequest } from "./collage.types";
import { CollageRequestModel } from "./collage.model";

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
            throw new Error("Missing required fields");
        } else if (input.borderSize < 0 || input.borderSize > 100) {
            throw new Error("Border size must be between 0 and 100");
        } else if (!Object.values(Orientation).includes(input.orientation)) {
            throw new Error("Invalid orientation value");
        } else if (!/^#([0-9A-F]{3}){1,2}$/i.test(input.borderColor)) {
            throw new Error(
                "Invalid border color format. Expected hex color code.",
            );
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
}
