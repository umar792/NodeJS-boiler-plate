import express from "express";
const router = express.Router();
import { socialController } from "../controller/social.controller.js";

// ---------------- social logins 
router.get("/login/facebook", socialController.socialLogin)
router.get("/auth/facebook/callback", socialController.verifyFacebookLogin)

// github
router.get("/login/github", socialController.githubLogin)
router.get("/auth/github/callback", socialController.verifyGithubLogin)

// google 
router.get("/login/google", socialController.googleLogin)
router.get("/auth/google/callback", socialController.verifyGoogleLogin)


export default router;