import { plainToInstance } from 'class-transformer'; // Updated to `plainToInstance`
import { validate, ValidationError } from 'class-validator';
import { HttpException } from '@/exceptions/HttpException';
import { Request, Response, NextFunction, RequestHandler } from 'express';

const validationMiddleware = (
  type: any,
  value: 'body' | 'query' | 'params' = 'body', // Restricting value to valid strings
  skipMissingProperties = false,
  whitelist = true,
  forbidNonWhitelisted = true,
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    const data = req[value] || {};
    const instance = plainToInstance(type, data);
    validate(instance, { skipMissingProperties, whitelist, forbidNonWhitelisted })
      .then((errors: ValidationError[]) => {
        if (errors.length > 0) {
          const message = errors
            .map((error: ValidationError) => 
              Object.values(error.constraints || {}).join(', ')
            )
            .join(', ');

          next(new HttpException(400, message || 'Validation failed'));
        } else {
          next();
        }
      })
      .catch(next); // Handle unexpected errors
  };
};

export default validationMiddleware;
