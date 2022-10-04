'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== 'default' && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.deleteRivo =
  exports.editRivoDetails =
  exports.getRivosBySearch =
  exports.uploadVideo =
  exports.getRivoWithId =
    void 0;
const fs = __importStar(require('fs'));
const path = __importStar(require('path'));
const crypto_1 = require('crypto');
const encryptBuffer_1 = __importDefault(require('../utils/encryptBuffer'));
const prisma_1 = require('../utils/prisma');
const client_1 = require('@prisma/client');
const cities_1 = require('../utils/cities');
const removeFile_1 = __importDefault(require('../utils/removeFile'));
//Get Video by Id
const getRivoWithId = (req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const rivoId = req.params.id;
      let content = req.query['content'] || '';
      const video = yield prisma_1.prisma.video.findUnique({
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
        const err = new Error('video id not valid');
        err.code = 401;
        return next(err);
      }
      const location = (0, cities_1.getCityFromId)(video.location);
      const response = {
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
      if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        const err = new Error('video id not valid!');
        err.code = 401;
        return next(err);
      }
      const err = new Error('Internal server Error!');
      err.code = 500;
      return next(err);
    }
  });
exports.getRivoWithId = getRivoWithId;
// Upload Videos =========
const uploadVideo = (req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const userId = req.userId;
      const location = (0, cities_1.getCityFromId)(req.body.location);
      if (!location) {
        const err = new Error('location id not valid');
        err.code = 401;
        return next(err);
      }
      if (req.file.size > 50 * 1024 * 1024) {
        const err = new Error('max video size 50mb');
        err.code = 401;
        return next(err);
      }
      const rivoPath = path.join(__dirname, '..', '..', 'uploads', userId, 'rivos');
      const isExists = fs.existsSync(rivoPath);
      if (!isExists) {
        fs.mkdir(rivoPath, { recursive: true }, (err) => {
          console.log(err);
          const error = new Error('something wrong');
          error.code = 500;
          return next(error);
        });
      }
      const uuid = (0, crypto_1.randomUUID)().toString();
      const rivoFileName = uuid + '-' + req.file.originalname;
      fs.writeFileSync(path.join(rivoPath, rivoFileName), (0, encryptBuffer_1.default)(req.file.buffer, userId));
      const video = yield prisma_1.prisma.video.create({
        data: {
          location: location.id,
          video: userId + '/rivos/' + rivoFileName,
          caption: req.body.caption || '',
          tags: req.body.tags || '',
          createUserId: userId,
          private: req.body.private === true,
        },
      });
      const response = {
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
      const err = new Error('Internal server Error!');
      err.code = 500;
      return next(err);
    }
  });
exports.uploadVideo = uploadVideo;
//Get User By Search  ====================>
const getRivosBySearch = (req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const tags = req.query['tags'] || null;
      const caption = req.query['caption'] || null;
      const location = req.query['location'] || null;
      const page = parseInt(req.query['page']) || 1;
      let videos;
      if (!tags && !caption && !location) {
        videos = yield prisma_1.prisma.video.findMany({
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
        videos = yield prisma_1.prisma.video.findMany({
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
        const err = new Error('no videos founded');
        err.code = 404;
        return next(err);
      }
      const response = {
        code: 200,
        status: 'ok',
        data: videos.map((video) => ({
          id: video.id,
          video: video.video,
          createUserId: video.createUserId,
          caption: video.caption,
          createAt: video.createAt,
          location: (0, cities_1.getCityFromId)(video.location),
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
    } catch (_a) {
      const err = new Error('Internal server Error!');
      err.code = 500;
      return next(err);
    }
  });
exports.getRivosBySearch = getRivosBySearch;
// Edit Video Details
const editRivoDetails = (req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const userId = req.userId;
      const videoId = req.params.id;
      const video = yield prisma_1.prisma.video.findUnique({
        where: {
          id: videoId,
        },
      });
      if (!video) {
        const err = new Error('video Not founded!');
        err.code = 404;
        return next(err);
      }
      if (video.createUserId !== userId) {
        const err = new Error('Request Filed!');
        err.code = 300;
        return next(err);
      }
      const data = {};
      if (req.body.caption) {
        data.caption = req.body.caption;
      }
      if (req.body.tags) {
        data.tags = req.body.tags;
      }
      if ('boolean' === typeof req.body.private) {
        data.private = req.body.private;
      }
      const updatedVideo = yield prisma_1.prisma.video.update({
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
      const response = {
        code: 202,
        status: 'ok',
        data: {
          id: updatedVideo.id,
          video: updatedVideo.video,
          createUserId: updatedVideo.createUserId,
          caption: updatedVideo.caption,
          createAt: updatedVideo.createAt,
          location: (0, cities_1.getCityFromId)(updatedVideo.location),
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
      if (error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        const err = new Error('video id not valid!');
        err.code = 401;
        return next(err);
      }
      const err = new Error('Internal server Error!');
      err.code = 500;
      return next(err);
    }
  });
exports.editRivoDetails = editRivoDetails;
// Delete Rivo
const deleteRivo = (req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const userId = req.userId;
      const videoId = req.params.id;
      const video = yield prisma_1.prisma.video.findUnique({
        where: {
          id: videoId,
        },
      });
      if (!video) {
        const err = new Error('video Not founded!');
        err.code = 404;
        return next(err);
      }
      if (video.createUserId !== userId) {
        const err = new Error('Request Filed!');
        err.code = 300;
        return next(err);
      }
      yield prisma_1.prisma.video.delete({
        where: {
          id: videoId,
        },
      });
      const response = {
        code: 202,
        status: 'ok',
      };
      (0, removeFile_1.default)(userId + video.video, () => {
        res.status(202).json(response);
      });
    } catch (error) {
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
exports.deleteRivo = deleteRivo;
