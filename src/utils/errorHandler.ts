import { ErrorRequestHandler } from 'express';

const errorReqHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err.code) {
    res.status(err.code);
  }

  return res.json({ code: err.code || 400, status: 'failed', message: err.message });
};

export default errorReqHandler;
