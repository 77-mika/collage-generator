import { Router ,Request, Response } from "express";
import { CollageController } from "./collage.controller";
import { asyncHandler } from "../../utils/asyncHandler";
const router =  Router();
const controller = new CollageController()

router.post(
    "/collage-requests",
    asyncHandler(controller.create.bind(controller)),
);

router.get(
    "/collage-requests",
    asyncHandler(controller.list.bind(controller)),
);


export default router;