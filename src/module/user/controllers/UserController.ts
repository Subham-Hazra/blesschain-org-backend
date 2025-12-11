import { NextFunction, Request, Response } from "express";
import { UserService } from "@/module/user/services/UserService";
import { ResponseHelper } from "@/util/ResponseHelper";
import { CreateUser, User } from "../interfaces/index.interface";
import { RequestWithUser } from "@/module/auth/interfaces/auth.interface";
const CsvParser = require("json2csv").Parser;
export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  public getAllUsers = async (req: Request, res: Response) => {
    try {

      const request = req as RequestWithUser;
      const userId = request?.user?._id;
      const payload = req.body;
      const updatedPayload = { ...payload, userId };

      const users = await this.userService.getAllUsers(updatedPayload);
      return ResponseHelper.sendSuccessResponse(
        res,
        200,
        users,
        "User fetched successfully!"
      );
    } catch (error) {
      return ResponseHelper.sendSuccessResponse(
        res,
        500,
        [],
        "Internal Server Error"
      );
    }
  };
  public getChatList = async (req: Request, res: Response) => {
    try {
      const request = req as RequestWithUser;
      const userId = request?.user?._id;
      const payload = req.body;
      const updatedPayload = { ...payload, userId };
      const users = await this.userService.getAllUsers(updatedPayload);
      return ResponseHelper.sendSuccessResponse(
        res,
        200,
        users,
        "User fetched successfully!"
      );
    } catch (error) {
      return ResponseHelper.sendSuccessResponse(
        res,
        500,
        [],
        "Internal Server Error"
      );
    }
  };

  public findUserById = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const user = await this.userService.findUserById(id);
      if (user) {
        return ResponseHelper.sendSuccessResponse(
          res,
          200,
          user,
          "User fetched successfully!"
        );
      } else {
        return ResponseHelper.sendSuccessResponse(res, 404, [], "User not found");
      }
    } catch (error) {
      return ResponseHelper.sendSuccessResponse(
        res,
        500,
        [],
        "Internal Server Error!"
      );
    }
  };

  public deleteUser = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const user = await this.userService.deleteUser(id);
      if (user) {
        return ResponseHelper.sendSuccessResponse(res, 200, user, "User deleated successfully");
      } else {
        return ResponseHelper.sendSuccessResponse(res, 404, [], "User not found");
      }
    } catch (error) {
      return ResponseHelper.sendSuccessResponse(res, 500, [], "Internal server error");
    }
  };
  public forceDeleteUser = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const user = await this.userService.forceDeleteUser(id);
      if (user) {
        return ResponseHelper.sendSuccessResponse(res, 200, user, "User found successfully");
      } else {
        return ResponseHelper.sendSuccessResponse(res, 404, user, "User not found");
      }
    } catch (error) {
      return ResponseHelper.sendSuccessResponse(res, 500, [], "Internal server error");
    }
  };
  public createUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const payload = req as RequestWithUser; 
      if (req.file) {
        payload.file = req.file;
      }
      const result: ResponseHelper = await this.userService.createUser(
        payload
      );
      return ResponseHelper.sendSuccessResponse(res, 200, result, "User created successfully.");
    } catch (error) {
      next(error);
    }
  };

  public importUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userData = req.body;
      if (req.file) {
        userData.file = req.file;
      }
      const result = await this.userService.importUser(
        userData
      );
      return ResponseHelper.sendSuccessResponse(res, 200, result, "User imported successfully.");
    } catch (error) {
      next(error);
    }
  };
  public exportUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const payload = req.body;
      const result = await this.userService.exportUser(payload);
      const csvFields = ["Id", "Name", "Email"];
      const csvParser = new CsvParser({ csvFields });
      const csvData = csvParser.parse(result);
      // const filePath = path.join(os.tmpdir(), 'usersdata111.csv');
      // fs.writeFileSync(filePath, csvData);
      // const fileUrl = `/download/${path.basename(filePath)}`;
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=usersdata.csv"
      );
      return ResponseHelper.sendSuccessResponse(res, 200, csvData, "User exported successfully.");
    } catch (error) {
      next(error);
    }
  };

  public updateUserOnlineOffline = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const payload = req as RequestWithUser;
      const result = await this.userService.updateUserOnlineOffline(payload);
      return ResponseHelper.sendSuccessResponse(
        res,
        200,
        result,
        "Socket updated success fully"
      );
    } catch (error) {
      next(error);
    }
  };
}
