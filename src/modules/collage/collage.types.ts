export enum Orientation {
    HORIZONTAL = "HORIZONTAL",
    VERTICAL = "VERTICAL"
}

export enum CollageStatus {
    PENDING = "PENDING",
    PROCESSING = "PROCESSING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    CANCELLED = "CANCELLED"
}

export interface CollageRequest {
    id : string;
    orientation : Orientation;
    borderSize : number;
    borderColor : string;
    status : CollageStatus;
    createdAt : Date;
    updatedAt : Date;
}