import { Prisma } from '@prisma/client';
import { RequestHandler } from 'express';
import { ErrorRequest, ResponsTemplate } from '../types/request';
import { getCityFromId } from '../utils/cities';
import { prisma } from '../utils/prisma';

export const getUserHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.userId;
    let content: string = (req.query['content'] as string) || '';
    const user = await prisma.user.findUnique({
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
      const err: ErrorRequest = new Error('User Not founded!');
      err.code = 404;
      return next(err);
    }
    const response: ResponsTemplate = {
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
      response.data.location = getCityFromId(user.profile?.location) || null;
      response.data.userImage = user.profile.userImage || '';
    }
    if (user.followers) {
      const followers = user.followers.map((f) => f.targetId);
      response.data.followers = followers;
      response.data.followers_count = followers.length;
    }
    if (user.following) {
      const following = user.following.map((f) => f.userId);
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
  } catch (err0) {
    const err: ErrorRequest = new Error('Internal server Error!');
    err.code = 500;
    return next(err);
  }
};

export const deleteUserHandler: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.userId;
    await prisma.user.delete({
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
