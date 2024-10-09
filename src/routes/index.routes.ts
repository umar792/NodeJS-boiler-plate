import express from "express"
const router = express.Router();
import userRouter from "../Modules/user/routes/user.routes.js";
import paymentRoutes from "../Modules/payments/payment.routes.js"

// user routes
router.use("/user" , userRouter)
// payment routes
router.use("/payment" , paymentRoutes)


export default router;