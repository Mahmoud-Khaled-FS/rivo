import { Request } from 'express';

export interface RequestWithBody<T> extends Request {
  body: T;
}
export interface ErrorRequest extends Error {
  code?: number;
}
export interface ResponsTemplate<T = any> {
  code: number;
  status: 'failed' | 'ok';
  data?: T;
}

export interface ProfileResponse {
  id: string;
  first_name: string;
  last_name: string;
  fullName: string;
  bio: string;
  createAt: Date | string;
  dateOfBirth: string | Date;
  gender: string;
  location: {
    id: string;
    city_ar: string;
    city_en: string;
  } | null;
  userImage: string;
  rivosCount?: number;
  followersCount?: number;
  followingCount?: number;
  likesCount?: number;
}
export interface VideoResponse {
  id: string;
  createUserId: string;
  video: string;
  caption: string;
  tags: string[];
  location: {
    id: string;
    city_ar: string;
    city_en: string;
  };
  views: number;
  commentsCount?: number;
  comments?: any;
  createAt: Date;
  updatedAt: Date;
  private: boolean;
  likes?: number;
  likesUsers?: string[];
}

export interface CommentsResponse {
  id: string;
  text: string;
  createAt: Date;
  updateAt: Date;
  author: {
    first_name: string;
    last_name: string;
    userImage: string;
    id: string;
  };
  videoId: string;
}
export interface LikesResponse {
  user: {
    first_name: string;
    last_name: string;
    userImage: string;
    id: string;
  };
  videoId: string;
}
