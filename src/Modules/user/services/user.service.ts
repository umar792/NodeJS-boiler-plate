import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import { fileURLToPath } from "url";
import { prisma } from "../../../db/db.js";
import { sendEmail } from "../../../utils/sendEmail.js";
import { Request, Response, NextFunction } from "express";
import { bodyChecker } from "../../../helpers/bodyChecker.js";
import { errorHandler } from "../../../utils/errorHandler.js";
import { generateToken } from "../../../helpers/generateToken.js";
import { emailValidators } from "../../../helpers/emailChecker.js";
import { responseHandler } from "../../../helpers/responseHandler.js";
import { FindUserByEmail } from "../../../helpers/findUserByEmail.js";





class UserService {

    // create user 
    public async createUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { userName, email, password } = req.body;

            // validate body data
            const bodyData = ["userName", "email", "password"];
            const isBodyValidator = bodyChecker.validateBody(req, bodyData)
            if (isBodyValidator) {
                return next(new errorHandler(isBodyValidator, 400))
            }

            // validate email
            if (!emailValidators.validate(email)) {
                return next(new errorHandler('Email is invalid', 400))
            }

            // check is email already exist in db
            const isEmail = await FindUserByEmail.findUser(email)
            if (isEmail) {
                return next(new errorHandler('Email already exist', 403))
            }

            // if user profile picture in request
            let filename;
            if (req.file) {
                filename = req.file.filename;
            }

            // now hash the password
            const hashPassword = await bcrypt.hash(password, 10);
            await prisma?.user.create({
                data: {
                    userName,
                    email,
                    password: hashPassword,
                    profilePicture: filename
                }
            })
            responseHandler.handleResponse(res, "Registration successful", 201, true)
        } catch (error: any) {
            return next(new errorHandler(error.message, 400))
        }
    }

    // login user
    public async loginUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.body;

            // validate body data
            const bodyData = ["email", "password"];
            const isBodyValidator = bodyChecker.validateBody(req, bodyData)
            if (isBodyValidator) {
                return next(new errorHandler(isBodyValidator, 400))
            }

            // validate email
            if (!emailValidators.validate(email)) {
                return next(new errorHandler('Email is invalid', 400))
            }

            // check is email already exist
            const isEmail = await FindUserByEmail.findUser(email);
            if (!isEmail) {
                return next(new errorHandler('Invalid credentials', 404))
            }

            // validate password
            const isMatchPassword = await bcrypt.compare(password, isEmail.password || "");
            if (!isMatchPassword) {
                return next(new errorHandler('Invalid credentials', 404))
            }

            // generate jwt token process.env.JWT_SECRET
            const token = generateToken.generate(isEmail.id, process.env.JWT_SECRET || '', "1d")

            //  refresh token 
            const refreshToken = generateToken.generate(isEmail.id, process.env.JWT_REFRESH_SECRET || '', "7d");
            const existingRefreshToken = await prisma.refreshToken.findUnique({
                where: { user_id: isEmail.id },
            });

            if (existingRefreshToken) {
                // Update existing refresh token
                await prisma.refreshToken.update({
                    where: { user_id: isEmail.id },
                    data: { refreshToken: refreshToken },
                });
            } else {
                // Create new refresh token
                await prisma.refreshToken.create({
                    data: {
                        refreshToken: refreshToken,
                        user: { connect: { id: isEmail.id } },
                    },
                });
            }
            const tokens = {
                accessToken : token,
                refreshToken
            }
            responseHandler.handleResponse(res, "Login Successful", 200, true, tokens)

        } catch (error: any) {
            return next(new errorHandler(error.message, 400))
        }
    }

    // verify token
    public async verify(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user;
            responseHandler.handleResponse(res, "Verify Successful", 200, true, "", user)
        } catch (error: any) {
            return next(new errorHandler(error.message, 400))
        }
    }

    // generate new access_token
    public async refreshToken(req: Request, res: Response, next: NextFunction) {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                return next(new errorHandler('Refresh token is required', 404));
            }

            // find the refresh token 
            const existingRefreshToken = await prisma.refreshToken.findFirst({
                where: { refreshToken: refreshToken },
            });
            // if refresh toke not found
            if (!existingRefreshToken) {
                return next(new errorHandler('Invalid refresh token', 404));
            }

            const newAccessToken = generateToken.generate(existingRefreshToken.user_id, process.env.JWT_SECRET || '', "1d");
            const newRefreshToken = generateToken.generate(existingRefreshToken.user_id, process.env.JWT_REFRESH_SECRET || '', "30d");

            // update refresh token
            await prisma.refreshToken.update({
                where: { id: existingRefreshToken.id },
                data: { refreshToken: newRefreshToken },
            });
            const tokens = {
                accessToken : newAccessToken,
                refreshToken : newRefreshToken
            }
            responseHandler.handleResponse(res, "Tokens refreshed successfully", 200, true, tokens)
        } catch (error: any) {
            return next(new errorHandler(error.message, 400))
        }
    }

    // update profile
    public async updateProfile(req: Request, res: Response, next: NextFunction) {
        try {

            const user = await prisma.user.findUnique({
                where: {
                    id: req.user.id
                }
            });
            if (!user) {
                return next(new errorHandler("User not found", 400))
            }

            if (req.body.userName) user.userName = req.body.userName
            if (req.body.email) user.email = req.body.email
            // if body have a profile image
            let filename;
            if (req.file) {
                filename = req.file.filename;
                if (req.user.profilePicture) {
                    const __filename = fileURLToPath(import.meta.url)
                    const __dirname = path.dirname(__filename);
                    const filePath = path.join(__dirname, "../../../uploads", `/${req.user.profilePicture}`)
                    fs.unlink(filePath, (err: any) => {
                        if (err) {
                            console.log("file not deleted due to some issue")
                        }                        
                    })
                };
                user.profilePicture = filename;
            }


            // update user data
            await prisma.user.update({
                where: {
                    id: req.user.id
                },
                data: user
            });
            responseHandler.handleResponse(res, "Profile updated successfully", 200, true)
        } catch (error: any) {
            return next(new errorHandler(error.message, 400))
        }
    }

    // update password
    public async updatePassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { oldPassword, newPassword } = req.body;
            // check body data
            const bodyData = ["oldPassword", "newPassword"];
            const isBodyValidator = bodyChecker.validateBody(req, bodyData)
            if (isBodyValidator) {
                return next(new errorHandler(isBodyValidator, 400))
            }
            
            // compare old pass
            const isMatch = await bcrypt.compare(oldPassword, req.user.password || "");
            if (!isMatch) {
                return next(new errorHandler("Old password is incorrect", 400))
            };

            // hashPassword
            const hashPassword = await bcrypt.hash(newPassword, 10);

            await prisma.user.update({
                where: { id: req.user.id },
                data: {
                    password: hashPassword
                }
            });

            responseHandler.handleResponse(res, "Password updated successfully", 200, true)
        } catch (error: any) {
            return next(new errorHandler(error.message, 400))
        }
    }

    // send OTP 
    public async sendOTP(req: Request, res: Response, next: NextFunction) {
        try {
            const { email } = req.body;
            if (!email) {
                return next(new errorHandler('Email is required', 404))
            }

            // find user by email
            const User = await FindUserByEmail.findUser(email)
            if (!User) {
                return next(new errorHandler('Email not found', 404))
            }


            // generate a radom OTP
            const OTP = Math.floor((Math.random() + 10) * 900);
            // send email
            try {
                await sendEmail.send({
                    to: User.email,
                    subject: "OTP verification",
                    message: `Hello ${User.userName} your OTP is ${OTP}, OTP expires in 15 minutes`
                });

                const currentDate = new Date();
                const updatedDate = new Date(currentDate.getTime() + 15 * 60 * 1000);
                await prisma.user.update({
                    where: {
                        id: User.id
                    },
                    data: {
                        otp: OTP,
                        otp_Expires: updatedDate
                    }
                });
                responseHandler.handleResponse(res, "OTP send to email successfully", 200, true)
            } catch (error: any) {
                return next(new errorHandler(error.message, 400))
            }
        } catch (error: any) {
            return next(new errorHandler(error.message, 400))
        }
    }

    // forgot password
    public async forgotPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { otp, newPassword } = req.body;
            const bodyData = ["otp", "newPassword"];
            const isBodyValidator = bodyChecker.validateBody(req, bodyData)
            if (isBodyValidator) {
                return next(new errorHandler(isBodyValidator, 400))
            }

            // find otp
            const User = await prisma.user.findFirst({
                where: {
                    otp
                }
            });
            if (!User) {
                return next(new errorHandler("OTP is invalid", 404))
            }
            // @ts-ignore
            if (User?.otp_Expires < new Date()) {
                await prisma.user.update({
                    where: {
                        id: User.id
                    },
                    data: {
                        otp: null,
                        otp_Expires: null,
                    }
                });
                return next(new errorHandler("OTP is expired", 404))
            }

            const hashPassword = await bcrypt.hash(newPassword, 10);
            await prisma.user.update({
                where: {
                    id: User.id
                },
                data: {
                    otp: null,
                    otp_Expires: null,
                    password: hashPassword
                }
            });
            responseHandler.handleResponse(res, "Password update successfully", 200, true)
        } catch (error: any) {
            return next(new errorHandler(error.message, 400))
        }
    }

}


export const userService = new UserService()