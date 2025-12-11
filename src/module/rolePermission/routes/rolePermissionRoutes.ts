import { Router } from 'express';
import { Routes } from '@/interface/route.interface';
import { FileUploader } from '@/util/multer';
import { RolePermissionController } from '../controller/rolePermissioncontroller';


class RolePermissionRoute implements Routes {
    public path = '/';
    public router = Router();
    public rolePermissionController = new RolePermissionController();
    public fileUploader = new FileUploader();
    constructor() {
      this.initializeRoutes();
    }
  
    private initializeRoutes() {
      this.router.post(`${this.path}create-role-permission`,this.rolePermissionController.createRolePermission);
      this.router.post(`${this.path}update-role-permission`,this.rolePermissionController.updateRolePermission);
    }
  }
  
export default RolePermissionRoute;

