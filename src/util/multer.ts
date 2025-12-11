import { HttpException } from '@/exceptions/HttpException';
import multer, { StorageEngine } from 'multer';
export class FileUploader {
  private upload: multer.Multer;
  constructor() {
    const storage: StorageEngine = multer.memoryStorage();
    this.upload = multer({
      storage,
      fileFilter: (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => { 
        if (file.mimetype.startsWith('image/') || file.mimetype === 'text/csv') {
          cb(null, true);
        } else {
          throw new HttpException(409, "Invalid file type. Only images are allowed")
         // cb(new Error('Invalid file type. Only images are allowed.'), false);
        }
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
    });
  }
  public getUploadMiddleware() {
    return this.upload.single('file');
  }
}