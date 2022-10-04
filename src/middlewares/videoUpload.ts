import { Request } from 'express';
import multer from 'multer';
import fileFilter from '../config/filterRivos';

const videoStorage = multer.memoryStorage();

const upload = multer({
  storage: videoStorage,
  //@ts-ignore
  fileFilter: fileFilter,
}).single('video');

export default upload;
