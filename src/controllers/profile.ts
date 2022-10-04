import { Prisma } from '@prisma/client';
import { Request, RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import { ErrorRequest, ProfileResponse, ResponsTemplate } from '../types/request';
import { getCityFromId } from '../utils/cities';
import { prisma } from '../utils/prisma';

export const getMyProfileHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.userId;
    const profile = await prisma.profile.findUnique({
      where: {
        userId: userId,
      },
    });
    if (!profile) {
      const err: ErrorRequest = new Error('User Not founded!');
      err.code = 404;
      return next(err);
    }
    const response: ResponsTemplate<ProfileResponse> = {
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
        location: getCityFromId(profile.location) || null,
        userImage: profile.userImage || '',
      },
    };
    res.status(202).json(response);
  } catch {
    const err: ErrorRequest = new Error('Internal server Error!');
    err.code = 500;
    return next(err);
  }
};
interface DataProfile {
  firstName?: string;
  lastName?: string;
  bio?: string;
  userImage?: string;
  gender?: string;
  dateOfBirth?: string;
  location?: string;
}
export const changeProfileInfoHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.userId;
    const data = validateRequestEditBody(req);
    if (data instanceof Error) {
      return next(data);
    }
    const profile = await prisma.profile.update({
      where: {
        userId: userId,
      },
      data: data as any,
    });
    if (!profile) {
      const err: ErrorRequest = new Error('User Not founded!');
      err.code = 404;
      return next(err);
    }
    const response: ResponsTemplate = {
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
        location: getCityFromId(profile.location) || null,
        userImage: profile.userImage || '',
      },
    };
    res.status(202).json(response);
  } catch {
    const err: ErrorRequest = new Error('Internal server Error!');
    err.code = 500;
    return next(err);
  }
};

// get user Profile ============================================
export const getUserProfile: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      const err: ErrorRequest = new Error('invalid user id');
      err.code = 401;
      return next(err);
    }
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        profile: true,
        _count: true,
      },
    });
    if (!user || !user.profile) {
      const err: ErrorRequest = new Error('profile not founded!');
      err.code = 404;
      return next(err);
    }
    const response: ResponsTemplate<ProfileResponse> = {
      code: 202,
      status: 'ok',
      data: {
        id: user.profile!.userId,
        bio: user.profile.bio || '',
        createAt: user.profile.createAt,
        dateOfBirth: user.profile.dateOfBirth || '',
        first_name: user.profile.firstName,
        last_name: user.profile.lastName,
        fullName: user.profile.firstName + ' ' + user.profile.lastName,
        gender: user.profile.gender || '',
        location: getCityFromId(user.profile?.location) || null,
        userImage: user.profile.userImage || '',
        followersCount: user._count.followers,
        followingCount: user._count.following,
        rivosCount: user._count.videos,
        likesCount: user._count.likes,
      },
    };
    res.status(202).json(response);
  } catch {
    const err: ErrorRequest = new Error('Internal server Error!');
    err.code = 500;
    return next(err);
  }
};
// search for users ==========================================
export const getUserBySearch: RequestHandler = async (req, res, next) => {
  try {
    const name = (req.query['name'] as string) || null;
    const email = (req.query['email'] as string) || null;
    const phone = (req.query['phone'] as string) || null;
    const page = parseInt(req.query['page'] as string) || 1;
    if (!name && !email && !phone) {
      const err: ErrorRequest = new Error('invalid data');
      err.code = 401;
      return next(err);
    }
    const users = await prisma.user.findMany({
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
      const err: ErrorRequest = new Error('no users founded');
      err.code = 404;
      return next(err);
    }
    interface Response extends ResponsTemplate<ProfileResponse[]> {
      page: number;
    }
    const response: Response = {
      code: 200,
      status: 'ok',
      data: users.map((user) => ({
        id: user.id,
        first_name: user.profile?.firstName as string,
        last_name: user.profile?.lastName as string,
        fullName: user.profile?.firstName + ' ' + user.profile?.lastName,
        userImage: user.profile?.userImage || '',
        bio: user.profile?.bio || '',
        gender: user.profile?.gender || '',
        dateOfBirth: user.profile?.dateOfBirth || '',
        location: getCityFromId(user.profile?.location) || null,
        createAt: user.profile?.createAt as Date,
        followersCount: user._count.followers,
        followingCount: user._count.following,
        rivosCount: user._count.videos,
      })),
      page: page,
    };
    res.status(202).json(response);
  } catch {
    const err: ErrorRequest = new Error('Internal server Error!');
    err.code = 500;
    return next(err);
  }
};
// follow User Handler ======================================
export const followHandler: RequestHandler = async (req, res, next) => {
  try {
    const targetId = req.body.target_id;
    if (!targetId) {
      const err: ErrorRequest = new Error('invalid target id');
      err.code = 401;
      return next(err);
    }
    const target = await prisma.user.findUnique({
      where: {
        id: targetId,
      },
    });
    if (!target) {
      const err: ErrorRequest = new Error('target not founded');
      err.code = 404;
      return next(err);
    }
    const userId = req.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      const err: ErrorRequest = new Error('User Not founded!');
      err.code = 404;
      return next(err);
    }
    await prisma.userFollower.create({ data: { targetId: targetId, userId: userId } });
    const response: ResponsTemplate = {
      code: 202,
      status: 'ok',
    };
    res.status(202).json(response);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      const err: ErrorRequest = new Error('user not founded!');
      err.code = 404;
      return next(err);
    }
    const err: ErrorRequest = new Error('Internal server Error!');
    err.code = 500;
    return next(err);
  }
};

// unfollow User Handler
export const unfollowHandler: RequestHandler = async (req, res, next) => {
  try {
    const targetId = req.body.target_id;
    if (!targetId) {
      const err: ErrorRequest = new Error('invalid target id');
      err.code = 401;
      return next(err);
    }
    const target = await prisma.user.findUnique({
      where: {
        id: targetId,
      },
    });
    if (!target) {
      const err: ErrorRequest = new Error('target not founded');
      err.code = 404;
      return next(err);
    }
    const userId = req.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      const err: ErrorRequest = new Error('User Not founded!');
      err.code = 404;
      return next(err);
    }
    await prisma.userFollower.delete({ where: { userId_targetId: { targetId: targetId, userId: userId } } });
    const response: ResponsTemplate = {
      code: 202,
      status: 'ok',
    };
    res.status(202).json(response);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      const err: ErrorRequest = new Error('user not founded!');
      err.code = 404;
      return next(err);
    }
    const err: ErrorRequest = new Error('Internal server Error!');
    err.code = 500;
    return next(err);
  }
};
// helper function ==========================================
const validateRequestEditBody = (req: Request) => {
  const error = validationResult(req);
  const errorsArray = error.array();
  const data: DataProfile = {};
  if (req.body['first_name']) {
    const hasError = errorsArray.find((e) => e.param === 'first_name');
    if (hasError) {
      const err: ErrorRequest = new Error('first name not valid');
      err.code = 401;
      return err;
    }
    data.firstName = req.body['first_name'];
  }
  if (req.body['last_name']) {
    const hasError = errorsArray.find((e) => e.param === 'last_name');
    if (hasError) {
      const err: ErrorRequest = new Error('last name not valid');
      err.code = 401;
      return err;
    }
    data.lastName = req.body['last_name'];
  }
  if (req.body['bio']) {
    const hasError = errorsArray.find((e) => e.param === 'bio');
    if (hasError) {
      const err: ErrorRequest = new Error('bio not valid');
      err.code = 401;
      return err;
    }
    data.bio = req.body['bio'];
  }
  if (req.body['user_image']) {
    const hasError = errorsArray.find((e) => e.param === 'user_image');
    if (hasError) {
      const err: ErrorRequest = new Error('image url not valid');
      err.code = 401;
      return err;
    }
    data.userImage = req.body['user_image'];
  }
  if (req.body['date_of_birth']) {
    const hasError = errorsArray.find((e) => e.param === 'date_of_birth');
    if (hasError) {
      const err: ErrorRequest = new Error('date of birth not valid');
      err.code = 401;
      return err;
    }
    data.dateOfBirth = req.body['date_of_birth'];
  }
  if (req.body['gender']) {
    const isIn = ['Male', 'Female'].includes(req.body['gender']);
    if (!isIn) {
      const err: ErrorRequest = new Error('gender not valid');
      err.code = 401;
      return err;
    }
    data.gender = req.body['gender'];
  }
  if (req.body['location']) {
    const isIn = getCityFromId(req.body['location']);
    if (!isIn) {
      const err: ErrorRequest = new Error('location not valid');
      err.code = 401;
      return err;
    }
    data.location = req.body['location'];
  }
  return data;
};
