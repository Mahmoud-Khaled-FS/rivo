import { DiskStorageOptions } from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { ErrorRequest } from '../types/request';

const storageRivosConfig: DiskStorageOptions = {
  destination(req, file, callback) {
    const userId = req.userId;
    const isExists = fs.existsSync(path.join(__dirname, '..', '..', 'uploads', userId, 'rivos'));
    if (!isExists) {
      fs.mkdir(path.join(__dirname, '..', '..', 'uploads', userId, 'rivos'), { recursive: true }, (err) => {
        const error: ErrorRequest = new Error('something wrong');
        error.code = 500;
        return callback(error, null);
      });
    }
    return callback(null, path.join(__dirname, '..', '..', 'uploads', userId, 'rivos'));
  },
  filename(req, file, callback) {
    const uuid = randomUUID().toString();
    callback(null, uuid + '-' + file.originalname);
  },
};

export default storageRivosConfig;
