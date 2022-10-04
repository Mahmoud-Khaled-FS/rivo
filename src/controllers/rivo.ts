import { RequestHandler } from 'express';
import { ErrorRequest, ResponsTemplate, VideoResponse } from '../types/request';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
import encryptBuffer, { decrypt } from '../utils/encryptBuffer';
import { prisma } from '../utils/prisma';
import { Prisma } from '@prisma/client';
import { getCityFromId } from '../utils/cities';
import remove from '../utils/removeFile';
import { join } from 'path';
import { Readable } from 'stream';

//Get Video by Id
export const getRivoWithId: RequestHandler = async (req, res, next) => {
  try {
    const rivoId = req.params.id;
    let content: string = (req.query['content'] as string) || '';
    const video = await prisma.video.findUnique({
      where: {
        id: rivoId,
      },
      include: {
        comments: content === 'all' || content.includes('comments'),
        likes: content === 'all' || content.includes('likes'),
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });
    if (!video) {
      const err: ErrorRequest = new Error('video id not valid');
      err.code = 401;
      return next(err);
    }
    const location = getCityFromId(video.location);
    const response: ResponsTemplate<VideoResponse> = {
      code: 202,
      status: 'ok',
      data: {
        id: video.id,
        video: video.video,
        createUserId: video.createUserId,
        caption: video.caption,
        createAt: video.createAt,
        location: location,
        private: video.private,
        tags: video.tags.split(','),
        updatedAt: video.updateAt,
        views: video.views,
        commentsCount: video._count.comments,
        likes: video._count.likes,
      },
    };
    if (video.comments) {
      const usersId = video.comments.map((f) => f.id);
      response.data.comments = usersId;
    }
    if (video.likes) {
      const usersId = video.likes.map((f) => f.userId);
      response.data.likesUsers = usersId;
    }
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

// Upload Videos =========
export const uploadVideo: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.userId;
    const location = getCityFromId(req.body.location);
    if (!location) {
      const err: ErrorRequest = new Error('location id not valid');
      err.code = 401;
      return next(err);
    }
    if (req.file.size > 16 * 1024 * 1024) {
      const err: ErrorRequest = new Error('max video size 50mb');
      err.code = 401;
      return next(err);
    }
    const rivoPath = path.join(__dirname, '..', '..', 'uploads', userId, 'rivos');
    const isExists = fs.existsSync(rivoPath);
    if (!isExists) {
      fs.mkdir(rivoPath, { recursive: true }, (err) => {
        const error: ErrorRequest = new Error('something wrong');
        error.code = 500;
        return next(error);
      });
    }
    const uuid = randomUUID().toString();
    const rivoFileName = uuid + '-' + req.file.originalname;
    fs.writeFileSync(path.join(rivoPath, rivoFileName), encryptBuffer(req.file.buffer, userId));
    const video = await prisma.video.create({
      data: {
        location: location.id,
        video: userId + '/rivos/' + rivoFileName,
        caption: req.body.caption || '',
        tags: req.body.tags || '',
        createUserId: userId,
        private: req.body.private === true,
      },
    });
    const response: ResponsTemplate<VideoResponse> = {
      code: 202,
      status: 'ok',
      data: {
        id: video.id,
        video: video.video,
        createUserId: video.createUserId,
        caption: video.caption,
        createAt: video.createAt,
        location: location,
        private: video.private,
        tags: video.tags.split(','),
        updatedAt: video.updateAt,
        views: video.views,
        commentsCount: 0,
        likes: 0,
      },
    };
    res.status(202).json(response);
  } catch (error) {
    console.log(error);
    const err: ErrorRequest = new Error('Internal server Error!');
    err.code = 500;
    return next(err);
  }
};

//Get User By Search  ====================>
export const getRivosBySearch: RequestHandler = async (req, res, next) => {
  try {
    const tags = (req.query['tags'] as string) || null;
    const caption = (req.query['caption'] as string) || null;
    const location = (req.query['location'] as string) || null;
    const page = parseInt(req.query['page'] as string) || 1;
    let videos;
    if (!tags && !caption && !location) {
      videos = await prisma.video.findMany({
        take: 10,
        skip: (page - 1) * 1,
        include: {
          _count: {
            select: {
              comments: true,
              likes: true,
            },
          },
        },
      });
    } else {
      videos = await prisma.video.findMany({
        take: 10,
        skip: (page - 1) * 1,
        include: {
          _count: {
            select: {
              comments: true,
              likes: true,
            },
          },
        },
        where: {
          OR: [
            tags
              ? {
                  tags: {
                    contains: tags,
                  },
                }
              : {},
            caption
              ? {
                  caption: {
                    contains: caption,
                  },
                }
              : {},
            location
              ? {
                  location: {
                    equals: location,
                  },
                }
              : {},
          ],
        },
      });
    }
    // console.log(users);
    if (!videos) {
      const err: ErrorRequest = new Error('no videos founded');
      err.code = 404;
      return next(err);
    }
    interface Response extends ResponsTemplate<VideoResponse[]> {
      page: number;
    }
    const response: Response = {
      code: 200,
      status: 'ok',
      data: videos.map((video) => ({
        id: video.id,
        video: video.video,
        createUserId: video.createUserId,
        caption: video.caption,
        createAt: video.createAt,
        location: getCityFromId(video.location),
        private: video.private,
        tags: video.tags.split(','),
        updatedAt: video.updateAt,
        views: video.views,
        commentsCount: 0,
        likes: 0,
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

// Edit Video Details

export const editRivoDetails: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.userId;
    const videoId = req.params.id;
    const video = await prisma.video.findUnique({
      where: {
        id: videoId,
      },
    });
    if (!video) {
      const err: ErrorRequest = new Error('video Not founded!');
      err.code = 404;
      return next(err);
    }
    if (video.createUserId !== userId) {
      const err: ErrorRequest = new Error('Request Filed!');
      err.code = 300;
      return next(err);
    }
    interface Data {
      caption?: string;
      tags?: string;
      private?: boolean;
    }
    const data: Data = {};
    if (req.body.caption) {
      data.caption = req.body.caption;
    }
    if (req.body.tags) {
      data.tags = req.body.tags;
    }
    if ('boolean' === typeof req.body.private) {
      data.private = req.body.private;
    }
    const updatedVideo = await prisma.video.update({
      where: {
        id: videoId,
      },
      data: data,
      include: {
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });
    const response: ResponsTemplate<VideoResponse> = {
      code: 202,
      status: 'ok',
      data: {
        id: updatedVideo.id,
        video: updatedVideo.video,
        createUserId: updatedVideo.createUserId,
        caption: updatedVideo.caption,
        createAt: updatedVideo.createAt,
        location: getCityFromId(updatedVideo.location),
        private: updatedVideo.private,
        tags: updatedVideo.tags.split(','),
        updatedAt: updatedVideo.updateAt,
        views: updatedVideo.views,
        commentsCount: updatedVideo._count.comments,
        likes: updatedVideo._count.likes,
      },
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

// Delete Rivo
export const deleteRivo: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.userId;
    const videoId = req.params.id;
    const video = await prisma.video.findUnique({
      where: {
        id: videoId,
      },
    });
    if (!video) {
      const err: ErrorRequest = new Error('video Not founded!');
      err.code = 404;
      return next(err);
    }
    if (video.createUserId !== userId) {
      const err: ErrorRequest = new Error('Request Filed!');
      err.code = 300;
      return next(err);
    }
    await prisma.video.delete({
      where: {
        id: videoId,
      },
    });
    const response: ResponsTemplate = {
      code: 202,
      status: 'ok',
    };
    remove(video.video);
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

// stream videos
export const getRivoStream: RequestHandler = async (req, res, next) => {
  try {
    const videoId = req.params.id;
    const video = await prisma.video.findUnique({
      where: {
        id: videoId,
      },
    });
    if (!video) {
      const err: ErrorRequest = new Error('video Not founded!');
      err.code = 404;
      return next(err);
    }
    const videoPath = join(__dirname, '..', '..', 'uploads', video.video);
    const videoSize = fs.statSync(videoPath).size;
    const range = req.headers.range;
    if (!range) {
      const err: ErrorRequest = new Error('Require range');
      err.code = 400;
      return next(err);
    }
    const chunk = 10 ** 6;
    const start = Number(range.replace(/\D/g, ''));
    const end = Math.min(start + chunk, videoSize);
    const contentLength = end - start + 1;
    const headers = {
      'Content-Range': `bytes ${start}-${end}/${videoSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': contentLength,
      'Content-Type': 'video/mp4',
    };
    res.writeHead(206, headers);
    fs.readFile(videoPath, function (err, buffer) {
      const videoStream = Readable.from(decrypt(buffer, video.createUserId));
      videoStream.pipe(res);
    });
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
