import { ErrorRequest } from '../types/request';
import { extname } from 'path';
function fileFilter(req: Request, file: any, callback: any) {
  const supportedExt = ['.flv', '.mkv', '.wmv', '.mp4'];
  var ext = extname(file.originalname);
  if (supportedExt.includes(ext)) {
    return callback(null, true);
  }
  const err: ErrorRequest = new Error('video type not supported');
  err.code = 401;
  return callback(err, false);
}

export default fileFilter;
