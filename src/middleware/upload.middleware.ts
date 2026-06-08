import multer from 'multer';
import type{ FileFilterCallback } from 'multer';
import type { Request } from 'express';
import { BadRequestError } from '../utils/appError.js';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_MB = 10;

const storage = multer.memoryStorage();

const fileFilter = (req:Request,file:Express.Multer.File,cb:FileFilterCallback) => {
    if(ALLOWED_MIME_TYPES.includes(file.mimetype)){
        cb(null,true);
    }else{
        cb(new BadRequestError("File type not supported"));
    }
}

export const uploadMiddleware = multer({
    storage,
    fileFilter,
    limits:{
        fileSize: MAX_FILE_SIZE_MB * 1024 * 1024
    }
});
