import { Request, Response, NextFunction } from "express";
import AppError from "../errors/appError";
import logger from "../logging";

const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction,
): void => {
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            status: "error",
            message: err.message,
        });
        return;
    }
    logger.error(err);
    res.status(500).json({
        status: "error",
        message: "Something went wrong",
    });
};
//     logger.error(err);
//     res.status(500).json({
//         status: "error",
//         message:
//             process.env.NODE_ENV === "development"
//                 ? err.message
//                 : "Something went wrong",
//         stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
//     });
// };

export default errorHandler;
