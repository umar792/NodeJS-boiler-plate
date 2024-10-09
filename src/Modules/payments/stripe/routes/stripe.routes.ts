import express from "express";
const router = express.Router();
import { stripeController } from "../controller/stripe.controller.js";


router.post("/create/session", stripeController.createSession);
router.get("/session/:session_id", stripeController.verifyPayment)




export default router; 