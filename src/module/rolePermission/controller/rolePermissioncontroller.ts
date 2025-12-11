import { Request, Response } from "express";
import { ResponseHelper } from "@/util/ResponseHelper";
import { RequestWithRolePermission } from "../interfaces/index.interface";
import { RolePermissionService } from "../services/RolePermissionService";

export class RolePermissionController {
  private rolePermissionService: RolePermissionService;

  constructor() {
    this.rolePermissionService = new RolePermissionService();
  }
  public createRolePermission = async (req: Request,  res: Response) => {
    try {
      const {body, user} = req as RequestWithRolePermission; 
      await this.rolePermissionService.createRolePermission(
        body,
        user
      );
      return ResponseHelper.sendSuccessResponse(res, 200,'', "Role permission created successfully.");
    } catch (error) {
      console.log("error : ", error)
      return ResponseHelper.sendSuccessResponse(res, 500,'', "Failed to create Role permission");
    }
  }
  public updateRolePermission = async (req: Request,  res: Response) => {
    try {
      const {body = {}} = req as unknown as RequestWithRolePermission; 
      await this.rolePermissionService.updateRolePermission(
        body
      );
      return ResponseHelper.sendSuccessResponse(res, 200,'', "Role permission updated successfully.");
    } catch (error) {
      return ResponseHelper.sendSuccessResponse(res, 500,'', "Failed to update Role permission");
    }
  }
  public  deleteRolePermission =  async (req: Request,  res: Response) => {
    try {
      const {body={}}  = req as unknown as RequestWithRolePermission; 
      await this.rolePermissionService.softDeleteRole(
        body?.roleId as string
      );
      return ResponseHelper.sendSuccessResponse(res, 200,'', "Role permission deleted successfully.");
    } catch (error) {
      return ResponseHelper.sendSuccessResponse(res, 500,'', "Failed to delete Role permission");
    }
  }

    public  updateRolePermissions =  async (req: Request,  res: Response) => {
    try {
      const {body={}}  = req as unknown as RequestWithRolePermission;
      const {roleId, permissionIds} = body
      await this.rolePermissionService.updateRolePermissions(
       { roleId, permissionIds }
      );
      return ResponseHelper.sendSuccessResponse(res, 200,'', "Role permissions updated successfully.");
    } catch (error) {
      return ResponseHelper.sendSuccessResponse(res, 500,'', "Failed to update Role permissions.");
    }
  }
}
