"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const remove = (path, cd, isDir) => {
    if (!isDir) {
        (0, fs_1.unlink)((0, path_1.join)(__dirname, '..', '..', 'uploads', path), (err) => {
            throw new Error();
        });
        return cd();
    }
    (0, fs_1.rmSync)((0, path_1.join)(__dirname, '..', '..', 'uploads', path), { recursive: true, force: true });
    return cd();
};
exports.default = remove;
