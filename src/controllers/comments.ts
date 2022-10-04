import { Prisma } from '@prisma/client';
import { RequestHandler } from 'express';
import { CommentsResponse, ErrorRequest, ResponsTemplate } from '../types/request';
import { prisma } from '../utils/prisma';

export const getCommentsForVideo: RequestHandler = async (req, res, next) => {
  try {
    const rivoId = req.params.id;
    const page = +req.query.page || 1;
    const comments = await prisma.comment.findMany({
      take: 50,
      skip: (page - 1) * 1,
      where: {
        videoId: rivoId,
      },
      include: {
        author: {
          include: {
            profile: true,
          },
        },
      },
    });
    interface Response extends ResponsTemplate<CommentsResponse[]> {
      page: number;
    }
    const response: Response = {
      code: 202,
      status: 'ok',
      data: comments.map((c) => ({
        id: c.id,
        text: c.text,
        createAt: c.createAt,
        updateAt: c.updateAt,
        author: {
          id: c.author.id,
          first_name: c.author.profile.firstName,
          last_name: c.author.profile.lastName,
          userImage: c.author.profile.userImage,
        },
        videoId: c.videoId,
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
export const createCommentForVideo: RequestHandler = async (req, res, next) => {
  try {
    const videoId = req.params.id;
    const v = await prisma.video.findUnique({
      where: {
        id: videoId,
      },
    });
    if (!req.body.text || req.body.text.trim() === '') {
      const err: ErrorRequest = new Error("can't save this comment");
      err.code = 401;
      return next(err);
    }
    const userId = req.userId;
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { profile: true } });
    const comment = await prisma.comment.create({
      data: {
        text: req.body.text,
        videoId: v.id,
        authorId: userId,
      },
    });
    const response: ResponsTemplate<CommentsResponse> = {
      code: 202,
      status: 'ok',
      data: {
        id: comment.id,
        author: {
          first_name: user.profile.firstName,
          last_name: user.profile.lastName,
          id: user.id,
          userImage: user.profile.userImage,
        },
        createAt: comment.createAt,
        videoId: videoId,
        text: comment.text,
        updateAt: comment.updateAt,
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
    const commentId = req.params.id;
    await prisma.comment.delete({
      where: {
        id: commentId,
      },
    });
    const response: ResponsTemplate = {
      code: 202,
      status: 'ok',
    };
    res.status(202).json(response);
  } catch (error) {
    // console.log(error);
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
