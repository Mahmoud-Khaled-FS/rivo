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
Object.defineProperty(exports, "__esModule", { value: true });
exports.unfollowHandler = exports.followHandler = exports.getUserBySearch = exports.getUserProfile = exports.changeProfileInfoHandler = exports.getMyProfileHandler = void 0;
const client_1 = require("@prisma/client");
const express_validator_1 = require("express-validator");
const cities_1 = require("../utils/cities");
const prisma_1 = require("../utils/prisma");
const getMyProfileHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const profile = yield prisma_1.prisma.profile.findUnique({
            where: {
                userId: userId,
            },
        });
        if (!profile) {
            const err = new Error('User Not founded!');
            err.code = 404;
            return next(err);
        }
        const response = {
            status: 'ok',
            code: 202,
            data: {
                id: profile.userId,
                first_name: profile.firstName,
                last_name: profile.lastName,
                fullName: profile.firstName + ' ' + profile.lastName,
                bio: profile.bio || '',
                createAt: profile.createAt || '',
                dateOfBirth: profile.dateOfBirth || '',
                gender: profile.gender || '',
                location: (0, cities_1.getCityFromId)(profile.location) || null,
                userImage: profile.userImage || '',
            },
        };
        res.status(202).json(response);
    }
    catch (_a) {
        const err = new Error('Internal server Error!');
        err.code = 500;
        return next(err);
    }
});
exports.getMyProfileHandler = getMyProfileHandler;
const changeProfileInfoHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const data = validateRequestEditBody(req);
        if (data instanceof Error) {
            return next(data);
        }
        const profile = yield prisma_1.prisma.profile.update({
            where: {
                userId: userId,
            },
            data: data,
        });
        if (!profile) {
            const err = new Error('User Not founded!');
            err.code = 404;
            return next(err);
        }
        const response = {
            status: 'ok',
            code: 202,
            data: {
                first_name: profile.firstName,
                last_name: profile.lastName,
                fullName: profile.firstName + ' ' + profile.lastName,
                bio: profile.bio || '',
                createAt: profile.createAt || '',
                dateOfBirth: profile.dateOfBirth || '',
                gender: profile.gender || '',
                location: (0, cities_1.getCityFromId)(profile.location) || null,
                userImage: profile.userImage || '',
            },
        };
        res.status(202).json(response);
    }
    catch (_b) {
        const err = new Error('Internal server Error!');
        err.code = 500;
        return next(err);
    }
});
exports.changeProfileInfoHandler = changeProfileInfoHandler;
// get user Profile ============================================
const getUserProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    try {
        const userId = req.params.id;
        if (!userId) {
            const err = new Error('invalid user id');
            err.code = 401;
            return next(err);
        }
        const user = yield prisma_1.prisma.user.findUnique({
            where: {
                id: userId,
            },
            include: {
                profile: true,
                _count: true,
            },
        });
        if (!user || !user.profile) {
            const err = new Error('profile not founded!');
            err.code = 404;
            return next(err);
        }
        const response = {
            code: 202,
            status: 'ok',
            data: {
                id: user.profile.userId,
                bio: user.profile.bio || '',
                createAt: user.profile.createAt,
                dateOfBirth: user.profile.dateOfBirth || '',
                first_name: user.profile.firstName,
                last_name: user.profile.lastName,
                fullName: user.profile.firstName + ' ' + user.profile.lastName,
                gender: user.profile.gender || '',
                location: (0, cities_1.getCityFromId)((_c = user.profile) === null || _c === void 0 ? void 0 : _c.location) || null,
                userImage: user.profile.userImage || '',
                followersCount: user._count.followers,
                followingCount: user._count.following,
                rivosCount: user._count.videos,
                likesCount: user._count.likes,
            },
        };
        res.status(202).json(response);
    }
    catch (_d) {
        const err = new Error('Internal server Error!');
        err.code = 500;
        return next(err);
    }
});
exports.getUserProfile = getUserProfile;
// search for users ==========================================
const getUserBySearch = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const name = req.query['name'] || null;
        const email = req.query['email'] || null;
        const phone = req.query['phone'] || null;
        const page = parseInt(req.query['page']) || 1;
        if (!name && !email && !phone) {
            const err = new Error('invalid data');
            err.code = 401;
            return next(err);
        }
        const users = yield prisma_1.prisma.user.findMany({
            take: 10,
            skip: (page - 1) * 1,
            include: {
                profile: true,
                _count: {
                    select: {
                        followers: true,
                        following: true,
                        videos: true,
                    },
                },
            },
            where: {
                OR: [
                    email
                        ? {
                            email: {
                                contains: email,
                            },
                        }
                        : {},
                    phone
                        ? {
                            phoneNumber: {
                                contains: phone,
                            },
                        }
                        : {},
                    name
                        ? {
                            profile: {
                                firstName: {
                                    contains: name,
                                },
                            },
                        }
                        : {},
                    name
                        ? {
                            profile: {
                                lastName: {
                                    contains: name,
                                },
                            },
                        }
                        : {},
                ],
            },
        });
        // console.log(users);
        if (!users) {
            const err = new Error('no users founded');
            err.code = 404;
            return next(err);
        }
        const response = {
            code: 200,
            status: 'ok',
            data: users.map((user) => {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
                return ({
                    id: user.id,
                    first_name: (_a = user.profile) === null || _a === void 0 ? void 0 : _a.firstName,
                    last_name: (_b = user.profile) === null || _b === void 0 ? void 0 : _b.lastName,
                    fullName: ((_c = user.profile) === null || _c === void 0 ? void 0 : _c.firstName) + ' ' + ((_d = user.profile) === null || _d === void 0 ? void 0 : _d.lastName),
                    userImage: ((_e = user.profile) === null || _e === void 0 ? void 0 : _e.userImage) || '',
                    bio: ((_f = user.profile) === null || _f === void 0 ? void 0 : _f.bio) || '',
                    gender: ((_g = user.profile) === null || _g === void 0 ? void 0 : _g.gender) || '',
                    dateOfBirth: ((_h = user.profile) === null || _h === void 0 ? void 0 : _h.dateOfBirth) || '',
                    location: (0, cities_1.getCityFromId)((_j = user.profile) === null || _j === void 0 ? void 0 : _j.location) || null,
                    createAt: (_k = user.profile) === null || _k === void 0 ? void 0 : _k.createAt,
                    followersCount: user._count.followers,
                    followingCount: user._count.following,
                    rivosCount: user._count.videos,
                });
            }),
            page: page,
        };
        res.status(202).json(response);
    }
    catch (_e) {
        const err = new Error('Internal server Error!');
        err.code = 500;
        return next(err);
    }
});
exports.getUserBySearch = getUserBySearch;
// follow User Handler ======================================
const followHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const targetId = req.body.target_id;
        if (!targetId) {
            const err = new Error('invalid target id');
            err.code = 401;
            return next(err);
        }
        const target = yield prisma_1.prisma.user.findUnique({
            where: {
                id: targetId,
            },
        });
        if (!target) {
            const err = new Error('target not founded');
            err.code = 404;
            return next(err);
        }
        const userId = req.userId;
        const user = yield prisma_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            const err = new Error('User Not founded!');
            err.code = 404;
            return next(err);
        }
        yield prisma_1.prisma.userFollower.create({ data: { targetId: targetId, userId: userId } });
        const response = {
            code: 202,
            status: 'ok',
        };
        res.status(202).json(response);
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            const err = new Error('user not founded!');
            err.code = 404;
            return next(err);
        }
        const err = new Error('Internal server Error!');
        err.code = 500;
        return next(err);
    }
});
exports.followHandler = followHandler;
// unfollow User Handler
const unfollowHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const targetId = req.body.target_id;
        if (!targetId) {
            const err = new Error('invalid target id');
            err.code = 401;
            return next(err);
        }
        const target = yield prisma_1.prisma.user.findUnique({
            where: {
                id: targetId,
            },
        });
        if (!target) {
            const err = new Error('target not founded');
            err.code = 404;
            return next(err);
        }
        const userId = req.userId;
        const user = yield prisma_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            const err = new Error('User Not founded!');
            err.code = 404;
            return next(err);
        }
        yield prisma_1.prisma.userFollower.delete({ where: { userId_targetId: { targetId: targetId, userId: userId } } });
        const response = {
            code: 202,
            status: 'ok',
        };
        res.status(202).json(response);
    }
    catch (error) {
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            const err = new Error('user not founded!');
            err.code = 404;
            return next(err);
        }
        const err = new Error('Internal server Error!');
        err.code = 500;
        return next(err);
    }
});
exports.unfollowHandler = unfollowHandler;
// helper function ==========================================
const validateRequestEditBody = (req) => {
    const error = (0, express_validator_1.validationResult)(req);
    const errorsArray = error.array();
    const data = {};
    if (req.body['first_name']) {
        const hasError = errorsArray.find((e) => e.param === 'first_name');
        if (hasError) {
            const err = new Error('first name not valid');
            err.code = 401;
            return err;
        }
        data.firstName = req.body['first_name'];
    }
    if (req.body['last_name']) {
        const hasError = errorsArray.find((e) => e.param === 'last_name');
        if (hasError) {
            const err = new Error('last name not valid');
            err.code = 401;
            return err;
        }
        data.lastName = req.body['last_name'];
    }
    if (req.body['bio']) {
        const hasError = errorsArray.find((e) => e.param === 'bio');
        if (hasError) {
            const err = new Error('bio not valid');
            err.code = 401;
            return err;
        }
        data.bio = req.body['bio'];
    }
    if (req.body['user_image']) {
        const hasError = errorsArray.find((e) => e.param === 'user_image');
        if (hasError) {
            const err = new Error('image url not valid');
            err.code = 401;
            return err;
        }
        data.userImage = req.body['user_image'];
    }
    if (req.body['date_of_birth']) {
        const hasError = errorsArray.find((e) => e.param === 'date_of_birth');
        if (hasError) {
            const err = new Error('date of birth not valid');
            err.code = 401;
            return err;
        }
        data.dateOfBirth = req.body['date_of_birth'];
    }
    if (req.body['gender']) {
        const isIn = ['Male', 'Female'].includes(req.body['gender']);
        if (!isIn) {
            const err = new Error('gender not valid');
            err.code = 401;
            return err;
        }
        data.gender = req.body['gender'];
    }
    if (req.body['location']) {
        const isIn = (0, cities_1.getCityFromId)(req.body['location']);
        if (!isIn) {
            const err = new Error('location not valid');
            err.code = 401;
            return err;
        }
        data.location = req.body['location'];
    }
    return data;
};
