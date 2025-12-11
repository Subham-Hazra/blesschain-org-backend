import moment from "moment";
import { RequestWithRolePermission, RolePermission } from "../interfaces/index.interface";
import rolePermissionModel from "../models/rolePermission.schema";
import { User } from "@/module/user/interfaces/index.interface";
import roleModel from "@/module/role/models/role.schema";
import permissionModel from "@/module/permissions/models/permission.schema";
import mongoose from "mongoose";

export class RolePermissionService {
  public rolePermissionModel = rolePermissionModel;
  public roleModel = roleModel;
  public permissionModel = permissionModel;
  public createRolePermission = async (body: RolePermission, user: User) => {
    const { roleId, permissionId } = body;
    const {_id} = user 
    console.log("user : ", user, _id)
    const exists = await this.rolePermissionModel.findOne({
      roleId,
      permissionId,
    });
    if (exists) throw Error("Already assigned permission");
    await this.rolePermissionModel.create({ roleId, permissionId, createdBy: _id });
  };
  public async updateRolePermission({ roleId, rolePermission }: RequestWithRolePermission) {
    await this.rolePermissionModel.findOneAndUpdate({ roleId }, rolePermission);
  }

  public async updateRolePermissions ({ roleId, permissionIds }: Record<string, string[]>){

  if (!Array.isArray(permissionIds)) throw Error('permissionIds must be an array' );

  // Validate role
  const role = await roleModel.findById(roleId);
  if (!role) throw Error('Role not found' );

  // Optional: validate permission IDs exist
  const validPermissions = await permissionModel.find({ _id: { $in: permissionIds } });
  if (validPermissions.length !== permissionIds.length) throw Error('One or more permission IDs are invalid');

  try {
    // Delete existing permissions for the role
    await rolePermissionModel.deleteMany({ roleId });

    // Create new mappings
    const rolePermissionDocs = permissionIds.map((permissionId: string | mongoose.Types.ObjectId) => ({
      roleId,
      permissionId,
    }));

    await rolePermissionModel.insertMany(rolePermissionDocs);
  } catch (error) {
    console.error('Error updating role permissions:', error);
    throw Error('Internal server error' );
  }
};
  public async softDeleteRole(roleId: string) {
    const deletedAt = moment().format("YYYY-MM-DD HH:MM:SS");
    await this.rolePermissionModel.findOneAndUpdate(
      { roleId },
      { deleted: true, deletedAt }
    );
  }
  public async hardDeleteRole(roleId: string) {
    await this.rolePermissionModel.deleteOne({ roleId });
  }
}
