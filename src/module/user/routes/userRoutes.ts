import { Router } from 'express';
import { UserController } from '@/module/user/controllers/UserController';
import { Routes } from '@/interface/route.interface';
import { FileUploader } from '@/util/multer';
import authMiddleware from '@/middlewares/auth.middlewares';
import verifyRolePermissionMiddleware from '@/middlewares/verify.role.permission.middleware';
import { ROLE_PERMISSIONS } from '@/module/permissions/interfaces/index.interface';

class UsersRoute implements Routes {
    public path = '/';
    public router = Router();
    public usersController = new UserController();
    public fileUploader = new FileUploader();
    constructor() {
      this.initializeRoutes();
    }
  
    private initializeRoutes() {
      this.router.post(`${this.path}get-users`, verifyRolePermissionMiddleware(ROLE_PERMISSIONS.READ_USER),this.usersController.getAllUsers);
      this.router.post(`${this.path}get-chat-list`,this.usersController.getChatList);
      this.router.get(`${this.path}:id`,this.usersController.findUserById);
      this.router.post(`${this.path}`,this.fileUploader.getUploadMiddleware(),this.usersController.createUser);
      this.router.post(`${this.path}import`,this.fileUploader.getUploadMiddleware(),this.usersController.importUser);
      this.router.post(`${this.path}export-user`,this.usersController.exportUser);
      this.router.post(`${this.path}update-user-socket-id` ,this.usersController.updateUserOnlineOffline);
      this.router.put(`${this.path}:id`, verifyRolePermissionMiddleware(ROLE_PERMISSIONS.DELETE_USER), this.usersController.deleteUser);
      this.router.delete(`${this.path}:id`, verifyRolePermissionMiddleware(ROLE_PERMISSIONS.DELETE_USER),this.usersController.forceDeleteUser);
    }
  }
  
export default UsersRoute;

