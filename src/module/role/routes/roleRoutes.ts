import { RoleController } from './../controller/RoleController';
import { Router } from 'express';
import { Routes } from '@/interface/route.interface';
import { FileUploader } from '@/util/multer';
import verifyRolePermissionMiddleware from '@/middlewares/verify.role.permission.middleware';
import { ROLE_PERMISSIONS } from '@/module/permissions/interfaces/index.interface';


class RoleRoute implements Routes {
    public path = '/';
    public router = Router();
    public roleController = new RoleController();
    public fileUploader = new FileUploader();
    constructor() {
      this.initializeRoutes();
    }
  
    private initializeRoutes() {
      this.router.post(`${this.path}get-roles`,verifyRolePermissionMiddleware(ROLE_PERMISSIONS.CREATE_ROLE),this.roleController.getAllRoles);
      this.router.post(`${this.path}create-role`,verifyRolePermissionMiddleware(ROLE_PERMISSIONS.CREATE_ROLE),this.roleController.createRole);
      this.router.post(`${this.path}update-role`,verifyRolePermissionMiddleware(ROLE_PERMISSIONS.EDIT_ROLE), this.roleController.updateRole);
      this.router.post(`${this.path}delete-role`,verifyRolePermissionMiddleware(ROLE_PERMISSIONS.DELETE_ROLE), this.roleController.deleteRole);
    }
  }
  
export default RoleRoute;

