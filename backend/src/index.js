import dotenv from"dotenv"
import express from "express";
import authUser from "./router/authRouter.js"
import db from "./DB/db.js"
import cookieParser from "cookie-parser"
import postRouter from "./router/postRouter.js"
import linkRouter from "./router/linkRouter.js"
import cors from "cors"
import { createRateLimiter } from "./middlewares/rateLimiting.js";
import redisClient from "./utils/redisClient.js";
dotenv.config()
const app=express()
const port = process.env.PORT

app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
  }))
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended:true}))

const rateLimit=createRateLimiter(redisClient)
// console.log("-- ",rateLimit);

app.use("/api/auth",rateLimit,authUser);
app.use("/api/post",rateLimit,postRouter);
app.use("/api/share",rateLimit,linkRouter);

app.get("/health",(_req,res)=>{
  // console.log("-- ",rateLimit);
    res.status(200).json({
        message:"Server is Healthy"
    })
})

app.listen(port,()=>{
console.log(`Server Running On Port ${port}`);
db()
})