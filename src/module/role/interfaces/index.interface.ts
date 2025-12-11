import { RequestWithUser } from "@/module/auth/interfaces/auth.interface";
import { Schema } from "mongoose";

export enum RoleType {
    ADMIN = 'admin',
    USER = 'staff'
}

export interface Role {
    roleName: string;
    deleted?: Boolean;
    createdAt?: Date;
    deletedAt?: Date;
    added_by?: Schema.Types.ObjectId,
}

export interface RequestWithRole extends RequestWithUser {
    role: Role;
    id?: string
}