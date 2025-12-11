// src/routes/Router.ts
import { Router } from 'express';
import UsersRoute from '@/module/user/routes/userRoutes';
import AuthRoute from '@/module/auth/routes/AuthRoute';
import ZoneRoute from '@/module/zones/routes/zoneRoute';
import ChatRoute from '@/module/chat/route/chatRoute';
import RoleRoute from '@/module/role/routes/roleRoutes';
import authMiddleware from '@/middlewares/auth.middlewares';
import PermissionRoute from '@/module/permissions/routes/permissionRoutes';
import RolePermissionRoute from '@/module/rolePermission/routes/rolePermissionRoutes';

export class AppRouter {
  public router: Router;
  private userRoutes: UsersRoute;
  private authRoute: AuthRoute;
  private zoneRoute: ZoneRoute;
  private chatRoute: ChatRoute;
  private roleRoute: RoleRoute;
  private permissionRoute: PermissionRoute;
  private rolePermissionRoute: RolePermissionRoute;

  constructor() {
    this.router = Router();
    this.authRoute = new AuthRoute();
    this.userRoutes = new UsersRoute();
    this.zoneRoute = new ZoneRoute();
    this.chatRoute = new ChatRoute();
    this.roleRoute = new RoleRoute();
    this.permissionRoute = new PermissionRoute();
    this.rolePermissionRoute = new RolePermissionRoute();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.use('/auth', this.authRoute.router);
    this.router.use('/users',authMiddleware, this.userRoutes.router);
    this.router.use('/zone',authMiddleware, this.zoneRoute.router);
    this.router.use('/chat',authMiddleware, this.chatRoute.router);
    this.router.use('/roles',authMiddleware, this.roleRoute.router);
    this.router.use('/permission',authMiddleware, this.permissionRoute.router);
    this.router.use('/role/permission',authMiddleware, this.rolePermissionRoute.router)
  }
}
