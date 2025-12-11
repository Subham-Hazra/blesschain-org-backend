import { Response } from 'express';

export class ResponseHelper {

  public static sendSuccessResponse(
    res: Response,
    status: number,
    data?: any,
    message?: string
  ) {
    return res.status(status).json({
      success: status >= 200 && status < 300,
      status,
      data,
      message
    });
  }

  public static sendErrorResponse(
    res: Response,
    status: number,
    errorMessage: string,
    errorCode?: string,
    errorDetails?: any
  ) {
    return res.status(status).json({
      success: false,
      status,
      error: {
        message: errorMessage,
        code: errorCode,
        details: errorDetails,
      },
    });
  }

}
