import { Request, Response } from "express";
import { CollageService, CreateCollageRequestInput } from "./collage.service";

export class CollageController {
    private collageService: CollageService;

    constructor() {
        this.collageService = new CollageService();
    }

    async create(req: Request, res: Response): Promise<void> {
        const { orientation, borderSize, borderColor } = req.body;
        const input: CreateCollageRequestInput = {
            orientation,
            borderColor,
            borderSize,
        };
        const collage = await this.collageService.createRequest(input);
        res.status(201).json(collage);
    }

    async list(req: Request, res: Response): Promise<void> {
        const collages = await this.collageService.listRequest();
        res.status(200).json(collages);
    }
}
