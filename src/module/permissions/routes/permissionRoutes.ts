import { PermissionController } from './../controller/PermissionController';
import { Router } from 'express';
import { Routes } from '@/interface/route.interface';
import { FileUploader } from '@/util/multer';


class PermissionRoute implements Routes {
    public path = '/';
    public router = Router();
    public PermissionController = new PermissionController();
    public fileUploader = new FileUploader();
    constructor() {
      this.initializeRoutes();
    }
  
    private initializeRoutes() {
      this.router.post(`${this.path}create-permission`,this.PermissionController.createPermission);
      this.router.post(`${this.path}update-permission`,this.PermissionController.updatePermission);
    }
  }
  
export default PermissionRoute;

