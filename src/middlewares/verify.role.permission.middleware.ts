import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUser } from '@/module/auth/interfaces/auth.interface';
import permissionModel from '@/module/permissions/models/permission.schema';
import { RoleType } from '@/module/role/interfaces/index.interface';
import roleModel from '@/module/role/models/role.schema';
import rolePermissionModel from '@/module/rolePermission/models/rolePermission.schema';
import { NextFunction, Request, RequestHandler } from 'express';


const verifyRolePermissionMiddleware = (permissionName: string): any => { //todo?: write correct type
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const request = req as RequestWithUser;
      const roleId = request?.user?.role;
      
      if (!roleId) next('No role assigned to user');
      const role = await roleModel.findOne({_id: roleId})
      console.log("role : ", role)
      if(role?.roleName === RoleType.ADMIN) next();
      const permission = await permissionModel.findOne({ name: permissionName });
      if (!permission) next(new HttpException(404, 'Permission Not Found'));
      const exists = await rolePermissionModel.findOne({
        roleId,
        permissionId: permission?._id,
      });

      if (!exists) return next(new HttpException(404, 'Access denied'));

      next();
    } catch (error) {
        next(new HttpException(500, 'Internal Server Error'));
    }
  };
};

export default verifyRolePermissionMiddleware;