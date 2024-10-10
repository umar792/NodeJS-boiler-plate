import Stripe from "stripe";
import { NextFunction, Request, Response } from "express";
import { errorHandler } from "../../../../utils/errorHandler.js";
import { responseHandler } from "../../../../helpers/responseHandler.js";
import { prisma } from "../../../../db/db.js";


class StripeService {

    // create stripe session url
    public async createSession(req: Request, res: Response, next: NextFunction) {
        try {
            const { amount } = req.body;
            if (!amount) {
                return next(new errorHandler("Amount is required", 400))
            }
            const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
            const session = await stripe.checkout.sessions.create({
                line_items: [
                    {
                        price_data: {
                            currency: "USD",
                            product_data: {
                                name: "Product Name"
                            },
                            unit_amount: amount * 100.
                        },
                        quantity: 1,
                    }
                ],
                mode: "payment",
                success_url: `${process.env.REDIRECT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.REDIRECT_URL}/cancel`
            });
            responseHandler.handleResponse(res, "Session created successfully", 200, true, "", session.url)

        } catch (error: any) {
            next(new errorHandler(error.message, 400))
        }
    }

    // verify payment
    public async verifyPayment(req: Request, res: Response, next: NextFunction) {
        try {
            const { session_id } = req.params;
            if (!session_id) {
                return next(new errorHandler("Session ID is required", 400))
            };
            const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
            const sessiondata = await stripe.checkout.sessions.retrieve(session_id);
            if (sessiondata.payment_status === "paid" && sessiondata.status === "complete") {

                // first find the session id in db if exist return with error
                const isSessionExist = await prisma.payment.findFirst({
                    where: {
                        platform: "stripe",
                        payment_id: sessiondata.id
                    }
                });
                if (isSessionExist) {
                    return next(new errorHandler("Payment has already been processed", 400))
                }
                // create new payment in db
                await prisma.payment.create({
                    data: {
                        payment_id: sessiondata.id,
                        // @ts-ignore
                        amount: `${sessiondata.amount_total / 100}`,
                        currency: "USD",
                        service_Fee: "0",
                        status: sessiondata.payment_status,
                        platform: "stripe",
                        created_At: new Date(),
                        email: sessiondata.customer_details?.email || "",
                        name: sessiondata.customer_details?.name || "",
                        user: {
                            connect: {
                                id: req.user.id,
                            }
                        }

                    }
                })
                responseHandler.handleResponse(res, "Payment successful", 200, true)
            } else {
                responseHandler.handleResponse(res, "Payment failed", 400, false)
            }
        } catch (error: any) {
            next(new errorHandler(error.message, 400))
        }
    }

}


export const stripeService = new StripeService();