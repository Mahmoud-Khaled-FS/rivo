import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import { prisma } from '../utils/prisma';
import bcrypt from 'bcryptjs';
import { ErrorRequest, RequestWithBody } from '../types/request';
import { LoginBody, SignupBody } from '../types/apiAuthBody';
import jwt from 'jsonwebtoken';

// controller function user sign up and create account
export const loginHandler: RequestHandler = async (req: RequestWithBody<LoginBody>, res, next) => {
  try {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      const err: ErrorRequest = new Error('bad request!');
      err.code = 400;
      return next(err);
    }
    const userExist = await prisma.user.findUnique({ where: { email: req.body.email }, include: { profile: true } });
    if (!userExist) {
      const err: ErrorRequest = new Error('email not found');
      err.code = 404;
      return next(err);
    }
    const isPasswordCorrect = await bcrypt.compare(req.body.password, userExist.passwordHash);
    if (!isPasswordCorrect) {
      const err: ErrorRequest = new Error('incorrect password');
      err.code = 401;
      return next(err);
    }
    const token = jwt.sign({ id: userExist.id }, process.env.JWT!);
    const response = {
      id: userExist.id,
      token: token,
      email: userExist.email,
      phoneNumber: userExist.phoneNumber,
      firstName: userExist.profile!.firstName,
      lastName: userExist.profile!.lastName,
      createAt: userExist.profile!.createAt,
      updatedAt: userExist.profile!.updateAt,
    };
    res.status(202).json({ status: 'ok', code: 202, data: response });
  } catch {
    const err: ErrorRequest = new Error('Internal server Error!');
    err.code = 500;
    return next(err);
  }
};

// controller function user sign up and create account
export const signupHandler: RequestHandler = async (req: RequestWithBody<SignupBody>, res, next) => {
  try {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      const err: ErrorRequest = new Error('bad request!');
      err.code = 400;
      return next(err);
    }
    const userExist = await prisma.user.findUnique({ where: { email: req.body.email } });
    if (userExist) {
      const err: ErrorRequest = new Error('this email is existing');
      err.code = 500;
      return next(err);
    }
    const hashPassword = await bcrypt.hash(req.body.password, 16);
    if (!hashPassword) {
      const err: ErrorRequest = new Error('Internal server Error!');
      err.code = 500;
      return next(err);
    }
    const user = await prisma.user.create({
      data: {
        email: req.body.email,
        passwordHash: hashPassword,
        phoneNumber: req.body.phone,
      },
    });
    if (!user) {
      const err: ErrorRequest = new Error('Internal server Error!');
      err.code = 500;
      return next(err);
    }
    const profile = await prisma.profile.create({
      data: {
        firstName: req.body.first_name,
        lastName: req.body.last_name,
        userId: user.id,
      },
    });
    if (!profile) {
      await prisma.user.delete({ where: { id: user.id } });
      const err: ErrorRequest = new Error('Internal server Error!');
      err.code = 500;
      return next(err);
    }
    const token = jwt.sign({ id: user.id }, process.env.JWT!);
    const response = {
      id: user.id,
      token: token,
      email: user.email,
      phoneNumber: user.phoneNumber,
      firstName: profile.firstName,
      lastName: profile.lastName,
      createAt: profile.createAt,
      updatedAt: profile.updateAt,
    };
    res.status(202).json({ status: 'ok', code: 202, data: response });
  } catch {
    const err: ErrorRequest = new Error('Internal server Error!');
    err.code = 500;
    return next(err);
  }
};
