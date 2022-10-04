"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorReqHandler = (err, req, res, next) => {
    if (err.code) {
        res.status(err.code);
    }
    return res.json({ code: err.code || 400, status: 'failed', message: err.message });
};
exports.default = errorReqHandler;
