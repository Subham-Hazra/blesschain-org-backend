import { RequestWithUser } from "@/module/auth/interfaces/auth.interface";
import { Schema } from "mongoose";

export enum RoleType {
    ADMIN = 'admin',
    USER = 'user'
}

export interface Permission {
    name: string;
    deleted?: Boolean;
    deletedAt?: Date;
    createdBy?: Schema.Types.ObjectId,
}

export interface RequestWithPermission extends RequestWithUser {
    permission: Permission;
    id?: string
}

export enum ROLE_PERMISSIONS {
    READ_USER = 'read_user',
    CREATE_USER = 'create_user',
    DELETE_USER = 'delete_user',
    EDIT_USER = 'edit_user',
    CREATE_ROLE = 'create_role',
    DELETE_ROLE = 'delete_role',
    EDIT_ROLE = 'edit_role',
}