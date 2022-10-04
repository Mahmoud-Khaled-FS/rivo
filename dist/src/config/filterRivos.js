"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
function fileFilter(req, file, callback) {
    const supportedExt = ['.flv', '.mkv', '.wmv', '.mp4'];
    var ext = (0, path_1.extname)(file.originalname);
    if (supportedExt.includes(ext)) {
        return callback(null, true);
    }
    const err = new Error('video type not supported');
    err.code = 401;
    return callback(err, false);
}
exports.default = fileFilter;
