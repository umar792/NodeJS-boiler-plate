
import { NextFunction, Request, Response } from "express";
import { stripeService } from "../services/stripe.service.js";






class StripeController {

    // create session url
    public async createSession(req: Request, res: Response, next: NextFunction) {
        return stripeService.createSession(req, res, next);
    }

    // verify payment using session_id
    public async verifyPayment(req: Request, res: Response, next: NextFunction) {
        return stripeService.verifyPayment(req, res, next);
    }

}


export const stripeController = new StripeController();
