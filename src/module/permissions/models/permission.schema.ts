import { model, Schema, Document } from "mongoose";
import { Permission } from "../interfaces/index.interface";
const mongoose = require("mongoose");

const permissionSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
    moduleName: {
      type: String,
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

const permissionModel = model<Permission & Document>(
  "Permissions",
  permissionSchema
);

export default permissionModel;
