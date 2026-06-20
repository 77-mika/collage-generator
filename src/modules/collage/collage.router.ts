import { Router, Request, Response } from "express";
import { CollageController } from "./collage.controller";
import { asyncHandler } from "../../utils/asyncHandler";
const router = Router();
const controller = new CollageController();
import { upload } from "../../middleware/upload";

router.post(
    "/collage-requests",
    upload.array("images", 3),
    asyncHandler(controller.create.bind(controller)),
);

router.get("/collage-requests", asyncHandler(controller.list.bind(controller)));

router.get(
    "/collage-requests/:id",
    asyncHandler(controller.getById.bind(controller)),
);
router.get(
    "/collage-requests/:id/result",
    asyncHandler(controller.getResult.bind(controller)),
);

router.patch(
    "/collage-requests/:id",
    asyncHandler(controller.cancel.bind(controller)),
);

export default router;
