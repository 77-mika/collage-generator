import { Request, Response } from "express";
import { CollageService, CreateCollageRequestInput } from "./collage.service";
import { StorageService } from "../../services/storage.services";

export class CollageController {
    private collageService: CollageService;
    private storageService: StorageService;

    constructor() {
        this.collageService = new CollageService();
        this.storageService = new StorageService();
    }

    async create(req: Request, res: Response): Promise<void> {
        const files = req.files as Express.Multer.File[];

        const uploadedImages = await Promise.all(
            files.map(async (file) => ({
                key: await this.storageService.uploadFile(file),
                originalName: file.originalname,
            })),
        );

        const { orientation, borderSize, borderColor } = req.body;

        const input: CreateCollageRequestInput = {
            orientation,
            borderSize: Number(borderSize),
            borderColor,
            images: uploadedImages,
        };

        const collage = await this.collageService.createRequest(input);

        res.status(201).json(collage);
    }

    async list(req: Request, res: Response): Promise<void> {
        const collages = await this.collageService.listRequest();
        res.status(200).json(collages);
    }

    async cancel(req: Request, res: Response): Promise<void> {
        const id = req.params.id as string ;
        const collage = await this.collageService.cancelRequest(id);

        res.status(200).json(collage);
    }

    async getById(req: Request, res: Response): Promise<void> {
        const id = req.params.id as string ;
        const collage = await this.collageService.getRequest(id);

        res.status(200).json(collage);
    }
    async getResult(req: Request, res: Response): Promise<void> {
        const id = req.params.id as string ;

        const url = await this.collageService.getResultUrl(id);

        res.status(200).json({
            url,
        });
    }
}
