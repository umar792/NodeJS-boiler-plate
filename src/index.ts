import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import { getPrismaClient } from "./db/db.js";
import routes from "./routes/index.routes.js";
import { errorHandler } from "./utils/errorHandler.js";
import { responseHandler } from "./helpers/responseHandler.js";
import express, { Express, NextFunction, Request, Response } from "express";

const app: Express = express();
// dotenv
dotenv.config()
//cors
app.use(cors({
    origin: "*"
}))
// bodyParser
app.use(bodyParser.urlencoded({ extended: false, limit: "50mb" }));
app.use(bodyParser.json({ limit: "50mb" }));

//server static file path
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
app.use("/uploads",express.static(path.join(__dirname, "uploads")))

app.get("/", (req: Request, res: Response) => {
    responseHandler.handleResponse(res, "Welcome to nodejs boilerplate", 200, true)
})



const server = app.listen(process.env.PORT, () => {
    getPrismaClient()
    console.log(`Server is running on port ${process.env.PORT}`);
});

// routes 
app.use("/api/v1/" , routes)

// Error handling middleware
app.use((err: errorHandler, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
});


// Error handler
process.on("uncaughtException", (err: any) => {
    console.log(`uncaughtException Error : ${err.message}`);
    console.log("Server is shutting down");
    server.close(() => {
        process.exit(1);
    });
})

process.on("unhandledRejection", (err: any) => {
    console.log(`Unhandled Rejection Error : ${err.message}`);
    console.log("Server is shutting down");
    server.close(() => {
        process.exit(1);
    });
});