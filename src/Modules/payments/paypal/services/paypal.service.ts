import axios from "axios";
import { prisma } from "../../../../db/db.js";
import { NextFunction, Request, Response } from "express";
import { bodyChecker } from "../../../../helpers/bodyChecker.js";
import { errorHandler } from "../../../../utils/errorHandler.js";
import { responseHandler } from "../../../../helpers/responseHandler.js";




class PaypalService {

    // generate token
    public static async generateAccessToken(req: Request, res: Response, next: NextFunction) {
        try {
            const axiosResponse = await axios({
                url: process.env.PAYPAL_BASE_URL + '/v1/oauth2/token',
                method: "post",
                data: 'grant_type=client_credentials',
                auth: {
                    username: process.env.PAYPAL_CLIENT_ID || '',
                    password: process.env.PAYPAL_SECRET || ''
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            return axiosResponse.data.access_token;
        } catch (error: any) {
            next(new errorHandler(error.message, 400))
        }
    }

    // create  order
    public async createOrder(req: Request, res: Response, next: NextFunction) {
        try {
            const { amount } = req.body;
            const bodyData = ["amount"];
            const isBodyValidator = bodyChecker.validateBody(req, bodyData)
            if (isBodyValidator) {
                return next(new errorHandler(isBodyValidator, 400))
            }

            const access_token = await PaypalService.generateAccessToken(req, res, next)

            // api call 
            const axiosResponse = await axios({
                url: process.env.PAYPAL_BASE_URL + '/v2/checkout/orders',
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${access_token}`
                },
                data: JSON.stringify({
                    intent: "CAPTURE",
                    purchase_units: [
                        {
                            items: [
                                {
                                    name: "Name of the product",
                                    description: "description of product",
                                    quantity: 1,
                                    unit_amount: {
                                        currency_code: "USD",
                                        value: amount.toString()
                                    }
                                }
                            ],
                            amount: {
                                currency_code: "USD",
                                value: amount.toString(),
                                breakdown: {
                                    item_total: {
                                        currency_code: "USD",
                                        value: amount.toString()
                                    }
                                }
                            }
                        }
                    ],
                    application_context: {
                        return_url: `${process.env.REDIRECT_URL}/complete`,
                        cancel_url: `${process.env.REDIRECT_URL}/cancel`,
                        shipping_preference: "NO_SHIPPING",
                        user_action: 'PAY_NOW'
                    }
                })
            });
            const data = {
                orderId: axiosResponse?.data?.id,
                links: axiosResponse?.data?.links?.filter((link: any) => link.rel === "approve")[0]?.href,
            }
            responseHandler.handleResponse(res, "Order Create successfully", 200, true, "", data)
        } catch (error: any) {
            next(new errorHandler(error.message, 400))
        }
    }

    // verify payment 
    public async verifyPayment(req: Request, res: Response, next: NextFunction) {
        try {

            const { token } = req.params;
            if (!token) {
                return next(new errorHandler("Token is required", 400))
            }
            const access_token = await PaypalService.generateAccessToken(req, res, next)

            const axiosResponse = await axios({
                url: process.env.PAYPAL_BASE_URL + `/v2/checkout/orders/${token}/capture`,
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${access_token}`
                },
            });
            const data = axiosResponse.data;
            //  create payment
            await prisma.payment.create({
                data: {
                    payment_id: data.id,
                    email: data.payer.email_address,
                    name: data.payer.name.given_name,
                    amount: data.purchase_units[0].payments.captures[0].amount.value,
                    currency: data.purchase_units[0].payments.captures[0].amount.currency_code,
                    service_Fee: data.purchase_units[0].payments.captures[0].seller_receivable_breakdown.paypal_fee.value,
                    created_At: data.purchase_units[0].payments.captures[0].create_time,
                    status: data.status,
                    platform: "paypal",
                    user: {
                        connect: {
                            id: req.user.id
                        }
                    }
                }
            })


            responseHandler.handleResponse(res, "Order details", 200, true, "", data)
        } catch (error: any) {
            next(new errorHandler(error.message, 400))
        }
    }

}

export const paypalService = new PaypalService();