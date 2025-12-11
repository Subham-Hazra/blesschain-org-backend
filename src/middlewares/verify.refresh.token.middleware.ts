import { HttpException } from '@/exceptions/HttpException';
import { NextFunction, Request, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { DataStoredInToken, RequestWithUser } from '@/module/auth/interfaces/auth.interface';
import userModel from '@/module/user/models/user.schema';


const refreshTokenMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    
    const Authorization = req.cookies?.['RefreshToken'] ?? null;
    if (Authorization) {
      const secretKey: string = process.env.REFRESH_SECRET_KEY ?? '';
      const verificationResponse = verify(Authorization, secretKey) as DataStoredInToken;
      
      const userId = verificationResponse._id;
      const findUser = await userModel.findById(userId).select('-password');
      console.log(findUser,'find user')
      if (findUser) {
        // @ts-expect-error
        req["user"] = findUser;
        next();
      } else {
        next(new HttpException(401, 'Wrong authentication token'));
      }
    } else {
      next(new HttpException(404, 'Unauthorized'));
    }
  } catch (error) {
    next(new HttpException(401, 'Jwt expired'));
  }
};

export default refreshTokenMiddleware;
