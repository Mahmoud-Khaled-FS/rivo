"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signupHandler = exports.loginHandler = void 0;
const express_validator_1 = require("express-validator");
const prisma_1 = require("../utils/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// controller function user sign up and create account
const loginHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const error = (0, express_validator_1.validationResult)(req);
        if (!error.isEmpty()) {
            const err = new Error('bad request!');
            err.code = 400;
            return next(err);
        }
        const userExist = yield prisma_1.prisma.user.findUnique({ where: { email: req.body.email }, include: { profile: true } });
        if (!userExist) {
            const err = new Error('email not found');
            err.code = 404;
            return next(err);
        }
        const isPasswordCorrect = yield bcryptjs_1.default.compare(req.body.password, userExist.passwordHash);
        if (!isPasswordCorrect) {
            const err = new Error('incorrect password');
            err.code = 401;
            return next(err);
        }
        const token = jsonwebtoken_1.default.sign({ id: userExist.id }, process.env.JWT);
        const response = {
            id: userExist.id,
            token: token,
            email: userExist.email,
            phoneNumber: userExist.phoneNumber,
            firstName: userExist.profile.firstName,
            lastName: userExist.profile.lastName,
            createAt: userExist.profile.createAt,
            updatedAt: userExist.profile.updateAt,
        };
        res.status(202).json({ status: 'ok', code: 202, data: response });
    }
    catch (_a) {
        const err = new Error('Internal server Error!');
        err.code = 500;
        return next(err);
    }
});
exports.loginHandler = loginHandler;
// controller function user sign up and create account
const signupHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const error = (0, express_validator_1.validationResult)(req);
        if (!error.isEmpty()) {
            const err = new Error('bad request!');
            err.code = 400;
            return next(err);
        }
        const userExist = yield prisma_1.prisma.user.findUnique({ where: { email: req.body.email } });
        if (userExist) {
            const err = new Error('this email is existing');
            err.code = 500;
            return next(err);
        }
        const hashPassword = yield bcryptjs_1.default.hash(req.body.password, 16);
        if (!hashPassword) {
            const err = new Error('Internal server Error!');
            err.code = 500;
            return next(err);
        }
        const user = yield prisma_1.prisma.user.create({
            data: {
                email: req.body.email,
                passwordHash: hashPassword,
                phoneNumber: req.body.phone,
            },
        });
        if (!user) {
            const err = new Error('Internal server Error!');
            err.code = 500;
            return next(err);
        }
        const profile = yield prisma_1.prisma.profile.create({
            data: {
                firstName: req.body.first_name,
                lastName: req.body.last_name,
                userId: user.id,
            },
        });
        if (!profile) {
            yield prisma_1.prisma.user.delete({ where: { id: user.id } });
            const err = new Error('Internal server Error!');
            err.code = 500;
            return next(err);
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT);
        const response = {
            id: user.id,
            token: token,
            email: user.email,
            phoneNumber: user.phoneNumber,
            firstName: profile.firstName,
            lastName: profile.lastName,
            createAt: profile.createAt,
            updatedAt: profile.updateAt,
        };
        res.status(202).json({ status: 'ok', code: 202, data: response });
    }
    catch (_b) {
        const err = new Error('Internal server Error!');
        err.code = 500;
        return next(err);
    }
});
exports.signupHandler = signupHandler;
