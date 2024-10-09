import jwt, { JwtPayload } from "jsonwebtoken"
import { errorHandler } from "../utils/errorHandler.js";
import { NextFunction, Request, Response } from "express";
import { prisma } from "../db/db.js";



export const jwtAuthentication = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return next(new errorHandler("Access denied", 400))
        }
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            return next(new errorHandler("JWT secret is not defined", 404));
        }
        const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
        const user = await prisma.user.findFirst({
            where: { id: decoded.id }
        });
        if (!user) {
            return next(new errorHandler("User not found", 404))
        }
        req.user = user;
        next();

    } catch (error: any) {
        return next(new errorHandler(error.message, 404))
    }
}