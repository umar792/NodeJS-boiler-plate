import { Response } from "express";


interface responseInterface {
    success: boolean;
    message: string;
    token?: string | object;
    data?: any;
    error?: any;
}

export class responseHandler {
    public static handleResponse(
        res: Response,
        message: string = "Internal Server Error",
        statusCode: number = 500,
        success: boolean = false,
        token?: string | object,
        data?: any,
        error?: any
    ) {

        const responseObj: responseInterface = {
            success: success,
            message: message,
        }
        if (data) responseObj.data = data;
        if (token) responseObj.token = token;
        if (error) responseObj.error = error;

        return res.status(statusCode).json(responseObj)
    }
}