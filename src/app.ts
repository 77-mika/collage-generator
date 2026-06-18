import express , {Application,Request,Response,NextFunction} from "express";

const app:Application = express();
app.use(express.json())


app.get("/health",(req:Request,res:Response)=>{
    res.json({
        message : "ok"
    })
})


export default app;