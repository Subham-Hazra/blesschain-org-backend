import { Router } from 'express';
import AuthController from '@/module/auth/controllers/AuthController';
import { Routes } from '@/interface/route.interface';
import validationMiddleware from '@/middlewares/validation.middlewares';
import { CreateUserDto } from '@/module/user/dtos/users.dto';
import authMiddleware from '@/middlewares/auth.middlewares';
import refreshTokenMiddleware from '@/middlewares/verify.refresh.token.middleware';
import { CreateUserMobileDto } from '@/module/user/dtos/user_mobile.dto';
class AuthRoute implements Routes {
  public path = '/';
  public router = Router();
  public authController = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}login`, validationMiddleware(CreateUserDto, 'body'), this.authController.logIn);
    this.router.post(`${this.path}login-user`, validationMiddleware(CreateUserMobileDto, 'body'), this.authController.logInUser);
    this.router.post(`${this.path}logout`, authMiddleware, this.authController.logOut);
    this.router.post(`${this.path}refresh-token`, refreshTokenMiddleware,this.authController.refreshToken);
  }
}

export default AuthRoute;
