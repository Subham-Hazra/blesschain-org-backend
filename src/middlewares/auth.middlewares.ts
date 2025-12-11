import { HttpException } from '@/exceptions/HttpException';
import { NextFunction, Request, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { DataStoredInToken, RequestWithUser } from '@/module/auth/interfaces/auth.interface';
import userModel from '@/module/user/models/user.schema';


const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const Authorization =  (req.headers.authorization ? (req.headers.authorization as string?? "")?.split?.('Bearer ')[1] : null);
    if (Authorization) {
      const secretKey: string = process.env.SECRET_KEY ?? ''; 
      const verificationResponse = verify(Authorization, secretKey) as DataStoredInToken; 
      const userId = verificationResponse._id;
      const findUser = await userModel.findById(userId).select('-password');
      console.log("findUser : ", findUser)
      if (findUser) {
        Object.defineProperty(req , "user" , {
          configurable: true,
          enumerable: true,
          get() {
            return findUser
          }
        })
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

export default authMiddleware;
