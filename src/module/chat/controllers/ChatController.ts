import { NextFunction, Request, Response } from "express";
import { ChatService } from "@/module/chat/services/ChatSetvice";
import { ResponseHelper } from "@/util/ResponseHelper";
import { CreateChats, Chats } from "../interfaces/index.interface";
import { RequestWithUser } from "@/module/auth/interfaces/auth.interface";
const CsvParser = require("json2csv").Parser;
export class ChatController {
    private ChatSetvice: ChatService;

    constructor() {
        this.ChatSetvice = new ChatService();
    }

    public create = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const payload = req as RequestWithUser;
            if (req.file) {
                payload.file = req.file;
            }
            const result: ResponseHelper = await this.ChatSetvice.create(
                payload
            );
            return ResponseHelper.sendSuccessResponse(res, 200, result, "Chat created successfully.");
        } catch (error) {
            next(error);
        }
    };

    public getChats = async (req: Request, res: Response) => {
        try {
            const payload = req.body;
            const users = await this.ChatSetvice.getChats(payload);
            return ResponseHelper.sendSuccessResponse(
                res,
                200,
                users,
                "Chat fetched successfully!"
            );
        } catch (error) {
            return ResponseHelper.sendSuccessResponse(
                res,
                500,
                [],
                "Internal Server Error"
            );
        }
    };

    public delete = async (req: Request, res: Response) => {
        try {
            const id = req.body.id;
            const response = await this.ChatSetvice.delete(id);
            console.log(response,'response---')
            if (response) {
                return ResponseHelper.sendSuccessResponse(res, 200, response, "Chat deleated successfully");
            } else {
                return ResponseHelper.sendSuccessResponse(res, 404, [], "Chat not found");
            }
        } catch (error) {
            console.log(error,'error')
            return ResponseHelper.sendSuccessResponse(res, 500, [], "Internal server error");
        }
    };
    
    public forceDelete = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;
            const response = await this.ChatSetvice.forceDelete(id);
            if (response) {
                return ResponseHelper.sendSuccessResponse(res, 200, response, "Chat deleated successfully");
            } else {
                return ResponseHelper.sendSuccessResponse(res, 404, response, "Chat not found");
            }
        } catch (error) {
            return ResponseHelper.sendSuccessResponse(res, 500, [], "Internal server error");
        }
    };


}
