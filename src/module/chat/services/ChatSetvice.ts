import { HttpException, ConflictException } from "@/exceptions/HttpException";
import { ImageProcessor } from "@/util/ImageProcessor";
import { isEmpty } from "@/util/util";
import { Chats, CreateChats } from "@/module/chat/interfaces/index.interface";
import chatModel from "@/module/chat/models/chat.schema";
import { QueryParams } from "@/interface/query.interface";
import { QueryBuilder } from "@/util/query";
import mongoose, { FilterQuery } from "mongoose";
import globalPaths from "@/config/paths.config";
import { FileManager } from "@/helper/delete";
import { ResponseHelper } from "@/util/ResponseHelper";
import { RequestWithUser } from "@/module/auth/interfaces/auth.interface";
export class ChatService {
    public chats = chatModel;
    public imageProcesser = new ImageProcessor(globalPaths.chatImage);
    public fileManager = new FileManager();

    public async create(request: RequestWithUser): Promise<ResponseHelper> {

        if (isEmpty(request)) throw new HttpException(400, "Request is empty");

        const { _id, receiver_id, text, ...rest } = request.body;
        const file = request.file;
        const { query, oldImage } = await this.prepareQueryAndImage(_id);
        rest.image = await this.processFile(file, oldImage, !_id);
        const dataToSave = { ...rest, text, sender_id: request?.user?._id, receiver_id: receiver_id };

        try {
            const response = await this.saveOrUpdateChat(query, dataToSave, _id);
            if (file && oldImage) this.fileManager.deleteFile(globalPaths.assets + oldImage);
            return response ?? [];
        } catch (error) {
            if (file && rest.image) this.fileManager.deleteFile(globalPaths.assets + rest.image);
            throw new HttpException(500, "Error updating or creating chat");
        }
    }

    private async prepareQueryAndImage(_id?: string): Promise<{ query: FilterQuery<CreateChats>; oldImage: string }> {

        if (!_id) return { query: {}, oldImage: "" };

        const chat = await this.chats.findById(_id).select("image");
        if (!chat) throw new HttpException(409, "Chat doesn't exist");

        return { query: { _id: _id }, oldImage: chat.image || "" };
    }

    private async processFile(file?: Express.Multer.File, oldImage?: string, isNew?: boolean): Promise<string | null> {
        if (file) {
            const fileName = `${Date.now()}_${file.originalname}`;
            return await this.imageProcesser.processImage(file.buffer, fileName, 200, 200);
        }
        return isNew ? null : oldImage || null;
    }

    private async saveOrUpdateChat(query: FilterQuery<CreateChats>, data: Record<string, any>, _id?: string): Promise<any> {
        return _id
            ? await this.chats.findOneAndUpdate(query, data, {
                new: true,
                setDefaultsOnInsert: true,
            })
            : await new this.chats(data).save();
    }


    public async getChats(req: QueryParams): Promise<Chats[]> {

        const { page, limit, sortField = "_id", sortOrder = "asc", filters, search, sender_id, receiver_id } = req;
        const initialQuery = {
            // deleted: false 
        } as Record<string, any>;

        const queryBuilder = new QueryBuilder(filters, initialQuery, ["name"]);
        let query = queryBuilder.build();

        if (sender_id && receiver_id) {
            const sender = new mongoose.Types.ObjectId(sender_id);
            const receiver = new mongoose.Types.ObjectId(receiver_id);
            query = {
                ...query,
                $or: [
                    { sender_id: sender, receiver_id: receiver },
                    { sender_id: receiver, receiver_id: sender },
                ],
            };
        }

        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query = {
                ...query,
                $or: [
                    { name: searchRegex },
                    { email: searchRegex },
                    { username: searchRegex },
                ],
            };
        }

        const pageNumber = parseInt(page) || 1;
        const limitNumber = parseInt(limit) || 3;
        const skip = (pageNumber - 1) * limitNumber;
        const sort: Record<string, 1 | -1> = {
            [sortField]: sortOrder === "asc" ? 1 : -1,
        };

        const response = await this.chats.aggregate([
            {
                $facet: {
                    records: [
                        {
                            $lookup: {
                                from: "users",
                                let: { sender_id: { $toObjectId: "$sender_id" } },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: { $eq: ["$_id", "$$sender_id"] },
                                        },
                                    },
                                    { $project: { name: 1 } },
                                ],
                                as: "user",
                            },
                        },
                        {
                            $lookup: {
                                from: "users",
                                let: { receiver_id: { $toObjectId: "$receiver_id" } },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: { $eq: ["$_id", "$$receiver_id"] },
                                        },
                                    },
                                    { $project: { name: 1 } },
                                ],
                                as: "receiver",
                            },
                        },
                        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
                        { $unwind: { path: "$receiver", preserveNullAndEmptyArrays: true } },
                        { $match: query },
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


        return response[0] || { records: [], totalCount: 0 };
    }

    public async delete(_id: string): Promise<any> {
        const deleteUserById = await this.chats.findOneAndUpdate(
            { _id: _id },
            { deleted: true },
            { new: true, lean: true }
        );
        if (!deleteUserById) throw new HttpException(409, "Chats doesn't exist");

        return deleteUserById;
    }

    public async forceDelete(_id: string): Promise<any> {
        const forceDeleteUser = await this.chats.findByIdAndDelete(_id);
        if (forceDeleteUser == null)
            throw new HttpException(409, "Chats doesn't exist");

        return forceDeleteUser;
    }


}
