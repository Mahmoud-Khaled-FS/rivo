"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const isAuth = (req, res, next) => {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
        const error = new Error('not authorized');
        error.code = 401;
        throw error;
    }
    const token = authHeader.split(' ')[1];
    const decodedToken = jsonwebtoken_1.default.verify(token, process.env.JWT);
    if (!decodedToken) {
        const error = new Error('Not authenticated');
        error.code = 401;
        throw error;
    }
    //@ts-ignore
    req.userId = decodedToken.id;
    next();
};
exports.default = isAuth;
