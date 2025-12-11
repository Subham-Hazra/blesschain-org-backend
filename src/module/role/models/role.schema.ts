

import { model, Schema, Document, Types } from 'mongoose';
import { User } from '@/module/user/interfaces/index.interface';
import { Role, RoleType } from '../interfaces/index.interface';

const roleSchema: Schema = new Schema({
  roleName: {
    type: String,
    required: true,
    enum: [RoleType.ADMIN, RoleType.USER],
    default:  RoleType.USER
  },
  deleted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  deletedAt: {
    type: Date,
  },
  added_by: {
    type: Schema.Types.ObjectId,
    ref: 'Users'
  },
},{
  timestamps: true
});

const roleModel = model<Role & Document>('Roles', roleSchema);

export default roleModel;
