import { Prisma } from '@prisma/client';
import { RequestHandler } from 'express';
import { ErrorRequest, LikesResponse, ResponsTemplate } from '../types/request';
import { prisma } from '../utils/prisma';

export const getLikesForVideo: RequestHandler = async (req, res, next) => {
  try {
    const rivoId = req.params.id;
    const page = +req.query.page || 1;
    const likes = await prisma.like.findMany({
      take: 50,
      skip: (page - 1) * 1,
      where: {
        videoId: rivoId,
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });
    interface Response extends ResponsTemplate<LikesResponse[]> {
      page: number;
    }
    const response: Response = {
      code: 202,
      status: 'ok',
      data: likes.map((l) => ({
        user: {
          id: l.user.id,
          first_name: l.user.profile.firstName,
          last_name: l.user.profile.lastName,
          userImage: l.user.profile.userImage,
        },
        videoId: l.videoId,
      })),
      page: page,
    };
    res.status(202).json(response);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      const err: ErrorRequest = new Error('video id not valid!');
      err.code = 401;
      return next(err);
    }
    const err: ErrorRequest = new Error('Internal server Error!');
    err.code = 500;
    return next(err);
  }
};

// Create Comment
export const addLikeForVideo: RequestHandler = async (req, res, next) => {
  try {
    const videoId = req.params.id;
    const v = await prisma.video.findUnique({
      where: {
        id: videoId,
      },
    });
    const userId = req.userId;
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { profile: true } });
    await prisma.like.create({
      data: {
        videoId: v.id,
        userId: userId,
      },
    });
    const response: ResponsTemplate<LikesResponse> = {
      code: 202,
      status: 'ok',
      data: {
        user: {
          first_name: user.profile.firstName,
          last_name: user.profile.lastName,
          id: user.id,
          userImage: user.profile.userImage,
        },
        videoId: videoId,
      },
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

//=========delete comment

export const deleteCommentForVideo: RequestHandler = async (req, res, next) => {
  try {
    const videoId = req.params.id;
    const v = await prisma.video.findUnique({
      where: {
        id: videoId,
      },
    });
    const userId = req.userId;
    await prisma.like.delete({
      where: {
        userId_videoId: {
          userId: userId,
          videoId: v.id,
        },
      },
    });
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
