import { socialLoginService } from "../services/socialLogin.service.js";
import { userService } from "../services/user.service.js";
import { Request, Response, NextFunction } from "express";



class UserController {

        // create user 
        public async createUser(req: Request, res: Response, next: NextFunction): Promise<any> {
                return await userService.createUser(req, res, next)
        }

        // login user 
        public async loginUser(req: Request, res: Response, next: NextFunction): Promise<any> {
                return await userService.loginUser(req, res, next)
        }

        // verify user
        public async verifyUser(req: Request, res: Response, next: NextFunction): Promise<any> {
                return await userService.verify(req, res, next)
        }

        // refresh token
        public async refreshToken(req: Request, res: Response, next: NextFunction): Promise<any> {
                return await userService.refreshToken(req, res, next)
        }

        // update user profile
        public async updateProfile(req: Request, res: Response, next: NextFunction): Promise<any> {
                return await userService.updateProfile(req, res, next)
        }

        // update password
        public async updatePassword(req: Request, res: Response, next: NextFunction): Promise<any> {
                return await userService.updatePassword(req, res, next)
        }

        // send OTP for forgot password
        public async sendOTP(req: Request, res: Response, next: NextFunction): Promise<any> {
                return await userService.sendOTP(req, res, next)
        }

        // forgotPassword
        public async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<any> {
                return await userService.forgotPassword(req, res, next)
        }


}


export const userController = new UserController();