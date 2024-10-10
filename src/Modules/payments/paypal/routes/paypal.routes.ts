import express from "express";
import { paypalController } from "../controllers/paypal.controller.js";
import { jwtAuthentication } from "../../../../middleware/jwtHandler.js";
const router = express.Router();


router.post("/create/order", jwtAuthentication, paypalController.createOrder);
router.get("/verifyOrder/:token", jwtAuthentication, paypalController.verifyPayment)




export default router; 