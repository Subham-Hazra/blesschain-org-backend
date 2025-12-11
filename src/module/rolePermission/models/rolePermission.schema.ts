import { model, Schema, Types } from "mongoose";import { RolePermission } from "../interfaces/index.interface";
;

const mongoose = require("mongoose");

const rolePermissionSchema : Schema = new mongoose.Schema(
  {
    roleId: {
      type: Types.ObjectId,
      ref: "Roles",
      required: true,
    },
    permissionId: {
      type: Types.ObjectId,
      ref: "Permissions",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

rolePermissionSchema.index({ roleId: 1, permissionId: 1 }, { unique: true });

const rolePermissionModel = model<RolePermission & Document>('RolePermissions', rolePermissionSchema);
export default rolePermissionModel;