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
exports.deleteUserHandler = exports.getUserHandler = void 0;
const client_1 = require("@prisma/client");
const cities_1 = require("../utils/cities");
const prisma_1 = require("../utils/prisma");
const getUserHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = req.userId;
        let content = req.query['content'] || '';
        const user = yield prisma_1.prisma.user.findUnique({
            where: {
                id: userId,
            },
            include: {
                comments: content === 'all' || content.includes('comments'),
                followers: content === 'all' || content.includes('followers'),
                following: content === 'all' || content.includes('following'),
                likes: content === 'all' || content.includes('likes'),
                profile: content === 'all' || content.includes('profile'),
                videos: content === 'all' || content.includes('videos'),
            },
        });
        if (!user) {
            const err = new Error('User Not founded!');
            err.code = 404;
            return next(err);
        }
        const response = {
            status: 'ok',
            code: 202,
            data: {
                email: user.email,
                id: user.id,
                phone: user.phoneNumber,
                provider: user.providerType,
            },
        };
        if (user.profile) {
            response.data.first_name = user.profile.firstName;
            response.data.last_name = user.profile.lastName;
            response.data.fullName = user.profile.firstName + ' ' + user.profile.lastName;
            response.data.bio = user.profile.bio || '';
            response.data.createAt = user.profile.createAt || '';
            response.data.dateOfBirth = user.profile.dateOfBirth || '';
            response.data.gender = user.profile.gender || '';
            response.data.location = (0, cities_1.getCityFromId)((_a = user.profile) === null || _a === void 0 ? void 0 : _a.location) || null;
            response.data.userImage = user.profile.userImage || '';
        }
        if (user.followers) {
            const followers = user.followers.map((f) => f.targetId);
            response.data.followers = followers;
            response.data.followers_count = followers.length;
        }
        if (user.following) {
            const following = user.followers.map((f) => f.userId);
            response.data.following = following;
            response.data.followeing_count = following.length;
        }
        if (user.videos) {
            const videos = user.videos.map((v) => ({ caption: v.caption, url: v.video, id: v.id }));
            response.data.rivos = videos;
            response.data.rivos_count = videos.length;
        }
        if (user.comments) {
            const comments = user.comments.map((c) => ({ text: c.text, videoId: c.videoId }));
            response.data.videos = comments;
            response.data.comments_count = comments.length;
        }
        if (user.likes) {
            const likes = user.likes.map((l) => l.videoId);
            response.data.videos = likes;
        }
        res.status(202).json(response);
    }
    catch (err0) {
        const err = new Error('Internal server Error!');
        err.code = 500;
        return next(err);
    }
});
exports.getUserHandler = getUserHandler;
const deleteUserHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        yield prisma_1.prisma.user.delete({
            where: {
                id: userId,
            },
            include: {
                comments: true,
                followers: true,
                following: true,
                likes: true,
                profile: true,
                videos: true,
            },
        });
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
exports.deleteUserHandler = deleteUserHandler;
