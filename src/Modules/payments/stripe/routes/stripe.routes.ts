import express from "express";
const router = express.Router();
import { stripeController } from "../controller/stripe.controller.js";
import { jwtAuthentication } from "../../../../middleware/jwtHandler.js";


router.post("/create/session", jwtAuthentication, stripeController.createSession);
router.get("/session/:session_id", jwtAuthentication, stripeController.verifyPayment)




export default router; 