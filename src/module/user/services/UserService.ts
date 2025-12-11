import { hash } from "bcrypt";
import { HttpException, ConflictException } from "@/exceptions/HttpException";
import { ImageProcessor } from "@/util/ImageProcessor";
import { isEmpty } from "@/util/util";
import { User, CreateUser } from "@/module/user/interfaces/index.interface";
import userModel from "@/module/user/models/user.schema";
import { QueryParams } from "@/interface/query.interface";
import { QueryBuilder } from "@/util/query";
import mongoose, { FilterQuery } from "mongoose";
import globalPaths from "@/config/paths.config";
import { FileManager } from "@/helper/delete";
import { ResponseHelper } from "@/util/ResponseHelper";
import csvParser from "csv-parser";
import XLSX from "xlsx";
import { RequestWithUser } from "@/module/auth/interfaces/auth.interface";
export class UserService {
  public users = userModel;
  public imageProcesser = new ImageProcessor(globalPaths.profilePath);
  public fileManager = new FileManager();

  
  public async getAllUsers(req: QueryParams): Promise<User[]> {
    try {
      const { page, limit, sortField = "_id", sortOrder = "asc", filters, search, userId } = req;
      const initialQuery = {
        _id: { $ne: userId },
      } as Record<string, any>;

      const queryBuilder = new QueryBuilder(filters, initialQuery, ["name"]);
      let query = queryBuilder.setSearchParams(search, ["name", "email","mobile"]).build();
  
      const pageNumber = parseInt(page) || 1;
      const limitNumber = parseInt(limit) || 3;
      const skip = (pageNumber - 1) * limitNumber;
      const sort: Record<string, 1 | -1> = {
        [sortField]: sortOrder === "asc" ? 1 : -1,
      };
  
      const response = await this.users.aggregate([
        {
          $facet: {
            records: [
              { $match: query },
              { $project: { password: 0 } },
              {
                $addFields: {
                  activeStatus: {
                    $cond: {
                      if: { $eq: ["$is_online", 1] },
                      then: "online",
                      else: "offline",
                    },
                  },
                },
              },
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
      throw new Error("Failed to retrieve users. Please try again later.");
    }
  }
  
  public async getChatList(req: QueryParams): Promise<User[]> {
    const { page, limit, sortField = "_id", sortOrder = "asc", filters ,userId} = req;
    const initialQuery = { 
        _id: { $ne: userId },
    } as Record<string, any>; 
    const queryBuilder = new QueryBuilder(filters, initialQuery, ["name"]);
    let query = queryBuilder.build();
    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 3;
    const skip = (pageNumber - 1) * limitNumber;
    const sort: Record<string, 1 | -1> = {
      [sortField]: sortOrder === "asc" ? 1 : -1,
    };

    const response = await this.users.aggregate([
      {
        $facet: {
          records: [
            { $match: query },
            { $project: { password: 0 } },
            {
              $addFields: {
                activeStatus: {
                  $cond: {
                    if: { $eq: ["$is_online", 1] },
                    then: "online",
                    else: "offline",
                  },
                },
                // avatar: {
                //     $cond: {
                //         if: { $ne: ['$image', ''] },
                //         then: { $concat: [this.baseUrl, '$image'] },
                //         else: ''
                //     }
                // }
              },
            },
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
  }

  public async findUserById(userId: string): Promise<User> {
    if (isEmpty(userId)) throw new HttpException(400, "UserId is empty");
    const findUser = await this.users.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: "users", // The collection to join
          pipeline: [
            {
              $project: {
                name: 1,
              },
            },
          ],
          localField: "added_by", // Field from the users collection
          foreignField: "_id", // Field in the users collection to match
          as: "added_by", // The name of the output array
        },
      },
      { $project: { password: 0 } }, // Exclude the password field
    ]);
    if (!findUser.length) throw new HttpException(409, "User doesn't exist");
    return findUser[0]; // Return the first (and only) user
  }

  public async createUser(userData: RequestWithUser): Promise<ResponseHelper> {
    if (isEmpty(userData)) throw new HttpException(400, "userData is empty");
    const { _id, email, ...rest } = userData.body;
    const file = userData.file;
    let query: FilterQuery<CreateUser> = {};
    let user_old_image = "";
    if (_id) {
      const findUser = await this.users.findOne({ _id: _id }).select("image");
      if (!findUser) throw new HttpException(409, "User doesn't exist");
      user_old_image = findUser.image;
      query._id = new mongoose.Types.ObjectId(_id);
    } else if (email) {
      query.email = email;
    } else {
      query = rest;
    }
    query.added_by = userData?.user?._id;

    if (file) {
     
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.originalname}`;
      rest.image = await this.imageProcesser.processImage(
        file.buffer,
        fileName,
        200,
        200
      );
    }

    if (rest?.password) {
      rest.password = await hash(rest.password, 10);
    }

    const userInfo = JSON.parse(JSON.stringify(rest));
    try {
      const response = await this.users
        .findOneAndUpdate(query, userInfo, {
          upsert: true,
          new: true,
        })
        .exec();

      if (file) {
        const tempImage = globalPaths.assets + user_old_image;
        this.fileManager.deleteFile(tempImage);
      }
      return response ?? [];
    } catch (error) {
      if (file) {
        const tempImage = globalPaths.assets + (rest.image || "");
        this.fileManager.deleteFile(tempImage);
      }
      throw new HttpException(500, "Error updating or creating user"+error);
    }
  }

  public async deleteUser(userId: string): Promise<User> {
    const deleteUserById = await this.users.findOneAndUpdate(
      { _id: userId },
      { deleted: true },
      { new: true, lean: true }
    );
    if (!deleteUserById) throw new HttpException(409, "User doesn't exist");

    return deleteUserById;
  }

  public async forceDeleteUser(userId: string): Promise<User> {
    const forceDeleteUser = await this.users.findByIdAndDelete(userId);
    if (forceDeleteUser == null)
      throw new HttpException(409, "User doesn't exist");

    return forceDeleteUser;
  }

  async importUser(fileBuffer: CreateUser): Promise<any> {
    try {
      const password = await hash("123456", 10);
      console.log("i am in iport user");
      if (fileBuffer) {
        const workbook = XLSX.read(fileBuffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const csvData = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);
        const csvStream = require("stream").Readable.from(csvData);
        const results: any[] = [];
        // console.log(csvStream,'csvStream--------------------')
        return new Promise((resolve, reject) => {
          csvStream
            .pipe(csvParser())
            .on("data", async (data: any) => {
              console.log(data, "datata-----");
              data.added_by = "added_by";
              data.password = password;
              results.push(data);
              console.log(results, "results userrrrr");
              const filter = { email: data.email };
              const update = data;
              await this.users.updateOne(filter, update, { upsert: true });
            })
            .on("end", async () => {
              resolve({
                status: true,
                message: "File processed successfully",
                data: results,
              });
            })
            .on("error", (error: Error) => {
              throw new HttpException(500, "Error processing CSV data");
            });
        });
      }
    } catch (error) {
      throw new HttpException(500, "Internal server error during  importing");
    }
  }

  public async exportUser(req: QueryParams): Promise<User[]> {
    const { page, limit, sortField = "_id", sortOrder = "asc", filters } = req;
    const initialQuery = {
      //  deleted: false
    } as Record<string, any>;
    // if (userId) {
    //   initialQuery.added_by = new mongoose.Types.ObjectId(userId);
    // }
    const queryBuilder = new QueryBuilder(filters, initialQuery, ["name"]);
    const query = queryBuilder.build();
    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 3;
    const skip = (pageNumber - 1) * limitNumber;
    const sort: Record<string, 1 | -1> = {
      [sortField]: sortOrder === "asc" ? 1 : -1,
    };

    const response = await this.users.aggregate([
      {
        $facet: {
          records: [
            { $match: query },
            { $project: { password: 0 } },
            {
              $addFields: {
                activeStatus: {
                  $cond: {
                    if: { $eq: ["$is_online", 1] },
                    then: "online",
                    else: "offline",
                  },
                },
                // avatar: {
                //     $cond: {
                //         if: { $ne: ['$image', ''] },
                //         then: { $concat: [this.baseUrl, '$image'] },
                //         else: ''
                //     }
                // }
              },
            },
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
    const userData = response[0]?.records;
    if (userData) {
      userData.map((user: CreateUser) => ({
        id: user._id,
        name: user.name,
        email: user.email,
      }));
    }
    return userData;
  }

  public async updateUserOnlineOffline(req: RequestWithUser): Promise<User> {
    const request = req as RequestWithUser;
    const user_id = request?.user?._id; 
    const updateUserSocket = await this.users.findOneAndUpdate(
      { _id: user_id },
      {
        $set: {
          socket_id: req?.body?.socket_id,
          is_online: req?.body?.is_online,
          updatedAt: Date.now(),
        },
      },
      { new: true, lean: true }
    );
    if (!updateUserSocket) throw new HttpException(409, "User doesn't exist");
    return updateUserSocket;
  }

  public async updateUserOnlineOfflineBySocket(payload: { socket_id: string, is_online: number }): Promise<any> {
    try {
      const user = await this.users.findOneAndUpdate(
        { socket_id: payload.socket_id },
        { is_online: payload.is_online,socket_id: '' },
        { new: true }
      );
      return user;
    } catch (error) {
      throw new Error(`Failed to update user status: ${error}`);
    }
  }

}
