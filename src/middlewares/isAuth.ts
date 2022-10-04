import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { ErrorRequest } from '../types/request';

declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}

const isAuth: RequestHandler = (req, res, next) => {
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    const error: ErrorRequest = new Error('not authorized');
    error.code = 401;
    throw error;
  }

  const token = authHeader.split(' ')[1];
  const decodedToken = jwt.verify(token, process.env.JWT!);
  if (!decodedToken) {
    const error: ErrorRequest = new Error('Not authenticated');
    error.code = 401;
    throw error;
  }
  //@ts-ignore
  req.userId = decodedToken.id;
  next();
};
export default isAuth;
