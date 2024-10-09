import express from "express";
import { paypalController } from "../controllers/paypal.controller.js";
const router = express.Router();


router.post("/create/order", paypalController.createOrder);
router.get("/verifyOrder/:token" , paypalController.verifyPayment)




export default router; 