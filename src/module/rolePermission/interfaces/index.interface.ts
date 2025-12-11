import { RequestWithUser } from "@/module/auth/interfaces/auth.interface";
import mongoose, { Schema } from "mongoose";

export enum RoleType {
  ADMIN = "admin",
  USER = "user",
}

export interface RolePermission {
  roleId: mongoose.Schema.Types.ObjectId;
  permissionId: mongoose.Schema.Types.ObjectId;
  createdBy?: mongoose.Schema.Types.ObjectId;
  roleName: string;
  deleted?: Boolean;
  createdAt?: Date;
  deletedAt?: Date;
}

export interface RequestWithRolePermission extends RequestWithUser {
  roleId: string;
  rolePermission?: RolePermission;
  rolePermissionIds?: string[]
}
