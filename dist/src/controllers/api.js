"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCities = void 0;
const cities_json_1 = __importDefault(require("../../data/cities.json"));
const getCities = (req, res) => {
    res.status(202).json(cities_json_1.default);
};
exports.getCities = getCities;
