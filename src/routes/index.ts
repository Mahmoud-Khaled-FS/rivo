import { Router } from 'express';
import * as controllers from '../controllers/api';
import isAuth from '../middlewares/isAuth';
import authRouters from './auth';
import userRouters from './user';
import profileRouters from './profile';
import rivoRouters from './rivo';
import commentsRouters from './comments';
import likesRouters from './likes';
const routers = Router();

routers.get('/cities', controllers.getCities);
routers.get('/stream/:id', controllers.startStream);

routers.use('/auth', authRouters);
routers.use('/user', isAuth, userRouters);
routers.use('/profile', isAuth, profileRouters);
routers.use('/rivo', isAuth, rivoRouters);
routers.use('/comments', isAuth, commentsRouters);
routers.use('/likes', isAuth, likesRouters);

export default routers;
