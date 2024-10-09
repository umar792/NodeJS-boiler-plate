import express from "express";
const router = express.Router();
import { upload } from "../../../middleware/multer.js";
import { userController } from "../controller/user.controller.js";
import { jwtAuthentication } from "../../../middleware/jwtHandler.js";


router.post("/login", userController.loginUser);
router.post("/sendOTP", userController.sendOTP);
router.post("/refresh/token", userController.refreshToken);
router.post("/forgot/password", userController.forgotPassword);
router.post("/signup", upload.single("file"), userController.createUser);
router.get("/verify/user", jwtAuthentication, userController.verifyUser);
router.put("/update/password", jwtAuthentication, userController.updatePassword);
router.put("/update/profile",upload.single("file"), jwtAuthentication, userController.updateProfile);


export default router;