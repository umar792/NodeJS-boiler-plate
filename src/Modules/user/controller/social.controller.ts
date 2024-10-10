



import { socialLoginService } from "../services/socialLogin.service.js";
import { Request, Response, NextFunction } from "express";



class SocialController {
// -----------------------------------------
        // social login 
        public async socialLogin(req: Request, res: Response, next: NextFunction): Promise<any> {
                return await socialLoginService.facebookLogin(req, res, next)
        }

        // verify facebook login
        public async verifyFacebookLogin(req: Request, res: Response, next: NextFunction): Promise<any> {
                return await socialLoginService.facebookCallback(req, res, next)
        }

        // ------------------------------ 

        // github login
        public async githubLogin(req: Request, res: Response, next: NextFunction): Promise<any> {
                return await socialLoginService.githubLogin(req, res, next)
        }

        // github verify login
        public async verifyGithubLogin(req: Request, res: Response, next: NextFunction): Promise<any> {
                return await socialLoginService.githubCallback(req, res, next)
        }

        // ---------------------------- 
        // google login 
        public async googleLogin(req: Request, res: Response, next: NextFunction): Promise<any> {
                return await socialLoginService.GoogleLogin(req, res, next)
        }

        // verify google login
        public async verifyGoogleLogin(req: Request, res: Response, next: NextFunction): Promise<any> {
                return await socialLoginService.GoogleCallback(req, res, next)
        }




}


export const socialController = new SocialController();