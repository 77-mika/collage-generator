import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
dotenv.config();



export class StorageService {
    private client: S3Client;

    constructor() {
        this.client = new S3Client({
            region: "default",
            endpoint: process.env.LIARA_ENDPOINT,
            credentials: {
                accessKeyId: process.env.LIARA_ACCESS_KEY as string,
                secretAccessKey: process.env.LIARA_SECRET_KEY as string,
            },
        });
    }

    async uploadFile(file: Express.Multer.File): Promise<string> {
        const key = `uploads/${Date.now()}-${file.originalname}`;

        await this.client.send(
            new PutObjectCommand({
                Bucket: process.env.LIARA_BUCKET_NAME,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
            }),
        );

        return key;
    }
}