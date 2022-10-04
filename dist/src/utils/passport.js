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
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth2_1 = require("passport-google-oauth2");
const prisma_1 = require("./prisma");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const passport_facebook_1 = require("passport-facebook");
const passport_twitter_1 = require("passport-twitter");
passport_1.default.serializeUser(function (user, cd) {
    cd(null, user);
});
passport_1.default.deserializeUser(function (user, cd) {
    cd(null, user);
});
passport_1.default.use(new passport_facebook_1.Strategy({
    clientID: '1113841782570303',
    clientSecret: '3b2adb161635ca208e38dae8da6ad029',
    callbackURL: 'http://localhost:8080/api/auth/facebook/cb',
    profileFields: ['id'],
}, function (accessToken, refreshToken, profile, done) {
    // const data = profile._json;
    console.log(profile);
    return done(null, profile);
}));
// ===== twittwer =====
passport_1.default.use(new passport_twitter_1.Strategy({
    consumerKey: process.env.TWITTER_CLIENT_ID2,
    consumerSecret: process.env.TWITTER_CLIENT_SECRET2,
    callbackURL: 'http://localhost:8080/api/auth/twitter/cb',
    passReqToCallback: true,
    includeEmail: true,
}, function (request, accessToken, refreshToken, profile, done) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let token;
            const user = yield prisma_1.prisma.user.findFirst({
                where: {
                    providerId: profile.id,
                    providerType: profile.provider,
                },
            });
            if (!user) {
                const newUser = yield prisma_1.prisma.user.create({
                    data: {
                        email: profile.username,
                        providerId: profile.id,
                        providerType: profile.provider,
                    },
                });
                if (!newUser) {
                    throw new Error();
                }
                yield prisma_1.prisma.profile.create({
                    data: {
                        firstName: profile._json.name.split(' ')[0],
                        lastName: profile._json.name.split(' ')[1],
                        userImage: profile._json.profile_image_url,
                        userId: newUser.id,
                    },
                });
                token = jsonwebtoken_1.default.sign({ id: newUser.id }, process.env.JWT);
                return done(null, { token: token });
            }
            token = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT);
            return done(null, { token: token });
        }
        catch (err) {
            return done();
        }
    });
}));
// =====google=====
passport_1.default.use(new passport_google_oauth2_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:8080/api/auth/google/cb',
    passReqToCallback: true,
}, function (request, accessToken, refreshToken, profile, done) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let token;
            const user = yield prisma_1.prisma.user.findFirst({
                where: {
                    providerId: profile.id,
                    providerType: profile.provider,
                },
            });
            if (!user) {
                const newUser = yield prisma_1.prisma.user.create({
                    data: {
                        email: profile.email,
                        providerId: profile.id,
                        providerType: profile.provider,
                    },
                });
                if (!newUser) {
                    throw new Error();
                }
                yield prisma_1.prisma.profile.create({
                    data: {
                        firstName: profile.given_name,
                        lastName: profile.family_name,
                        userImage: profile.picture,
                        userId: newUser.id,
                    },
                });
                token = jsonwebtoken_1.default.sign({ id: newUser.id }, process.env.JWT);
                return done(null, { token: token });
            }
            token = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT);
            return done(null, { token: token });
            // console.log()
        }
        catch (err) {
            return done();
        }
    });
}));
passport_1.default.serializeUser(function (user, done) {
    done(null, user);
});
passport_1.default.deserializeUser(function (user, done) {
    done(null, user);
});
