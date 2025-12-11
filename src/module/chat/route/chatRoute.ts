import { Router } from 'express';
import { ChatController } from '@/module/chat/controllers/ChatController';
import { Routes } from '@/interface/route.interface';
import { FileUploader } from '@/util/multer';
import authMiddleware from '@/middlewares/auth.middlewares';

class ChatRoute implements Routes {
    public path = '/';
    public router = Router();
    public ChatController = new ChatController();
    public fileUploader = new FileUploader();
    constructor() {
      this.initializeRoutes();
    }
  
    private initializeRoutes() {
        this.router.post(`${this.path}`,this.fileUploader.getUploadMiddleware(),authMiddleware,this.ChatController.create);
        this.router.post(`${this.path}get-user-chats`,this.fileUploader.getUploadMiddleware(),authMiddleware,this.ChatController.getChats);
        this.router.put(`${this.path}`,authMiddleware, this.ChatController.delete);
        this.router.delete(`${this.path}:id`,authMiddleware,this.ChatController.forceDelete);
        
    }
  }
  
export default ChatRoute;

