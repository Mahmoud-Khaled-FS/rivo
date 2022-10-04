import passport from 'passport';
import { Strategy } from 'passport-google-oauth2';
import { prisma } from './prisma';
import jwt from 'jsonwebtoken';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as TwitterStrategy } from 'passport-twitter';

passport.serializeUser(function (user, cd) {
  cd(null, user);
});

passport.deserializeUser(function (user, cd) {
  cd(null, user!);
});

passport.use(
  new FacebookStrategy(
    {
      clientID: '1113841782570303',
      clientSecret: '3b2adb161635ca208e38dae8da6ad029',
      callbackURL: 'http://localhost:8080/api/auth/facebook/cb',
      profileFields: ['id'],
    },
    function (accessToken: any, refreshToken: any, profile: any, done: any) {
      // const data = profile._json;
      console.log(profile);
      return done(null, profile);
    },
  ),
);

// ===== twittwer =====

passport.use(
  new TwitterStrategy(
    {
      consumerKey: process.env.TWITTER_CLIENT_ID2!,
      consumerSecret: process.env.TWITTER_CLIENT_SECRET2!,
      callbackURL: 'http://localhost:8080/api/auth/twitter/cb',
      passReqToCallback: true,
      includeEmail: true,
    },
    async function (request: any, accessToken: any, refreshToken: any, profile: any, done: any) {
      try {
        let token: string;
        const user = await prisma.user.findFirst({
          where: {
            providerId: profile.id,
            providerType: profile.provider,
          },
        });
        if (!user) {
          const newUser = await prisma.user.create({
            data: {
              email: profile.username,
              providerId: profile.id,
              providerType: profile.provider,
            },
          });
          if (!newUser) {
            throw new Error();
          }
          await prisma.profile.create({
            data: {
              firstName: profile._json.name.split(' ')[0],
              lastName: profile._json.name.split(' ')[1],
              userImage: profile._json.profile_image_url,
              userId: newUser.id,
            },
          });
          token = jwt.sign({ id: newUser.id }, process.env.JWT!);
          return done(null, { token: token! });
        }
        token = jwt.sign({ id: user!.id }, process.env.JWT!);
        return done(null, { token: token! });
      } catch (err) {
        return done();
      }
    },
  ),
);
// =====google=====
passport.use(
  new Strategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: 'http://localhost:8080/api/auth/google/cb',
      passReqToCallback: true,
    },
    async function (request: any, accessToken: any, refreshToken: any, profile: any, done: any) {
      try {
        let token: string;
        const user = await prisma.user.findFirst({
          where: {
            providerId: profile.id,
            providerType: profile.provider,
          },
        });
        if (!user) {
          const newUser = await prisma.user.create({
            data: {
              email: profile.email,
              providerId: profile.id,
              providerType: profile.provider,
            },
          });
          if (!newUser) {
            throw new Error();
          }
          await prisma.profile.create({
            data: {
              firstName: profile.given_name,
              lastName: profile.family_name,
              userImage: profile.picture,
              userId: newUser.id,
            },
          });
          token = jwt.sign({ id: newUser.id }, process.env.JWT!);
          return done(null, { token: token! });
        }
        token = jwt.sign({ id: user!.id }, process.env.JWT!);
        return done(null, { token: token! });
        // console.log()
      } catch (err) {
        return done();
      }
    },
  ),
);

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user!);
});
