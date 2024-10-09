import express from "express"
const router = express.Router();
import paypalRouter from "./paypal/routes/paypal.routes.js";
import stripeRouter from "./stripe/routes/stripe.routes.js";


// paypal routes
router.use("/paypal", paypalRouter)
//stripe
router.use("/stripe", stripeRouter)


export default router;