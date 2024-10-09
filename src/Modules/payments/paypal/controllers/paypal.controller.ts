import { NextFunction, Request, Response } from "express";
import { paypalService } from "../services/paypal.service.js";






class PaypalController {

    // create order
    public async createOrder(req: Request, res: Response, next: NextFunction) {
        return paypalService.createOrder(req, res, next)
    }

    // capture order data
    public async verifyPayment(req: Request, res: Response, next: NextFunction) {
        return paypalService.verifyPayment(req, res, next)
    }



}


export const paypalController = new PaypalController();
