import { Request, Response } from "express";
import { ResponseHelper } from "@/util/ResponseHelper";
import { RequestWithRole } from "../interfaces/index.interface";
import { RoleService } from "@/module/role/services/RoleService";

export class RoleController {
  private roleService: RoleService;

  constructor() {
    this.roleService = new RoleService();
  }

    public getAllRoles= async (req: Request, res: Response) => {
      try {
  
        const request = req as RequestWithRole;
        const userId = request?.user?._id;
        const payload = req.body;
        const updatedPayload = { ...payload, userId };
  
        const roles = await this.roleService.getAllRoles(updatedPayload);
        return ResponseHelper.sendSuccessResponse(
          res,
          200,
          roles,
          "Role fetched successfully!"
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
  public createRole = async (req: Request,  res: Response) => {
    try {
      const {body, user} = req as RequestWithRole; 
      await this.roleService.createRole(
        body,
        user
      );
      return ResponseHelper.sendSuccessResponse(res, 200,'', "Role created successfully.");
    } catch (error) {
      return ResponseHelper.sendSuccessResponse(res, 500,'', "Failed to create Role");
    }
  }
  public updateRole = async (req: Request,  res: Response) => {
    try {
      const {body = {}} = req as unknown as RequestWithRole; 
      console.log("body : ", req)
      await this.roleService.updateRole(
        body
      );
      return ResponseHelper.sendSuccessResponse(res, 200,'', "Role updated successfully.");
    } catch (error) {
      return ResponseHelper.sendSuccessResponse(res, 500,'', "Failed to update Role");
    }
  }
  public  deleteRole =  async (req: Request,  res: Response) => {
    try {
      const {body={}}  = req as unknown as RequestWithRole; 
      await this.roleService.softDeleteRole(
        body?.id as string
      );
      return ResponseHelper.sendSuccessResponse(res, 200,'', "Role deleted successfully.");
    } catch (error) {
      return ResponseHelper.sendSuccessResponse(res, 500,'', "Failed to delete Role");
    }
  }
}
