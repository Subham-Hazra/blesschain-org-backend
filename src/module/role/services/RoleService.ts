import moment from "moment";
import { RequestWithRole, Role } from "../interfaces/index.interface";
import roleModel from "../models/role.schema";
import { User } from "@/module/user/interfaces/index.interface";
import { QueryBuilder } from "@/util/query";
import { QueryParams } from "@/interface/query.interface";

export class RoleService {
    public roleModel = roleModel;
      public async getAllRoles(req: QueryParams): Promise<User[]> {
        try {
          const { page, limit, sortField = "createdAt", sortOrder = "asc", filters, search, userId } = req;
          const initialQuery = {
            // _id: { $ne: userId },
            deleted: false
          } as Record<string, any>;
    
          const queryBuilder = new QueryBuilder(filters, initialQuery, ["roleName"]);
          let query = queryBuilder.setSearchParams(search, ["roleName"]).build();
      
          const pageNumber = parseInt(page) || 1;
          const limitNumber = parseInt(limit) || 3;
          const skip = (pageNumber - 1) * limitNumber;
          const sort: Record<string, 1 | -1> = {
            [sortField]: sortOrder === "asc" ? 1 : -1,
          };
      
          const response = await this.roleModel.aggregate([
            {
              $facet: {
                records: [
                  { $match: query },
                  { $project: { roleName: 1 } },
                  { $sort: sort },
                  { $skip: skip },
                  { $limit: limitNumber },
                ],
                totalCount: [{ $match: query }, { $count: "count" }],
              },
            },
            {
              $project: {
                records: 1,
                totalCount: { $arrayElemAt: ["$totalCount.count", 0] },
              },
            },
          ]);
      
          return response[0];
        } catch (error) {
          console.error("Error in getAllUsers:", error);
          throw new Error("Failed to retrieve roles. Please try again later.");
        }
      }
    public createRole = async (body: Role, user: User) => {
        const {roleName} = body
        const {_id} = user 
        const roleCreatePayload = {
            roleName,
            added_by:_id
        }
        await this.roleModel.create(roleCreatePayload);
    }
    public async updateRole({id, role}: RequestWithRole) {
        console.log("id, role : ", id, role)
        await this.roleModel.findOneAndUpdate({_id: id}, role);
    }
    public async softDeleteRole(id: string) {
        const deletedAt = moment().format('YYYY-MM-DD HH:MM:SS')
        await this.roleModel.findOneAndUpdate({_id: id}, {deleted: true, deletedAt});
    }
    public async hardDeleteRole(id: string) {
        await this.roleModel.deleteOne({_id:id});
    }
}
