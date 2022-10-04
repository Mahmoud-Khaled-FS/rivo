"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCityFromId = void 0;
const cities_json_1 = __importDefault(require("../../data/cities.json"));
const getCityFromId = (id) => {
    const location = cities_json_1.default.find((c) => id === c.id);
    return location;
};
exports.getCityFromId = getCityFromId;
