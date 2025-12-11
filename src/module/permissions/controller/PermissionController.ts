import { Request, Response } from "express";
import { ResponseHelper } from "@/util/ResponseHelper";
import { RequestWithPermission } from "../interfaces/index.interface";
import { PermissionService } from "../services/PermissionService";

export class PermissionController {
  private permissionService: PermissionService;

  constructor() {
    this.permissionService = new PermissionService();
  }
  public createPermission = async (req: Request,  res: Response) => {
    try {
      const {body, user} = req as RequestWithPermission; 
      await this.permissionService.createPermisson(
        body,
        user
      );
      return ResponseHelper.sendSuccessResponse(res, 200,'', "Permission created successfully.");
    } catch (error) {
      return ResponseHelper.sendSuccessResponse(res, 500,'', "Failed to create Permission");
    }
  }
  public updatePermission = async (req: Request,  res: Response) => {
    try {
      const {body = {}} = req as unknown as RequestWithPermission; 
      await this.permissionService.updatePermission(
        body
      );
      return ResponseHelper.sendSuccessResponse(res, 200,'', "Permission updated successfully.");
    } catch (error) {
      return ResponseHelper.sendSuccessResponse(res, 500,'', "Failed to update Permission");
    }
  }
  public  deletePermsission =  async (req: Request,  res: Response) => {
    try {
      const {body={}}  = req as unknown as RequestWithPermission; 
      await this.permissionService.softDeletePermission(
        body?.id as string
      );
      return ResponseHelper.sendSuccessResponse(res, 200,'', "Permission deleted successfully.");
    } catch (error) {
      return ResponseHelper.sendSuccessResponse(res, 500,'', "Failed to delete Permission");
    }
  }
}
