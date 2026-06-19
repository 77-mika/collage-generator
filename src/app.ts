import express, { Application, Request, Response } from "express";
import collageRouters from "./modules/collage/collage.router";
import logger from "./logging";
import morgan from "morgan";
import errorHandler from "./errors/errorHandler";
import dotenv from "dotenv";
dotenv.config();
const app: Application = express();
app.use(express.json());

app.use(
    morgan("combined", {
        stream: {
            write: (message: string) => logger.http(message.trim()),
        },
    }),
);

app.use("/api/v1/", collageRouters);

app.get("/health", (req: Request, res: Response) => {
    res.json({
        message: "ok",
    });
});

app.use(errorHandler);

export default app;
