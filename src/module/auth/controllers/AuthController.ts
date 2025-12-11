import { NextFunction, Request, Response } from 'express';
import AuthService from '@/module/auth/services/AuthService';
import { RequestWithUser } from '@/module/auth/interfaces/auth.interface';
import { ResponseHelper } from '@/util/ResponseHelper';

class AuthController {
  public authService = new AuthService();

  public logIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData = req.body;
      const { authToken, refreshTokenCookie, findUser } = await this.authService.login(userData);
      res.setHeader('Set-Cookie', [refreshTokenCookie]);
      res.status(200).json({ data: findUser, message: 'Login Successfull', token: authToken });
    } catch (error) {
      next(error);
    }
  };
  public logInUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData = req.body;
      const { authToken, refreshTokenCookie, findUser } = await this.authService.loginUser(userData);
      res.setHeader('Set-Cookie', [refreshTokenCookie]);
      const tempUser = {
        token: authToken,
        user: findUser
      }
      return ResponseHelper.sendSuccessResponse(
        res,
        200,
        tempUser,
        "Login Successfull!"
      );
    } catch (error) {
      return next(error);
    }
  };

  public logOut = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const request = req as RequestWithUser
      const userData = request?.user;
      const logOutUserData = await this.authService.logout(userData);
      return ResponseHelper.sendSuccessResponse(
        res,
        200,
        logOutUserData,
        "User logout successfully!"
    );
    } catch (error) {
      return ResponseHelper.sendErrorResponse(res, 500, 'Internal Server Error', 'ERR500', error);
    }
  };

  public refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // @ts-expect-error
      const userData = req['user'];
      const { authToken } = await this.authService.refreshAccessToken(userData);
      console.log(authToken, 'new created token')
      res
        .status(200)

        .json({ accessToken: authToken });
    } catch (error) {
      console.log(error, 'errrorooo')
      next(error);
    }
  };
}

export default AuthController;
