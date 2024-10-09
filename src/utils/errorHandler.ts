export class errorHandler extends Error {
    public message: string;
    public statusCode: number;
    constructor(message: string, statusCode: number) {
        super(message)
        this.message = message || "Internal Server Error";
        this.statusCode = statusCode || 500;
        Error.captureStackTrace(this, this.constructor)
    }

}