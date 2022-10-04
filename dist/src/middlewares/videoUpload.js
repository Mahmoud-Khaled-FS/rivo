"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const filterRivos_1 = __importDefault(require("../config/filterRivos"));
const videoStorage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage: videoStorage,
    //@ts-ignore
    fileFilter: filterRivos_1.default,
}).single('video');
exports.default = upload;