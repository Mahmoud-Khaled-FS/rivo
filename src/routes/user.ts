import { Router } from 'express';
import * as controllers from '../controllers/user';

const routes = Router();

routes.get('/', controllers.getUserHandler);

routes.delete('/', controllers.deleteUserHandler);

export default routes;
