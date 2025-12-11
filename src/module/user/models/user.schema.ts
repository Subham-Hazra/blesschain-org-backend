
import { model, Schema, Document, Types } from 'mongoose';
import { User } from '@/module/user/interfaces/index.interface';

const userSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  image: {
    type: String
  },
  password: {
    type: String,
    required: true,
    trim: true
  },
  mobile: {
    type: String,
    unique:true,
    default:null
  },
  socket_id: {
    type: String,
    required: false
  },
  role: { 
    type: Types.ObjectId,
    ref: 'Roles'
  }, 
  is_online: {
    type: Number,
    default: 0
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

const userModel = model<User & Document>('Users', userSchema);

export default userModel;
