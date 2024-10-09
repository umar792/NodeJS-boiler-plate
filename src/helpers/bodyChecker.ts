import { Request } from "express";

export class bodyChecker {
    public static validateBody(req: Request, schema: any) {
        for (let elm of schema) {
            if (!req.body[elm]) {
                return (`${elm} field is required`)
            }
        }
    }
}