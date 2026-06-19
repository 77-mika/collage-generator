import { model, Schema } from "mongoose";
import { Orientation, CollageStatus } from "./collage.types";

const collageSchema = new Schema(
    {
        orientation: {
            type: String,
            enum: Object.values(Orientation),
            required: true,
        },
        borderSize: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
        },
        borderColor: {
            type: String,
            required: true,
        },
        images: [
            {
                key: {
                    type: String,
                    required: true,
                },
                originalName: {
                    type: String,
                    required: true,
                },
            },
        ],
        resultImageKey: {
            type: String,
        },
        status: {
            type: String,
            enum: Object.values(CollageStatus),
            default: CollageStatus.PENDING,
            required: true,
        },
    },
    { timestamps: true },
);

export const CollageRequestModel = model("CollageRequest", collageSchema);
