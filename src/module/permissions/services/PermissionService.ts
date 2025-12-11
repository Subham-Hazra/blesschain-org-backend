import moment from "moment";
import { Permission, RequestWithPermission} from "../interfaces/index.interface";
import permissionModel from "../models/permission.schema";
import { User } from "@/module/user/interfaces/index.interface";

export class PermissionService {
    public permissionModel = permissionModel;
    public createPermisson = async (body: Permission, user: User) => {
        const {name} = body
        const {_id} = user 
        const permissionCreatePayload = {
            name,
            createdBy: _id
        }
        await this.permissionModel.create(permissionCreatePayload);
    }
    public async updatePermission({id, permission}: RequestWithPermission) {
        console.log("id, name : ", id, permission)
        await this.permissionModel.findOneAndUpdate({_id: id}, permission);
    }
    public async softDeletePermission(id: string) {
        const deletedAt = moment().format('YYYY-MM-DD HH:MM:SS')
        await this.permissionModel.findOneAndUpdate({_id: id}, {deleted: true, deletedAt});
    }
    public async hardDeletePermission(id: string) {
        await this.permissionModel.deleteOne({_id:id});
    }
}
