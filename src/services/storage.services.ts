import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
} from "@aws-sdk/client-s3";
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

    async downloadFile(key: string): Promise<Buffer> {
        const response = await this.client.send(
            new GetObjectCommand({
                Bucket: process.env.LIARA_BUCKET_NAME,
                Key: key,
            }),
        );

        if (!response.Body) {
            throw new Error("File not found in storage");
        }

        const chunks: Buffer[] = [];

        for await (const chunk of response.Body as any) {
            chunks.push(Buffer.from(chunk));
        }

        return Buffer.concat(chunks);
    }
    async uploadBuffer(buffer: Buffer, key: string): Promise<string> {
        await this.client.send(
            new PutObjectCommand({
                Bucket: process.env.LIARA_BUCKET_NAME,
                Key: key,
                Body: buffer,
                ContentType: "image/jpeg",
            }),
        );

        return key;
    }
}
