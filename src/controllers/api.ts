import { RequestHandler } from 'express';
import cities from '../../data/cities.json';
import { ErrorRequest } from '../types/request';
import { prisma } from '../utils/prisma';
import * as fs from 'fs';
import { join } from 'path';
import { Readable } from 'stream';
import { decrypt } from '../utils/encryptBuffer';
import { Prisma } from '@prisma/client';
export const getCities: RequestHandler = (req, res) => {
  res.status(202).json(cities);
};
export const startStream: RequestHandler = async (req, res, next) => {
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
    const chunk = 160 ** 6;
    const start = Number(range.replace(/\D/g, ''));
    const end = Math.min(start + chunk, videoSize - 1);
    const contentLength = end - start + 1;
    const headers = {
      'Content-Range': `bytes ${start}-${end}/${videoSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': contentLength,
      'Content-Type': 'video/mp4',
    };
    res.writeHead(206, headers);
    const buffer = fs.readFileSync(videoPath);
    const videoStream = new Readable();

    const bufferDe = decrypt(buffer, video.createUserId);
    videoStream._read = () => {};
    videoStream.push(bufferDe);
    videoStream.pipe(res);
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
