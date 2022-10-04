"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const crypto_1 = require("crypto");
const storageRivosConfig = {
    destination(req, file, callback) {
        const userId = req.userId;
        const isExists = fs.existsSync(path.join(__dirname, '..', '..', 'uploads', userId, 'rivos'));
        if (!isExists) {
            fs.mkdir(path.join(__dirname, '..', '..', 'uploads', userId, 'rivos'), { recursive: true }, (err) => {
                const error = new Error('something wrong');
                error.code = 500;
                return callback(error, null);
            });
        }
        return callback(null, path.join(__dirname, '..', '..', 'uploads', userId, 'rivos'));
    },
    filename(req, file, callback) {
        const uuid = (0, crypto_1.randomUUID)().toString();
        callback(null, uuid + '-' + file.originalname);
    },
};
exports.default = storageRivosConfig;
