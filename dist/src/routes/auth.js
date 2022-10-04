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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const passport_1 = __importDefault(require("passport"));
const controllers = __importStar(require("../controllers/auth"));
const routes = (0, express_1.Router)();
require('../utils/passport');
routes.post('/signup', (0, express_validator_1.body)('email').isEmail(), (0, express_validator_1.body)('phone').isMobilePhone('any'), (0, express_validator_1.body)('password').isLength({ min: 8, max: 40 }), (0, express_validator_1.body)('first_name').isAlpha().isLength({ min: 2, max: 20 }), (0, express_validator_1.body)('last_name').isAlpha().isLength({ min: 2, max: 20 }), controllers.signupHandler);
routes.post('/login', (0, express_validator_1.body)('email').isEmail(), (0, express_validator_1.body)('phone').isMobilePhone('any'), controllers.loginHandler);
routes.get('/google', passport_1.default.authenticate('google', { scope: ['profile', 'email'], session: false }));
routes.get('/facebook', passport_1.default.authenticate('facebook'));
routes.get('/twitter', passport_1.default.authenticate('twitter', { scope: ['users.read', 'email'] }));
routes.get('/google/cb', passport_1.default.authenticate('google', { session: false }), (req, res) => {
    var _a;
    //@ts-ignore
    res.redirect(process.env.CLIENT_URL_PROVIDER_SUCCESS + `?token=${(_a = req.user) === null || _a === void 0 ? void 0 : _a.token}`);
});
routes.get('/facebook/cb', passport_1.default.authenticate('facebook', { session: false }), (req, res) => {
    console.log('cs');
    //@ts-ignore
    // res.redirect(process.env.CLIENT_URL_PROVIDER_SUCCESS! + `?token=${req.user?.token}`);
});
routes.get('/twitter/cb', passport_1.default.authenticate('twitter', { session: false }), (req, res) => {
    var _a;
    //@ts-ignore
    res.redirect(process.env.CLIENT_URL_PROVIDER_SUCCESS + `?token=${(_a = req.user) === null || _a === void 0 ? void 0 : _a.token}`);
});
exports.default = routes;
