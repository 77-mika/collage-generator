import { Router ,Request, Response } from "express";
import { CollageController } from "./collage.controller";
const router =  Router();
const controller = new CollageController()

router.post("/collage-requests",(req,res)=>{
     return controller.create(req,res)
})

router.get("/collage-requests",(req: Request, res: Response)=>{
    return controller.list(req,res)
})


export default router;