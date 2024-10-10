import { User } from "@prisma/client";
import { prisma } from "../../../db/db.js";
import { NextFunction, Request, Response } from "express";
// @ts-ignore
import passport from 'passport';
import { errorHandler } from "../../../utils/errorHandler.js";
// @ts-ignore
import { Strategy as FacebookStrategy } from 'passport-facebook';
// @ts-ignore
import { Strategy as GithubStrategy } from "passport-github2"
// @ts-ignore
import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import { generateToken } from "../../../helpers/generateToken.js";
import { responseHandler } from "../../../helpers/responseHandler.js";
import { FindUserByEmail } from "../../../helpers/findUserByEmail.js";

class SocialLoginService {
  constructor() {
    // facebook
    passport.use(
      new FacebookStrategy(
        {
          clientID: process.env.FACEBOOK_CLIENT_ID,
          clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
          callbackURL: `${process.env.REDIRECT_URL}/api/v1/user/social/auth/facebook/callback`,
          profileFields: ['id', 'displayName', 'photos', 'email'],
        },
        async (accessToken: string, refreshToken: string, profile: any, done: any) => {
          try {
            done(null, profile);
          } catch (error: any) {
            done(error);
          }
        }
      )
    );

    // github 
    passport.use(new GithubStrategy({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `${process.env.REDIRECT_URL}/api/v1/user/social/auth/github/callback`,
      profileFields: ['id', 'displayName', 'photos', 'email'],
    },
      async (accessToken: string, refreshToken: string, profile: any, done: any) => {
        try {
          done(null, profile);
        } catch (error: any) {
          done(error);
        }
      }
    )
    );

    // google 
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.REDIRECT_URL}/api/v1/user/social/auth/google/callback`,
    },
      async (accessToken: string, refreshToken: string, profile: any, done: any) => {
        try {
          done(null, profile);
        } catch (error: any) {
          done(error);
        }
      }
    )
    );
  }


  // handle tokens
  public static async handleToken(user: User) {
    const token = generateToken.generate(user.id, process.env.JWT_SECRET || '', '1h');
    const refreshToken = generateToken.generate(user.id, process.env.JWT_REFRESH_SECRET || '', '7d');

    const existingRefreshToken = await prisma.refreshToken.findUnique({
      where: { user_id: user.id },
    });

    if (existingRefreshToken) {
      // Update existing refresh token
      await prisma.refreshToken.update({
        where: { user_id: user.id },
        data: { refreshToken: refreshToken },
      });
    } else {
      // Create new refresh token
      await prisma.refreshToken.create({
        data: {
          refreshToken: refreshToken,
          user: { connect: { id: user.id } },
        },
      });
    }

    const tokens = {
      access_token: token,
      refresh_token: refreshToken,
    };
    return tokens;

  }

  public static async createNewUser(user: any) {
    const newUser = await prisma.user.create({
      data: {
        userName: user.userName,
        email: user.email,
        profilePicture: user.profilePicture,
        created_At: new Date(),
        signupType: user.signupType,
        social_id: user.social_id
      }
    });
    return newUser;
  }

  public static async handleCallBackFunction(res: Response, next: NextFunction, error: any, user: any, platForm: string) {
    if (error) {
      return next(new errorHandler(error.message, 400));
    }
    if (!user) {
      return next(new errorHandler("Authentication failed ", 400));
    }

    // fist find the user using email 
    const dbUser = await FindUserByEmail.findUser(user.emails[0].value)
    if (!dbUser) {
      // create new user and generate tokens
      const newUser = await SocialLoginService.createNewUser({
        userName: user.displayName,
        email: user.emails[0].value,
        profilePicture: user.photos[0].value,
        signupType: platForm,
        social_id: user.id,
      })
      const tokens = await SocialLoginService.handleToken(newUser)
      responseHandler.handleResponse(res, "Signup successfully", 200, true, tokens, newUser)
    } else {
      const dbUser = await FindUserByEmail.findUser(user.emails[0].value);
      if (!dbUser) {
        return next(new errorHandler("User not found", 400));
      }
      const tokens = await SocialLoginService.handleToken(dbUser);
      responseHandler.handleResponse(res, "Login successful", 200, true, tokens, dbUser)
    }
    try {
    } catch (error: any) {
      return next(new errorHandler(error.message, 400));
    }
  }


  // ---------------------------------------------------- face book login start -------------------------------- 
  // Facebook login route
  public facebookLogin(req: Request, res: Response, next: NextFunction) {
    passport.authenticate('facebook', { scope: ['email'] })(req, res, next);
  }
  // Facebook callback route
  public async facebookCallback(req: Request, res: Response, next: NextFunction) {
    passport.authenticate('facebook', { session: false }, async (error: any, user: any) => {
      return await SocialLoginService.handleCallBackFunction(res, next, error, user, "facebook")
    })(req, res, next);
  }
  // ---------------------------------------------------------------- facebook login end ------------------------------------


  // ------------------------- github login start --------------------------------------------------------------------
  public githubLogin(req: Request, res: Response, next: NextFunction) {
    passport.authenticate('github', { scope: ['user:email'] })(req, res, next);
  }
  // Facebook callback route
  public async githubCallback(req: Request, res: Response, next: NextFunction) {
    passport.authenticate('github', { session: false }, async (error: any, user: any) => {
      // return await SocialLoginService.handleCallBackFunction(res, next, error, user, "github")
      res.status(200).json({
        success: true,
        message: "Email not show so under process",
        user
      })
    })(req, res, next);
  }

  // ----------------------------- github login end ------------------------------------------------


  // -------------------------------- google login start --------------------------------------------------
  public GoogleLogin(req: Request, res: Response, next: NextFunction) {
    passport.authenticate('google', { scope: ["profile", 'email'] })(req, res, next);
  }
  // Facebook callback route
  public async GoogleCallback(req: Request, res: Response, next: NextFunction) {
    passport.authenticate('google', { session: false }, async (error: any, user: any) => {
      return await SocialLoginService.handleCallBackFunction(res, next, error, user, "google")
    })(req, res, next);
  }
  // ----------------- google login end ------------------------------------------------





}

export const socialLoginService = new SocialLoginService();
